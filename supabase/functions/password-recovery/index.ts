// Serves a standalone Supabase password-recovery page.
// Deploy as the Edge Function "password-recovery".
// The public anon/publishable key is entered by the user; never put service_role here.
const SUPABASE_URL = "https://fecigiwjtbtabnsfsdym.supabase.co";

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Восстановление пароля</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:24px 14px;background:#f4f6fa;color:#172033;font:16px system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:460px;margin:7vh auto;background:#fff;border:1px solid #e3e8f0;border-radius:18px;padding:24px;box-shadow:0 8px 28px #1a27440c}
h1{font-size:23px;margin:0 0 8px}p{color:#64748b;line-height:1.5;font-size:14px}
label{display:block;font-size:13px;font-weight:650;margin:16px 0 6px}
input{width:100%;padding:12px;border:1px solid #d8dfeb;border-radius:10px;font:inherit}
button{margin-top:18px;border:0;border-radius:10px;padding:13px 16px;background:#315efb;color:white;font:inherit;font-weight:650;cursor:pointer;width:100%}
button:disabled{opacity:.55}.msg{margin-top:14px;padding:12px;border-radius:10px;background:#edf2ff;color:#244bd4;font-size:14px;white-space:pre-wrap}
.err{background:#fff0ee;color:#a33b30}.hidden{display:none}
</style>
</head>
<body><main>
<h1>Восстановление пароля</h1>
<p>Укажите публичный ключ Supabase и почту аккаунта. Ключ anon/publishable предназначен для клиентского использования. Никогда не вводите service_role key.</p>
<section id="request">
<label for="key">Публичный anon / publishable key</label><input id="key" type="password" autocomplete="off" placeholder="Публичный ключ Supabase">
<label for="email">Электронная почта аккаунта</label><input id="email" type="email" autocomplete="email" placeholder="name@example.com">
<button id="send">Отправить письмо для восстановления</button>
</section>
<form id="change" class="hidden">
<label for="password">Новый пароль (не менее 8 символов)</label><input id="password" type="password" minlength="8" autocomplete="new-password" required>
<label for="confirm">Повторите новый пароль</label><input id="confirm" type="password" minlength="8" autocomplete="new-password" required>
<button id="save" type="submit">Сохранить новый пароль</button>
</form>
<div id="msg" class="msg">Сначала запросите письмо. Если вы уже перешли по ссылке из письма, страница проверит сессию после ввода публичного ключа.</div>
</main>
<script type="module">
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = "${SUPABASE_URL}";
const $ = id => document.getElementById(id);
const show = (text, error=false) => { $("msg").textContent=text; $("msg").classList.toggle("err",error); };
let client = null;
function initClient(key) {
  if (!key) throw new Error("Введите публичный anon/publishable key.");
  client = createClient(SUPABASE_URL,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:"implicit"}});
  return client;
}
$("send").addEventListener("click", async () => {
  const key=$("key").value.trim(), email=$("email").value.trim();
  if(!email){show("Введите электронную почту аккаунта.",true);return;}
  $("send").disabled=true;
  try {
    initClient(key);
    const redirectTo=location.origin+location.pathname;
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo});
    if(error) throw error;
    show("Если аккаунт с таким адресом существует, письмо для восстановления будет отправлено. Откройте ссылку в этом же браузере.");
  } catch(e) { show("Не удалось отправить письмо: "+e.message,true); }
  finally {$("send").disabled=false;}
});
$("key").addEventListener("change", async () => {
  try {
    initClient($("key").value.trim());
    const {data,error}=await client.auth.getSession();
    if(error) throw error;
    if(data.session) {
      $("request").classList.add("hidden");
      $("change").classList.remove("hidden");
      show("Ссылка подтверждена. Задайте новый пароль.");
    } else {
      show("Активная сессия восстановления не обнаружена. Если вы только что открыли письмо, проверьте, что ссылка ведёт на эту страницу, и запросите новое письмо.");
    }
  } catch(e) { show("Не удалось проверить ссылку: "+e.message,true); }
});
$("change").addEventListener("submit",async e=>{
  e.preventDefault();
  const password=$("password").value, confirm=$("confirm").value;
  if(password.length<8){show("Пароль должен содержать не менее 8 символов.",true);return;}
  if(password!==confirm){show("Пароли не совпадают.",true);return;}
  $("save").disabled=true;
  try {
    const {error}=await client.auth.updateUser({password});
    if(error) throw error;
    await client.auth.signOut();
    $("change").classList.add("hidden");
    show("Пароль успешно изменён. Теперь можно войти в приложение с новым паролем.");
  } catch(e) { show("Не удалось изменить пароль: "+e.message,true); }
  finally {$("save").disabled=false;}
});
</script>
</body></html>`;

Deno.serve((req) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { "Allow": "GET, HEAD" } });
  }
  return new Response(req.method === "HEAD" ? null : html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
});
