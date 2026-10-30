# Запуск тестовой панели разработчика

Файл интерфейса: `prototype/developer-admin-preview.html`.
Edge Function: `supabase/functions/account-admin/index.ts`.
Целевой тестовый проект: `fecigiwjtbtabnsfsdym`.

## Что уже сделано в репозитории
- Панель авторизуется через Supabase Auth `signInWithPassword`.
- Запросы идут в Edge Function `account-admin` с текущим JWT.
- В браузере используется только Project URL и публичный anon/publishable key.
- Сервер проверяет сессию и роль `developer` или `admin`.
- Service role остаётся только в секретах Edge Function.

## Что нужно для фактического запуска
1. Убедиться, что выбран именно тестовый проект `fecigiwjtbtabnsfsdym`.
2. В Supabase SQL Editor выполнить `supabase/account_admin_permissions.sql`.
3. Убедиться, что для проекта настроен SMTP/email provider, иначе приглашения могут не доходить.
4. Развернуть функцию из корня репозитория:
   `supabase functions deploy account-admin --project-ref fecigiwjtbtabnsfsdym`
5. Проверить в Edge Function Secrets, что присутствуют стандартные `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Не копировать service role key в HTML или чат.
6. Открыть тестовую панель, ввести Project URL и публичный anon key, затем войти учётной записью, у которой в `profiles.role` стоит `developer` или `admin`.
7. Проверить отрицательный сценарий: вход сотрудника должен завершаться отказом 403 при запросе списка и создании аккаунта.
8. Создать тестового сотрудника с доступным тестовым email; проверить письмо-приглашение, профиль, блокировку и восстановление.

## Важные ограничения перед production
- Текущая проверка лимита 15 сотрудников — предварительная и не защищает от двух одновременных приглашений на границе лимита. Перед production заменить на атомарную серверную операцию.
- Нужны rate limiting, аудит действий разработчиков, проверка повторного приглашения, безопасный сброс/отзыв приглашения и проверка конфигурации SMTP.
- Не публиковать эту панель в основной сайт, пока интеграция и тесты не завершены.
- Не переносить старые localStorage/IndexedDB чек-листы и фотографии автоматически.
