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
    const password = typeof body.password === "string" ? body.password : "";
    const accounts: Record<string, { email: string; displayName: string }> = {
      "ЦГиСПЛ-Карасук": { email: "cgspl-karasuk@accounts.invalid", displayName: "ЦГиСПЛ-Карасук" },
      "ЦГиСПЛ-Тимашевск": { email: "cgspl-timashevsk@accounts.invalid", displayName: "ЦГиСПЛ-Тимашевск" },
    };
    const account = accounts[username];
    if (!account) return json({ error: "Неизвестный логин сотрудника" }, 400);
    if (password.length < 8 || password.length > 128) {
      return json({ error: "Пароль должен содержать от 8 до 128 символов" }, 400);
    }

    const { count, error: countError } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "employee");
    if (countError) return json({ error: "Не удалось проверить лимит сотрудников" }, 500);
    if ((count ?? 0) >= 15) return json({ error: "Достигнут лимит в 15 сотрудников" }, 409);

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: { display_name: account.displayName },
    });
    if (createError || !created.user) {
      return json({ error: createError?.message ?? "Не удалось создать аккаунт" }, 409);
    }

    const { error: profileError } = await admin.from("profiles").upsert({
      id: created.user.id,
      display_name: account.displayName,
      role: "employee",
    }, { onConflict: "id" });

    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return json({ error: "Не удалось создать профиль сотрудника; учётная запись Auth отменена" }, 500);
    }

    return json({
      success: true,
      employee: { id: created.user.id, display_name: account.displayName, role: "employee" },
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

    const { count, error: countError } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "employee");
    if (countError) return json({ error: "Не удалось проверить лимит сотрудников" }, 500);
    if ((count ?? 0) >= 15) return json({ error: "Достигнут лимит в 15 сотрудников" }, 409);

    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { display_name: displayName },
    });
    if (inviteError || !inviteData.user) {
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
      return json({ error: "Не удалось создать профиль сотрудника" }, 500);
    }

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

    // This preflight preserves the existing cap, but is not concurrency-safe.
    // A database-side atomic quota is still required before this becomes a hard invariant.
    if (role === "employee") {
      const { count, error: countError } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "employee");
      if (countError) return json({ error: "Не удалось проверить лимит сотрудников" }, 500);
      if ((count ?? 0) >= 15) return json({ error: "Достигнут лимит в 15 сотрудников" }, 409);
    }

    const { data: updated, error: updateError } = await admin
      .from("profiles")
      .update({ role })
      .eq("id", userId)
      .in("role", ["employee", "assistant"])
      .select("id, display_name, role")
      .maybeSingle();
    if (updateError) return json({ error: "Не удалось изменить роль аккаунта" }, 500);
    if (!updated) return json({ error: "Роль аккаунта изменилась параллельно. Обновите список." }, 409);
    return json({ success: true, employee: updated });
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
