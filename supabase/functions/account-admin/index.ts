import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return json({ error: "Требуется авторизация" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Серверная конфигурация не завершена" }, 500);
  }

  // Проверяем JWT вызывающего пользователя обычным anon-клиентом.
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const token = authorization.slice("Bearer ".length);
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Недействительная сессия" }, 401);

  // getUser(jwt) verifies the signature and current Auth user. Read only the
  // session_id claim from that already-verified JWT, then confirm it still
  // exists in auth.sessions through a service-role-only RPC.
  let sessionId: string | null = null;
  try {
    const payloadPart = token.split(".")[1];
    if (payloadPart) {
      const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
      if (typeof payload.session_id === "string") sessionId = payload.session_id;
    }
  } catch {
    return json({ error: "Не удалось проверить идентификатор сессии" }, 401);
  }
  if (!sessionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
    return json({ error: "В JWT отсутствует корректный идентификатор сессии" }, 401);
  }

  // Service role используется только на сервере, никогда в браузере.
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const reserveEmployeeSlot = async () => {
    const reservationId = crypto.randomUUID();
    const { data, error } = await admin.rpc("reserve_employee_slot", {
      p_reservation_id: reservationId,
    });
    return { reservationId, reserved: data === true, error };
  };
  const releaseEmployeeSlot = async (reservationId: string) => {
    const { error } = await admin.rpc("release_employee_slot", {
      p_reservation_id: reservationId,
    });
    return error;
  };

  // Compensate a failed profile write. If Auth deletion fails, keep the
  // reservation until its 10-minute expiry so a partially-created account
  // cannot silently escape the employee-capacity accounting.
  const rollbackProvisionedUser = async (userId: string, reservationId: string) => {
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) return { deleted: false, error: deleteError };
    const releaseError = await releaseEmployeeSlot(reservationId);
    return { deleted: true, error: releaseError };
  };

  const { data: activeSession, error: activeSessionError } = await admin.rpc("is_auth_session_active_for_user", {
    p_session_id: sessionId,
    p_user_id: authData.user.id,
  });
  if (activeSessionError) return json({ error: "Не удалось проверить активность сессии" }, 503);
  if (activeSession !== true) return json({ error: "Сессия отозвана или истекла", code: "AUTH_SESSION_REVOKED" }, 401);

  const { data: actor, error: actorError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (actorError) return json({ error: "Не удалось проверить права аккаунта" }, 500);
  if (!actor || !["developer", "admin"].includes(actor.role)) {
    return json({ error: "Недостаточно прав" }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Некорректный JSON" }, 400);
  }

  if (body.action === "list_employees") {
    const { data, error } = await admin
      .from("profiles")
      .select("id, display_name, role, created_at, updated_at")
      .in("role", ["employee", "assistant"])
      .order("created_at", { ascending: true });
    if (error) return json({ error: "Не удалось загрузить сотрудников" }, 500);
    const employees = await Promise.all((data ?? []).map(async (profile) => {
      const { data: authRecord } = await admin.auth.admin.getUserById(profile.id);
      const bannedUntil = authRecord.user?.banned_until ?? null;
      const suspended = Boolean(bannedUntil && new Date(bannedUntil).getTime() > Date.now());
      return { ...profile, suspended, banned_until: bannedUntil };
    }));
    return json({ employees });
  }

  if (body.action === "create_named_employee") {
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const normalizedUsername = username.normalize("NFC").toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    if (!username || username.length > 64 || normalizedUsername.includes("@") || /\s/.test(username)) {
      return json({ error: "Логин должен содержать от 1 до 64 символов без пробелов и символа @" }, 400);
    }
    const namedAccounts: Record<string, string> = {
      "цгиспл-карасук": "cgspl-karasuk@accounts.invalid",
      "цгиспл-тимашевск": "cgspl-timashevsk@accounts.invalid",
    };
    let email = namedAccounts[normalizedUsername];
    if (!email) {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalizedUsername));
      const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      email = "u" + hash.slice(0, 63) + "@accounts.invalid";
    }
    const displayName = username;
    if (password.length < 8 || password.length > 128) {
      return json({ error: "Пароль должен содержать от 8 до 128 символов" }, 400);
    }

    const reservation = await reserveEmployeeSlot();
    if (reservation.error) return json({ error: "Не удалось зарезервировать место сотрудника" }, 500);
    if (!reservation.reserved) return json({ error: "Достигнут лимит в 15 сотрудников" }, 409);

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });
    if (createError || !created.user) {
      await releaseEmployeeSlot(reservation.reservationId);
      return json({ error: createError?.message ?? "Не удалось создать аккаунт" }, 409);
    }

    const { error: profileError } = await admin.from("profiles").upsert({
      id: created.user.id,
      display_name: displayName,
      role: "employee",
    }, { onConflict: "id" });

    if (profileError) {
      const rollback = await rollbackProvisionedUser(created.user.id, reservation.reservationId);
      if (!rollback.deleted) {
        return json({ error: "Не удалось создать профиль сотрудника и отменить учётную запись Auth. Резерв места сохранён до автоматического истечения; требуется ручная проверка." }, 500);
      }
      if (rollback.error) {
        return json({ error: "Профиль не создан, учётная запись Auth отменена, но освобождение резерва не подтверждено; место освободится автоматически по истечении срока." }, 202);
      }
      return json({ error: "Не удалось создать профиль сотрудника; учётная запись Auth отменена" }, 500);
    }

    const releaseError = await releaseEmployeeSlot(reservation.reservationId);
    if (releaseError) return json({ error: "Аккаунт создан, но освобождение резервации не подтвердилось; место освободится автоматически по истечении срока" }, 202);
    return json({
      success: true,
      employee: { id: created.user.id, display_name: displayName, role: "employee" },
    }, 201);
  }

  if (body.action === "invite_employee") {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const displayName = typeof body.display_name === "string" ? body.display_name.trim() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return json({ error: "Укажите корректный email" }, 400);
    }
    if (!displayName || displayName.length > 100) {
      return json({ error: "Имя должно содержать от 1 до 100 символов" }, 400);
    }

    const reservation = await reserveEmployeeSlot();
    if (reservation.error) return json({ error: "Не удалось зарезервировать место сотрудника" }, 500);
    if (!reservation.reserved) return json({ error: "Достигнут лимит в 15 сотрудников" }, 409);

    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { display_name: displayName },
    });
    if (inviteError || !inviteData.user) {
      await releaseEmployeeSlot(reservation.reservationId);
      return json({ error: inviteError?.message ?? "Не удалось отправить приглашение" }, 400);
    }

    const { error: profileError } = await admin.from("profiles").upsert({
      id: inviteData.user.id,
      display_name: displayName,
      role: "employee",
    }, { onConflict: "id" });

    if (profileError) {
      // Do not silently orphan an invited Auth user if compensation fails.
      const rollback = await rollbackProvisionedUser(inviteData.user.id, reservation.reservationId);
      if (!rollback.deleted) {
        return json({ error: "Не удалось создать профиль и отменить приглашённую учётную запись Auth. Резерв места сохранён до автоматического истечения; требуется ручная проверка." }, 500);
      }
      if (rollback.error) {
        return json({ error: "Профиль не создан, приглашённая учётная запись Auth отменена, но освобождение резерва не подтверждено; место освободится автоматически по истечении срока." }, 202);
      }
      return json({ error: "Не удалось создать профиль сотрудника" }, 500);
    }

    const releaseError = await releaseEmployeeSlot(reservation.reservationId);
    if (releaseError) return json({ error: "Приглашение создано, но освобождение резервации не подтвердилось; место освободится автоматически по истечении срока" }, 202);
    return json({ success: true, employee: { id: inviteData.user.id, display_name: displayName, role: "employee" } }, 201);
  }

  if (body.action === "set_employee_role") {
    // Changing roles is a developer-only operation; UI visibility is not authorization.
    if (actor.role !== "developer") {
      return json({ error: "Менять роли может только разработчик" }, 403);
    }
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    const role = body.role;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return json({ error: "Некорректный ID сотрудника" }, 400);
    }
    if (userId === authData.user.id) {
      return json({ error: "Нельзя менять собственную роль этим действием" }, 400);
    }
    if (role !== "employee" && role !== "assistant") {
      return json({ error: "Допустимы только роли сотрудника и помощника" }, 400);
    }

    const { data: target, error: targetError } = await admin
      .from("profiles")
      .select("id, display_name, role")
      .eq("id", userId)
      .maybeSingle();
    if (targetError) return json({ error: "Не удалось проверить аккаунт" }, 500);
    if (!target || !["employee", "assistant"].includes(target.role)) {
      return json({ error: "Менять роль можно только сотрудникам и помощникам" }, 404);
    }
    if (target.role === role) {
      return json({ success: true, employee: target });
    }

    let reservationId: string | null = null;
    if (role === "employee") {
      const reservation = await reserveEmployeeSlot();
      if (reservation.error) return json({ error: "Не удалось зарезервировать место сотрудника" }, 500);
      if (!reservation.reserved) return json({ error: "Достигнут лимит в 15 сотрудников" }, 409);
      reservationId = reservation.reservationId;
    }

    const { data: updated, error: updateError } = await admin
      .from("profiles")
      .update({ role })
      .eq("id", userId)
      .in("role", ["employee", "assistant"])
      .select("id, display_name, role")
      .maybeSingle();
    if (updateError || !updated) {
      if (reservationId) await releaseEmployeeSlot(reservationId);
      if (updateError) return json({ error: "Не удалось изменить роль аккаунта" }, 500);
      return json({ error: "Роль аккаунта изменилась параллельно. Обновите список." }, 409);
    }
    if (reservationId) {
      const releaseError = await releaseEmployeeSlot(reservationId);
      if (releaseError) return json({ error: "Роль изменена, но освобождение резервации не подтвердилось; место освободится автоматически по истечении срока" }, 202);
    }
    return json({ success: true, employee: updated });
  }

  if (body.action === "delete_employee") {
    // Only developers can delete employee/helper accounts. The caller's own
    // account and privileged accounts are never eligible.
    if (actor.role !== "developer") return json({ error: "Удалять аккаунты может только разработчик" }, 403);
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    const mode = body.mode;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return json({ error: "Некорректный ID аккаунта" }, 400);
    }
    if (userId === authData.user.id) return json({ error: "Нельзя удалить собственную учётную запись" }, 400);
    if (mode !== "transfer" && mode !== "permanent") return json({ error: "Выберите передачу данных разработчику или безвозвратное удаление" }, 400);

    const { data: target, error: targetError } = await admin.from("profiles")
      .select("id, display_name, role").eq("id", userId).maybeSingle();
    if (targetError) return json({ error: "Не удалось проверить аккаунт" }, 500);
    if (!target || !["employee", "assistant"].includes(target.role)) {
      return json({ error: "Удалять можно только аккаунты сотрудников и помощников" }, 404);
    }

    const [{ data: checklists, error: checklistError }, { data: objects, error: storageError }] = await Promise.all([
      admin.from("checklists").select("id, title, equipment_type, payload, created_at").eq("owner_id", userId),
      admin.rpc("admin_list_storage_objects_for_user", { p_user_id: userId }),
    ]);
    if (checklistError) return json({ error: "Не удалось проверить чек-листы; удаление отменено" }, 500);
    if (storageError) return json({ error: "Не удалось проверить фотографии и файлы; удаление отменено" }, 500);

    // Block sign-in and revoke sessions before moving or deleting any data.
    const { error: banError } = await admin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
    if (banError) return json({ error: "Не удалось закрыть доступ к аккаунту; данные не изменены" }, 500);
    const { data: revokedSessionCount, error: revokeError } = await admin.rpc("revoke_auth_sessions_for_user", { p_user_id: userId });
    if (revokeError) return json({ error: "Не удалось отозвать сессии аккаунта. Аккаунт заблокирован; данные сохранены для проверки." }, 500);

    if (mode === "transfer") {
      // Copy files to a developer-managed archive first. The source remains
      // intact until every copy and checklist-reference update succeeds.
      const pathMap = new Map<string, string>();
      const copied: Array<{ bucket: string; path: string }> = [];
      for (const object of objects ?? []) {
        const bucket = object.bucket_id as string;
        const sourcePath = object.name as string;
        const archivePath = "__developer_archive/" + authData.user.id + "/" + userId + "/" + object.id + "/" + sourcePath.split("/").pop();
        const { error } = await admin.storage.from(bucket).copy(sourcePath, archivePath);
        if (error) {
          return json({ error: "Не удалось полностью скопировать файлы в архив разработчика. Исходные файлы сохранены; аккаунт заблокирован для безопасной проверки.", detail: error.message, copied_files: copied.length }, 500);
        }
        copied.push({ bucket, path: archivePath });
        pathMap.set(bucket + "/" + sourcePath, bucket + "/" + archivePath);
      }

      const rewrite = (value: unknown): unknown => {
        if (typeof value === "string") {
          let result = value;
          for (const [oldPath, newPath] of pathMap) {
            result = result.split(oldPath).join(newPath);
            result = result.split(encodeURIComponent(oldPath)).join(encodeURIComponent(newPath));
          }
          return result;
        }
        if (Array.isArray(value)) return value.map(rewrite);
        if (value && typeof value === "object") {
          return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, rewrite(item)]));
        }
        return value;
      };

      for (const checklist of checklists ?? []) {
        const updatedPayload = rewrite(checklist.payload);
        // Checklist ownership is intentionally immutable at the database layer.
        // Preserve the original creation time and content by creating a new
        // developer-owned archive record, then remove the employee-owned row.
        const { error } = await admin.from("checklists").insert({
          owner_id: authData.user.id,
          title: checklist.title,
          equipment_type: checklist.equipment_type,
          payload: updatedPayload,
          created_at: checklist.created_at,
        });
        if (error) {
          return json({ error: "Не удалось скопировать все чек-листы разработчику. Исходные записи и файлы сохранены; аккаунт заблокирован для безопасной проверки.", detail: error.message }, 500);
        }
      }
      // Remove original checklist rows only after every archive row exists.
      const { error: removeChecklistError } = await admin.from("checklists").delete().eq("owner_id", userId);
      if (removeChecklistError) {
        return json({ error: "Архивные копии чек-листов созданы, но исходные записи не удалось убрать. Аккаунт заблокирован для проверки.", detail: removeChecklistError.message }, 500);
      }
      // Remove originals only after all archived copies and references exist.
      const byBucket = new Map<string, string[]>();
      for (const object of objects ?? []) {
        const bucket = object.bucket_id as string;
        byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), object.name as string]);
      }
      for (const [bucket, paths] of byBucket) {
        const { error } = await admin.storage.from(bucket).remove(paths);
        if (error) {
          return json({ error: "История передана разработчику, но часть исходных файлов не удалось убрать. Архивные копии сохранены; аккаунт заблокирован для проверки.", detail: error.message }, 500);
        }
      }
    } else {
      // Irreversible mode: delete records, then Storage objects, then Auth user.
      const byBucket = new Map<string, string[]>();
      for (const object of objects ?? []) {
        const bucket = object.bucket_id as string;
        byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), object.name as string]);
      }
      for (const [bucket, paths] of byBucket) {
        const { error } = await admin.storage.from(bucket).remove(paths);
        if (error) return json({ error: "Не удалось удалить все файлы. Аккаунт заблокирован; оставшиеся данные требуют проверки.", detail: error.message }, 500);
      }
      const { error: checklistDeleteError } = await admin.from("checklists").delete().eq("owner_id", userId);
      if (checklistDeleteError) return json({ error: "Не удалось удалить чек-листы. Аккаунт заблокирован; требуется проверка.", detail: checklistDeleteError.message }, 500);
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) return json({ error: "Данные обработаны, но Supabase не подтвердил удаление Auth-аккаунта. Аккаунт остаётся заблокированным; требуется проверка.", detail: deleteError.message }, 500);
    return json({
      success: true, user_id: userId, deleted: true, mode,
      transferred_checklists: mode === "transfer" ? (checklists ?? []).length : 0,
      transferred_files: mode === "transfer" ? (objects ?? []).length : 0,
      deleted_checklists: mode === "permanent" ? (checklists ?? []).length : 0,
      deleted_files: mode === "permanent" ? (objects ?? []).length : 0,
      revoked_sessions: revokedSessionCount ?? 0,
    });
  }

  if (body.action === "set_employee_access") {
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    const suspended = body.suspended;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return json({ error: "Некорректный ID сотрудника" }, 400);
    }
    if (typeof suspended !== "boolean") {
      return json({ error: "Не указан статус блокировки" }, 400);
    }

    const { data: target, error: targetError } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();
    if (targetError) return json({ error: "Не удалось проверить аккаунт" }, 500);
    if (!target || !["employee", "assistant"].includes(target.role)) {
      return json({ error: "Можно менять доступ только сотрудникам и помощникам" }, 404);
    }

    const { error } = await admin.auth.admin.updateUserById(userId, {
      ban_duration: suspended ? "876000h" : "none",
    });
    if (error) return json({ error: "Не удалось изменить доступ к аккаунту" }, 500);
    return json({ success: true, user_id: userId, suspended });
  }

  return json({ error: "Неизвестное действие" }, 400);
});
