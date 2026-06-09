"use strict";

const CYCLE = 600;
const SAVE_KEY = "rybaliti2_save";

const FISH = [
  {n:"Уклейка",  rar:0, w:[0.02,0.12], val:5,  minBait:0},
  {n:"Ёрш",      rar:0, w:[0.05,0.2],  val:6,  minBait:0},
  {n:"Плотва",   rar:0, w:[0.1,0.5],   val:9,  minBait:0},
  {n:"Окунь",    rar:0, w:[0.1,0.9],   val:13, minBait:0},
  {n:"Карась",   rar:0, w:[0.2,1.2],   val:16, minBait:0},
  {n:"Лещ",      rar:1, w:[0.5,2.5],   val:28, minBait:0},
  {n:"Линь",     rar:1, w:[0.6,2.0],   val:34, minBait:1},
  {n:"Карп",     rar:1, w:[1.0,5.0],   val:46, minBait:1},
  {n:"Судак",    rar:2, w:[1.5,6.0],   val:72, minBait:1},
  {n:"Щука",     rar:2, w:[1.5,8.0],   val:84, minBait:2},
  {n:"Налим",    rar:2, w:[2.0,7.0],   val:92, minBait:2},
  {n:"Сом",      rar:3, w:[5.0,40.0],  val:210, minBait:2},
  {n:"Осётр",    rar:3, w:[6.0,30.0],  val:270, minBait:3},
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
  {id:"glass",   n:"Стеклопластиковая", em:"🎣", cost:100,  dur:120, bite:1.25, line:120, reel:1.15,
   desc:"Клюёт быстрее, леска покрепче."},
  {id:"carbon",  n:"Карбоновая удочка", em:"🪝", cost:380,  dur:150, bite:1.5,  line:145, reel:1.35,
   desc:"Лёгкая и чувствительная. Хорошая подсечка."},
  {id:"spin",    n:'Спиннинг "Хищник"', em:"🦞", cost:1100, dur:180, bite:1.7,  line:185, reel:1.6,
   desc:"Мощный, держит крупную рыбу."},
  {id:"premium", n:'Удочка "Нереальная"', em:"🌟", cost:3500, dur:240, bite:2.1, line:260, reel:2.0,
   desc:"Топовая снасть. Леска почти не рвётся."},
  {id:"epic", n:'Эпическое удилище "Бездна"', em:"🔱", cost:9000, dur:320, bite:2.3, line:360, reel:2.5, epic:true,
   desc:"Только ей под силу вытащить морское чудище. Остальные снасти оно рвёт сразу."},
];
const BAITS = [
  {id:"worm",    n:"Червяк",  em:"🪱", cost:0,    tier:0, inf:true, pack:0, desc:"Бесконечная базовая наживка. Ловит мелочь."},
  {id:"maggot",  n:"Опарыш",  em:"🐛", cost:60,   tier:1, pack:5, desc:"Привлекает рыбу побольше."},
  {id:"wobbler", n:"Воблер",  em:"🎏", cost:220,  tier:2, pack:5, desc:"Соблазняет хищников и крупняк."},
  {id:"spinner", n:"Блесна",  em:"🥄", cost:650,  tier:3, pack:5, desc:"Манит редкую и трофейную рыбу."},
  {id:"livebait",n:"Живец",   em:"🐠", cost:1500, tier:4, pack:5, desc:"Шанс на легендарный и особый улов!"},
];

const FP_WORDS = ["qq","ff","qq","ff","hy2","pq","бс","яклауд","АВГ!","AWG","AmneziaWG","naiveproxy","TCP банят","КАСКАД","Дабл VPN","Мультиадмин","chrome","safari",
  "ios","360","edge","random","randomized","REALITY?","vless","hello?","utls","qq?","ff!","tls1.3","client\nhello"];

const MONKEY_LINES = ["клюёт?","ну как рыбалка?","много поймал?","покажи улов 👀",
  "а слабо щуку?","опять сорвалась? 😏","qq?","я бы лучше поймал","тут рыбы нет, ха","ты ещё тут?"];

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
  "Сом":"som","Осётр":"osetr","Золотая рыбка":"zolotaya","Царь-рыба":"tsar-ryba",
  "Кракен":"kraken","Лесси":"lessi","Посейдон":"poseidon","Левиафан":"leviafan"
};
const SPRITE_NAMES = [
  "ukleyka","yorsh","plotva","okun","karas","lesch","lin","karp","sudak","schuka","nalim",
  "som","osetr","zolotaya","tsar-ryba","kraken","lessi","poseidon","leviafan",
  "bamboo","glass","carbon","spin","epic","worm","maggot","wobbler","spinner","livebait","monkey"
];
