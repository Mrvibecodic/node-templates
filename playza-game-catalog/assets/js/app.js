(function(){
  var DATA = window.CATALOG || {games:[],categories:[],styleTags:[]};
  var games = DATA.games;
  var cats = DATA.categories;
  var tags = DATA.styleTags;

  var CAT_COLORS = {
    arcade:["#ff2e7e","#7c3cff"], platformer:["#19e3c2","#3c7cff"],
    shooter:["#ff5a3c","#7c1cff"], racing:["#ffd23f","#ff2e7e"],
    fighting:["#ff2e5b","#8a1cff"], puzzle:["#3cd0ff","#7c3cff"],
    strategy:["#5cff8a","#1c9aff"], tower:["#ffae3c","#ff2e7e"],
    rpg:["#a855ff","#ff2e7e"], horror:["#5b5bff","#0e0e2a"],
    sport:["#19e3c2","#ffd23f"], runner:["#ff7a1c","#ff2ec4"],
    clicker:["#ffd23f","#19e3c2"], adventure:["#3cffa1","#1c6cff"]
  };

  var favKey = "playza_fav";
  var favs = {};
  try{ favs = JSON.parse(localStorage.getItem(favKey)||"{}"); }catch(e){ favs = {}; }
  function saveFavs(){ try{ localStorage.setItem(favKey, JSON.stringify(favs)); }catch(e){} }

  function el(html){ var d=document.createElement("div"); d.innerHTML=html.trim(); return d.firstChild; }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];}); }
  function stars(r){ var full=Math.round(r); var s=""; for(var i=0;i<5;i++){ s+= i<full?"★":"☆"; } return s; }
  function fmtPlays(n){ if(n>=1000000) return (n/1000000).toFixed(1).replace(".0","")+"M"; if(n>=1000) return Math.round(n/1000)+"K"; return ""+n; }

  function phStyle(g){
    var c = CAT_COLORS[g.category] || ["#7c3cff","#ff2e7e"];
    return "background:radial-gradient(120% 120% at 20% 10%,"+c[0]+"33,transparent 60%),linear-gradient(150deg,"+c[0]+","+c[1]+")";
  }
  function coverMarkup(g, big){
    var t = g.tags && g.tags.length ? g.tags[0] : g.categoryName;
    return ''+
      '<div class="ph-bg" style="'+phStyle(g)+'"></div>'+
      '<img src="'+esc(g.cover)+'" alt="'+esc(g.title)+'" loading="lazy" data-fallback>'+
      '<div class="ph">'+
        '<span class="ph-tag">'+esc(t)+'</span>'+
        (big?'':'<span class="ph-title">'+esc(g.title)+'</span>')+
      '</div>';
  }

  function cardMarkup(g){
    var bdg="";
    if(g.isNew) bdg+='<span class="badge new">new</span>';
    if(g.hot) bdg+='<span class="badge hot">hot</span>';
    var on = favs[g.slug] ? " on" : "";
    var tg = (g.tags||[]).slice(0,2).map(function(t){return '<span class="mini-tag">'+esc(t)+'</span>';}).join("");
    return ''+
      '<article class="card" data-slug="'+esc(g.slug)+'">'+
        '<div class="cover">'+
          (bdg?'<div class="badges">'+bdg+'</div>':'')+
          '<button class="fav'+on+'" data-fav="'+esc(g.slug)+'" aria-label="В избранное">♥</button>'+
          coverMarkup(g,false)+
        '</div>'+
        '<div class="card-body">'+
          '<h3 class="card-title">'+esc(g.title)+'</h3>'+
          '<div class="card-meta"><span class="card-cat">'+esc(g.categoryName)+'</span>'+
            '<span class="stars">'+stars(g.rating)+'</span><span>'+g.rating.toFixed(1)+'</span></div>'+
          '<div class="card-tags">'+tg+'</div>'+
          '<div class="card-foot"><span class="plays">'+fmtPlays(g.plays)+' запусков</span>'+
            '<button class="play-btn" data-play>Играть</button></div>'+
        '</div>'+
      '</article>';
  }

  function bindCover(node){
    var img = node.querySelector("img[data-fallback]");
    if(img){ img.addEventListener("error", function(){ img.style.display="none"; }); }
  }

  function renderRail(id, list){
    var box = document.getElementById(id);
    if(!box) return;
    box.innerHTML="";
    list.forEach(function(g){ var n=el(cardMarkup(g)); box.appendChild(n); bindCover(n); });
  }

  var state = { cat:"all", tag:"all", q:"", sort:"popular", shown:0, step:24 };

  function filtered(){
    var q = state.q.trim().toLowerCase();
    var list = games.filter(function(g){
      if(state.cat!=="all" && g.category!==state.cat) return false;
      if(state.tag!=="all" && (g.tags||[]).indexOf(state.tag)<0) return false;
      if(q && g.title.toLowerCase().indexOf(q)<0 && g.categoryName.toLowerCase().indexOf(q)<0) return false;
      return true;
    });
    if(state.sort==="popular") list.sort(function(a,b){return b.plays-a.plays;});
    else if(state.sort==="rating") list.sort(function(a,b){return b.rating-a.rating;});
    else if(state.sort==="az") list.sort(function(a,b){return a.title.localeCompare(b.title,"ru");});
    else if(state.sort==="new") list.sort(function(a,b){return (b.isNew?1:0)-(a.isNew?1:0) || b.plays-a.plays;});
    return list;
  }

  function renderGrid(reset){
    var grid = document.getElementById("grid");
    var list = filtered();
    document.getElementById("resultCount").textContent = list.length;
    if(reset){ grid.innerHTML=""; state.shown=0; }
    var next = list.slice(state.shown, state.shown+state.step);
    next.forEach(function(g){ var n=el(cardMarkup(g)); grid.appendChild(n); bindCover(n); });
    state.shown += next.length;
    document.getElementById("empty").hidden = list.length!==0;
    document.getElementById("loadMore").style.display = state.shown<list.length ? "" : "none";
  }

  function buildChips(){
    var cbox = document.getElementById("catChips");
    cbox.appendChild(makeChip("Все игры","all",games.length,"cat"));
    cats.forEach(function(c){ cbox.appendChild(makeChip(c.name,c.key,c.count,"cat")); });
    var tbox = document.getElementById("tagChips");
    tbox.appendChild(makeChip("Любой стиль","all",null,"tag",true));
    tags.forEach(function(t){ tbox.appendChild(makeChip(t,t,null,"tag",true)); });
  }
  function makeChip(label,val,count,kind,isTag){
    var b=document.createElement("button");
    b.className="chip"+(isTag?" tag":"")+(val==="all"?" active":"");
    b.setAttribute("data-"+kind,val);
    b.innerHTML=esc(label)+(count!=null?'<span class="c">'+count+'</span>':"");
    b.addEventListener("click",function(){
      var group = document.querySelectorAll('[data-'+kind+']');
      group.forEach(function(x){x.classList.remove("active");});
      b.classList.add("active");
      if(kind==="cat") state.cat=val; else state.tag=val;
      renderGrid(true);
    });
    return b;
  }

  function buildFooterCats(){
    var box=document.getElementById("footCats");
    cats.forEach(function(c){
      var b=document.createElement("button");
      b.textContent=c.name;
      b.addEventListener("click",function(){
        state.cat=c.key;
        document.querySelectorAll('[data-cat]').forEach(function(x){x.classList.toggle("active", x.getAttribute("data-cat")===c.key);});
        renderGrid(true);
        document.getElementById("catalog").scrollIntoView({behavior:"smooth"});
      });
      box.appendChild(b);
    });
  }

  function openGame(slug){
    var g = games.filter(function(x){return x.slug===slug;})[0];
    if(!g) return;
    var revs = (g.reviews||[]).map(function(r){
      return '<div class="review"><div class="review-top"><span class="review-author">'+esc(r.author)+'</span>'+
        '<span class="stars">'+stars(r.rating)+'</span></div><div class="review-text">'+esc(r.text)+'</div></div>';
    }).join("");
    var tg=(g.tags||[]).map(function(t){return '<span class="mini-tag">'+esc(t)+'</span>';}).join("");
    document.getElementById("gmBody").innerHTML=''+
      '<div class="gm-cover">'+coverMarkup(g,true)+'</div>'+
      '<div class="gm-info">'+
        '<h3>'+esc(g.title)+'</h3>'+
        '<div class="gm-sub"><span class="card-cat">'+esc(g.categoryName)+'</span>'+
          '<span class="stars">'+stars(g.rating)+'</span><span>'+g.rating.toFixed(1)+'</span>'+
          '<span>'+fmtPlays(g.plays)+' запусков</span></div>'+
        '<p class="gm-desc">'+esc(g.description)+'</p>'+
        '<div class="gm-tags">'+tg+'</div>'+
        '<div class="gm-actions"><button class="btn btn-primary" data-play>Играть</button>'+
          '<button class="btn btn-ghost" data-fav-big="'+esc(g.slug)+'">'+(favs[g.slug]?"В избранном ♥":"В избранное ♡")+'</button></div>'+
        '<div class="reviews"><h4>Отзывы игроков</h4>'+(revs||'<div class="review-text">Пока без отзывов.</div>')+'</div>'+
      '</div>';
    bindCover(document.getElementById("gmBody"));
    showModal("gameModal");
  }

  function showModal(id){
    var sw = window.innerWidth - document.documentElement.clientWidth;
    document.getElementById(id).hidden=false;
    document.body.style.overflow="hidden";
    if(sw>0) document.body.style.paddingRight=sw+"px";
  }
  function hideModals(){
    document.getElementById("gameModal").hidden=true;
    document.getElementById("loginModal").hidden=true;
    document.body.style.overflow="";
    document.body.style.paddingRight="";
  }

  var toastT;
  function toast(msg){
    var t=document.getElementById("toast"); t.textContent=msg; t.hidden=false;
    clearTimeout(toastT); toastT=setTimeout(function(){t.hidden=true;},1800);
  }

  function toggleFav(slug){
    if(favs[slug]) delete favs[slug]; else favs[slug]=1;
    saveFavs();
    document.querySelectorAll('[data-fav="'+slug+'"]').forEach(function(b){ b.classList.toggle("on", !!favs[slug]); });
    var big=document.querySelector('[data-fav-big="'+slug+'"]');
    if(big) big.textContent = favs[slug]?"В избранном ♥":"В избранное ♡";
    toast(favs[slug]?"Добавлено в избранное":"Убрано из избранного");
  }

  function animateStat(node, target){
    var start=0, dur=1100, t0=null;
    function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1); var v=Math.floor(start+(target-start)*(1-Math.pow(1-p,3)));
      node.textContent = node.getAttribute("data-stat")==="plays"?fmtPlays(v):v.toLocaleString("ru-RU");
      if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  function init(){
    var totalPlays = games.reduce(function(s,g){return s+g.plays;},0);
    var sg=document.querySelector('[data-stat="games"]');
    var sc=document.querySelector('[data-stat="cats"]');
    var sp=document.querySelector('[data-stat="plays"]');
    if(sg) animateStat(sg, games.length);
    if(sc) animateStat(sc, cats.length);
    if(sp) animateStat(sp, totalPlays);

    var deck=document.getElementById("heroDeck");
    var feat=games.filter(function(g){return g.featured;}).slice(0,3);
    if(feat.length<3) feat=games.slice(0,3);
    feat.forEach(function(g){
      var n=el('<div class="deck-card"><div class="cover">'+coverMarkup(g,false)+'</div></div>');
      deck.appendChild(n); bindCover(n);
    });

    var hot = games.slice().sort(function(a,b){return b.plays-a.plays;}).slice(0,12);
    var fresh = games.filter(function(g){return g.isNew;}).slice(0,12);
    if(fresh.length<8) fresh=games.slice(0,12);
    var top = games.slice().sort(function(a,b){return b.rating-a.rating || b.plays-a.plays;}).slice(0,12);
    renderRail("railHot",hot); renderRail("railFresh",fresh); renderRail("railTop",top);

    buildChips(); buildFooterCats(); renderGrid(true);

    var s=document.getElementById("search"), tmr;
    s.addEventListener("input",function(){ clearTimeout(tmr); tmr=setTimeout(function(){ state.q=s.value; renderGrid(true); },140); });
    document.getElementById("sort").addEventListener("change",function(e){ state.sort=e.target.value; renderGrid(true); });
    document.getElementById("loadMore").addEventListener("click",function(){ renderGrid(false); });

    document.addEventListener("click",function(e){
      var play=e.target.closest("[data-play]");
      if(play){ e.stopPropagation(); showModal("loginModal"); return; }
      var fav=e.target.closest("[data-fav]");
      if(fav){ e.stopPropagation(); toggleFav(fav.getAttribute("data-fav")); return; }
      var favBig=e.target.closest("[data-fav-big]");
      if(favBig){ toggleFav(favBig.getAttribute("data-fav-big")); return; }
      var openLogin=e.target.closest("[data-open-login]");
      if(openLogin){ e.preventDefault(); showModal("loginModal"); return; }
      if(e.target.closest("[data-close]")){ hideModals(); return; }
      var card=e.target.closest(".card");
      if(card){ openGame(card.getAttribute("data-slug")); }
    });
    document.addEventListener("keydown",function(e){ if(e.key==="Escape") hideModals(); });

    var burger=document.querySelector("[data-burger]");
    if(burger) burger.addEventListener("click",function(){ document.querySelector(".nav").classList.toggle("open"); });
    document.querySelectorAll(".nav a").forEach(function(a){ a.addEventListener("click",function(){ document.querySelector(".nav").classList.remove("open"); }); });
  }

  if(document.readyState!=="loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
