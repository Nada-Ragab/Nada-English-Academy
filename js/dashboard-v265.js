(function(){
  'use strict';
  function initCoachTabs(){
    const card=document.getElementById('dashCoachUnified');
    if(!card) return;
    const tabs=[...card.querySelectorAll('[data-coach-tab]')];
    const panes=[...card.querySelectorAll('[data-coach-pane]')];
    const activate=(name)=>{
      tabs.forEach(btn=>{
        const active=btn.dataset.coachTab===name;
        btn.classList.toggle('active',active);
        btn.setAttribute('aria-selected',String(active));
      });
      panes.forEach(pane=>{
        const active=pane.dataset.coachPane===name;
        pane.classList.toggle('active',active);
        pane.hidden=!active;
      });
      try{localStorage.setItem('nada_dashboard_coach_tab',name)}catch(e){}
    };
    tabs.forEach(btn=>btn.addEventListener('click',()=>activate(btn.dataset.coachTab)));
    let saved='today';
    try{saved=localStorage.getItem('nada_dashboard_coach_tab')||'today'}catch(e){}
    if(!tabs.some(btn=>btn.dataset.coachTab===saved)) saved='today';
    activate(saved);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initCoachTabs);
  else initCoachTabs();
})();
