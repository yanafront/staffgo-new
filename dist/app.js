const menu=document.querySelector('.menu-toggle');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');document.querySelector('nav').classList.toggle('open',open)});document.querySelectorAll('nav details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)document.querySelectorAll('nav details').forEach(o=>{if(o!==d)o.open=false})}));document.addEventListener('click',e=>{if(!e.target.closest('nav details'))document.querySelectorAll('nav details').forEach(d=>d.open=false);if(e.target.closest('nav a')){document.querySelector('nav').classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню')}});document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('nav details').forEach(d=>d.open=false);document.querySelector('nav').classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню')}});
const audiences={
'vacancies-customer':['','Размещайте вакансии и получайте отклики прямо на платформе или передавайте подбор команде StaffGo.'],
'vacancies-worker':['','Регистрируйтесь на платформе, заполняйте анкету и получайте доступ ко всем подходящим вакансиям.'],
'complex-customer':['','Вы выбираете исполнителя и принимаете работу. Платформа формирует документы и проводит выплату по согласованным условиям.'],
'complex-worker':['','Находите заказчиков, договаривайтесь о задаче и выполняйте её. Документы и выплата после подтверждения результата — в одном кабинете.']};document.querySelectorAll('.service-experience').forEach(group=>{const tabs=[...group.querySelectorAll('[data-audience]')],panel=group.querySelector('[role=tabpanel]');function setTab(tab){tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1});const content=audiences[tab.dataset.audience];panel.setAttribute('aria-labelledby',tab.id);let heading=panel.querySelector('h5');if(content[0]){if(!heading){heading=document.createElement('h5');panel.prepend(heading)}heading.textContent=content[0]}else if(heading){heading.remove()}panel.querySelector('p').textContent=content[1]}tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>setTab(tab));tab.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=tabs[event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+1)%tabs.length];setTab(next);next.focus()}})})});
/* Progressive, reduced-motion-aware reveal effects. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = [
    '.hero-copy', '.intro-strip', '.section-heading', '.format', '.jobs-copy',
    '.steps-list > div', '.business-grid article', '.service-intro', '.service-modes article',
    '.faq', '.footer-main > *', '.footer-bottom > *'
  ];
  const elements = [...document.querySelectorAll(revealTargets.join(','))];
  const header = document.querySelector('.header');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
  } else {
    document.documentElement.classList.add('motion-ready');
    elements.forEach((element, index) => {
      element.classList.add('motion-item');
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
    });
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          activeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px' });
    elements.forEach((element) => observer.observe(element));
  }

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();

/* Animate native disclosure elements without changing their semantics. */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const enableDetailsAnimation = (selector) => {
    document.querySelectorAll(selector).forEach((details) => {
      const summary = details.querySelector(':scope > summary');
      if (!summary) return;
      let animation;

      const finish = (open) => {
        details.open = open;
        details.classList.remove('is-closing');
        details.style.height = '';
        animation = undefined;
      };

      summary.addEventListener('click', (event) => {
        event.preventDefault();
        if (animation) animation.cancel();

        const startHeight = details.offsetHeight;
        if (details.open) {
          details.classList.add('is-closing');
          animation = details.animate(
            { height: [`${startHeight}px`, `${summary.offsetHeight}px`] },
            { duration: 210, easing: 'cubic-bezier(.4,0,.2,1)' }
          );
          animation.onfinish = () => finish(false);
          return;
        }

        details.open = true;
        const endHeight = details.scrollHeight;
        details.style.height = `${startHeight}px`;
        animation = details.animate(
          { height: [`${startHeight}px`, `${endHeight}px`] },
          { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
        animation.onfinish = () => finish(true);
      });
    });
  };

  enableDetailsAnimation('.faq-list details');
  enableDetailsAnimation('.header nav details');
})();
