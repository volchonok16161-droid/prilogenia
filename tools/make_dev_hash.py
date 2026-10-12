#!/usr/bin/env python3
"""
Смена пароля разработчика.

    python3 tools/make_dev_hash.py "новый_пароль" приложение/index.html

Скрипт вычисляет SHA-256-хеш (с той же «солью», что и приложение) и подставляет его
в index.html вместо старого. Пароль в открытом виде в файл не записывается.

ВАЖНО: это лишь затруднение для случайного входа. Настоящая защита публикации — токен GitHub:
без него никто не сможет изменить файл oborudovanie.json на сайте.
"""
import hashlib
import re
import sys

SALT = 'tmh-checklist-dev:'

if len(sys.argv) != 3:
    print(__doc__)
    sys.exit(2)

password, path = sys.argv[1], sys.argv[2]
if len(password) < 8:
    print('Пароль слишком короткий (нужно минимум 8 символов).')
    sys.exit(1)
new_hash = hashlib.sha256((SALT + password).encode('utf-8')).hexdigest()
text = open(path, encoding='utf-8').read()
pattern = re.compile(r"(const DEV_CREDENTIALS=\{login:'developer',passHash:')[0-9a-f]{64}(')")
if len(pattern.findall(text)) != 1:
    print('Не найдена строка DEV_CREDENTIALS в', path)
    sys.exit(1)
text = pattern.sub(lambda m: m.group(1) + new_hash + m.group(2), text)
# проверочная функция сравнивает с тем же хешем — заменяем и её
text, n = re.subn(r"(__sha256\('" + re.escape(SALT) + r"'\+String\(p\)\)===')[0-9a-f]{64}(')", lambda m: m.group(1) + new_hash + m.group(2), text)
if n != 1:
    print('Не найдена проверка пароля __devPassOk')
    sys.exit(1)
open(path, 'w', encoding='utf-8').write(text)
print('Готово: пароль разработчика заменён. Логин: developer')
print('После смены пароля обновите sw.js (CACHE_VERSION), чтобы пользователи получили новую версию.')
