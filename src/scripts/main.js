(async function(){
  const load = async (selector, path) => {
    const el = document.querySelector(selector);
    if(!el) return;
    try{
      const res = await fetch(path);
      if(!res.ok) throw new Error('Not found');
      el.innerHTML = await res.text();
    }catch(e){
      // fallback simple content
      el.innerHTML = `<div style="padding:18px;color:#bbb">Failed to load ${path}</div>`;
      console.error(e);
    }
  };

  await Promise.all([
    load('#site-header','src/components/header.html'),
    load('#site-footer','src/components/footer.html'),
  ]);

  // Small footer year injection
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();

  // Smooth scroll for internal links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if(!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });

  // Modal: create backdrop element
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('aria-hidden','true');
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button class="close" aria-label="Close">✕</button>
      <h3 id="modal-title"></h3>
      <div class="modal-body"></div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const openModal = (title, html) => {
    const titleEl = backdrop.querySelector('#modal-title');
    const bodyEl = backdrop.querySelector('.modal-body');
    titleEl.textContent = title;
    bodyEl.innerHTML = html;
    backdrop.setAttribute('aria-hidden','false');
    // focus first focusable element
    const focusable = backdrop.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
    if(focusable) focusable.focus();
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    backdrop.setAttribute('aria-hidden','true');
    backdrop.querySelector('#modal-title').textContent = '';
    backdrop.querySelector('.modal-body').innerHTML = '';
    document.body.style.overflow = '';
  };

  backdrop.addEventListener('click', (e) => {
    if(e.target === backdrop) closeModal();
  });

  backdrop.querySelector('.close').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && backdrop.getAttribute('aria-hidden') === 'false') closeModal();
  });

  // Open modal when clicking a collapsible card
  document.querySelectorAll('.card.collapsible').forEach(card => {
    const title = card.querySelector('h3')?.textContent?.trim() || 'Details';
    const detailsHtml = card.querySelector('.card-details')?.innerHTML || card.querySelector('.card-summary')?.innerHTML || '';
    const summaryHtml = card.querySelector('.card-summary')?.innerHTML || '';
    const modalHtml = `<div class="modal-summary">${summaryHtml}</div><div style="height:12px"></div><div class="modal-details">${detailsHtml}</div>`;

    const handler = (e) => {
      if(e.target.closest('a')) return; // let links behave
      openModal(title, modalHtml);
    };

    card.addEventListener('click', handler);
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(e); }
    });
  });

  // ensure title has shimmer class (continuous shimmer handled by CSS)
  const titleEl = document.querySelector('.title');
  if(titleEl && !titleEl.classList.contains('shimmer')){
    titleEl.classList.add('shimmer');
  }

  // coffee particle handler
  const coffeeBtn = document.getElementById('coffee-btn');
  if(coffeeBtn){
    const emojis = ['☕'];
    const explode = (x,y) => {
      for(let i=0;i<18;i++){
        const el = document.createElement('div');
        el.className = 'coffee-particle';
        el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
        document.body.appendChild(el);
        // random direction and distance
        const angle = (Math.random()*Math.PI*2);
        const dist = 80 + Math.random()*140;
        const tx = Math.cos(angle)*dist;
        const ty = Math.sin(angle)*dist - (20 + Math.random()*40);
        el.style.left = (x - 10) + 'px';
        el.style.top = (y - 10) + 'px';
        // force initial layout
        requestAnimationFrame(()=>{
          el.style.opacity = '1';
          el.style.transform = `translate(${tx}px, ${ty}px) scale(${0.7 + Math.random()*0.6}) rotate(${Math.random()*60-30}deg)`;
        });
        // fade out
        setTimeout(()=>{
          el.style.opacity = '0';
          el.style.transform = `translate(${tx*1.1}px, ${ty*1.2}px) scale(0.6)`;
          setTimeout(()=>el.remove(), 900);
        }, 300 + Math.random()*700);
      }
    };

    coffeeBtn.addEventListener('click', (e)=>{
      const rect = coffeeBtn.getBoundingClientRect();
      explode(rect.left + rect.width/2, rect.top + rect.height/2);
    });
    coffeeBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); const rect = coffeeBtn.getBoundingClientRect(); explode(rect.left + rect.width/2, rect.top + rect.height/2); } });
  }

})();