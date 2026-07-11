(() => {
  'use strict';
  const STORAGE_KEY = 'nada_dashboard_v270_tab';

  function allSections(){ return [...document.querySelectorAll('#dashboard [data-dashboard-section]')]; }
  function allTabs(){ return [...document.querySelectorAll('#dashboard [data-dashboard-tab]')]; }

  function activateTab(name, persist = true){
    const allowed = new Set(['overview','learn','odoo','ai','progress']);
    const tab = allowed.has(name) ? name : 'overview';
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;
    dashboard.dataset.activeTab = tab;
    allTabs().forEach(btn => {
      const active = btn.dataset.dashboardTab === tab;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    allSections().forEach(section => {
      const show = section.dataset.dashboardSection === tab;
      section.hidden = !show;
      if (show) {
        section.classList.remove('dashboardTabEnter');
        requestAnimationFrame(() => section.classList.add('dashboardTabEnter'));
      }
    });
    if (persist) localStorage.setItem(STORAGE_KEY, tab);
  }

  function bindTabs(){
    allTabs().forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.dashboardTab)));
  }

  function smartContinue(){
    const candidates = [
      document.getElementById('homeContinueLearning'),
      document.querySelector('[data-go="learn"]'),
      document.querySelector('[data-go="myday"]')
    ].filter(Boolean);
    if (candidates[0]) candidates[0].click();
  }

  function enhanceContinue(){
    const btn = document.getElementById('dashContinue');
    if (!btn || btn.dataset.v270Bound) return;
    btn.dataset.v270Bound = '1';
    btn.addEventListener('click', (event) => {
      if (event.defaultPrevented) return;
      // Keep existing app behavior when present; only provide a fallback.
      setTimeout(() => {
        const dash = document.getElementById('dashboard');
        if (dash && dash.classList.contains('active')) smartContinue();
      }, 0);
    });
  }

  function init(){
    if (!document.getElementById('dashboard')) return;
    bindTabs();
    enhanceContinue();
    activateTab(localStorage.getItem(STORAGE_KEY) || 'overview', false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.NadaDashboardV270 = { activateTab };
})();
