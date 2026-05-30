(function () {
  "use strict";

  var I18N = {
    ru: {
      doc_dir: "ltr",
      nav_features: "Возможности", nav_how: "Как это работает", nav_pricing: "Тарифы", nav_gallery: "Галерея", nav_faq: "Вопросы",
      btn_signin: "Войти", btn_invite: "Получить инвайт", btn_try: "Начать бесплатно",
      hero_eyebrow: "Онлайн-фоторедактор с ИИ",
      hero_h1a: "Профессиональная обработка фото", hero_em: "прямо в браузере", hero_h1b: "",
      hero_p: "Vibrai открывает RAW с любой цифровой камеры, ретуширует портреты, апскейлит и раскрашивает снимки с помощью нейросетей — без установки программ. Вся тяжёлая обработка идёт на наших GPU-серверах.",
      hero_cta1: "Попробовать редактор", hero_cta2: "Посмотреть тарифы",
      stat1: "снимков обработано", stat2: "форматов камер", stat3: "ИИ-инструментов",
      ba_before: "До", ba_after: "После",
      trust: "Доверяют фотографы, ретушёры и студии в 90+ странах",
      tiles_eyebrow: "Что умеет Vibrai", tiles_h2a: "Один редактор — ", tiles_h2s: "сотни возможностей", tiles_lead: "Наведите на плитку, чтобы увидеть описание инструмента. Всё работает онлайн, тяжёлые операции выполняются на сервере.",
      t_retouch_t: "Портретная ретушь", t_retouch_d: "Ретушь и улучшение фотографий, специальные фильтры для работы с лицами: кожа, глаза, зубы, форма.",
      t_portrait_t: "Портрет и боке", t_portrait_d: "Отделение модели от фона, мягкое боке и студийный свет для портретов из любых условий.",
      t_sky_t: "Замена неба", t_sky_d: "Замена неба и атмосферные пресеты в один клик: закаты, грозы, звёздное небо с подбором света сцены.",
      t_landscape_t: "Цвет и HDR", t_landscape_d: "Сочная цветокоррекция, HDR-слияние брекетинга и природные пресеты для пейзажа и макро.",
      t_upscale_t: "ИИ-апскейл", t_upscale_d: "Увеличение до 8K с дорисовкой деталей нейросетью — без артефактов и замыливания.",
      t_creative_t: "Резкость и детали", t_creative_d: "Усиление микроконтраста и прорисовка текстур: шерсть, ткань, волосы остаются чёткими.",
      t_denoise_t: "Шумоподавление", t_denoise_d: "Удаление шума с ночных и плёночных кадров, реставрация старых и повреждённых снимков.",
      t_raw_t: "RAW и форматы камер", t_raw_d: "Загрузка RAW и поддержка форматов цифровых камер: CR3, NEF, ARW, RAF, DNG и десятки других.",
      t_object_t: "Удаление объектов", t_object_d: "Удаление лишних людей и предметов с достройкой фона генеративной нейросетью.",
      t_product_t: "Геометрия и перспектива", t_product_d: "Выравнивание горизонта, коррекция перспективы зданий и оптических искажений объектива.",
      t_bg_t: "Удаление фона", t_bg_d: "Точное вырезание объекта и удаление фона для каталогов и маркетплейсов — пакетно.",
      t_batch_t: "Пакетная обработка", t_batch_d: "Применение пресетов и экспорт тысяч снимков за один прогон по заданному рецепту.",
      t_relight_t: "Свет и тревел-пресеты", t_relight_d: "Переосвещение сцены, тёплый и холодный свет, готовые тревел- и репортажные пресеты.",
      t_color_t: "Облако и любое устройство", t_color_d: "Проекты в облаке: начните на ноутбуке, продолжите с планшета — ничего не теряется.",
      feat_eyebrow: "Сила нейросетей", feat_h2a: "ИИ берёт на себя ", feat_h2s: "рутину", feat_lead: "Обучённые на миллионах кадров модели выполняют сложные операции автоматически, а вы лишь подправляете результат.",
      f1_t: "ИИ-апскейл до 8K", f1_d: "Увеличиваем разрешение в 4–16 раз, восстанавливая реалистичные детали и края.",
      f2_t: "Умное шумоподавление", f2_d: "Раздельная обработка яркостного и цветового шума с сохранением текстуры.",
      f3_t: "Генеративная замена неба", f3_d: "Нейросеть распознаёт горизонт и пересобирает освещение под новое небо.",
      f4_t: "Удаление объектов", f4_d: "Отметьте лишнее — модель заполнит область правдоподобным фоном.",
      f5_t: "Авто-цвет и тон", f5_d: "Баланс белого, экспозиция и киношный грейдинг подбираются за секунды.",
      f6_t: "Инструменты для лиц", f6_d: "Ретушь кожи с сохранением пор, коррекция взгляда, симметрии и формы.",
      up_eyebrow: "Загрузка и форматы", up_h2a: "Перетащите ", up_h2s: "RAW или фото", up_lead: "Аплоад больших RAW-файлов идёт по частям с докачкой: соединение между браузером и сервером не рвётся даже на гигабайтных снимках.",
      up_title: "Перетащите файлы сюда", up_p: "или нажмите, чтобы выбрать. RAW, TIFF и JPEG до 800 МБ каждый.", up_btn: "Выбрать файлы",
      up_uploading: "Передача на сервер…", up_processing: "Обработка ИИ…", up_done: "Готово",
      up_note: "Демонстрация: файлы не покидают ваш браузер.",
      how_eyebrow: "Три шага", how_h2a: "От загрузки до ", how_h2s: "результата",
      s1_t: "Загрузите снимок", s1_d: "RAW с камеры, телефонный JPEG или скан — Vibrai прочитает формат и покажет превью.",
      s2_t: "Примените ИИ-инструменты", s2_d: "Ретушь, апскейл, замена неба, цвет — тяжёлые задачи считаются на наших GPU.",
      s3_t: "Скачайте в нужном виде", s3_d: "Экспорт в JPEG, TIFF или PNG, пакетом или по одному, с вашими пресетами.",
      gal_eyebrow: "Работы пользователей", gal_h2a: "Сделано в ", gal_h2s: "Vibrai", gal_lead: "Несколько примеров до и после обработки нейросетями.",
      price_eyebrow: "Подписка", price_h2a: "Тарифы для ", price_h2s: "любых задач", price_lead: "Помесячно, без скрытых платежей. Доступ открывается по инвайту.",
      plan_free_t: "Старт", plan_free_p: "0 ₽", plan_free_per: "/мес", plan_free_s: "Знакомство с редактором.",
      plan_pro_t: "Pro", plan_pro_p: "990 ₽", plan_pro_per: "/мес", plan_pro_s: "Для активных фотографов и ретушёров.",
      plan_studio_t: "Studio", plan_studio_p: "3 490 ₽", plan_studio_per: "/мес", plan_studio_s: "Команда и пакетная обработка.",
      ribbon: "Популярный",
      pf1: "20 снимков в месяц", pf2: "Базовая ретушь и цвет", pf3: "Апскейл до 2K", pf4: "RAW-форматы", pf5: "Пакетная обработка", pf6: "Командный доступ",
      pp1: "Безлимит снимков", pp2: "Все ИИ-инструменты", pp3: "Апскейл до 8K", pp4: "Приоритетные GPU", pp5: "Пакетная обработка", pp6: "Командный доступ",
      ps1: "Всё из Pro", ps2: "До 10 участников", ps3: "Общие пресеты", ps4: "Пакет до 5000 фото", ps5: "Приоритетная поддержка", ps6: "API доступ",
      plan_btn: "Получить инвайт",
      tmt_eyebrow: "Отзывы", tmt_h2a: "Что говорят ", tmt_h2s: "пользователи",
      tm1: "RAW с моей Sony открывается мгновенно, а апскейл вытягивает детали, которых я не видел даже в исходнике.", tm1n: "Анна К.", tm1r: "Свадебный фотограф",
      tm2: "Замена неба и удаление объектов экономят мне часы на каждой съёмке недвижимости.", tm2n: "Маркус Л.", tm2r: "Фотограф-интерьерщик",
      tm3: "Пакетная ретушь портретов для каталога — то, ради чего мы перешли всей студией.", tm3n: "Дина С.", tm3r: "Арт-директор студии",
      cta_eyebrow: "Доступ по инвайтам", cta_h2a: "Откройте ", cta_h2s: "Vibrai", cta_p: "Регистрация сейчас по приглашениям. Есть код от друга или партнёра? Активируйте его. Уже есть аккаунт — войдите.",
      cta_btn1: "Активировать инвайт", cta_btn2: "У меня есть аккаунт",
      foot_about: "Онлайн-фоторедактор с ИИ: RAW, ретушь, апскейл и цвет прямо в браузере.",
      foot_h1: "Продукт", foot_h2: "Компания", foot_h3: "Поддержка",
      foot_features: "Возможности", foot_pricing: "Тарифы", foot_gallery: "Галерея", foot_how: "Как это работает",
      foot_about_l: "О сервисе", foot_careers: "Вакансии", foot_press: "Пресса", foot_contact: "Контакты",
      foot_status: "Статус систем", foot_faq: "Вопросы", foot_help: "Написать нам",
      foot_rights: "Все права защищены.", foot_note: "Изображения — демонстрационные, лицензия Pexels/Picsum.",
      reg_h3: "Активировать инвайт", reg_sub: "Vibrai работает по приглашениям. Введите полученный код.",
      reg_hint: "Демо-коды:", reg_code: "Инвайт-код", reg_email: "Email", reg_pass: "Пароль", reg_pass_ph: "Придумайте пароль", reg_btn: "Создать аккаунт",
      reg_foot: "Уже с нами?", reg_foot_l: "Войти",
      reg_err_email: "Введите корректный email.", reg_err_code: "Код не распознан. Уточните у того, кто вас пригласил.", reg_ok: "Инвайт принят — добро пожаловать!",
      log_h3: "Вход", log_sub: "С возвращением в Vibrai.", log_email: "Email", log_pass: "Пароль", log_pass_ph: "Ваш пароль", log_btn: "Войти",
      log_foot: "Есть инвайт-код?", log_foot_l: "Создать аккаунт", log_progress: "Выполняем вход…", log_ok: "Вы вошли",
      send_h3: "Написать нам", send_sub: "Обычно отвечаем в течение двух рабочих дней.",
      send_email: "Ваш email", send_topic: "Тема", send_msg: "Сообщение", send_msg_ph: "Чем можем помочь?", send_btn: "Отправить",
      topic_general: "Общий вопрос", topic_support: "Поддержка", topic_billing: "Оплата и подписка", topic_partner: "Партнёрство",
      send_err_email: "Введите корректный email.", send_err_msg: "Добавьте короткое сообщение.", send_ok: "Отправлено — мы ответим на ваш email.",
      send_sent: "Отправлено ✓",
      ph_email: "you@example.com", ph_code: "XXXX-XXXX",
      contact_h1a: "Связаться с ", contact_h1s: "нами", contact_p: "Выберите тему — мы направим обращение нужной команде. Электронные адреса мы не публикуем: пишите через форму.",
      contact_send: "Написать сообщение",
      c1_t: "Поддержка", c1_d: "Вопросы по работе редактора, форматам и обработке.",
      c2_t: "Оплата и подписка", c2_d: "Тарифы, инвайты, счета и возвраты.",
      c3_t: "Партнёрство", c3_d: "Студии, интеграции и оптовые лицензии.",
      c4_t: "Пресса", c4_d: "Материалы для СМИ и комментарии.",
      feat_page_h1a: "Все ", feat_page_h1s: "возможности", feat_page_p: "Полный набор инструментов Vibrai — от RAW-конвейера до генеративного ИИ.",
      about_h1a: "О ", about_h1s: "Vibrai", about_p: "Мы делаем профессиональную обработку фото доступной из браузера.",
      about_b1h: "Наша задача", about_b1: "Снять барьер между снимком и результатом: никакой установки, тяжёлые вычисления — на сервере, доступ — с любого устройства.",
      about_b2h: "Как устроено", about_b2: "Браузер отправляет файл по частям на GPU-кластер, где работают модели ретуши, апскейла и шумоподавления. Готовый результат возвращается обратно потоком.",
      about_b3h: "Приватность", about_b3: "Файлы обрабатываются изолированно и удаляются после экспорта. Мы не используем ваши снимки для обучения без согласия.",
      status_h1a: "Статус ", status_h1s: "систем", status_p: "Текущее состояние сервисов Vibrai.",
      status_all: "Все системы работают штатно",
      st1: "Веб-редактор", st2: "Загрузка файлов", st3: "GPU-обработка ИИ", st4: "Экспорт и скачивание", st5: "Аккаунты и оплата",
      state_ok: "Работает", state_warn: "Повышенная нагрузка",
      faq_h2a: "Частые ", faq_h2s: "вопросы",
      q1: "Нужно ли что-то устанавливать?", a1: "Нет. Vibrai полностью работает в браузере, а тяжёлые операции выполняются на наших серверах.",
      q2: "Какие форматы камер поддерживаются?", a2: "RAW большинства производителей: Canon CR2/CR3, Nikon NEF, Sony ARW, Fujifilm RAF, Adobe DNG и другие, а также TIFF и JPEG.",
      q3: "Насколько большие файлы можно загружать?", a3: "До 800 МБ на файл. Передача идёт по частям с докачкой, поэтому крупные RAW не обрываются.",
      q4: "Как получить доступ?", a4: "Сейчас регистрация по инвайтам. Активируйте код приглашения или войдите в существующий аккаунт.",
      menu: "Меню", close: "Закрыть"
    },
    en: {
      doc_dir: "ltr",
      nav_features: "Features", nav_how: "How it works", nav_pricing: "Pricing", nav_gallery: "Gallery", nav_faq: "FAQ",
      btn_signin: "Sign in", btn_invite: "Get invite", btn_try: "Start free",
      hero_eyebrow: "AI-powered online photo editor",
      hero_h1a: "Professional photo editing", hero_em: "right in your browser", hero_h1b: "",
      hero_p: "Vibrai opens RAW from any digital camera, retouches portraits, upscales and recolors shots with neural networks — no installs. All the heavy lifting runs on our GPU servers.",
      hero_cta1: "Open the editor", hero_cta2: "See pricing",
      stat1: "photos processed", stat2: "camera formats", stat3: "AI tools",
      ba_before: "Before", ba_after: "After",
      trust: "Trusted by photographers, retouchers and studios in 90+ countries",
      tiles_eyebrow: "What Vibrai can do", tiles_h2a: "One editor — ", tiles_h2s: "hundreds of tools", tiles_lead: "Hover a tile to read what the tool does. Everything runs online; heavy operations are computed on the server.",
      t_retouch_t: "Portrait retouching", t_retouch_d: "Retouching and photo enhancement with dedicated tools for faces: skin, eyes, teeth and shape.",
      t_portrait_t: "Portrait & bokeh", t_portrait_d: "Separate the subject from the background, add soft bokeh and studio light to any portrait.",
      t_sky_t: "Sky replacement", t_sky_d: "Replace the sky and apply atmospheric presets in one click: sunsets, storms, starfields with matched scene light.",
      t_landscape_t: "Color & HDR", t_landscape_d: "Vivid color grading, HDR bracket merging and nature presets for landscape and macro.",
      t_upscale_t: "AI upscale", t_upscale_d: "Enlarge up to 8K with neural detail synthesis — no artifacts, no mush.",
      t_creative_t: "Sharpness & detail", t_creative_d: "Boost micro-contrast and texture: fur, fabric and hair stay crisp.",
      t_denoise_t: "Noise reduction", t_denoise_d: "Remove noise from night and film frames, restore old and damaged photos.",
      t_raw_t: "RAW & camera formats", t_raw_d: "RAW upload and support for digital camera formats: CR3, NEF, ARW, RAF, DNG and dozens more.",
      t_object_t: "Object removal", t_object_d: "Remove unwanted people and objects with generative background fill.",
      t_product_t: "Geometry & perspective", t_product_d: "Level the horizon, correct building perspective and lens distortion.",
      t_bg_t: "Background removal", t_bg_d: "Precise cut-outs and background removal for catalogs and marketplaces — in batches.",
      t_batch_t: "Batch processing", t_batch_d: "Apply presets and export thousands of shots in a single run from one recipe.",
      t_relight_t: "Relight & travel presets", t_relight_d: "Relight the scene, warm or cool the light, apply ready travel and reportage presets.",
      t_color_t: "Cloud, any device", t_color_d: "Cloud projects: start on a laptop, continue on a tablet — nothing is lost.",
      feat_eyebrow: "Neural power", feat_h2a: "AI handles the ", feat_h2s: "busywork", feat_lead: "Models trained on millions of frames run complex operations automatically — you just refine the result.",
      f1_t: "AI upscale to 8K", f1_d: "Increase resolution 4–16× while rebuilding realistic detail and edges.",
      f2_t: "Smart denoise", f2_d: "Luminance and color noise handled separately, texture preserved.",
      f3_t: "Generative sky", f3_d: "The network detects the horizon and relights the scene for the new sky.",
      f4_t: "Object removal", f4_d: "Mark the clutter — the model fills the area with a believable background.",
      f5_t: "Auto color & tone", f5_d: "White balance, exposure and cinematic grade in seconds.",
      f6_t: "Face tools", f6_d: "Skin retouch that keeps pores, plus gaze, symmetry and shape correction.",
      up_eyebrow: "Upload & formats", up_h2a: "Drop a ", up_h2s: "RAW or photo", up_lead: "Large RAW uploads are chunked with resume: the link between browser and server holds even for gigabyte shots.",
      up_title: "Drop files here", up_p: "or click to choose. RAW, TIFF and JPEG up to 800 MB each.", up_btn: "Choose files",
      up_uploading: "Sending to server…", up_processing: "AI processing…", up_done: "Done",
      up_note: "Demo: files never leave your browser.",
      how_eyebrow: "Three steps", how_h2a: "From upload to ", how_h2s: "result",
      s1_t: "Upload a shot", s1_d: "Camera RAW, a phone JPEG or a scan — Vibrai reads the format and shows a preview.",
      s2_t: "Apply AI tools", s2_d: "Retouch, upscale, sky swap, color — heavy jobs run on our GPUs.",
      s3_t: "Download your way", s3_d: "Export to JPEG, TIFF or PNG, in batches or one by one, with your presets.",
      gal_eyebrow: "Made by users", gal_h2a: "Made in ", gal_h2s: "Vibrai", gal_lead: "A few before-and-after examples of neural editing.",
      price_eyebrow: "Subscription", price_h2a: "Plans for ", price_h2s: "every job", price_lead: "Monthly, no hidden fees. Access opens by invite.",
      plan_free_t: "Start", plan_free_p: "$0", plan_free_per: "/mo", plan_free_s: "Get to know the editor.",
      plan_pro_t: "Pro", plan_pro_p: "$12", plan_pro_per: "/mo", plan_pro_s: "For active photographers and retouchers.",
      plan_studio_t: "Studio", plan_studio_p: "$39", plan_studio_per: "/mo", plan_studio_s: "Teams and batch processing.",
      ribbon: "Popular",
      pf1: "20 photos / month", pf2: "Basic retouch & color", pf3: "Upscale to 2K", pf4: "RAW formats", pf5: "Batch processing", pf6: "Team access",
      pp1: "Unlimited photos", pp2: "All AI tools", pp3: "Upscale to 8K", pp4: "Priority GPUs", pp5: "Batch processing", pp6: "Team access",
      ps1: "Everything in Pro", ps2: "Up to 10 seats", ps3: "Shared presets", ps4: "Batches up to 5000", ps5: "Priority support", ps6: "API access",
      plan_btn: "Get invite",
      tmt_eyebrow: "Reviews", tmt_h2a: "What users ", tmt_h2s: "say",
      tm1: "RAW from my Sony opens instantly, and the upscale pulls out detail I couldn't even see in the original.", tm1n: "Anna K.", tm1r: "Wedding photographer",
      tm2: "Sky replacement and object removal save me hours on every real-estate shoot.", tm2n: "Markus L.", tm2r: "Interior photographer",
      tm3: "Batch portrait retouch for our catalog is exactly why the whole studio switched.", tm3n: "Dina S.", tm3r: "Studio art director",
      cta_eyebrow: "Invite-only access", cta_h2a: "Open ", cta_h2s: "Vibrai", cta_p: "Sign-ups are invite-only right now. Got a code from a friend or partner? Redeem it. Already have an account? Sign in.",
      cta_btn1: "Redeem invite", cta_btn2: "I have an account",
      foot_about: "AI online photo editor: RAW, retouch, upscale and color right in the browser.",
      foot_h1: "Product", foot_h2: "Company", foot_h3: "Support",
      foot_features: "Features", foot_pricing: "Pricing", foot_gallery: "Gallery", foot_how: "How it works",
      foot_about_l: "About", foot_careers: "Careers", foot_press: "Press", foot_contact: "Contact",
      foot_status: "System status", foot_faq: "FAQ", foot_help: "Message us",
      foot_rights: "All rights reserved.", foot_note: "Images are for demo only, Pexels/Picsum license.",
      reg_h3: "Redeem invite", reg_sub: "Vibrai is invite-only. Enter the code you received.",
      reg_hint: "Demo codes:", reg_code: "Invite code", reg_email: "Email", reg_pass: "Password", reg_pass_ph: "Create a password", reg_btn: "Create account",
      reg_foot: "Already a member?", reg_foot_l: "Sign in",
      reg_err_email: "Enter a valid email.", reg_err_code: "Code not recognized. Check with whoever invited you.", reg_ok: "Invite accepted — welcome!",
      log_h3: "Sign in", log_sub: "Welcome back to Vibrai.", log_email: "Email", log_pass: "Password", log_pass_ph: "Your password", log_btn: "Sign in",
      log_foot: "Have an invite code?", log_foot_l: "Create account", log_progress: "Signing you in…", log_ok: "Signed in",
      send_h3: "Message us", send_sub: "We usually reply within two business days.",
      send_email: "Your email", send_topic: "Topic", send_msg: "Message", send_msg_ph: "How can we help?", send_btn: "Send",
      topic_general: "General", topic_support: "Support", topic_billing: "Billing & subscription", topic_partner: "Partnership",
      send_err_email: "Enter a valid email.", send_err_msg: "Add a short message.", send_ok: "Sent — we'll reply by email.",
      send_sent: "Sent ✓",
      ph_email: "you@example.com", ph_code: "XXXX-XXXX",
      contact_h1a: "Get in ", contact_h1s: "touch", contact_p: "Pick a topic and we'll route it to the right team. We don't publish email addresses — use the form.",
      contact_send: "Send a message",
      c1_t: "Support", c1_d: "Questions about the editor, formats and processing.",
      c2_t: "Billing & subscription", c2_d: "Plans, invites, invoices and refunds.",
      c3_t: "Partnership", c3_d: "Studios, integrations and volume licenses.",
      c4_t: "Press", c4_d: "Media assets and comments.",
      feat_page_h1a: "All ", feat_page_h1s: "features", feat_page_p: "The full Vibrai toolset — from the RAW pipeline to generative AI.",
      about_h1a: "About ", about_h1s: "Vibrai", about_p: "We make professional photo editing available from the browser.",
      about_b1h: "Our mission", about_b1: "Remove the barrier between a shot and the result: no installs, heavy compute on the server, access from any device.",
      about_b2h: "How it works", about_b2: "The browser sends the file in chunks to a GPU cluster running retouch, upscale and denoise models. The finished result streams back.",
      about_b3h: "Privacy", about_b3: "Files are processed in isolation and deleted after export. We don't train on your photos without consent.",
      status_h1a: "System ", status_h1s: "status", status_p: "Current state of Vibrai services.",
      status_all: "All systems operational",
      st1: "Web editor", st2: "File uploads", st3: "GPU AI processing", st4: "Export & download", st5: "Accounts & billing",
      state_ok: "Operational", state_warn: "Elevated load",
      faq_h2a: "Frequently asked ", faq_h2s: "questions",
      q1: "Do I need to install anything?", a1: "No. Vibrai runs entirely in the browser, while heavy operations run on our servers.",
      q2: "Which camera formats are supported?", a2: "RAW from most makers: Canon CR2/CR3, Nikon NEF, Sony ARW, Fujifilm RAF, Adobe DNG and more, plus TIFF and JPEG.",
      q3: "How large can files be?", a3: "Up to 800 MB per file. Transfer is chunked with resume, so large RAW files don't drop.",
      q4: "How do I get access?", a4: "Sign-up is invite-only for now. Redeem an invite code or sign into an existing account.",
      menu: "Menu", close: "Close"
    },
    de: {
      doc_dir: "ltr",
      nav_features: "Funktionen", nav_how: "So funktioniert's", nav_pricing: "Preise", nav_gallery: "Galerie", nav_faq: "FAQ",
      btn_signin: "Anmelden", btn_invite: "Einladung holen", btn_try: "Kostenlos starten",
      hero_eyebrow: "KI-gestützter Online-Fotoeditor",
      hero_h1a: "Professionelle Fotobearbeitung", hero_em: "direkt im Browser", hero_h1b: "",
      hero_p: "Vibrai öffnet RAW jeder Digitalkamera, retuschiert Porträts, skaliert hoch und koloriert Aufnahmen per neuronalen Netzen — ohne Installation. Die ganze Rechenlast läuft auf unseren GPU-Servern.",
      hero_cta1: "Editor öffnen", hero_cta2: "Preise ansehen",
      stat1: "bearbeitete Fotos", stat2: "Kameraformate", stat3: "KI-Werkzeuge",
      ba_before: "Vorher", ba_after: "Nachher",
      trust: "Vertraut von Fotografen, Retuscheuren und Studios in über 90 Ländern",
      tiles_eyebrow: "Was Vibrai kann", tiles_h2a: "Ein Editor — ", tiles_h2s: "hunderte Werkzeuge", tiles_lead: "Fahre über eine Kachel, um die Funktion zu lesen. Alles läuft online; rechenintensive Schritte erfolgen auf dem Server.",
      t_retouch_t: "Porträt-Retusche", t_retouch_d: "Retusche und Bildverbesserung mit speziellen Werkzeugen für Gesichter: Haut, Augen, Zähne und Form.",
      t_portrait_t: "Porträt & Bokeh", t_portrait_d: "Motiv vom Hintergrund trennen, weiches Bokeh und Studiolicht für jedes Porträt.",
      t_sky_t: "Himmel ersetzen", t_sky_d: "Himmel ersetzen und Atmosphären-Presets mit einem Klick: Sonnenuntergänge, Gewitter, Sternenhimmel mit passendem Szenenlicht.",
      t_landscape_t: "Farbe & HDR", t_landscape_d: "Kräftige Farbkorrektur, HDR-Belichtungsreihen und Natur-Presets für Landschaft und Makro.",
      t_upscale_t: "KI-Upscaling", t_upscale_d: "Vergrößerung bis 8K mit neuronaler Detailsynthese — ohne Artefakte und Matsch.",
      t_creative_t: "Schärfe & Details", t_creative_d: "Mikrokontrast und Texturen verstärken: Fell, Stoff und Haare bleiben scharf.",
      t_denoise_t: "Rauschreduzierung", t_denoise_d: "Rauschen aus Nacht- und Filmaufnahmen entfernen, alte und beschädigte Fotos restaurieren.",
      t_raw_t: "RAW & Kameraformate", t_raw_d: "RAW-Upload und Unterstützung für Digitalkamera-Formate: CR3, NEF, ARW, RAF, DNG und viele mehr.",
      t_object_t: "Objekte entfernen", t_object_d: "Störende Personen und Objekte mit generativer Hintergrundfüllung entfernen.",
      t_product_t: "Geometrie & Perspektive", t_product_d: "Horizont ausrichten, Gebäudeperspektive und Objektivverzerrung korrigieren.",
      t_bg_t: "Hintergrund entfernen", t_bg_d: "Präzises Freistellen und Hintergrund entfernen für Kataloge und Marktplätze — im Stapel.",
      t_batch_t: "Stapelverarbeitung", t_batch_d: "Presets anwenden und tausende Aufnahmen in einem Durchlauf nach einem Rezept exportieren.",
      t_relight_t: "Licht & Reise-Presets", t_relight_d: "Szene neu ausleuchten, Licht wärmer oder kühler, fertige Reise- und Reportage-Presets.",
      t_color_t: "Cloud, jedes Gerät", t_color_d: "Cloud-Projekte: am Laptop beginnen, am Tablet fortsetzen — nichts geht verloren.",
      feat_eyebrow: "Neuronale Kraft", feat_h2a: "KI übernimmt die ", feat_h2s: "Routine", feat_lead: "Mit Millionen Aufnahmen trainierte Modelle führen komplexe Schritte automatisch aus — du verfeinerst nur das Ergebnis.",
      f1_t: "KI-Upscaling auf 8K", f1_d: "Auflösung 4–16× erhöhen und dabei realistische Details und Kanten rekonstruieren.",
      f2_t: "Intelligentes Entrauschen", f2_d: "Luminanz- und Farbrauschen getrennt behandelt, Textur bleibt erhalten.",
      f3_t: "Generativer Himmel", f3_d: "Das Netz erkennt den Horizont und beleuchtet die Szene für den neuen Himmel neu.",
      f4_t: "Objekte entfernen", f4_d: "Markiere Störendes — das Modell füllt den Bereich glaubwürdig auf.",
      f5_t: "Auto-Farbe & Ton", f5_d: "Weißabgleich, Belichtung und Kino-Grading in Sekunden.",
      f6_t: "Gesichts-Werkzeuge", f6_d: "Hautretusche mit erhaltenen Poren, dazu Blick-, Symmetrie- und Formkorrektur.",
      up_eyebrow: "Upload & Formate", up_h2a: "Ziehe ein ", up_h2s: "RAW oder Foto", up_lead: "Große RAW-Uploads werden in Teilen mit Fortsetzung übertragen: Die Verbindung zwischen Browser und Server hält auch bei Gigabyte-Aufnahmen.",
      up_title: "Dateien hierher ziehen", up_p: "oder klicken zum Auswählen. RAW, TIFF und JPEG bis je 800 MB.", up_btn: "Dateien wählen",
      up_uploading: "Übertragung zum Server…", up_processing: "KI-Verarbeitung…", up_done: "Fertig",
      up_note: "Demo: Dateien verlassen deinen Browser nicht.",
      how_eyebrow: "Drei Schritte", how_h2a: "Vom Upload zum ", how_h2s: "Ergebnis",
      s1_t: "Aufnahme hochladen", s1_d: "Kamera-RAW, ein Handy-JPEG oder ein Scan — Vibrai liest das Format und zeigt eine Vorschau.",
      s2_t: "KI-Werkzeuge anwenden", s2_d: "Retusche, Upscaling, Himmeltausch, Farbe — schwere Aufgaben laufen auf unseren GPUs.",
      s3_t: "Nach Wunsch herunterladen", s3_d: "Export als JPEG, TIFF oder PNG, im Stapel oder einzeln, mit deinen Presets.",
      gal_eyebrow: "Von Nutzern", gal_h2a: "Erstellt mit ", gal_h2s: "Vibrai", gal_lead: "Einige Vorher-Nachher-Beispiele neuronaler Bearbeitung.",
      price_eyebrow: "Abonnement", price_h2a: "Tarife für ", price_h2s: "jede Aufgabe", price_lead: "Monatlich, keine versteckten Gebühren. Zugang per Einladung.",
      plan_free_t: "Start", plan_free_p: "0 €", plan_free_per: "/Mon.", plan_free_s: "Den Editor kennenlernen.",
      plan_pro_t: "Pro", plan_pro_p: "12 €", plan_pro_per: "/Mon.", plan_pro_s: "Für aktive Fotografen und Retuscheure.",
      plan_studio_t: "Studio", plan_studio_p: "39 €", plan_studio_per: "/Mon.", plan_studio_s: "Teams und Stapelverarbeitung.",
      ribbon: "Beliebt",
      pf1: "20 Fotos / Monat", pf2: "Basis-Retusche & Farbe", pf3: "Upscaling bis 2K", pf4: "RAW-Formate", pf5: "Stapelverarbeitung", pf6: "Team-Zugang",
      pp1: "Unbegrenzte Fotos", pp2: "Alle KI-Werkzeuge", pp3: "Upscaling bis 8K", pp4: "Priorisierte GPUs", pp5: "Stapelverarbeitung", pp6: "Team-Zugang",
      ps1: "Alles aus Pro", ps2: "Bis zu 10 Plätze", ps3: "Geteilte Presets", ps4: "Stapel bis 5000", ps5: "Priorisierter Support", ps6: "API-Zugang",
      plan_btn: "Einladung holen",
      tmt_eyebrow: "Bewertungen", tmt_h2a: "Was Nutzer ", tmt_h2s: "sagen",
      tm1: "RAW meiner Sony öffnet sofort, und das Upscaling holt Details heraus, die ich im Original nicht einmal sah.", tm1n: "Anna K.", tm1r: "Hochzeitsfotografin",
      tm2: "Himmeltausch und Objektentfernung sparen mir Stunden bei jedem Immobilien-Shooting.", tm2n: "Markus L.", tm2r: "Innenraumfotograf",
      tm3: "Stapel-Porträtretusche für unseren Katalog ist genau der Grund, warum das ganze Studio gewechselt ist.", tm3n: "Dina S.", tm3r: "Art-Direktorin",
      cta_eyebrow: "Zugang per Einladung", cta_h2a: "Öffne ", cta_h2s: "Vibrai", cta_p: "Die Anmeldung läuft derzeit per Einladung. Code von Freund oder Partner? Lös ihn ein. Schon ein Konto? Melde dich an.",
      cta_btn1: "Einladung einlösen", cta_btn2: "Ich habe ein Konto",
      foot_about: "KI-Online-Fotoeditor: RAW, Retusche, Upscaling und Farbe direkt im Browser.",
      foot_h1: "Produkt", foot_h2: "Unternehmen", foot_h3: "Support",
      foot_features: "Funktionen", foot_pricing: "Preise", foot_gallery: "Galerie", foot_how: "So funktioniert's",
      foot_about_l: "Über uns", foot_careers: "Karriere", foot_press: "Presse", foot_contact: "Kontakt",
      foot_status: "Systemstatus", foot_faq: "FAQ", foot_help: "Nachricht senden",
      foot_rights: "Alle Rechte vorbehalten.", foot_note: "Bilder nur zu Demozwecken, Pexels/Picsum-Lizenz.",
      reg_h3: "Einladung einlösen", reg_sub: "Vibrai ist nur per Einladung. Gib den erhaltenen Code ein.",
      reg_hint: "Demo-Codes:", reg_code: "Einladungscode", reg_email: "E-Mail", reg_pass: "Passwort", reg_pass_ph: "Passwort erstellen", reg_btn: "Konto erstellen",
      reg_foot: "Schon dabei?", reg_foot_l: "Anmelden",
      reg_err_email: "Gib eine gültige E-Mail ein.", reg_err_code: "Code nicht erkannt. Frag die Person, die dich eingeladen hat.", reg_ok: "Einladung akzeptiert — willkommen!",
      log_h3: "Anmelden", log_sub: "Willkommen zurück bei Vibrai.", log_email: "E-Mail", log_pass: "Passwort", log_pass_ph: "Dein Passwort", log_btn: "Anmelden",
      log_foot: "Hast du einen Code?", log_foot_l: "Konto erstellen", log_progress: "Anmeldung läuft…", log_ok: "Angemeldet",
      send_h3: "Nachricht senden", send_sub: "Wir antworten meist innerhalb von zwei Werktagen.",
      send_email: "Deine E-Mail", send_topic: "Thema", send_msg: "Nachricht", send_msg_ph: "Wie können wir helfen?", send_btn: "Senden",
      topic_general: "Allgemein", topic_support: "Support", topic_billing: "Abrechnung & Abo", topic_partner: "Partnerschaft",
      send_err_email: "Gib eine gültige E-Mail ein.", send_err_msg: "Füge eine kurze Nachricht hinzu.", send_ok: "Gesendet — wir antworten per E-Mail.",
      send_sent: "Gesendet ✓",
      ph_email: "du@beispiel.de", ph_code: "XXXX-XXXX",
      contact_h1a: "Kontakt ", contact_h1s: "aufnehmen", contact_p: "Wähle ein Thema, wir leiten es ans richtige Team weiter. Wir veröffentlichen keine E-Mail-Adressen — nutze das Formular.",
      contact_send: "Nachricht senden",
      c1_t: "Support", c1_d: "Fragen zu Editor, Formaten und Verarbeitung.",
      c2_t: "Abrechnung & Abo", c2_d: "Tarife, Einladungen, Rechnungen und Rückerstattungen.",
      c3_t: "Partnerschaft", c3_d: "Studios, Integrationen und Volumenlizenzen.",
      c4_t: "Presse", c4_d: "Medien-Material und Stellungnahmen.",
      feat_page_h1a: "Alle ", feat_page_h1s: "Funktionen", feat_page_p: "Das komplette Vibrai-Toolset — von der RAW-Pipeline bis zur generativen KI.",
      about_h1a: "Über ", about_h1s: "Vibrai", about_p: "Wir machen professionelle Fotobearbeitung aus dem Browser möglich.",
      about_b1h: "Unsere Mission", about_b1: "Die Hürde zwischen Aufnahme und Ergebnis abbauen: keine Installation, schwere Berechnungen auf dem Server, Zugang von jedem Gerät.",
      about_b2h: "So funktioniert's", about_b2: "Der Browser sendet die Datei in Teilen an ein GPU-Cluster mit Retusche-, Upscaling- und Entrausch-Modellen. Das fertige Ergebnis streamt zurück.",
      about_b3h: "Datenschutz", about_b3: "Dateien werden isoliert verarbeitet und nach dem Export gelöscht. Ohne Zustimmung trainieren wir nicht mit deinen Fotos.",
      status_h1a: "System", status_h1s: "status", status_p: "Aktueller Zustand der Vibrai-Dienste.",
      status_all: "Alle Systeme betriebsbereit",
      st1: "Web-Editor", st2: "Datei-Uploads", st3: "GPU-KI-Verarbeitung", st4: "Export & Download", st5: "Konten & Abrechnung",
      state_ok: "Betriebsbereit", state_warn: "Erhöhte Last",
      faq_h2a: "Häufige ", faq_h2s: "Fragen",
      q1: "Muss ich etwas installieren?", a1: "Nein. Vibrai läuft vollständig im Browser, schwere Operationen auf unseren Servern.",
      q2: "Welche Kameraformate werden unterstützt?", a2: "RAW der meisten Hersteller: Canon CR2/CR3, Nikon NEF, Sony ARW, Fujifilm RAF, Adobe DNG und mehr, dazu TIFF und JPEG.",
      q3: "Wie groß dürfen Dateien sein?", a3: "Bis 800 MB pro Datei. Die Übertragung erfolgt in Teilen mit Fortsetzung, große RAW-Dateien brechen nicht ab.",
      q4: "Wie bekomme ich Zugang?", a4: "Die Anmeldung läuft derzeit per Einladung. Lös einen Code ein oder melde dich in einem bestehenden Konto an.",
      menu: "Menü", close: "Schließen"
    }
  };

  var LANG_KEY = "vibrai_lang";
  var LANGS = ["ru", "en", "de"];
  var LANG_LABEL = { ru: "Русский", en: "English", de: "Deutsch" };
  var LANG_FLAG = { ru: "RU", en: "EN", de: "DE" };

  function detectLang() {
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
    if (saved && LANGS.indexOf(saved) !== -1) return saved;
    var navs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || "en"];
    for (var i = 0; i < navs.length; i++) {
      var code = (navs[i] || "").slice(0, 2).toLowerCase();
      if (LANGS.indexOf(code) !== -1) return code;
    }
    return "en";
  }

  var lang = detectLang();

  function t(key) {
    var d = I18N[lang] || I18N.en;
    return (d[key] != null) ? d[key] : (I18N.en[key] != null ? I18N.en[key] : key);
  }

  function applyLang() {
    var dict = I18N[lang] || I18N.en;
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dict.doc_dir || "ltr");
    document.querySelectorAll("[data-i18n]").forEach(function (n) {
      var v = dict[n.getAttribute("data-i18n")];
      if (v != null) n.textContent = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (n) {
      var v = dict[n.getAttribute("data-i18n-ph")];
      if (v != null) n.setAttribute("placeholder", v);
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (n) {
      var v = dict[n.getAttribute("data-i18n-title")];
      if (v != null) n.setAttribute("title", v);
    });
    var titleKey = document.body.getAttribute("data-title-key");
    if (titleKey && dict[titleKey]) document.title = dict[titleKey] + " — Vibrai";
    document.querySelectorAll("[data-lang-cur]").forEach(function (n) { n.textContent = LANG_FLAG[lang]; });
    document.querySelectorAll(".lang-menu button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });
  }

  function setLang(l) {
    if (LANGS.indexOf(l) === -1) return;
    lang = l;
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
    applyLang();
  }

  function initLang() {
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var menu = btn.parentElement.querySelector(".lang-menu");
        if (menu) menu.classList.toggle("open");
      });
    });
    document.querySelectorAll(".lang-menu button").forEach(function (b) {
      b.textContent = "";
      var flag = document.createElement("span"); flag.className = "flag"; flag.textContent = LANG_FLAG[b.getAttribute("data-lang")];
      var label = document.createElement("span"); label.textContent = LANG_LABEL[b.getAttribute("data-lang")];
      b.appendChild(flag); b.appendChild(label);
      b.addEventListener("click", function () {
        setLang(b.getAttribute("data-lang"));
        var menu = b.closest(".lang-menu"); if (menu) menu.classList.remove("open");
      });
    });
    document.addEventListener("click", function () {
      document.querySelectorAll(".lang-menu.open").forEach(function (m) { m.classList.remove("open"); });
    });
  }

  function fmt(n) { return n.toLocaleString(lang === "en" ? "en-US" : (lang === "de" ? "de-DE" : "ru-RU")); }
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }

  var HERO_IMAGES = [
    "assets/img/hero.jpg", "assets/img/tile-relight.jpg", "assets/img/tile-sky.jpg",
    "assets/img/tile-landscape.jpg", "assets/img/g1.jpg", "assets/img/tile-color.jpg"
  ];
  function initHeroBg() {
    var p = document.getElementById("hero-photo");
    if (!p) return;
    var src = HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
    var probe = new Image();
    probe.onload = function () { p.style.backgroundImage = "url('" + src + "')"; p.classList.add("in"); };
    probe.onerror = function () { p.style.backgroundImage = "url('assets/img/hero.jpg')"; p.classList.add("in"); };
    probe.src = src;
  }

  function initBeforeAfter() {
    document.querySelectorAll(".ba").forEach(function (ba) {
      var after = ba.querySelector(".after");
      var divider = ba.querySelector(".divider");
      var handle = ba.querySelector(".handle");
      var range = ba.querySelector("input[type=range]");
      function set(p) {
        p = Math.max(0, Math.min(100, p));
        if (after) after.style.clipPath = "inset(0 0 0 " + p + "%)";
        if (divider) divider.style.left = p + "%";
        if (handle) handle.style.left = p + "%";
      }
      if (range) { range.addEventListener("input", function () { set(parseFloat(range.value)); }); set(parseFloat(range.value || 50)); }
    });
  }

  function initGallery() {
    document.querySelectorAll(".gallery").forEach(function (g) {
      var track = g.querySelector(".gal-track");
      var prev = g.querySelector("[data-gal=prev]");
      var next = g.querySelector("[data-gal=next]");
      if (!track) return;
      var step = function () { var item = track.querySelector(".gal-item"); return item ? item.getBoundingClientRect().width + 18 : 320; };
      if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
      if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
    });
  }

  var RAW_NAMES = ["IMG_4821.CR3", "DSC09134.ARW", "_DSF7765.RAF", "NEF_2096.NEF", "PXL_2026.dng", "SCAN_017.TIFF"];
  function randSize() { return (Math.random() * 42 + 12).toFixed(1) + " MB"; }
  function initUploader() {
    var zone = document.getElementById("uploader");
    if (!zone) return;
    var input = document.getElementById("upload-input");
    var list = document.getElementById("upload-list");
    function addRow(name, size) {
      var row = el("div", "upl-row");
      row.innerHTML = '<div class="nm">' + name + '</div><div class="sz">' + size + '</div>' +
        '<div class="bar"><i></i></div><div class="pct">0%</div>';
      list.appendChild(row);
      var bar = row.querySelector(".bar i");
      var pct = row.querySelector(".pct");
      var p = 0, phase = 0;
      var iv = setInterval(function () {
        p += Math.random() * 9 + 3;
        if (p >= 100) {
          p = 100; clearInterval(iv);
          bar.style.width = "100%";
          if (phase === 0) {
            phase = 1; pct.textContent = ""; pct.appendChild(document.createTextNode("100%"));
            row.querySelector(".sz").textContent = t("up_processing");
            var p2 = 0; bar.style.width = "0%"; bar.style.background = "linear-gradient(90deg,var(--accent),var(--cyan))";
            var iv2 = setInterval(function () {
              p2 += Math.random() * 12 + 5;
              if (p2 >= 100) { p2 = 100; clearInterval(iv2); row.querySelector(".sz").textContent = t("up_done"); pct.textContent = "✓"; }
              bar.style.width = Math.min(100, p2) + "%";
            }, 180);
          }
        } else { bar.style.width = p + "%"; pct.textContent = Math.floor(p) + "%"; }
      }, 200);
    }
    function simulate(files) {
      if (files && files.length) {
        Array.prototype.slice.call(files, 0, 6).forEach(function (f) {
          addRow(f.name, (f.size ? (f.size / 1048576).toFixed(1) + " MB" : randSize()));
        });
      } else {
        var n = Math.floor(Math.random() * 2) + 2;
        for (var i = 0; i < n; i++) addRow(RAW_NAMES[Math.floor(Math.random() * RAW_NAMES.length)], randSize());
      }
    }
    zone.addEventListener("click", function () { if (input) input.click(); else simulate(null); });
    if (input) input.addEventListener("change", function () { simulate(input.files); input.value = ""; });
    ["dragenter", "dragover"].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add("drag"); }); });
    ["dragleave", "drop"].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove("drag"); }); });
    zone.addEventListener("drop", function (e) { simulate(e.dataTransfer ? e.dataTransfer.files : null); });
  }

  var INVITE_CODES = ["VIBRAI-2026", "PRO-INVITE", "STUDIO-VIP"];
  function openModal(id) { var m = document.getElementById(id); if (m) { m.classList.add("open"); document.body.style.overflow = "hidden"; var f = m.querySelector("input,select,textarea"); if (f) setTimeout(function () { f.focus(); }, 60); } }
  function closeModal(m) { if (m) { m.classList.remove("open"); document.body.style.overflow = ""; } }

  function initModals() {
    document.querySelectorAll("[data-open]").forEach(function (b) { b.addEventListener("click", function () { openModal(b.dataset.open); }); });
    document.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { closeModal(b.closest(".modal-root")); }); });
    document.querySelectorAll(".modal-root .backdrop").forEach(function (bd) { bd.addEventListener("click", function () { closeModal(bd.closest(".modal-root")); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") document.querySelectorAll(".modal-root.open").forEach(closeModal); });
    document.querySelectorAll("[data-switch]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); document.querySelectorAll(".modal-root.open").forEach(closeModal); openModal(a.dataset.switch); }); });

    var reg = document.getElementById("form-register");
    if (reg) reg.addEventListener("submit", function (e) {
      e.preventDefault();
      var code = (reg.querySelector("[name=code]").value || "").trim().toUpperCase();
      var email = (reg.querySelector("[name=email]").value || "").trim();
      var msg = reg.querySelector(".form-msg");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.className = "form-msg err"; msg.textContent = t("reg_err_email"); return; }
      if (INVITE_CODES.indexOf(code) === -1) { msg.className = "form-msg err"; msg.textContent = t("reg_err_code"); return; }
      msg.className = "form-msg ok"; msg.textContent = t("reg_ok");
      setTimeout(function () { closeModal(reg.closest(".modal-root")); toast(t("reg_ok")); reg.reset(); msg.textContent = ""; }, 950);
    });

    var login = document.getElementById("form-login");
    if (login) login.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = login.querySelector(".form-msg");
      msg.className = "form-msg ok"; msg.textContent = t("log_progress");
      setTimeout(function () { closeModal(login.closest(".modal-root")); toast(t("log_ok")); login.reset(); msg.textContent = ""; }, 850);
    });
  }

  function initNav() {
    var toggle = document.getElementById("nav-toggle");
    var links = document.getElementById("nav-links");
    if (toggle && links) toggle.addEventListener("click", function () { links.classList.toggle("open"); });
    if (links) links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { links.classList.remove("open"); }); });
  }

  function initReveal() {
    if (!("IntersectionObserver" in window)) { document.querySelectorAll("[data-reveal]").forEach(function (n) { n.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach(function (n) { io.observe(n); });
  }

  function initCounters() {
    document.querySelectorAll("[data-count]").forEach(function (n) {
      var target = parseInt(n.dataset.count, 10), cur = 0, step = Math.max(1, Math.round(target / 60));
      var iv = setInterval(function () { cur += step; if (cur >= target) { cur = target; clearInterval(iv); } n.textContent = fmt(cur) + (n.dataset.suffix || ""); }, 24);
    });
  }

  var toastWrap;
  function toast(text) {
    if (!toastWrap) { toastWrap = el("div", "toast-wrap"); document.body.appendChild(toastWrap); }
    var t2 = el("div", "toast", '<span class="dot"></span>' + text);
    toastWrap.appendChild(t2);
    setTimeout(function () { t2.style.transition = "opacity .3s"; t2.style.opacity = "0"; setTimeout(function () { t2.remove(); }, 300); }, 2600);
  }

  function initSendForms() {
    var RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    document.querySelectorAll(".send-form").forEach(function (f) {
      var emailEl = f.querySelector("[name=email]");
      var textEl = f.querySelector("[name=message]");
      var msgEl = f.querySelector(".form-msg");
      var btn = f.querySelector("button[type=submit]");
      if (emailEl) emailEl.addEventListener("input", function () { if (RE.test(emailEl.value.trim())) emailEl.classList.remove("invalid"); });
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = emailEl ? emailEl.value.trim() : "";
        var text = textEl ? textEl.value.trim() : "";
        if (!RE.test(email)) { if (emailEl) { emailEl.classList.add("invalid"); emailEl.focus(); } msgEl.className = "form-msg err"; msgEl.textContent = t("send_err_email"); return; }
        if (textEl && !text) { msgEl.className = "form-msg err"; msgEl.textContent = t("send_err_msg"); textEl.focus(); return; }
        if (emailEl) emailEl.classList.remove("invalid");
        msgEl.className = "form-msg ok"; msgEl.textContent = t("send_ok");
        if (btn) { btn.disabled = true; btn.textContent = t("send_sent"); }
        f.reset();
        var modal = f.closest(".modal-root");
        setTimeout(function () {
          if (modal) { closeModal(modal); toast(t("send_ok")); }
          if (btn) { btn.disabled = false; btn.textContent = t("send_btn"); }
          msgEl.textContent = ""; msgEl.className = "form-msg";
        }, modal ? 1000 : 5000);
      });
    });
  }

  function init() {
    initLang();
    applyLang();
    initHeroBg();
    initBeforeAfter();
    initGallery();
    initUploader();
    initModals();
    initSendForms();
    initNav();
    initReveal();
    initCounters();
    var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
