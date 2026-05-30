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
# Подход к переименованию — "белый список": вы сами перечисляете
# базовые токены вашей темы (например, префикс БЭМ-блоков), и только они
# заменяются. Это исключает поломку сторонних классов (bootstrap, tailwind,
# иконочные шрифты и пр.).
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
      --tokens-file F    файл со списком токенов (по одному на строку)
      --ext "html,css"   расширения для обработки (по умолчанию: html,htm,css,js)
      --no-vars          не переименовывать CSS-переменные (--var)
      --no-comments      не вставлять случайные комментарии-маркеры
      --no-jitter        не подмешивать незначащие пробелы
      --keep-generator   не трогать <meta name="generator">
      --no-install-deps  не доустанавливать недостающие зависимости автоматически
  -v, --verbose          подробный вывод
  -h, --help             эта справка

Примеры:
  # Положить скрипт в папку темы и запустить — результат в output.zip рядом:
  ./uniquify-theme.sh --tokens "hero,card,btn,nav,footer"

  # Явно указать исходную папку, итоговый zip и seed:
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
# Скрипту нужны: perl 5 и одна из утилит хеширования (md5sum/shasum/openssl).
# Если чего-то не хватает и не передан --no-install-deps, пробуем доустановить
# недостающие пакеты через доступный пакетный менеджер.

# detect_pkg_mgr -> печатает имя поддерживаемого пакетного менеджера или пусто.
detect_pkg_mgr() {
  local m
  for m in apt-get dnf yum pacman apk zypper brew; do
    if command -v "$m" >/dev/null 2>&1; then printf '%s' "$m"; return 0; fi
  done
  return 1
}

# pkg_install MGR PKG... -> устанавливает пакеты выбранным менеджером.
# При необходимости использует sudo (если запущено не от root).
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

# ensure_deps -> проверяет наличие зависимостей и доустанавливает недостающие.
ensure_deps() {
  local -a need_pkgs=()

  # Утилита хеширования: достаточно любой из md5sum/shasum/openssl.
  if ! command -v md5sum >/dev/null 2>&1 \
     && ! command -v shasum >/dev/null 2>&1 \
     && ! command -v openssl >/dev/null 2>&1; then
    need_pkgs+=( coreutils )
  fi
  # perl нужен всегда (контекстно-безопасное переименование).
  command -v perl >/dev/null 2>&1 || need_pkgs+=( perl )
  # zip нужен, если результат упаковывается в архив.
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

  printf '[uniquify] не хватает зависимостей: %s. Устанавливаю через %s%s...\n' \
    "${need_pkgs[*]}" "$mgr" \
    "$( [ "$(id -u 2>/dev/null || echo 0)" != "0" ] && command -v sudo >/dev/null 2>&1 && printf ' (потребуются права sudo)' )" >&2
  pkg_install "$mgr" "${need_pkgs[@]}" \
    || die "не удалось установить зависимости: ${need_pkgs[*]} (установите их вручную)"
}

ensure_deps

# ------------------------- хеш-функция (детерминизм по seed) ------------------
# hashstr STRING -> hex-строка. Используется для генерации воспроизводимых имён.
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

# genname BASE -> детерминированное имя вида <PREFIX><6-hex>, зависящее от seed.
genname() {
  local h; h="$(hashstr "${SEED}::${1}")"
  printf '%s%s' "$PREFIX" "${h:0:8}"
}

# rand_hex N -> N случайных hex-символов (невоспроизводимый маркер).
rand_hex() {
  local n="$1" s
  s="$(hashstr "${SEED}::$(date +%s%N 2>/dev/null || echo $RANDOM)::$RANDOM::$RANDOM")"
  printf '%s' "${s:0:$n}"
}

# seedhash KEY N -> N hex-символов, детерминированно зависящих от seed и KEY.
# Используется для маркеров, чтобы при одинаковом --seed сборка была
# полностью воспроизводимой.
seedhash() {
  local h; h="$(hashstr "${SEED}::mark::${1}")"
  printf '%s' "${h:0:${2}}"
}

# ------------------------------ подготовка вывода ----------------------------
log "копирую $SRC -> $OUT"
mkdir -p "$OUT"
# Копируем содержимое исходной папки (вместе со скрытыми файлами).
cp -a "$SRC"/. "$OUT"/
# Не тащим в сборку сам скрипт, его манифест, прежний архив и прежнюю папку
# вывода (актуально, когда работаем прямо в папке скрипта).
rm -f "$OUT/$SELF_NAME" "$OUT/.uniquify-manifest.txt"
[ -n "$ZIP_OUT" ] && rm -f "$OUT/$(basename "$ZIP_OUT")"
# Если прошлая папка вывода (FINAL_OUT) лежала внутри исходника — исключаем её.
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

# Уникализируем и сортируем по убыванию длины: длинные токены заменяем первыми,
# чтобы избежать частичных пересечений (например, "card" и "card-title").
if [ "${#TOKEN_LIST[@]}" -gt 0 ]; then
  mapfile -t TOKEN_LIST < <(printf '%s\n' "${TOKEN_LIST[@]}" \
    | awk '!seen[$0]++' \
    | awk '{ print length, $0 }' | sort -rn | cut -d" " -f2-)
fi

# ---------------------------------------------------------------------------
# Контекстно-безопасное переименование (perl).
# ---------------------------------------------------------------------------
# Карта токенов и карта CSS-переменных пишутся во временные tab-файлы
# (TOKEN<TAB>NEW), отсортированные "длинные → короткие". perl-хелпер читает
# их и применяет замены строго в нужном контексте, по типу файла.
WORKTMP=""
cleanup() {
  [ -n "$WORKTMP" ] && rm -rf "$WORKTMP"
  # Временную папку вывода удаляем только после успешной упаковки в zip.
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
  local t
  if [ "${#TOKEN_LIST[@]}" -gt 0 ]; then
    for t in "${TOKEN_LIST[@]}"; do
      printf '%s\t%s\n' "$t" "$(genname "class::$t")" >> "$TOKEN_MAP"
      if [ "$RENAME_VARS" -eq 1 ]; then
        printf '%s\t%s\n' "$t" "$(genname "var::$t")" >> "$VAR_MAP"
      fi
    done
  fi
}

# perl-хелпер: режим работы передаётся через $ENV{MODE} (html|css|js).
write_perl_helper() {
  cat > "$PERL_HELPER" <<'PERL'
use strict; use warnings;

# Загрузка карт TOKEN\tNEW (порядок важен: длинные токены идут первыми).
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

# Переименование идентификаторов класса/id внутри произвольной строки $s.
# Совпадение — токен, стоящий в начале идентификатора: слева либо начало,
# либо символ не из [A-Za-z0-9_-]; справа НЕ из [A-Za-z0-9_] (дефис разрешён,
# чтобы сохранить BEM-суффиксы: hero--big -> NEW--big).
sub rename_ids {
    my ($s) = @_;
    for my $p (@TOK) {
        my ($t, $n) = @$p;
        my $q = quotemeta $t;
        $s =~ s/(^|[^A-Za-z0-9_-])$q(?![A-Za-z0-9_])/$1$n/g;
    }
    return $s;
}

# Переименование CSS-переменных --token (объявление и var(--token)).
sub rename_vars {
    my ($s) = @_;
    for my $p (@VAR) {
        my ($t, $n) = @$p;
        my $q = quotemeta $t;
        $s =~ s/--$q(?![A-Za-z0-9_-])/--$n/g;
    }
    return $s;
}

local $/;            # слурп всего файла
my $data = <STDIN>;

if ($mode eq 'css') {
    # Только селекторы .token / #token.
    for my $p (@TOK) {
        my ($t, $n) = @$p;
        my $q = quotemeta $t;
        $data =~ s/([.#])$q(?![A-Za-z0-9_])/$1$n/g;
    }
    $data = rename_vars($data);
}
elsif ($mode eq 'html') {
    # Значения атрибутов class/id: в двойных, одинарных кавычках или без
    # кавычек (валидный HTML5: class=value).
    $data =~ s{((?:class|id)\s*=\s*)("[^"]*"|'[^']*'|[^\s"'=<>`]+)}{
        my ($pre, $raw) = ($1, $2);
        my $qc = substr($raw, 0, 1);
        if ($qc eq '"' || $qc eq "'") {
            my $val = substr($raw, 1, length($raw) - 2);
            $pre . $qc . rename_ids($val) . $qc;
        } else {
            $pre . rename_ids($raw);     # значение без кавычек
        }
    }gei;
    # CSS-переменные могут встречаться в инлайновом style="--token: ...".
    $data = rename_vars($data) if @VAR;
}
elsif ($mode eq 'js') {
    # Только содержимое строковых литералов '...', "...", `...`.
    $data =~ s/('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)/
        my $lit = $1;
        my $qc  = substr($lit, 0, 1);
        my $inner = substr($lit, 1, length($lit) - 2);
        $qc . rename_ids($inner) . $qc;
    /ge;
}
else {
    # неизвестный режим — ничего не меняем
}

print $data;
PERL
}

# Применяет perl-хелпер к одному файлу в заданном режиме.
apply_perl() {
  local mode="$1" file="$2"
  MODE="$mode" TOKEN_MAP="$TOKEN_MAP" VAR_MAP="$VAR_MAP" \
    perl "$PERL_HELPER" < "$file" > "$file.tmp" && mv "$file.tmp" "$file"
}

# ---------------------------------------------------------------------------
# Шаг 1+2. Контекстное переименование классов/id и CSS-переменных по типу файла.
# ---------------------------------------------------------------------------
rename_tokens() {
  [ "${#TOKEN_LIST[@]}" -gt 0 ] || { log "токены не заданы — пропускаю переименование"; return 0; }
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

# CSS-переменные уже обрабатываются внутри rename_tokens (режимы css/html).
rename_css_vars() { return 0; }

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
    # Заменяем content у generator на детерминированный, не ломая разметку.
    sed -i -E "s/(<meta[^>]*name=[\"']generator[\"'][^>]*content=[\"'])[^\"']*([\"'])/\1build-${tag}\2/Ig" "$f"
  done < <(find_targets)
}

# ---------------------------------------------------------------------------
# Шаг 4. Вставка случайных комментариев-маркеров (меняет размер/хеш файла,
#         не влияя на отображение). Синтаксис комментария — по типу файла.
# ---------------------------------------------------------------------------
inject_comments() {
  [ "$INJECT_COMMENTS" -eq 1 ] || return 0
  local f tag
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    tag="$(seedhash "cmt::${f#"$OUT"/}" 16)"
    case "$f" in
      *.css|*.CSS|*.js|*.JS)
        # /* build:<tag> */ в начало файла.
        printf '/* b:%s */\n' "$tag" | cat - "$f" > "$f.tmp" && mv "$f.tmp" "$f"
        ;;
      *.html|*.htm|*.HTML|*.HTM)
        # <!-- b:<tag> --> сразу после первой строки (часто <!doctype>).
        awk -v t="$tag" 'NR==1{print; print "<!-- b:" t " -->"; next} {print}' \
          "$f" > "$f.tmp" && mv "$f.tmp" "$f"
        ;;
    esac
  done < <(find_targets)
}

# ---------------------------------------------------------------------------
# Шаг 5. "Джиттер" незначащих пробелов в CSS — меняет размер/побайтовый хеш
#         файла, не затрагивая отображение: добавляет 0..2 хвостовых пробела
#         к части строк и изредка пустую строку между правилами. Применяется
#         ТОЛЬКО к CSS, где хвостовые пробелы и пустые строки всегда незначащи
#         (в HTML возможен <pre>/<textarea>, в JS — шаблонные строки, поэтому
#          там джиттер не используется — их уникальность обеспечивают
#          переименование и комментарии-маркеры).
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
        # Преобразуем hex-seed в число для srand (детерминизм по seed).
        n = 0; for (i = 1; i <= length(seed); i++) { n += index("0123456789abcdef", substr(seed,i,1)) * i }
        srand(n)
      }
      {
        line = $0
        # Хвостовые пробелы к "кодовым"/пустым строкам.
        if (line ~ /[{};]/ || line ~ /^[[:space:]]*$/) {
          k = int(rand() * 3)         # 0..2 пробела
          pad = ""
          for (i = 0; i < k; i++) pad = pad " "
          line = line pad
        }
        print line
        # Иногда вставляем пустую строку после закрывающей скобки правила.
        if (line ~ /[}]/ && rand() < 0.15) print ""
      }
    ' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  done < <(find_targets)
}

# --------------------------------- выполнение --------------------------------
log "шаг 1: переименование классов/id"
rename_tokens
log "шаг 2: переименование CSS-переменных"
rename_css_vars
log "шаг 3: чистка <meta generator>"
strip_generator
log "шаг 4: вставка комментариев-маркеров"
inject_comments
log "шаг 5: джиттер пробелов"
jitter_whitespace

# Сводный отчёт: записываем манифест сборки (seed + карта токенов), чтобы
# при необходимости повторить или продолжить уникализацию.
{
  printf 'seed=%s\n' "$SEED"
  printf 'prefix=%s\n' "$PREFIX"
  printf 'generated_at=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  if [ "${#TOKEN_LIST[@]}" -gt 0 ]; then
    printf 'token_map:\n'
    for t in "${TOKEN_LIST[@]}"; do
      printf '  %s -> %s\n' "$t" "$(genname "class::$t")"
    done
  fi
} > "$OUT/.uniquify-manifest.txt"

# ------------------------------ упаковка в zip -------------------------------
OUT_PACKED=0
if [ "$MAKE_ZIP" -eq 1 ]; then
  command -v zip >/dev/null 2>&1 || die "не найдена утилита zip (установите её или используйте --no-zip)"
  # Готовим целевую папку под архив и удаляем прежний файл, чтобы не дописывать.
  zip_dir="$(dirname "$ZIP_OUT")"
  mkdir -p "$zip_dir"
  ZIP_OUT="$(cd "$zip_dir" && pwd)/$(basename "$ZIP_OUT")"
  rm -f "$ZIP_OUT"
  log "упаковываю $OUT -> $ZIP_OUT"
  # Архивируем содержимое папки (а не саму папку): заходим внутрь OUT.
  ( cd "$OUT" && zip -r -q "$ZIP_OUT" . ) || die "не удалось создать архив: $ZIP_OUT"
  OUT_PACKED=1
  printf 'Готово. Архив: %s\n' "$ZIP_OUT"
else
  # Папочный режим: переносим готовую сборку из временной папки в FINAL_OUT.
  [ -n "$FINAL_OUT" ] || FINAL_OUT="$SCRIPT_DIR/output"
  mkdir -p "$(dirname "$FINAL_OUT")"
  rm -rf "$FINAL_OUT"
  mv "$OUT" "$FINAL_OUT" || die "не удалось переместить результат в: $FINAL_OUT"
  OUT="$FINAL_OUT"; OUT_IS_TEMP=0
  printf 'Готово. Уникальная копия: %s\n' "$FINAL_OUT"
  printf 'Манифест сборки: %s/.uniquify-manifest.txt\n' "$FINAL_OUT"
fi
