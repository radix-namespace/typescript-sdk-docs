(() => {
  // ===== Theme =====
  const getPreferred = () => localStorage.getItem('rns-docs-theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const applyTheme = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('rns-docs-theme', t);
    document.getElementById('icon-sun').style.display = t === 'dark' ? 'none' : 'block';
    document.getElementById('icon-moon').style.display = t === 'dark' ? 'block' : 'none';
  };

  applyTheme(getPreferred());

  document.getElementById('theme-toggle').addEventListener('click', () => {
    applyTheme(getPreferred() === 'dark' ? 'light' : 'dark');
  });

  // ===== Mobile sidebar =====
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const menuBtn = document.getElementById('mobile-menu-btn');

  const openSidebar = () => { sidebar.classList.add('open'); overlay.classList.add('visible'); };
  const closeSidebar = () => { sidebar.classList.remove('open'); overlay.classList.remove('visible'); };

  menuBtn.addEventListener('click', () => sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
  overlay.addEventListener('click', closeSidebar);

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => { if (window.innerWidth <= 768) closeSidebar(); });
  });

  // ===== Sidebar categories =====
  document.querySelectorAll('.sidebar-category-title').forEach(btn => {
    btn.addEventListener('click', () => btn.parentElement.classList.toggle('open'));
  });

  // ===== Active link tracking =====
  const methodCards = document.querySelectorAll('.method-card[id]');
  const sidebarLinks = document.querySelectorAll('.sidebar-link[href^="#"]');
  const linkMap = {};
  sidebarLinks.forEach(l => { linkMap[l.getAttribute('href').slice(1)] = l; });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        sidebarLinks.forEach(l => l.classList.remove('active'));
        const link = linkMap[e.target.id];
        if (link) {
          link.classList.add('active');
          link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });

  methodCards.forEach(card => observer.observe(card));

  // Also observe sections
  document.querySelectorAll('.section[id]').forEach(s => observer.observe(s));

  // ===== Search =====
  const searchInput = document.getElementById('sidebar-search');
  const noResults = document.getElementById('no-results');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    let anyVisible = false;

    document.querySelectorAll('.sidebar-category').forEach(cat => {
      let catVisible = false;
      cat.querySelectorAll('.sidebar-link').forEach(link => {
        const text = link.textContent.toLowerCase();
        const show = !q || text.includes(q);
        link.style.display = show ? '' : 'none';
        if (show) catVisible = true;
      });
      cat.style.display = catVisible ? '' : 'none';
      if (q && catVisible) cat.classList.add('open');
      if (catVisible) anyVisible = true;
    });

    // Also filter method cards in main content
    document.querySelectorAll('.method-card').forEach(card => {
      const text = (card.getAttribute('data-search') || '').toLowerCase();
      card.style.display = (!q || text.includes(q)) ? '' : 'none';
    });

    if (noResults) noResults.style.display = anyVisible ? 'none' : 'block';
  });

  // ===== Copy buttons =====
  document.querySelectorAll('.code-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('.code-block').querySelector('pre');
      const text = pre.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      });
    });
  });

  // ===== Response tabs =====
  document.querySelectorAll('.response-tabs').forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('.response-tab');
    const panels = tabGroup.parentElement.querySelectorAll('.response-panel');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const target = tabGroup.parentElement.querySelector(`#${tab.dataset.target}`);
        if (target) target.classList.add('active');
      });
    });
  });

  // ===== Type blocks expand/collapse =====
  document.querySelectorAll('.type-block-header').forEach(h => {
    h.addEventListener('click', () => h.parentElement.classList.toggle('open'));
  });

  // ===== Back to top =====
  const backBtn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    backBtn.classList.toggle('visible', window.scrollY > 400);
  });
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Open the first category by default
  const firstCat = document.querySelector('.sidebar-category');
  if (firstCat) firstCat.classList.add('open');

  // Open category matching hash on load
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      const section = target.closest('.section');
      if (section) {
        const id = section.id;
        document.querySelectorAll('.sidebar-category').forEach(cat => {
          const links = cat.querySelectorAll(`.sidebar-link[href^="#"]`);
          links.forEach(l => {
            if (l.getAttribute('href').slice(1) === id || document.getElementById(l.getAttribute('href').slice(1))?.closest('.section')?.id === id) {
              cat.classList.add('open');
            }
          });
        });
      }
    }
  }
})();
