  /* Mobile menu toggle */
  (function(){
    const burger = document.getElementById('navBurger');
    const shell = document.getElementById('navShell');
    const panel = document.getElementById('navMobilePanel');
    if (!shell || !panel) return;
    function setMenuOpen(isOpen){
      shell.classList.toggle('open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      if (burger) {
        burger.classList.toggle('open', isOpen);
        burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Меню');
      }
    }
    function toggleMenu(){
      setMenuOpen(!shell.classList.contains('open'));
    }
    if (burger) {
      burger.addEventListener('click', toggleMenu);
      burger.setAttribute('aria-expanded', 'false');
    }
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenuOpen(false)));
    const backdrop = document.getElementById('navBackdrop');
    if (backdrop) backdrop.addEventListener('click', () => setMenuOpen(false));
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    });
    const mqlDesktop = window.matchMedia('(min-width: 820px)');
    const onMqlChange = (e) => { if (e.matches) setMenuOpen(false); };
    if (mqlDesktop.addEventListener) mqlDesktop.addEventListener('change', onMqlChange);
    else mqlDesktop.addListener(onMqlChange);
  })();
  /* ===== Kindness counter — odometer-style rolling digits ===== */
  (function(){
    const numEl = document.getElementById('kindNumber');
    if (!numEl) return;

    // Base: fixed point in time + known hours at that moment
    const BASE_DATE = new Date('2026-05-21T12:00:00Z');
    const BASE_HOURS = 110024;
    // Rate: 1 hour per 2 real seconds → 1800 hours per real hour
    const HOURS_PER_MS = 1 / 2000;

    const computed = Math.floor(BASE_HOURS + (Date.now() - BASE_DATE.getTime()) * HOURS_PER_MS);
    const stored = parseInt(localStorage.getItem('kindHours') || '0', 10);
    let value = Math.max(computed, stored);

    function formatChars(n){
      // returns array like ["1","1","0"," ","0","2","4"]
      const s = n.toString();
      const out = [];
      for (let i=0;i<s.length;i++){
        const fromEnd = s.length - i;
        if (i > 0 && fromEnd % 3 === 0) out.push(' ');
        out.push(s[i]);
      }
      return out;
    }

    function buildDigit(initial){
      const d = document.createElement('span');
      d.className = 'kind-digit';
      const stack = document.createElement('span');
      stack.className = 'kind-digit-stack';
      const cur = document.createElement('span'); cur.className='cur'; cur.textContent = initial;
      const nxt = document.createElement('span'); nxt.className='nxt'; nxt.textContent = initial;
      stack.appendChild(cur); stack.appendChild(nxt);
      d.appendChild(stack);
      return d;
    }

    function buildSep(){
      const s = document.createElement('span');
      s.className = 'kind-sep';
      return s;
    }

    function setup(initialChars){
      numEl.innerHTML = '';
      initialChars.forEach(c => {
        if (c === ' ') numEl.appendChild(buildSep());
        else numEl.appendChild(buildDigit(c));
      });
    }

    function tickDigit(digitEl, newVal){
      const stack = digitEl.querySelector('.kind-digit-stack');
      const cur = stack.querySelector('.cur');
      const nxt = stack.querySelector('.nxt');
      if (cur.textContent === String(newVal)) return;
      nxt.textContent = newVal;
      // animate roll up
      stack.style.transition = 'transform .7s cubic-bezier(.3, 1.25, .35, 1)';
      requestAnimationFrame(() => {
        stack.style.transform = 'translateY(-1em)';
      });
      const onEnd = () => {
        stack.style.transition = 'none';
        stack.style.transform = 'translateY(0)';
        cur.textContent = newVal;
        stack.removeEventListener('transitionend', onEnd);
      };
      stack.addEventListener('transitionend', onEnd);
    }

    function render(newVal){
      const chars = formatChars(newVal);
      // If structure changed (e.g., digit count or separator count), rebuild
      if (chars.length !== numEl.children.length){
        setup(chars);
        return;
      }
      chars.forEach((c, i) => {
        if (c === ' ') return;
        tickDigit(numEl.children[i], c);
      });
    }

    // Initial mount — show value immediately, no count-up animation
    setup(formatChars(value));

    // Every 2 seconds add 1–5 hours (random each tick)
    function scheduleTick(){
      setTimeout(() => {
        value += 1 + Math.floor(Math.random() * 5);
        localStorage.setItem('kindHours', value);
        render(value);
        scheduleTick();
      }, 2000);
    }
    scheduleTick();

    // Hero video fallback placeholder — hide when loaded, show on error
    const heroV = document.querySelector('.kind-video');
    const heroPh = document.querySelector('.kind-video-ph');
    if (heroV && heroPh) {
      const hide = () => { heroPh.style.display = 'none'; };
      const show = () => { heroPh.style.display = ''; };
      if (heroV.readyState >= 2) hide();
      else heroV.addEventListener('canplay', hide, { once: true });
      heroV.addEventListener('error', show, { once: true });
    }
  })();

  /* ===== Scroll reveal + video play on enter viewport ===== */
  (function(){
    const STAGGER = 180; // ms between text and phone within a row

    // Mark all feat-row children as reveal targets
    document.querySelectorAll('.feat-row').forEach(row => {
      const text = row.querySelector('.feat-text');
      const phone = row.querySelector('.feat-phone');
      if (text) text.dataset.reveal = '';
      if (phone) {
        phone.dataset.reveal = '';
        phone.dataset.revealSide = row.classList.contains('feat-row-rev') ? 'right' : 'left';
      }
    });

    // Also reveal the hero counter and phone
    const heroCounter = document.querySelector('.kind-counter');
    const heroPhone = document.querySelector('.kind-phone');
    if (heroCounter) heroCounter.dataset.reveal = '';
    if (heroPhone) heroPhone.dataset.reveal = '';

    // Final CTA block
    const finalInner = document.querySelector('.final-inner');
    if (finalInner) finalInner.dataset.reveal = '';

    // Set initial hidden state via inline style (avoids FOUC before CSS loads)
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.style.opacity = '0';
      if (el.dataset.revealSide === 'left') {
        el.style.transform = 'translateX(-180px)';
      } else if (el.dataset.revealSide === 'right') {
        el.style.transform = 'translateX(180px)';
      } else {
        el.style.transform = 'translateY(56px)';
      }
      el.style.transition = 'opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1)';
    });

    function revealEl(el, delay) {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translate(0,0)';
      }, 80 + delay);
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);

        const row = el.closest('.feat-row');
        if (row) {
          const isText = el.classList.contains('feat-text');
          revealEl(el, isText ? 0 : STAGGER);
        } else {
          revealEl(el, 0);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

    // Safe play/pause — prevents AbortError from overlapping play/pause calls
    function safePlay(video) {
      if (video._playing) return;
      video._wantPlay = true;
      if (video._playPromise) return; // play already in flight
      video._playPromise = video.play().then(() => {
        video._playing = true;
        video._playPromise = null;
        // if pause was requested while play was in flight — honour it now
        if (!video._wantPlay) safePause(video);
      }).catch(err => {
        video._playing = false;
        video._playPromise = null;
        // retry once on NotAllowedError (autoplay policy) after user gesture
        if (err.name === 'NotAllowedError') {
          const retry = () => { video._wantPlay && safePlay(video); };
          document.addEventListener('click',      retry, { once: true });
          document.addEventListener('touchstart', retry, { once: true, passive: true });
          document.addEventListener('scroll',     retry, { once: true, passive: true });
        }
      });
    }

    function safePause(video) {
      video._wantPlay = false;
      if (video._playPromise) return; // will pause after promise resolves (see above)
      if (!video._playing) return;
      video.pause();
      video._playing = false;
    }

    // Single observer manages play/pause for every video on the page
    const videoVisibilityIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          safePlay(video);
        } else {
          safePause(video);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('video').forEach(v => {
      // reset flags
      v._wantPlay = false;
      v._playing = false;
      v._playPromise = null;
      videoVisibilityIo.observe(v);
    });
  })();
