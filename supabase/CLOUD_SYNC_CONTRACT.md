# Контракт облачного слоя чек-листов

Файл `prototype/supabase-cloud-sync.js` — изолированный слой доступа к `public.checklists`. Он не подключён автоматически к существующим обработчикам интерфейса и не импортирует данные LocalStorage/IndexedDB.

## Использование

После загрузки `prototype/supabase-auth.js`:

```js
import { createCloudSync } from "./prototype/supabase-cloud-sync.js";

await window.TMHAuthReady;
const cloud = createCloudSync(window.TMHAuth);
const records = await cloud.list();
```

Передача owner ID от UI не предусмотрена: владелец вычисляется заново через `TMHAuth.getCurrentIdentity()` для каждой операции.

## API

- `list()` — получить записи текущего владельца.
- `create({ title, equipmentType, payload })` — создать запись, owner_id берётся из сессии.
- `update({ id, expectedRevision, title, equipmentType, payload })` — обновить только при совпадении revision.
- `remove(id)` — удалить только запись текущего владельца.

## Конкурентные изменения

Обновление использует compare-and-swap: `id + owner_id + revision`. Revision увеличивается на единицу. Если другая сессия уже обновила запись или запись удалена, возвращается `REVISION_CONFLICT`; автоматическая перезапись не выполняется.

## Ограничения

- Payload ограничен 512 КБ и должен быть JSON-объектом.
- Inline base64 изображения запрещены. Фотографии требуют отдельной интеграции с Supabase Storage и приватными RLS-политиками.
- Этот модуль пока не решает offline queue, retry/idempotency, конфликтное слияние, миграцию локальных данных и привязку текущих пяти форматов чек-листов к облачному payload.
- Не считать облачную синхронизацию включённой в пользовательском интерфейсе до отдельной интеграции и browser E2E тестов.
