"use strict";

const CYCLE = 600;
const SAVE_KEY = "rybaliti2_save";

const FISH = [
  {n:"Уклейка",  rar:0, w:[0.02,0.12], val:5,  minBait:0},
  {n:"Ёрш",      rar:0, w:[0.05,0.2],  val:6,  minBait:0},
  {n:"Пескарь",  rar:0, w:[0.02,0.15], val:7,  minBait:0},
  {n:"Плотва",   rar:0, w:[0.1,0.5],   val:9,  minBait:0},
  {n:"Густера",  rar:0, w:[0.1,0.6],   val:11, minBait:0},
  {n:"Окунь",    rar:0, w:[0.1,0.9],   val:13, minBait:0},
  {n:"Карась",   rar:0, w:[0.2,1.2],   val:16, minBait:0},
  {n:"Мусорный пакет", rar:0, w:[0.2,1.5], val:0, minBait:0, trash:true},
  {n:"Краснопёрка", rar:1, w:[0.3,1.5], val:24, minBait:1},
  {n:"Лещ",      rar:1, w:[0.5,2.5],   val:28, minBait:0},
  {n:"Чехонь",   rar:1, w:[0.2,1.2],   val:32, minBait:1},
  {n:"Линь",     rar:1, w:[0.6,2.0],   val:34, minBait:1},
  {n:"Карп",     rar:1, w:[1.0,5.0],   val:46, minBait:1},
  {n:"Голавль",  rar:2, w:[0.8,4.0],   val:62, minBait:2},
  {n:"Берш",     rar:2, w:[0.6,2.5],   val:68, minBait:1},
  {n:"Судак",    rar:2, w:[1.5,6.0],   val:72, minBait:1},
  {n:"Хариус",   rar:2, w:[0.3,1.8],   val:80, minBait:2},
  {n:"Щука",     rar:2, w:[1.5,8.0],   val:84, minBait:2},
  {n:"Жерех",    rar:2, w:[1.0,6.0],   val:88, minBait:3},
  {n:"Налим",    rar:2, w:[2.0,7.0],   val:92, minBait:2},
  {n:"Форель",   rar:2, w:[0.5,3.0],   val:96, minBait:2},
  {n:"Угорь",    rar:3, w:[0.5,3.5],   val:150, minBait:3},
  {n:"Сом",      rar:3, w:[5.0,40.0],  val:210, minBait:2},
  {n:"Сёмга",    rar:3, w:[2.0,12.0],  val:240, minBait:3},
  {n:"Осётр",    rar:3, w:[6.0,30.0],  val:270, minBait:3},
  {n:"Таймень",  rar:3, w:[8.0,50.0],  val:320, minBait:4},
  {n:"Белуга",   rar:3, w:[10.0,80.0], val:380, minBait:4},
  {n:"Золотая рыбка", rar:4, w:[0.3,0.6], val:560, minBait:3},
  {n:"Царь-рыба",     rar:4, w:[20,90],   val:840, minBait:4},
];
const RAR_NAME = ["обычная","необычная","редкая","эпическая","ЛЕГЕНДАРНАЯ","МИФИЧЕСКАЯ"];
const RAR_CLASS= ["rar-common","rar-uncommon","rar-rare","rar-epic","rar-legendary","rar-mythic"];
const RAR_BASE = [100, 44, 23, 7.5, 1.4];

const SPECIALS = [
  {n:"Кракен",   art:"octopus",   w:[80,400],   val:2600},
  {n:"Лесси",    art:"nessie",    w:[200,900],  val:3400},
  {n:"Посейдон", art:"poseidon",  w:[120,320],  val:5200},
  {n:"Левиафан", art:"leviathan", w:[300,1500], val:4400},
];

const RODS = [
  {id:"bamboo",  n:"Бамбуковая удочка", em:"🎋", cost:0,    dur:0,   bite:1.0,  line:100, reel:1.0,
   desc:"Простая, но вечная — не ломается никогда."},
  {id:"telescope", n:"Телескопическая", em:"🩼", cost:45, dur:90,  bite:1.12, line:110, reel:1.08,
   desc:"Дешёвый апгрейд с бамбука: клюёт чуть бодрее."},
  {id:"glass",   n:"Стеклопластиковая", em:"🎣", cost:100,  dur:120, bite:1.25, line:120, reel:1.15,
   desc:"Клюёт быстрее, леска покрепче."},
  {id:"feeder",  n:'Фидер "Дальник"',   em:"🥖", cost:240,  dur:140, bite:1.35, line:135, reel:1.22,
   desc:"Дальний заброс по дну. Любит мирную рыбу — леща, карпа, линя."},
  {id:"carbon",  n:"Карбоновая удочка", em:"🪝", cost:380,  dur:150, bite:1.5,  line:145, reel:1.35,
   desc:"Лёгкая и чувствительная. Хорошая подсечка."},
  {id:"match",   n:"Матчевая удочка",   em:"🎯", cost:600,  dur:165, bite:1.55, line:160, reel:1.42,
   desc:"Точная и хлёсткая. Уверенно держит трофей."},
  {id:"spin",    n:'Спиннинг "Хищник"', em:"🦞", cost:1100, dur:180, bite:1.7,  line:185, reel:1.6,
   desc:"Мощный, держит крупную рыбу."},
  {id:"premium", n:'Удочка "Нереальная"', em:"🌟", cost:3500, dur:240, bite:2.1, line:260, reel:2.0,
   desc:"Топовая снасть. Леска почти не рвётся."},
  {id:"epic", n:'Эпическое удилище "Бездна"', em:"🔱", cost:9000, dur:320, bite:2.3, line:360, reel:2.5, epic:true,
   desc:"Только ей под силу вытащить морское чудище. Остальные снасти оно рвёт сразу."},
];
const BAITS = [
  {id:"worm",    n:"Червяк",  em:"🪱", cost:0,    tier:0, inf:true, pack:0,
   best:"мелочь и бель", desc:"Бесконечная базовая наживка. Ловит мелочь.",
   aff:{"Пескарь":2.2,"Ёрш":2.0,"Плотва":1.6,"Окунь":1.5,"Густера":1.5,"Карась":1.4}},
  {id:"dough",   n:"Тесто",   em:"🍞", cost:80,   tier:1, pack:6,
   best:"карась, лещ, густера", desc:"Мирная насадка для бели. Крупняк берёт нехотя и мелким.",
   aff:{"Карась":2.4,"Густера":2.2,"Лещ":1.8,"Линь":1.6,"Плотва":1.5,"Краснопёрка":1.4,"Карп":0.6,"Сазан":0.6},
   small:["Карп","Лещ"]},
  {id:"bloodworm",n:"Мотыль", em:"🩸", cost:110,  tier:1, pack:6,
   best:"любая мелочь, особенно зимой", desc:"Универсальная мелкая насадка — но крупную рыбу только мельчит.",
   aff:{"Пескарь":2.4,"Ёрш":2.2,"Уклейка":2.0,"Плотва":2.0,"Густера":1.9,"Окунь":1.7,"Карась":1.5,"Лещ":1.3,"Берш":0.7},
   small:["Карась","Лещ","Окунь","Берш"]},
  {id:"maggot",  n:"Опарыш",  em:"🐛", cost:60,   tier:1, pack:5,
   best:"рыба побольше", desc:"Привлекает рыбу побольше.",
   aff:{"Краснопёрка":1.8,"Густера":1.6,"Плотва":1.5,"Лещ":1.5,"Линь":1.4,"Чехонь":1.4}},
  {id:"corn",    n:"Кукуруза", em:"🌽", cost:180,  tier:2, pack:5,
   best:"карп, сазан, лещ", desc:"Сладкая насадка для крупной мирной рыбы.",
   aff:{"Карп":2.6,"Лещ":2.0,"Карась":1.8,"Линь":1.7,"Краснопёрка":1.5}},
  {id:"fly",     n:"Мушка",   em:"🪰", cost:300,  tier:2, pack:5,
   best:"хариус, форель, голавль", desc:"Нахлыстовая мушка по верху — для быстрой речной рыбы.",
   aff:{"Хариус":2.8,"Форель":2.4,"Голавль":2.0,"Уклейка":1.8,"Чехонь":1.8,"Жерех":1.4}},
  {id:"wobbler", n:"Воблер",  em:"🎏", cost:220,  tier:2, pack:5,
   best:"хищник и крупняк", desc:"Соблазняет хищников и крупняк.",
   aff:{"Голавль":1.8,"Щука":1.7,"Окунь":1.6,"Судак":1.5,"Берш":1.5,"Жерех":1.5,"Форель":1.5}},
  {id:"jig",     n:"Виброхвост", em:"🦑", cost:520, tier:3, pack:5,
   best:"судак, берш, окунь", desc:"Силиконовая приманка по дну — для судаковой охоты.",
   aff:{"Судак":2.6,"Берш":2.6,"Окунь":1.9,"Щука":1.7,"Налим":1.6,"Сом":1.4}},
  {id:"spinner", n:"Блесна",  em:"🥄", cost:650,  tier:3, pack:5,
   best:"редкая и трофейная", desc:"Манит редкую и трофейную рыбу.",
   aff:{"Жерех":2.2,"Угорь":1.9,"Сёмга":1.9,"Щука":1.8,"Таймень":1.6,"Сом":1.5,"Осётр":1.4}},
  {id:"livebait",n:"Живец",   em:"🐠", cost:1500, tier:4, pack:5,
   best:"легендарный и особый улов", desc:"Шанс на легендарный и особый улов!",
   aff:{"Белуга":2.4,"Таймень":2.2,"Сом":2.0,"Осётр":2.0,"Сёмга":1.8,"Берш":1.6,"Судак":1.5}},
];

const FP_WORDS = ["qq","ff","qq","ff","hy2","pq","бс","яклауд","АВГ!","AWG","AmneziaWG","naiveproxy",
  "TCP банят","КАСКАД","Дабл VPN","Мультиадмин","chrome","safari",
  "ios","360","edge","random","randomized","REALITY?","vless","hello?","utls","qq?","ff!","tls1.3","client\nhello",
  "vmess","trojan","shadowsocks","ss?","ECH","DPI","obfs4","WG","wireguard","xray","sing-box","mux?",
  "padding","fakeTLS","SNI","домен?","фронт","CDN","ws+tls","grpc","блок 🧱","детект 👀","пинг 9999","МТС режет",
  "роскомнадзор",
  "hy2","хистерия2","hysteria","фингерпринт","xhttp","помогите","а что случилось?","n/a"];

const MONKEY_LINES = ["клюёт?","ну как рыбалка?","много поймал?","покажи улов 👀",
  "а слабо щуку?","опять сорвалась? 😏","qq?","я бы лучше поймал","тут рыбы нет, ха","ты ещё тут?",
  "дай червяка 🪱","косяк уплыл!","смотри — рябь!","а удочка-то слабая","сом где-то тут 👀","я видел белугу, клянусь"];

const SCHOOL_FISH = ["Уклейка","Плотва","Густера","Окунь","Карась","Краснопёрка","Лещ","Чехонь"];
const SCHOOL_ANIMS = ["dart","scatter","swirl"];

const FISH_SHADOW_COLS = [["#2e5a4a","#7fc09a"],["#39506f","#8fb0d6"],["#5a4a2e","#bda06a"],
  ["#4a3a5e","#a589c8"],["#5a2e34","#c88f86"],["#2e4f5e","#8fc0d6"],["#4d4a2e","#c2bd6a"]];

const FISHART = {
  _default:{hei:0.5, top:"#5a6e74", bot:"#cdd6d8", fin:"#7d8a8e", snout:"round", mark:"none"},
  "Уклейка":{hei:0.32, top:"#8fa6b4", bot:"#eef4f7", fin:"#aebfc8", snout:"point", mark:"hstripe", hstripeCol:"rgba(150,170,185,.55)"},
  "Ёрш":{hei:0.46, top:"#5f6a3e", bot:"#cbc59c", fin:"#7d7a4e", snout:"round", mark:"spots", spotCol:"rgba(50,56,32,.55)", dspiky:true},
  "Плотва":{hei:0.5, top:"#566f7e", bot:"#eef2f4", fin:"#c44a3a", snout:"round", mark:"none"},
  "Окунь":{hei:0.54, top:"#3f6b3a", bot:"#d8d2a8", fin:"#d8632e", snout:"round", mark:"vstripes", stripeCol:"rgba(30,55,25,.5)", dspiky:true},
  "Карась":{hei:0.62, top:"#7a5a2a", bot:"#e8c87a", fin:"#9a6e34", snout:"round", mark:"scales"},
  "Лещ":{hei:0.68, top:"#7d7560", bot:"#e9e3cf", fin:"#5e5848", snout:"round", mark:"none"},
  "Линь":{hei:0.5, top:"#34431f", bot:"#8f9a52", fin:"#2c3a1a", snout:"round", mark:"none"},
  "Карп":{hei:0.58, top:"#6e4f24", bot:"#d8b060", fin:"#7a5a2a", snout:"round", mark:"scales", barbel:true},
  "Судак":{hei:0.4, top:"#5a6048", bot:"#d2cdb0", fin:"#7a7e5e", snout:"long", mark:"spots", spotCol:"rgba(40,44,30,.5)", dspiky:true},
  "Щука":{hei:0.38, top:"#4a5e34", bot:"#cfd6a8", fin:"#5e6e3e", snout:"long", mark:"spots", spotCol:"rgba(225,234,180,.7)"},
  "Налим":{hei:0.42, top:"#5a4e34", bot:"#cfc29a", fin:"#4e4530", snout:"round", mark:"mottle", barbel:true},
  "Сом":{hei:0.52, top:"#2e3630", bot:"#7e8676", fin:"#242a26", snout:"round", mark:"mottle", barbel:true},
  "Осётр":{hei:0.4, top:"#6a7378", bot:"#c7cdce", fin:"#565e62", snout:"long", mark:"scutes", barbel:true},
  "Краснопёрка":{hei:0.52, top:"#6b7a52", bot:"#f0e9c8", fin:"#e03a2a", snout:"round", mark:"scales"},
  "Голавль":{hei:0.46, top:"#4e6470", bot:"#dfe4da", fin:"#d2622e", snout:"round", mark:"scales"},
  "Форель":{hei:0.44, top:"#7a6238", bot:"#e8d8a8", fin:"#8a6e3e", snout:"round", mark:"spots", spotCol:"rgba(190,60,40,.6)"},
  "Жерех":{hei:0.4, top:"#56707e", bot:"#e8eef0", fin:"#7e8e98", snout:"point", mark:"hstripe", hstripeCol:"rgba(120,140,155,.5)"},
  "Угорь":{hei:0.24, top:"#3a4a36", bot:"#c8c89a", fin:"#2e3a2c", snout:"long", mark:"none"},
  "Таймень":{hei:0.42, top:"#5e4a52", bot:"#d8c0b0", fin:"#b04038", snout:"long", mark:"spots", spotCol:"rgba(40,30,35,.5)"},
  "Пескарь":{hei:0.34, top:"#6a5f44", bot:"#d8cfae", fin:"#8a7e5e", snout:"point", mark:"spots", spotCol:"rgba(50,42,26,.55)", barbel:true},
  "Густера":{hei:0.64, top:"#7e8794", bot:"#eef2f5", fin:"#c06a5a", snout:"round", mark:"scales"},
  "Чехонь":{hei:0.34, top:"#8ba0ae", bot:"#f4f7f9", fin:"#aebcc6", snout:"point", mark:"hstripe", hstripeCol:"rgba(150,168,182,.5)"},
  "Берш":{hei:0.42, top:"#6a7060", bot:"#d2cdb4", fin:"#8a8e70", snout:"long", mark:"vstripes", stripeCol:"rgba(40,46,32,.45)", dspiky:true},
  "Хариус":{hei:0.46, top:"#5a6a86", bot:"#dfe6ee", fin:"#7e6aa0", snout:"round", mark:"spots", spotCol:"rgba(60,40,80,.5)", dspiky:true},
  "Сёмга":{hei:0.42, top:"#5e6e84", bot:"#eef2f6", fin:"#8a96a4", snout:"long", mark:"spots", spotCol:"rgba(35,45,55,.55)"},
  "Белуга":{hei:0.4, top:"#8a949a", bot:"#dfe4e6", fin:"#6e767a", snout:"long", mark:"scutes", barbel:true},
  "Мусорный пакет":{special:"trashbag"},
  "Золотая рыбка":{special:"goldfish"},
  "Царь-рыба":{hei:0.6, top:"#caa23a", bot:"#ffe9a0", fin:"#e0b84a", snout:"round", mark:"scales", crown:true},
  "Кракен":{special:"octopus"},
  "Лесси":{special:"nessie"},
  "Посейдон":{special:"poseidon"},
  "Левиафан":{special:"leviathan"},
};

const SPRITE_BASE = "assets/sprites/";
const FISH_SLUG = {
  "Уклейка":"ukleyka","Ёрш":"yorsh","Плотва":"plotva","Окунь":"okun","Карась":"karas",
  "Лещ":"lesch","Линь":"lin","Карп":"karp","Судак":"sudak","Щука":"schuka","Налим":"nalim",
  "Краснопёрка":"krasnoperka","Голавль":"golavl","Форель":"forel","Жерех":"zherekh","Угорь":"ugor","Таймень":"taimen",
  "Пескарь":"peskar","Густера":"gustera","Чехонь":"chehon","Берш":"bersh","Хариус":"harius","Сёмга":"semga","Белуга":"beluga",
  "Мусорный пакет":"trashbag","Сом":"som","Осётр":"osetr","Золотая рыбка":"zolotaya","Царь-рыба":"tsar-ryba",
  "Кракен":"kraken","Лесси":"lessi","Посейдон":"poseidon","Левиафан":"leviafan"
};
const SPRITE_NAMES = [
  "ukleyka","yorsh","plotva","okun","karas","lesch","lin","karp","sudak","schuka","nalim",
  "som","osetr","zolotaya","tsar-ryba","trashbag","krasnoperka","golavl","forel","zherekh","ugor","taimen","kraken","lessi","poseidon","leviafan",
  "peskar","gustera","chehon","bersh","harius","semga","beluga",
  "bamboo","glass","carbon","spin","epic","telescope","feeder","match","premium",
  "worm","maggot","wobbler","spinner","livebait","dough","corn","bloodworm","fly","jig","monkey"
];
