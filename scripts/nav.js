(function(){
  var burger = document.getElementById('navBurger');
  var shell = document.getElementById('navShell');
  var panel = document.getElementById('navMobilePanel');
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
  if (burger) {
    burger.addEventListener('click', function(){ setMenuOpen(!shell.classList.contains('open')); });
    burger.setAttribute('aria-expanded', 'false');
  }
  panel.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setMenuOpen(false); }); });
  var backdrop = document.getElementById('navBackdrop');
  if (backdrop) backdrop.addEventListener('click', function(){ setMenuOpen(false); });
  window.addEventListener('keydown', function(e){ if (e.key === 'Escape') setMenuOpen(false); });
  var mql = window.matchMedia('(min-width: 820px)');
  var onMql = function(e){ if (e.matches) setMenuOpen(false); };
  if (mql.addEventListener) mql.addEventListener('change', onMql);
  else mql.addListener(onMql);
})();
