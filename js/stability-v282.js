(()=>{
'use strict';
const $=id=>document.getElementById(id);

function showScreen(screenId){
  const target=$(screenId);
  if(!target) return false;
  document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('[data-screen]').forEach(el=>el.classList.toggle('active',el.dataset.screen===screenId));
  target.classList.add('active');
  if(screenId==='topicscreen' && typeof window.renderTopicsScreen==='function') window.renderTopicsScreen();
  window.scrollTo({top:0,left:0,behavior:'auto'});
  return true;
}

function openTopicAt(start){
  const index=Math.max(0,Number(start)||0);
  try{
    if(typeof state!=='undefined') state.i=index;
    if(typeof save==='function') save();
    if(typeof render==='function') render();
  }catch(err){ console.error('Topic open error:',err); }
  showScreen('learn');
}

// One authoritative navigation route, before legacy handlers.
document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-screen="topicscreen"]');
  if(nav){
    event.preventDefault();
    event.stopImmediatePropagation();
    showScreen('topicscreen');
    return;
  }

  const screenCard=event.target.closest('.topicsScreenCard[data-topic-start], .premiumTopicCard[data-topic-start]');
  if(screenCard && !event.target.closest('[data-topic-action]')){
    event.preventDefault();
    event.stopImmediatePropagation();
    openTopicAt(screenCard.dataset.topicStart);
    return;
  }

  const sidebarTopic=event.target.closest('.topicMain[data-start], .topicCard[data-start]');
  if(sidebarTopic && !event.target.closest('.topicActions, [data-topic-action], .topicManageAny, .topicDuplicateAny, .topicPinAny, .topicDeleteAny')){
    event.preventDefault();
    event.stopImmediatePropagation();
    openTopicAt(sidebarTopic.dataset.start);
  }
},true);

function refresh(){
  try{ if(typeof window.renderTopicsScreen==='function') window.renderTopicsScreen(); }catch(err){console.error(err);}
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',refresh,{once:true}); else refresh();
window.NadaNavigation={showScreen,openTopicAt};
})();
