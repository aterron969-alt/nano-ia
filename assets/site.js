// Nano IA — reveals, the A/B game, the email form and the copy button. Content works without this file.
(() => {
  // ---------- reveal once ----------
  const targets = document.querySelectorAll('[data-reveal]');
  if (targets.length) {
    if (!('IntersectionObserver' in window)) targets.forEach((el) => el.classList.add('is-in'));
    else {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
      targets.forEach((el) => io.observe(el));
      addEventListener('load', () => setTimeout(() => targets.forEach((el) => {
        const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
      }), 2500));
    }
  }

  // ---------- ¿Cuál suena a IA? ----------
  const game = document.querySelector('[data-game]');
  if (game) {
    const rounds = JSON.parse(game.querySelector('script[type="application/json"]').textContent);
    const specs = [...game.querySelectorAll('.spec')];
    const out = game.querySelector('[data-why]');
    const next = game.querySelector('[data-next]');
    const score = game.querySelector('[data-score]');
    let i = 0, hits = 0, played = 0;
    const fit = (el, word) => {
      const n = word.length;
      el.style.setProperty('--w', `min(clamp(5rem, 13.5vw, 14rem), ${(62 / Math.max(n, 5)).toFixed(2)}vw)`);
      el.style.setProperty('--wm', `min(21vw, ${(124 / Math.max(n, 5)).toFixed(2)}vw)`);
    };
    const show = () => {
      const r = rounds[i];
      game.classList.remove('revealed');
      specs.forEach((s, k) => {
        const o = r.options[k];
        s.classList.remove('is-ai', 'is-human');
        s.dataset.ai = o.ai ? '1' : '0';
        s.querySelector('.cap').innerHTML = `<b>${k ? 'B' : 'A'}.</b> ${o.text}`;
        const w = s.querySelector('.word'); w.textContent = o.word; fit(s, o.word);
        s.setAttribute('aria-label', `Opción ${k ? 'B' : 'A'}: ${o.text}`);
        s.setAttribute('aria-pressed', 'false');
      });
      out.textContent = r.ask;
      next.hidden = true;
    };
    specs.forEach((s) => s.addEventListener('click', () => {
      if (game.classList.contains('revealed')) return;
      const r = rounds[i];
      const right = s.dataset.ai === '1';
      played++; if (right) hits++;
      specs.forEach((x) => x.classList.add(x.dataset.ai === '1' ? 'is-ai' : 'is-human'));
      s.setAttribute('aria-pressed', 'true');
      game.classList.add('revealed');
      out.textContent = (right ? '¡Bien visto! ' : 'Casi. ') + r.why;
      score.textContent = `${hits} de ${played} acertadas`;
      next.hidden = false;
      next.textContent = i < rounds.length - 1 ? 'Otra' : 'Quiero el kit';
    }));
    next.addEventListener('click', () => {
      if (i < rounds.length - 1) { i++; show(); game.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      else location.hash = '#kit';
    });
    show();
  }

  // ---------- email form (MailerLite) ----------
  document.querySelectorAll('form[data-capture]').forEach((form) => {
    const status = form.querySelector('.status');
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const email = form.querySelector('input[type=email]');
      const ok = form.querySelector('input[type=checkbox]');
      status.className = 'status';
      if (!email.value || !email.checkValidity()) { status.textContent = 'Revisa el email: parece que le falta algo.'; status.classList.add('err'); email.focus(); return; }
      if (!ok.checked) { status.textContent = 'Marca la casilla para que pueda enviarte el kit.'; status.classList.add('err'); ok.focus(); return; }
      const action = form.dataset.action;
      if (!action) { status.textContent = 'El formulario se está conectando. Vuelve a intentarlo en unos minutos.'; status.classList.add('err'); return; }
      const btn = form.querySelector('button'); btn.disabled = true; const label = btn.textContent; btn.textContent = 'Enviando…';
      try {
        const fd = new FormData(); fd.append('fields[email]', email.value.trim()); fd.append('ml-submit', '1'); fd.append('anticsrf', 'true');
        const res = await fetch(action, { method: 'POST', body: fd });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success !== false) { location.href = form.dataset.redirect || 'gracias.html'; return; }
        throw new Error('ml');
      } catch {
        status.textContent = 'No se ha podido enviar. Prueba otra vez en un momento.'; status.classList.add('err');
        btn.disabled = false; btn.textContent = label;
      }
    });
  });

  // ---------- copy the sample prompt ----------
  document.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const src = document.getElementById(b.dataset.copy);
    try { await navigator.clipboard.writeText(src.innerText); b.textContent = 'Copiado'; setTimeout(() => (b.textContent = 'Copiar el prompt'), 1800); }
    catch { b.textContent = 'Selecciónalo y copia'; }
  }));
})();
