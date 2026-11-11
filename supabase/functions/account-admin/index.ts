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
      await admin.auth.admin.deleteUser(created.user.id);
      await releaseEmployeeSlot(reservation.reservationId);
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
      // Не оставляем Auth-пользователя без профиля при неудаче вставки.
      await admin.auth.admin.deleteUser(inviteData.user.id);
      await releaseEmployeeSlot(reservation.reservationId);
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
    // Permanent account deletion is deliberately restricted to developers.
    if (actor.role !== "developer") {
      return json({ error: "Удалять аккаунты может только разработчик" }, 403);
    }
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return json({ error: "Некорректный ID аккаунта" }, 400);
    }
    if (userId === authData.user.id) {
      return json({ error: "Нельзя удалить собственную учётную запись" }, 400);
    }

    const { data: target, error: targetError } = await admin
      .from("profiles")
      .select("id, display_name, role")
      .eq("id", userId)
      .maybeSingle();
    if (targetError) return json({ error: "Не удалось проверить аккаунт" }, 500);
    if (!target || !["employee", "assistant"].includes(target.role)) {
      return json({ error: "Удалять можно только аккаунты сотрудников и помощников" }, 404);
    }

    // profiles/checklists use ON DELETE CASCADE. Never hard-delete an account
    // while it owns cloud checklists: that would destroy business records.
    const { count: checklistCount, error: checklistError } = await admin
      .from("checklists")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId);
    if (checklistError) return json({ error: "Не удалось проверить облачные чек-листы; удаление отменено" }, 500);
    if ((checklistCount ?? 0) > 0) {
      return json({
        error: "Удаление запрещено: у аккаунта есть облачные чек-листы. Сначала сохраните или передайте их, затем повторите удаление.",
        checklist_count: checklistCount,
      }, 409);
    }

    // Supabase Auth refuses deletion while the user owns Storage objects.
    // Fail closed if Storage ownership cannot be checked.
    const { count: storageObjectCount, error: storageError } = await admin
      .schema("storage")
      .from("objects")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId);
    if (storageError) return json({ error: "Не удалось проверить файлы аккаунта; удаление отменено" }, 500);
    if ((storageObjectCount ?? 0) > 0) {
      return json({
        error: "Удаление запрещено: у аккаунта остались файлы в Supabase Storage. Сначала сохраните или передайте файлы.",
        storage_object_count: storageObjectCount,
      }, 409);
    }

    // Ban first to prevent new sign-ins while the account is being removed.
    const { error: banError } = await admin.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });
    if (banError) return json({ error: "Не удалось временно закрыть доступ; аккаунт не удалён" }, 500);

    // Recheck after blocking access to reduce the chance of deleting data
    // created between the initial preflight and the ban.
    const [{ count: finalChecklistCount, error: finalChecklistError }, { count: finalStorageCount, error: finalStorageError }] = await Promise.all([
      admin.from("checklists").select("id", { count: "exact", head: true }).eq("owner_id", userId),
      admin.schema("storage").from("objects").select("id", { count: "exact", head: true }).eq("owner_id", userId),
    ]);
    if (finalChecklistError || finalStorageError || (finalChecklistCount ?? 0) > 0 || (finalStorageCount ?? 0) > 0) {
      const { error: restoreError } = await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
      if (restoreError) {
        return json({ error: "Удаление отменено, но автоматическое восстановление доступа не удалось. Аккаунт остаётся заблокированным; требуется ручная проверка." }, 500);
      }
      return json({ error: "После блокировки доступа обнаружены связанные данные или ошибка проверки. Аккаунт не удалён; доступ восстановлен." }, 409);
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      const { error: restoreError } = await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
      if (restoreError) {
        return json({ error: "Supabase не подтвердил удаление, и восстановить доступ автоматически не удалось. Аккаунт остаётся заблокированным; требуется ручная проверка." }, 500);
      }
      return json({ error: "Supabase не подтвердил удаление аккаунта; доступ восстановлен. " + deleteError.message }, 500);
    }
    return json({ success: true, user_id: userId, deleted: true });
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
