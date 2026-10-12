#!/usr/bin/env python3
"""
Проверка консистентности чек-листа ТМХ/НЭВЗ.

Запускать после любых правок:
    python3 tools/check_consistency.py приложение/index.html

Что делает:
  * вырезает из index.html 4 встроенные копии (ТТ, БИ, Гидродемпферы,
    Комплексный/КМБ). Они лежат как шаблонные строки (`...`) с обычным HTML —
    не base64 — и раскрываются так же, как это делает браузер;
  * проверяет каждую копию и внешнюю оболочку на одинаковые признаки;
  * проверяет JS-синтаксис всех <script> (нужен установленный node, иначе шаг пропускается);
  * проверяет файлы PWA рядом с index.html (sw.js, manifest.json, иконки).
Код возврата: 0 — всё хорошо, 1 — есть проблемы, 2 — неверный запуск.
"""
import json
import os
import re
import subprocess
import sys

EMBEDS = {
    'EMBED_TT_HTML': 'Тяговый трансформатор (ТТ)',
    'EMBED_BI_HTML': 'МСУД-015 защита (БИ)',
    'EMBED_HYDRO_HTML': 'Гидродемпферы',
    'EMBED_CHECKLIST_HTML': 'Комплексный / КМБ',
}
REQUIRED_SHEETS = ['Данные', 'Фотографии', 'Сводная', 'История изменений']
RISK_SHEETS = ['Инструкция', 'ТТ', 'БИ', 'Гидродемпферы', 'Комплексный', 'КМБ', 'Места осмотра', 'Узлы', 'Список узлов']
SIMPLE_ESC = {'n': '\n', 't': '\t', 'r': '\r', 'b': '\b', 'f': '\f', 'v': '\v', '0': '\0'}


def read_template(text, name):
    """Возвращает (раскрытое содержимое, позиция начала, позиция конца) шаблонной строки."""
    marker = 'const ' + name + '=`'
    start = text.find(marker)
    if start < 0:
        return None
    p = start + len(marker)
    out = []
    while p < len(text):
        c = text[p]
        if c == '\\':
            n = text[p + 1]
            if n == 'u' and text[p + 2] == '{':
                end = text.index('}', p)
                out.append(chr(int(text[p + 3:end], 16)))
                p = end + 1
                continue
            if n == 'u':
                out.append(chr(int(text[p + 2:p + 6], 16)))
                p += 6
                continue
            if n == 'x':
                out.append(chr(int(text[p + 2:p + 4], 16)))
                p += 4
                continue
            if n == '\n':
                p += 2
                continue
            out.append(SIMPLE_ESC.get(n, n))
            p += 2
            continue
        if c == '`':
            return ''.join(out), start, p + 1
        out.append(c)
        p += 1
    raise ValueError('Не закрыта шаблонная строка ' + name)


def load_sources(path):
    with open(path, encoding='utf-8') as f:
        content = f.read()
    sources = {}
    shell = content
    for name, label in EMBEDS.items():
        res = read_template(content, name)
        if res is None:
            print('❌ Не найдена константа %s' % name)
            continue
        body, s, e = res
        sources[label] = body
    # оболочка = файл без встроенных шаблонов
    for name in EMBEDS:
        res = read_template(shell, name)
        if res:
            shell = shell[:res[1]] + 'const ' + name + '="";' + shell[res[2]:]
    sources['Внешняя оболочка'] = shell
    return sources, content


def script_blocks(html):
    pat = re.compile(r'<!--[\s\S]*?-->|<script([^>]*)>([\s\S]*?)</script>')
    for m in pat.finditer(html):
        if m.group(0).startswith('<!--') or 'src=' in (m.group(1) or ''):
            continue
        yield html[:m.start()].count('\n') + 1, m.group(2)


def js_syntax_errors(label, html):
    errs = []
    js = ("const vm=require('vm');let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{"
          "try{new vm.Script(d)}catch(e){console.log(e.message);process.exit(1)}})")
    for line, code in script_blocks(html):
        try:
            r = subprocess.run(['node', '-e', js], input=code, text=True, capture_output=True, timeout=60)
        except FileNotFoundError:
            return None
        if r.returncode != 0:
            errs.append('%s: синтаксическая ошибка в <script> около строки %d: %s' % (label, line, r.stdout.strip()))
    return errs


def function_body(text, name):
    m = re.search(r'(?:async\s+)?function\s+' + re.escape(name) + r'\s*\([^)]*\)\s*\{', text)
    if not m:
        return None
    i = m.end() - 1
    depth = 0
    while i < len(text):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                return text[m.start():i + 1]
        i += 1
    return None


def check(path):
    problems = []
    sources, content = load_sources(path)
    base = os.path.dirname(os.path.abspath(path))
    embeds_only = {k: v for k, v in sources.items() if k != 'Внешняя оболочка'}

    # 1. Листы Excel одинаковы во всех копиях и содержат обязательные
    ref = None
    for label, txt in embeds_only.items():
        sheets = re.findall(r"addWorksheet\(['\"]([^'\"]+)['\"]\)", txt)
        if ref is None:
            ref, ref_label = sheets, label
        elif sheets != ref:
            problems.append('Листы Excel различаются: «%s» = %s, «%s» = %s' % (label, sheets, ref_label, ref))
        for req in REQUIRED_SHEETS:
            if req not in sheets:
                problems.append('«%s»: нет обязательного листа Excel «%s»' % (label, req))

    for label, txt in embeds_only.items():
        # 2. Константа лимита колонок и журнал изменений
        if 'MAX_OPS_COLUMNS' not in txt:
            problems.append('«%s»: не используется MAX_OPS_COLUMNS' % label)
        if 'changeLog' not in txt:
            problems.append('«%s»: нет журнала изменений changeLog' % label)

    for label, txt in sources.items():
        compact = re.sub(r'\s+', '', txt)
        # 3. Пароль не хранится открыто
        if '{login,password}' in compact:
            problems.append('«%s»: пароль пишется в localStorage в открытом виде' % label)
        if re.search(r"password:'[^']+'", compact) and 'passHash' not in compact:
            problems.append('«%s»: пароль администратора лежит в коде открытым текстом' % label)
        if re.search(r"password:'[^']+'", compact):
            problems.append('«%s»: найден пароль в открытом виде (password:\'...\')' % label)
        # 4. Дубли функций верхнего уровня (в оболочке — уже без встроенных копий)
        names = re.findall(r'(?m)^function\s+([A-Za-z_]\w*)\s*\(', txt)
        dups = sorted({n for n in names if names.count(n) > 1})
        if dups:
            problems.append('«%s»: функции объявлены повторно (вторая перезаписывает первую): %s' % (label, ', '.join(dups)))

    for label, txt in embeds_only.items():
        # 5. Процент заполнения нельзя округлять вверх: 99,5% не должно становиться 100%
        if re.search(r'Math\.round\(\s*100\s*\*', txt):
            problems.append('«%s»: процент считается через Math.round — 99,5%%+ покажется как 100%% и откроет экспорт' % label)
        # 6. saveState обязан ловить ошибки записи
        body = function_body(txt, 'saveState')
        if body is None:
            problems.append('«%s»: нет функции saveState' % label)
        elif 'catch' not in body:
            problems.append('«%s»: saveState без try/catch — при переполнении localStorage данные теряются молча' % label)
        # 7. Подсчёт процента и подсказка/поиск фото должны использовать одни правила
        if label == EMBEDS['EMBED_HYDRO_HTML']:
            us = function_body(txt, 'updateStats') or ''
            if 'computeStats' not in us:
                problems.append('«%s»: updateStats не использует computeStats — строка «Заполнено» и экспорт игнорируют обязательные фото' % label)
        if label in (EMBEDS['EMBED_TT_HTML'], EMBEDS['EMBED_BI_HTML']):
            gu = function_body(txt, 'getUnfilledElements') or ''
            if '.photo-area' not in gu:
                problems.append('«%s»: поиск незаполненного требует фото у полей без блока фото' % label)

    # 8. Надстройка индикации фото не должна глотать вызовы для карточек .card-item
    if "orig.call(this, iid, fieldKey)" not in content:
        problems.append('Надстройка updatePhotoRequirementForField не вызывает оригинал для карточек .card-item (гидродемпферы)')

    # 9. Синтаксис JS
    for label, txt in sources.items():
        errs = js_syntax_errors(label, txt)
        if errs is None:
            print('⚠️  node не найден — проверка синтаксиса JS пропущена')
            break
        problems.extend(errs)

    # 10. PWA-файлы
    sw = os.path.join(base, 'sw.js')
    if os.path.exists(sw):
        sw_txt = open(sw, encoding='utf-8').read()
        shell = re.search(r'APP_SHELL\s*=\s*\[([\s\S]*?)\]', sw_txt)
        for f in re.findall(r"'\./([^']+)'", shell.group(1) if shell else ''):
            if f and not os.path.exists(os.path.join(base, f)):
                problems.append('sw.js: файл из APP_SHELL не найден: ' + f)
        print('Версия кэша service worker:', (re.search(r"CACHE_VERSION\s*=\s*'([^']+)'", sw_txt) or [None, '?'])[1])
    else:
        problems.append('Нет sw.js рядом с index.html')
    man = os.path.join(base, 'manifest.json')
    if os.path.exists(man):
        try:
            for ic in json.load(open(man, encoding='utf-8')).get('icons', []):
                if not os.path.exists(os.path.join(base, ic['src'])):
                    problems.append('manifest.json: нет файла иконки ' + ic['src'])
                if ic.get('purpose', '') == 'any maskable':
                    problems.append('manifest.json: purpose "any maskable" у %s — нужны отдельные maskable-иконки' % ic['src'])
        except Exception as e:
            problems.append('manifest.json не читается: %s' % e)

    # 11. «Зона риска»: модуль, кнопка, правило в sw.js и файл со всеми листами
    if '__RISK_CORE__' not in content or 'applyRegistry(html, mode)' not in content:
        problems.append('Справочник из zona_riska.xlsx не подключён к запуску чек-листов (нет __RISK_CORE__ / applyRegistry)')
    if 'ready(2500)' not in content:
        problems.append('showEmbeddedApp не дожидается загрузки zona_riska.xlsx — чек-лист может стартовать со старым списком')
    for label, txt in embeds_only.items():
        if '__nrEval' not in txt or 'NODE_RULES' not in txt:
            problems.append('«%s»: нет блока правил узлов (лист «Узлы» не будет действовать)' % label)
        if 'buildEquipment=function' not in txt or 'getSections=function' not in txt:
            problems.append('«%s»: правила узлов не подключены к buildEquipment/getSections' % label)
    for label, txt in embeds_only.items():
        if 'LOCOMOTIVE_PLACES' not in txt:
            problems.append('«%s»: не учитывается индивидуальное место осмотра локомотива (LOCOMOTIVE_PLACES)' % label)
    if '__DEV_PANEL_V1__' not in content or 'DEV_CREDENTIALS' not in content:
        problems.append('Нет панели разработчика или входа разработчика в index.html')
    if re.search(r"DEV_CREDENTIALS\s*=\s*\{[^}]*password\s*:", content):
        problems.append('Пароль разработчика хранится в открытом виде (должен быть passHash)')
    ck = sources.get(EMBEDS['EMBED_CHECKLIST_HTML'], '')
    if '__ceField' not in ck or 'photoAlways' not in ck:
        problems.append('Комплексный чек-лист: не подключено оборудование из конструктора (__ceField / photoAlways)')
    if os.path.exists(sw) and 'oborudovanie' not in open(sw, encoding='utf-8').read():
        problems.append('sw.js: нет правила «сначала сеть» для oborudovanie.json')
    oj = os.path.join(base, 'oborudovanie.json')
    if not os.path.exists(oj):
        problems.append('Нет файла oborudovanie.json рядом с index.html')
    else:
        try:
            data = json.load(open(oj, encoding='utf-8'))
            if not isinstance(data.get('equipment'), list):
                problems.append('oborudovanie.json: нет списка equipment')
        except Exception as e:
            problems.append('oborudovanie.json не читается: %s' % e)
    if '__RISK_ZONE_V1__' not in content or 'id="riskBtnBar"' not in content:
        problems.append('Нет модуля или кнопки «Зона риска» в index.html')
    if os.path.exists(sw) and 'zona_riska' not in open(sw, encoding='utf-8').read():
        problems.append('sw.js: нет правила «сначала сеть» для zona_riska.xlsx — правки списка будут доходить с задержкой')
    xl = os.path.join(base, 'zona_riska.xlsx')
    if not os.path.exists(xl):
        problems.append('Нет файла zona_riska.xlsx рядом с index.html')
    else:
        try:
            import zipfile
            with zipfile.ZipFile(xl) as z:
                names = re.findall(r'<sheet [^>]*name="([^"]+)"', z.read('xl/workbook.xml').decode('utf-8'))
            for need in RISK_SHEETS:
                if need not in names:
                    problems.append('zona_riska.xlsx: нет листа «%s»' % need)
        except Exception as e:
            problems.append('zona_riska.xlsx не читается: %s' % e)

    print('Проверено источников: %d' % len(sources))
    if not problems:
        print('✅ Расхождений не найдено.')
        return 0
    print('❌ Найдено проблем: %d\n' % len(problems))
    for i, p in enumerate(problems, 1):
        print('%d. %s' % (i, p))
    return 1


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Использование: python3 check_consistency.py путь/к/index.html')
        sys.exit(2)
    sys.exit(check(sys.argv[1]))
