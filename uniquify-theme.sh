#!/usr/bin/env bash
#
# uniquify-theme.sh — рандомизация "отпечатков" темы (HTML / CSS / JS).
#
# Назначение:
#   Сделать из одной темы несколько визуально идентичных, но технически
#   уникальных копий. Структура (DOM, селекторы, логика) НЕ меняется —
#   меняются только "отпечатки", по которым тему опознают краулеры/сканеры:
#     * имена кастомных CSS-классов и id (консистентно во всех файлах);
#     * имена кастомных CSS-переменных (--var);
#     * data-* атрибуты-маркеры;
#     * сигнатурные комментарии и <meta name="generator">;
#     * размер файлов и хеши (за счёт случайных невидимых вставок и
#       перетасовки незначащих пробелов/переводов строк).
#
# Что НЕ трогается (чтобы не сломать вёрстку):
#   - текстовый контент внутри тегов;
#   - значения свойств CSS и порядок объявлений внутри правила;
#   - имена тегов, атрибуты href/src и т.п.;
#   - любые классы/id/переменные, которых нет в карте переименования.
#
# Подход к переименованию — две стратегии:
#   1) АВТО (по умолчанию): скрипт сам собирает имена классов/id из
#      CSS-селекторов вашей темы и имена CSS-переменных (--var). Берутся
#      только идентификаторы, реально объявленные в локальном CSS, — то есть
#      гарантированно "свои", а не сторонние. Имена-омонимы HTML-тегов
#      (body, code, nav, header, footer, form, ...) в авто-режиме
#      исключаются, чтобы не сломать JS-селекторы вида querySelector('nav').
#   2) "БЕЛЫЙ СПИСОК": через --tokens вы задаёте базовые токены вручную;
#      тогда авто-сбор классов отключается (переменные всё равно собираются).
#   Доп. охват и контроль: --scan-html добавляет в карту классы/id из
#   HTML-атрибутов; --exclude "a,b" исключает конкретные имена;
#   --include-reserved разрешает имена-омонимы тегов; --no-auto-tokens
#   выключает авто-сбор классов. Это исключает поломку сторонних классов
#   (bootstrap, tailwind, иконочные шрифты и пр.).
#
# Зависимости: bash 4+, coreutils (sed, awk, find, sort), perl 5
#              (для контекстно-безопасного переименования) и один из:
#              md5sum | shasum | openssl  (для детерминизма по seed).
#              Недостающие perl/утилиту хеширования скрипт пытается доустановить
#              сам через доступный пакетный менеджер (отключается --no-install-deps).
#
# Безопасность переименования (контекстная):
#   Токены заменяются ТОЛЬКО там, где это действительно класс/id, и нигде
#   больше:
#     * HTML — только внутри значений атрибутов class="..." и id="...";
#     * CSS  — только в селекторах вида .token / #token (имена тегов,
#              свойства и значения не трогаются);
#     * JS   — только внутри строковых литералов ('...', "...", `...`).
#   Имена HTML-тегов, текст страницы, имена свойств и любые совпадения вне
#   этих контекстов остаются нетронутыми. BEM-суффиксы сохраняются:
#   класс hero превратится в u<hash>, а hero--big — в u<hash>--big.
#
# Использование:
#   # Простой режим: положить скрипт в папку темы и запустить — он обработает
#   # html/css/js в этой же папке и соберёт результат в output.zip рядом с собой.
#   ./uniquify-theme.sh [опции]
#
#   # Расширенный режим: явно указать исходную папку/архив:
#   scripts/uniquify-theme.sh -s SRC_DIR [--zip OUT.zip | -o OUT_DIR] [опции]
#
# Запустив скрипт с разными --seed, вы получите разные уникальные сборки.
# С одинаковым --seed результат полностью воспроизводим.

set -euo pipefail

# Папка, где лежит сам скрипт. По умолчанию именно она и обрабатывается,
# а результат складывается в zip-архив рядом со скриптом.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)"
SELF_NAME="$(basename "${BASH_SOURCE[0]}")"

# --------------------------- значения по умолчанию ---------------------------
SRC=""
OUT=""
SEED=""
PREFIX="u"                      # префикс для сгенерированных имён (u<hash>)
TOKENS=""                       # список базовых классов/id через запятую
TOKENS_FILE=""                  # либо файл со списком (по токену на строку)
AUTO_TOKENS=1                   # авто-сбор классов/id из CSS, если --tokens не задан
SCAN_HTML=0                     # дополнительно собирать классы/id из HTML-атрибутов
INCLUDE_RESERVED=0              # включать в карту имена-омонимы HTML-тегов (опасно для JS)
EXCLUDE=""                      # имена, исключаемые из переименования (через запятую)
RENAME_VARS=1                   # переименовывать ли CSS-переменные --var
INJECT_COMMENTS=1               # вставлять ли случайные комментарии-маркеры
JITTER_WHITESPACE=1             # подмешивать ли незначащие пробелы/переводы строк
STRIP_GENERATOR=1               # вычищать/рандомизировать <meta name="generator">
EXTENSIONS="html,htm,css,js"   # какие расширения обрабатывать
AUTO_INSTALL_DEPS=1             # доустанавливать недостающие зависимости автоматически
MAKE_ZIP=1                      # упаковывать результат в zip-архив
ZIP_EXPLICIT=0                  # пользователь явно указал --zip/--no-zip
ZIP_OUT=""                      # путь к итоговому zip (по умолч. <папка скрипта>/output.zip)
VERBOSE=0

usage() {
  sed -n '2,40p' "$0" | sed 's/^# \{0,1\}//'
  cat <<'EOF'

Опции:
  -s, --src DIR          исходная папка темы (по умолчанию — папка скрипта)
  -o, --out DIR          папка для уникальной копии (по умолчанию — временная)
      --zip FILE         путь к итоговому zip (по умолчанию: <папка скрипта>/output.zip)
      --no-zip           не упаковывать результат в zip
      --seed STR         seed для воспроизводимости (по умолчанию — случайный)
      --prefix STR       префикс генерируемых имён (по умолчанию: u)
      --tokens "a,b,c"   список базовых классов/id для переименования
                         (если задан — авто-сбор классов отключается)
      --tokens-file F    файл со списком токенов (по одному на строку)
      --no-auto-tokens   не собирать классы/id из CSS автоматически
      --scan-html        дополнительно собирать классы/id из HTML-атрибутов
      --include-reserved разрешить переименование имён-омонимов HTML-тегов
                         (body, code, nav, ... — может сломать JS-селекторы)
      --exclude "a,b"    имена, которые не переименовывать
      --ext "html,css"   расширения для обработки (по умолчанию: html,htm,css,js)
      --no-vars          не переименовывать CSS-переменные (--var)
      --no-comments      не вставлять случайные комментарии-маркеры
      --no-jitter        не подмешивать незначащие пробелы
      --keep-generator   не трогать <meta name="generator">
      --no-install-deps  не доустанавливать недостающие зависимости автоматически
  -v, --verbose          подробный вывод
  -h, --help             эта справка

Примеры:
  # Полный авто-режим: положить скрипт в папку темы и запустить. Классы/id
  # и CSS-переменные собираются из самой темы — результат в output.zip рядом:
  ./uniquify-theme.sh

  # Авто-режим с расширенным охватом (классы из HTML тоже) и фикс. seed:
  ./uniquify-theme.sh --scan-html --seed site-01

  # Ручной белый список + явные пути:
  scripts/uniquify-theme.sh -s ./theme --zip ./build/site-01.zip \
      --tokens "hero,card,btn,nav,footer" --seed site-01
EOF
}

log()  { [ "$VERBOSE" -eq 1 ] && printf '[uniquify] %s\n' "$*" >&2 || true; }
die()  { printf 'Ошибка: %s\n' "$*" >&2; exit 1; }

# ------------------------------- разбор аргументов ---------------------------
while [ $# -gt 0 ]; do
  case "$1" in
    -s|--src)         SRC="${2:-}"; shift 2;;
    -o|--out)         OUT="${2:-}"; shift 2;;
    --seed)           SEED="${2:-}"; shift 2;;
    --prefix)         PREFIX="${2:-}"; shift 2;;
    --tokens)         TOKENS="${2:-}"; shift 2;;
    --tokens-file)    TOKENS_FILE="${2:-}"; shift 2;;
    --no-auto-tokens) AUTO_TOKENS=0; shift;;
    --scan-html)      SCAN_HTML=1; shift;;
    --include-reserved) INCLUDE_RESERVED=1; shift;;
    --exclude)        EXCLUDE="${2:-}"; shift 2;;
    --ext)            EXTENSIONS="${2:-}"; shift 2;;
    --no-vars)        RENAME_VARS=0; shift;;
    --no-comments)    INJECT_COMMENTS=0; shift;;
    --no-jitter)      JITTER_WHITESPACE=0; shift;;
    --keep-generator) STRIP_GENERATOR=0; shift;;
    --no-install-deps) AUTO_INSTALL_DEPS=0; shift;;
    --zip)            ZIP_OUT="${2:-}"; MAKE_ZIP=1; ZIP_EXPLICIT=1; shift 2;;
    --no-zip)         MAKE_ZIP=0; ZIP_EXPLICIT=1; shift;;
    -v|--verbose)     VERBOSE=1; shift;;
    -h|--help)        usage; exit 0;;
    *) die "неизвестный аргумент: $1 (см. --help)";;
  esac
done

# По умолчанию работаем в папке самого скрипта.
[ -n "$SRC" ] || SRC="$SCRIPT_DIR"
[ -n "$SRC" ] || die "не удалось определить папку скрипта; задайте --src"
[ -d "$SRC" ] || die "исходная папка не найдена: $SRC"
# Нормализуем путь к исходнику (для надёжных сравнений/исключений).
SRC="$(cd "$SRC" && pwd)"

# Если явно задана папка вывода (-o) и не выбран zip явно — отдаём папку, без zip.
if [ -n "$OUT" ] && [ "$ZIP_EXPLICIT" -eq 0 ]; then
  MAKE_ZIP=0
fi

# Итоговый zip по умолчанию кладём рядом со скриптом: <папка скрипта>/output.zip.
if [ "$MAKE_ZIP" -eq 1 ] && [ -z "$ZIP_OUT" ]; then
  ZIP_OUT="$SCRIPT_DIR/output.zip"
fi

# Куда положить готовую папку, если zip не делаем (по умолчанию <папка скрипта>/output).
FINAL_OUT="$OUT"
[ "$MAKE_ZIP" -eq 0 ] && [ -z "$FINAL_OUT" ] && FINAL_OUT="$SCRIPT_DIR/output"

# Обработку всегда ведём во временной папке — это исключает рекурсивное
# копирование, когда исходник и вывод лежат в одном каталоге. Готовый результат
# затем упаковывается в zip или переносится в FINAL_OUT.
OUT="$(mktemp -d)"
OUT_IS_TEMP=1

# Случайный seed, если не задан явно. Предпочитаем /dev/urandom (больше
# энтропии), иначе откатываемся на время + PID + $RANDOM.
if [ -z "$SEED" ]; then
  SEED="$(head -c 16 /dev/urandom 2>/dev/null | od -An -tx1 2>/dev/null | tr -d ' \n')"
  [ -n "$SEED" ] || SEED="$(date +%s%N 2>/dev/null || date +%s)-$$-$RANDOM"
fi
log "seed: $SEED"

# --------------------------- установка зависимостей --------------------------
detect_pkg_mgr() {
  local m
  for m in apt-get dnf yum pacman apk zypper brew; do
    if command -v "$m" >/dev/null 2>&1; then printf '%s' "$m"; return 0; fi
  done
  return 1
}

pkg_install() {
  local mgr="$1"; shift
  local sudo=""
  if [ "$(id -u 2>/dev/null || echo 0)" != "0" ] && command -v sudo >/dev/null 2>&1; then
    sudo="sudo"
  fi
  case "$mgr" in
    apt-get) $sudo apt-get update -y && $sudo apt-get install -y "$@";;
    dnf)     $sudo dnf install -y "$@";;
    yum)     $sudo yum install -y "$@";;
    pacman)  $sudo pacman -Sy --noconfirm "$@";;
    apk)     $sudo apk add --no-cache "$@";;
    zypper)  $sudo zypper install -y "$@";;
    brew)    brew install "$@";;
    *)       return 1;;
  esac
}

ensure_deps() {
  local -a need_pkgs=()
  if ! command -v md5sum >/dev/null 2>&1 \
     && ! command -v shasum >/dev/null 2>&1 \
     && ! command -v openssl >/dev/null 2>&1; then
    need_pkgs+=( coreutils )
  fi
  command -v perl >/dev/null 2>&1 || need_pkgs+=( perl )
  if [ "$MAKE_ZIP" -eq 1 ] && ! command -v zip >/dev/null 2>&1; then
    need_pkgs+=( zip )
  fi
  [ "${#need_pkgs[@]}" -eq 0 ] && return 0
  if [ "$AUTO_INSTALL_DEPS" -ne 1 ]; then
    die "не хватает зависимостей: ${need_pkgs[*]} (установите вручную или уберите --no-install-deps)"
  fi
  local mgr
  mgr="$(detect_pkg_mgr)" \
    || die "не хватает зависимостей: ${need_pkgs[*]}, и не найден поддерживаемый пакетный менеджер (установите их вручную)"
  printf '[uniquify] не хватает зависимостей: %s. Устанавливаю через %s...\n' "${need_pkgs[*]}" "$mgr" >&2
  pkg_install "$mgr" "${need_pkgs[@]}" \
    || die "не удалось установить зависимости: ${need_pkgs[*]} (установите их вручную)"
}

ensure_deps

# ------------------------- хеш-функция (детерминизм по seed) ------------------
if command -v md5sum >/dev/null 2>&1; then
  hashstr() { printf '%s' "$1" | md5sum | awk '{print $1}'; }
elif command -v shasum >/dev/null 2>&1; then
  hashstr() { printf '%s' "$1" | shasum | awk '{print $1}'; }
elif command -v openssl >/dev/null 2>&1; then
  hashstr() { printf '%s' "$1" | openssl md5 | awk '{print $NF}'; }
else
  die "нужна одна из утилит: md5sum, shasum или openssl"
fi

command -v perl >/dev/null 2>&1 || die "нужен perl 5 (для безопасного переименования)"

# genname BASE -> детерминированное имя вида <PREFIX><8-hex>, зависящее от seed.
genname() {
  local h; h="$(hashstr "${SEED}::${1}")"
  printf '%s%s' "$PREFIX" "${h:0:8}"
}

# seedhash KEY N -> N hex-символов, детерминированно зависящих от seed и KEY.
seedhash() {
  local h; h="$(hashstr "${SEED}::mark::${1}")"
  printf '%s' "${h:0:${2}}"
}

# ------------------------------ подготовка вывода ----------------------------
log "копирую $SRC -> $OUT"
mkdir -p "$OUT"
cp -a "$SRC"/. "$OUT"/
rm -f "$OUT/$SELF_NAME" "$OUT/.uniquify-manifest.txt"
[ -n "$ZIP_OUT" ] && rm -f "$OUT/$(basename "$ZIP_OUT")"
if [ -n "$FINAL_OUT" ] && [ "$(cd "$(dirname "$FINAL_OUT")" 2>/dev/null && pwd)" = "$SRC" ]; then
  rm -rf "$OUT/$(basename "$FINAL_OUT")"
fi

# Набор расширений для поиска целевых файлов.
IFS=',' read -r -a EXT_ARR <<< "$EXTENSIONS"
find_targets() {
  local args=()
  local first=1
  for e in "${EXT_ARR[@]}"; do
    e="$(printf '%s' "$e" | tr -d ' ')"
    [ -z "$e" ] && continue
    if [ $first -eq 1 ]; then
      args+=( -iname "*.$e" ); first=0
    else
      args+=( -o -iname "*.$e" )
    fi
  done
  find "$OUT" -type f \( "${args[@]}" \)
}

# ------------------------- собираем список токенов ---------------------------
declare -a TOKEN_LIST=()
declare -a VAR_LIST=()
if [ -n "$TOKENS" ]; then
  IFS=',' read -r -a _tmp <<< "$TOKENS"
  for t in "${_tmp[@]}"; do
    t="$(printf '%s' "$t" | tr -d ' ')"
    [ -n "$t" ] && TOKEN_LIST+=( "$t" )
  done
fi
if [ -n "$TOKENS_FILE" ]; then
  [ -f "$TOKENS_FILE" ] || die "файл токенов не найден: $TOKENS_FILE"
  while IFS= read -r line || [ -n "$line" ]; do
    line="$(printf '%s' "$line" | tr -d ' \t\r')"
    [ -n "$line" ] && case "$line" in \#*) ;; *) TOKEN_LIST+=( "$line" );; esac
  done < "$TOKENS_FILE"
fi

# Авто-сбор токенов из самой темы: имена классов/id из CSS-селекторов
# (и опц. из HTML) и имена CSS-переменных (--var). Заполняет TOKEN_LIST
# (если он пуст и включён авто-режим) и VAR_LIST (когда включён RENAME_VARS).
discover_tokens() {
  local dh; dh="$(mktemp)"
  cat > "$dh" <<'PERL'
use strict; use warnings;
my $mode = $ENV{DMODE} || 'css';
local $/; my $data = <STDIN>;
my (%cls, %var);
if ($mode eq 'css') {
    $data =~ s{/\*.*?\*/}{}gs;                 # убрать комментарии
    while ($data =~ /([^{}]+)\{/g) {           # преамбулы селекторов (до '{')
        my $sel = $1;
        next if $sel =~ /^\s*\@/;              # пропускаем @media/@font-face/...
        while ($sel =~ /[.#]([A-Za-z_][A-Za-z0-9_-]*)/g) { $cls{$1} = 1 }
    }
    while ($data =~ /--([A-Za-z_][A-Za-z0-9_-]*)/g) { $var{$1} = 1 }
}
elsif ($mode eq 'html') {
    while ($data =~ /(?:class|id)\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+)/gi) {
        my $v = $1; $v =~ s/^["']//; $v =~ s/["']$//;
        while ($v =~ /([A-Za-z_][A-Za-z0-9_-]*)/g) { $cls{$1} = 1 }
    }
}
print "C\t$_\n" for sort keys %cls;
print "V\t$_\n" for sort keys %var;
PERL

  local f
  local -a css_files=() html_files=()
  while IFS= read -r f; do case "$f" in *.css|*.CSS) css_files+=( "$f" );; esac; done < <(find_targets)
  while IFS= read -r f; do case "$f" in *.html|*.htm|*.HTML|*.HTM) html_files+=( "$f" );; esac; done < <(find_targets)

  local raw=""
  [ "${#css_files[@]}" -gt 0 ] && raw="$(cat "${css_files[@]}" 2>/dev/null | DMODE=css perl "$dh")"
  if [ "$SCAN_HTML" -eq 1 ] && [ "${#html_files[@]}" -gt 0 ]; then
    raw="$raw"$'\n'"$(cat "${html_files[@]}" 2>/dev/null | DMODE=html perl "$dh")"
  fi
  rm -f "$dh"

  # Денилист имён-омонимов HTML-тегов: опасны в JS-строках (querySelector('nav')).
  local reserved=" a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr "

  local -A excl=()
  if [ -n "$EXCLUDE" ]; then
    local e; local -a _ex
    IFS=',' read -r -a _ex <<< "$EXCLUDE"
    for e in "${_ex[@]}"; do e="$(printf '%s' "$e" | tr -d ' ')"; [ -n "$e" ] && excl["$e"]=1; done
  fi

  local collect_classes=0
  [ "${#TOKEN_LIST[@]}" -eq 0 ] && [ "$AUTO_TOKENS" -eq 1 ] && collect_classes=1

  local kind name
  while IFS=$'\t' read -r kind name; do
    [ -n "$name" ] || continue
    [ "${#name}" -ge 2 ] || continue                 # пропускаем односимвольные
    [ -n "${excl[$name]:-}" ] && continue            # пользовательские исключения
    case "$kind" in
      C)
        [ "$collect_classes" -eq 1 ] || continue
        if [ "$INCLUDE_RESERVED" -ne 1 ] && [[ "$reserved" == *" $name "* ]]; then continue; fi
        TOKEN_LIST+=( "$name" )
        ;;
      V)
        [ "$RENAME_VARS" -eq 1 ] || continue
        VAR_LIST+=( "$name" )
        ;;
    esac
  done <<< "$raw"
}
discover_tokens

# Уникализируем и сортируем по убыванию длины: длинные токены заменяем первыми,
# чтобы избежать частичных пересечений (например, "card" и "card-title").
if [ "${#TOKEN_LIST[@]}" -gt 0 ]; then
  mapfile -t TOKEN_LIST < <(printf '%s\n' "${TOKEN_LIST[@]}" \
    | awk '!seen[$0]++' \
    | awk '{ print length, $0 }' | sort -rn | cut -d" " -f2-)
fi
if [ "${#VAR_LIST[@]}" -gt 0 ]; then
  mapfile -t VAR_LIST < <(printf '%s\n' "${VAR_LIST[@]}" \
    | awk '!seen[$0]++' \
    | awk '{ print length, $0 }' | sort -rn | cut -d" " -f2-)
fi
log "токенов классов/id: ${#TOKEN_LIST[@]}, переменных: ${#VAR_LIST[@]}"

# ---------------------------------------------------------------------------
# Контекстно-безопасное переименование (perl).
# ---------------------------------------------------------------------------
WORKTMP=""
cleanup() {
  [ -n "$WORKTMP" ] && rm -rf "$WORKTMP"
  [ "${OUT_IS_TEMP:-0}" -eq 1 ] && [ "${OUT_PACKED:-0}" -eq 1 ] && rm -rf "$OUT"
  true
}
trap cleanup EXIT
WORKTMP="$(mktemp -d)"
TOKEN_MAP="$WORKTMP/tokens.map"
VAR_MAP="$WORKTMP/vars.map"
PERL_HELPER="$WORKTMP/uniq.pl"
: > "$TOKEN_MAP"
: > "$VAR_MAP"

build_maps() {
  local t v
  if [ "${#TOKEN_LIST[@]}" -gt 0 ]; then
    for t in "${TOKEN_LIST[@]}"; do
      printf '%s\t%s\n' "$t" "$(genname "class::$t")" >> "$TOKEN_MAP"
    done
  fi
  # Карта CSS-переменных строится из реально найденных имён --var, а не из
  # списка классов (имена классов и переменных, как правило, не совпадают).
  if [ "$RENAME_VARS" -eq 1 ] && [ "${#VAR_LIST[@]}" -gt 0 ]; then
    for v in "${VAR_LIST[@]}"; do
      printf '%s\t%s\n' "$v" "$(genname "var::$v")" >> "$VAR_MAP"
    done
  fi
}

# perl-хелпер: режим работы передаётся через $ENV{MODE} (html|css|js).
write_perl_helper() {
  cat > "$PERL_HELPER" <<'PERL'
use strict; use warnings;

sub load_map {
    my ($path) = @_;
    my @m;
    return @m unless $path && -f $path;
    open my $fh, '<', $path or return @m;
    while (my $line = <$fh>) {
        chomp $line;
        next unless length $line;
        my ($t, $n) = split /\t/, $line, 2;
        next unless defined $t && length $t && defined $n && length $n;
        push @m, [$t, $n];
    }
    close $fh;
    return @m;
}

my @TOK = load_map($ENV{TOKEN_MAP});
my @VAR = load_map($ENV{VAR_MAP});
my $mode = $ENV{MODE} || '';
my %TOKMAP = map { $_->[0] => $_->[1] } @TOK;

sub rename_ids {
    my ($s) = @_;
    for my $p (@TOK) {
        my ($t, $n) = @$p;
        my $q = quotemeta $t;
        $s =~ s/(^|[^A-Za-z0-9_-])$q(?![A-Za-z0-9_])/$1$n/g;
    }
    return $s;
}

sub rename_vars {
    my ($s) = @_;
    for my $p (@VAR) {
        my ($t, $n) = @$p;
        my $q = quotemeta $t;
        $s =~ s/--$q(?![A-Za-z0-9_-])/--$n/g;
    }
    return $s;
}

# Переименование внутри JS-строк — ТОЛЬКО когда строка целиком является
# ссылкой на класс/id: "tok", ".tok", "#tok" или список через пробел
# ("tab active", ".a .b"). Свободный текст, ключи i18n ("nav.feedback"),
# URL и шаблоны ${...} не трогаются (любая часть-не-токен => литерал как был).
sub rename_js_literal {
    my ($lit) = @_;
    return $lit if length($lit) < 2;
    my $qc    = substr($lit, 0, 1);
    my $inner = substr($lit, 1, length($lit) - 2);
    return $lit unless $inner =~ /\A[.#]?[A-Za-z0-9_-]+(?:[ \t]+[.#]?[A-Za-z0-9_-]+)*\z/;
    my @parts = split /([ \t]+)/, $inner;
    my $changed = 0;
    my @out;
    for my $part (@parts) {
        if ($part =~ /\A[ \t]+\z/) { push @out, $part; next; }
        my ($pre, $name) = $part =~ /\A([.#]?)([A-Za-z0-9_-]+)\z/;
        if (defined $name && exists $TOKMAP{$name}) {
            push @out, $pre . $TOKMAP{$name};
            $changed = 1;
        } else {
            return $lit;
        }
    }
    return $lit unless $changed;
    return $qc . join('', @out) . $qc;
}

local $/;
my $data = <STDIN>;

if ($mode eq 'css') {
    for my $p (@TOK) {
        my ($t, $n) = @$p;
        my $q = quotemeta $t;
        $data =~ s/([.#])$q(?![A-Za-z0-9_])/$1$n/g;
    }
    $data = rename_vars($data);
}
elsif ($mode eq 'html') {
    $data =~ s{((?<![\w-])(?:class|id)\s*=\s*)("[^"]*"|'[^']*'|[^\s"'=<>`]+)}{
        my ($pre, $raw) = ($1, $2);
        my $qc = substr($raw, 0, 1);
        if ($qc eq '"' || $qc eq "'") {
            my $val = substr($raw, 1, length($raw) - 2);
            $pre . $qc . rename_ids($val) . $qc;
        } else {
            $pre . rename_ids($raw);
        }
    }gei;
    $data = rename_vars($data) if @VAR;
}
elsif ($mode eq 'js') {
    $data =~ s/('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)/ rename_js_literal($1) /ge;
}
else {
}

print $data;
PERL
}

apply_perl() {
  local mode="$1" file="$2"
  MODE="$mode" TOKEN_MAP="$TOKEN_MAP" VAR_MAP="$VAR_MAP" \
    perl "$PERL_HELPER" < "$file" > "$file.tmp" && mv "$file.tmp" "$file"
}

# ---------------------------------------------------------------------------
# Шаг 1+2. Контекстное переименование классов/id и CSS-переменных по типу файла.
# ---------------------------------------------------------------------------
rename_tokens() {
  if [ "${#TOKEN_LIST[@]}" -eq 0 ] && [ "${#VAR_LIST[@]}" -eq 0 ]; then
    log "нет ни токенов классов/id, ни переменных — пропускаю переименование"
    return 0
  fi
  build_maps
  write_perl_helper
  local f t new
  for t in "${TOKEN_LIST[@]}"; do
    new="$(genname "class::$t")"
    log "  токен '$t' -> '$new'"
  done
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    case "$f" in
      *.css|*.CSS)              apply_perl css  "$f";;
      *.html|*.htm|*.HTML|*.HTM) apply_perl html "$f";;
      *.js|*.JS)                apply_perl js   "$f";;
    esac
  done < <(find_targets)
}

# ---------------------------------------------------------------------------
# Шаг 3. Чистка/рандомизация сигнатурного <meta name="generator">.
# ---------------------------------------------------------------------------
strip_generator() {
  [ "$STRIP_GENERATOR" -eq 1 ] || return 0
  local f tag
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    case "$f" in *.html|*.htm|*.HTML|*.HTM) ;; *) continue;; esac
    tag="$(seedhash "gen::${f#"$OUT"/}" 10)"
    sed -i -E "s/(<meta[^>]*name=[\"']generator[\"'][^>]*content=[\"'])[^\"']*([\"'])/\1build-${tag}\2/Ig" "$f"
  done < <(find_targets)
}

# ---------------------------------------------------------------------------
# Шаг 4. Вставка случайных комментариев-маркеров.
# ---------------------------------------------------------------------------
inject_comments() {
  [ "$INJECT_COMMENTS" -eq 1 ] || return 0
  local f tag
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    tag="$(seedhash "cmt::${f#"$OUT"/}" 16)"
    case "$f" in
      *.css|*.CSS|*.js|*.JS)
        printf '/* b:%s */\n' "$tag" | cat - "$f" > "$f.tmp" && mv "$f.tmp" "$f"
        ;;
      *.html|*.htm|*.HTML|*.HTM)
        awk -v t="$tag" 'NR==1{print; print "<!-- b:" t " -->"; next} {print}' \
          "$f" > "$f.tmp" && mv "$f.tmp" "$f"
        ;;
    esac
  done < <(find_targets)
}

# ---------------------------------------------------------------------------
# Шаг 5. "Джиттер" незначащих пробелов в CSS.
# ---------------------------------------------------------------------------
jitter_whitespace() {
  [ "$JITTER_WHITESPACE" -eq 1 ] || return 0
  local f rel
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    case "$f" in *.css|*.CSS) ;; *) continue;; esac
    rel="${f#"$OUT"/}"
    awk -v seed="$(hashstr "${SEED}::ws::${rel}")" '
      BEGIN {
        n = 0; for (i = 1; i <= length(seed); i++) { n += index("0123456789abcdef", substr(seed,i,1)) * i }
        srand(n)
      }
      {
        line = $0
        if (line ~ /[{};]/ || line ~ /^[[:space:]]*$/) {
          k = int(rand() * 3)
          pad = ""
          for (i = 0; i < k; i++) pad = pad " "
          line = line pad
        }
        print line
        if (line ~ /[}]/ && rand() < 0.15) print ""
      }
    ' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  done < <(find_targets)
}

# --------------------------------- выполнение --------------------------------
log "шаг 1: переименование классов/id"
rename_tokens
log "шаг 3: чистка <meta generator>"
strip_generator
log "шаг 4: вставка комментариев-маркеров"
inject_comments
log "шаг 5: джиттер пробелов"
jitter_whitespace

# Сводный отчёт: манифест сборки (seed + карты токенов/переменных).
{
  printf 'seed=%s\n' "$SEED"
  printf 'prefix=%s\n' "$PREFIX"
  printf 'generated_at=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'auto_tokens=%s scan_html=%s include_reserved=%s\n' "$AUTO_TOKENS" "$SCAN_HTML" "$INCLUDE_RESERVED"
  printf 'classes=%s vars=%s\n' "${#TOKEN_LIST[@]}" "${#VAR_LIST[@]}"
  if [ "${#TOKEN_LIST[@]}" -gt 0 ]; then
    printf 'token_map:\n'
    for t in "${TOKEN_LIST[@]}"; do
      printf '  %s -> %s\n' "$t" "$(genname "class::$t")"
    done
  fi
  if [ "$RENAME_VARS" -eq 1 ] && [ "${#VAR_LIST[@]}" -gt 0 ]; then
    printf 'var_map:\n'
    for v in "${VAR_LIST[@]}"; do
      printf '  --%s -> --%s\n' "$v" "$(genname "var::$v")"
    done
  fi
} > "$OUT/.uniquify-manifest.txt"

# ------------------------------ упаковка в zip -------------------------------
OUT_PACKED=0
if [ "$MAKE_ZIP" -eq 1 ]; then
  command -v zip >/dev/null 2>&1 || die "не найдена утилита zip (установите её или используйте --no-zip)"
  zip_dir="$(dirname "$ZIP_OUT")"
  mkdir -p "$zip_dir"
  ZIP_OUT="$(cd "$zip_dir" && pwd)/$(basename "$ZIP_OUT")"
  rm -f "$ZIP_OUT"
  log "упаковываю $OUT -> $ZIP_OUT"
  ( cd "$OUT" && zip -r -q "$ZIP_OUT" . ) || die "не удалось создать архив: $ZIP_OUT"
  OUT_PACKED=1
  printf 'Готово. Архив: %s\n' "$ZIP_OUT"
else
  [ -n "$FINAL_OUT" ] || FINAL_OUT="$SCRIPT_DIR/output"
  mkdir -p "$(dirname "$FINAL_OUT")"
  rm -rf "$FINAL_OUT"
  mv "$OUT" "$FINAL_OUT" || die "не удалось переместить результат в: $FINAL_OUT"
  OUT="$FINAL_OUT"; OUT_IS_TEMP=0
  printf 'Готово. Уникальная копия: %s\n' "$FINAL_OUT"
  printf 'Манифест сборки: %s/.uniquify-manifest.txt\n' "$FINAL_OUT"
fi
