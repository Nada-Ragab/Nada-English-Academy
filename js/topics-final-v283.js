(function(){
'use strict';
function byId(id){ return document.getElementById(id); }
function activateScreen(id){
  var target=byId(id);
  if(!target) return false;
  document.querySelectorAll('.screen').forEach(function(el){ el.classList.remove('active'); });
  document.querySelectorAll('[data-screen]').forEach(function(el){
    el.classList.toggle('active', el.getAttribute('data-screen')===id);
  });
  target.classList.add('active');
  try { window.scrollTo(0,0); } catch(e) {}
  return true;
}
function topicStartFrom(el){
  if(!el) return null;
  var raw=el.getAttribute('data-topic-start');
  if(raw===null) raw=el.getAttribute('data-start');
  var value=Number(raw);
  return Number.isFinite(value) ? Math.max(0,value) : null;
}
function openTopic(start){
  var index=Number(start);
  if(!Number.isFinite(index)) return false;
  index=Math.max(0,index);
  try{
    if(typeof state!=='undefined') state.i=index;
    if(typeof render==='function') render();
    if(typeof save==='function') save();
  }catch(error){ console.error('V28.3 topic render error',error); }
  activateScreen('learn');
  var en=byId('en');
  if(en) en.scrollIntoView({block:'center'});
  return true;
}
function openTopicsScreen(){
  activateScreen('topicscreen');
  try{ if(typeof window.renderTopicsScreen==='function') window.renderTopicsScreen(); }catch(error){ console.error(error); }
}

document.addEventListener('click',function(event){
  var nav=event.target.closest('[data-screen="topicscreen"],#sidebarTopicsShortcut');
  if(nav){
    event.preventDefault();
    event.stopPropagation();
    openTopicsScreen();
    return;
  }
  if(event.target.closest('[data-topic-action],.topicActions,.customTopicActions,.topicAction,.topicsScreenCardActions')) return;
  var card=event.target.closest('.topicsScreenCard[data-topic-start],.premiumTopicCard[data-topic-start],.topicMain[data-start],.topicCard[data-start]');
  if(card){
    var start=topicStartFrom(card);
    if(start!==null){
      event.preventDefault();
      event.stopPropagation();
      openTopic(start);
    }
  }
},true);

// Keyboard accessibility and a guaranteed direct handler after every re-render.
function bindDirectTopicHandlers(){
  document.querySelectorAll('.topicsScreenCard[data-topic-start],.premiumTopicCard[data-topic-start],.topicMain[data-start],.topicCard[data-start]').forEach(function(el){
    el.setAttribute('tabindex', el.getAttribute('tabindex') || '0');
    el.onkeydown=function(e){
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openTopic(topicStartFrom(el)); }
    };
  });
}
var observer=new MutationObserver(bindDirectTopicHandlers);
function init(){
  bindDirectTopicHandlers();
  observer.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
window.NadaTopicsV283={openTopic:openTopic,openTopicsScreen:openTopicsScreen,activateScreen:activateScreen};
})();
