(function () {
  if (document.getElementById('ln-mobile-bar')) return;

  var header = document.getElementById('SITE_HEADER') || document.body;

  // Coleta links do menu desktop original (#comp-mlifm6m1)
  var links = [];
  var seen = {};
  var menuRoot = document.getElementById('comp-mlifm6m1');
  if (menuRoot) {
    var anchors = menuRoot.querySelectorAll('a[href]');
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var href = a.getAttribute('href');
      var text = (a.textContent || '').replace(/\s+/g, ' ').trim();
      if (href && text && !seen[href]) {
        seen[href] = true;
        links.push({ href: href, text: text });
      }
    }
  }

  // Fallback caso o menu não esteja presente
  if (links.length === 0) {
    links = [
      { href: 'index.html', text: 'Início' },
      { href: 'inventario.html', text: 'Inventário' },
      { href: 'divorcio.html', text: 'Divórcio' },
      { href: 'guardadefilhos.html', text: 'Guarda de Filhos' },
      { href: 'planejamentopatrimonial.html', text: 'Planejamento Patrimonial' },
      { href: 'pensaoalimenticia.html', text: 'Pensão Alimentícia' },
      { href: 'agende.html', text: 'Agende sua Consulta' },
      { href: 'blog.html', text: 'Blog' }
    ];
  }

  // Adiciona link para Ferramentas Gratuitas se ainda não estiver na lista
  if (!seen['./ferramentas/'] && !seen['ferramentas/']) {
    links.push({ href: './ferramentas/', text: 'Ferramentas Gratuitas' });
  }

  var bar = document.createElement('div');
  bar.id = 'ln-mobile-bar';

  var brand = document.createElement('a');
  brand.id = 'ln-mobile-brand';
  brand.href = 'index.html';
  brand.textContent = 'Larissa Naves Advocacia';

  var btn = document.createElement('button');
  btn.id = 'ln-mobile-menu-btn';
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'ln-mobile-drawer');
  btn.innerHTML = '&#9776; Menu';

  bar.appendChild(brand);
  bar.appendChild(btn);

  var drawer = document.createElement('nav');
  drawer.id = 'ln-mobile-drawer';
  drawer.setAttribute('aria-label', 'Menu principal');

  for (var j = 0; j < links.length; j++) {
    var item = document.createElement('a');
    item.href = links[j].href;
    item.textContent = links[j].text;
    drawer.appendChild(item);
  }

  if (header === document.body) {
    document.body.insertBefore(drawer, document.body.firstChild);
    document.body.insertBefore(bar, document.body.firstChild);
  } else {
    header.insertBefore(drawer, header.firstChild);
    header.insertBefore(bar, header.firstChild);
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = drawer.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.innerHTML = open ? '&#10005; Fechar' : '&#9776; Menu';
  });

  document.addEventListener('click', function (e) {
    if (!drawer.classList.contains('is-open')) return;
    if (!drawer.contains(e.target) && !bar.contains(e.target)) {
      drawer.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '&#9776; Menu';
    }
  });
})();
