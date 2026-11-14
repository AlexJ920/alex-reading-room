(() => {
  const grid = document.querySelector('[data-public-shelf]');
  if (grid) {
    const cards = [...grid.children];
    const groups = new Map();
    cards.forEach(card => {
      const series = card.dataset.series;
      if (series) groups.set(series, [...(groups.get(series) || []), card]);
    });
    const switcher = document.querySelector('.shelf-view-switch');
    let mode = 'series';
    const render = () => {
      grid.replaceChildren();
      const displayed = new Set();
      cards.forEach(card => {
        const name = card.dataset.series;
        const members = groups.get(name) || [];
        if (mode === 'books' || members.length < 2) { grid.append(card); return; }
        if (displayed.has(name)) return;
        displayed.add(name);
        const visible = members.filter(item => item.style.display !== 'none');
        if (!visible.length) return;
        const group = document.createElement('details');
        group.className = 'series-group';
        const summary = document.createElement('summary');
        const cover = visible[0].querySelector('.book-cover img');
        if (cover) { const img = cover.cloneNode(); img.className = 'series-summary-cover'; img.alt = ''; summary.append(img); }
        const copy = document.createElement('div');
        const label = document.createElement('span'); label.className = 'eyebrow'; label.textContent = 'MY COLLECTION';
        const title = document.createElement('h3'); title.textContent = name;
        const count = document.createElement('p'); count.textContent = `已收藏 ${visible.length} 本 · 按书架顺序排列`;
        const action = document.createElement('span'); action.className = 'series-action'; action.textContent = '展开查看各卷 ↓';
        copy.append(label,title,count,action); summary.append(copy);
        const inner = document.createElement('div'); inner.className = 'book-grid series-books';
        members.forEach(item => inner.append(item));
        group.append(summary,inner); grid.append(group);
        if (document.querySelector('.search-field input')?.value.trim()) group.open = true;
      });
    };
    if ([...groups.values()].some(items => items.length > 1)) {
      switcher.hidden = false;
      switcher.addEventListener('click', event => {
        const button = event.target.closest('[data-shelf-view]'); if (!button) return;
        mode = button.dataset.shelfView;
        switcher.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        render();
      });
      window.addEventListener('shelf-filtered',render);
      render();
    }
  }
  const photos = [...document.querySelectorAll('[data-lightbox]')];
  if (!photos.length || !window.HTMLDialogElement) return;
  const dialog = document.createElement('dialog'); dialog.className = 'image-viewer'; dialog.setAttribute('aria-label','图片预览');
  dialog.innerHTML = '<div class="viewer-toolbar"><button type="button" data-prev aria-label="上一张">← 上一张</button><span data-counter></span><button type="button" data-next aria-label="下一张">下一张 →</button><button type="button" data-close autofocus>关闭 ✕</button></div><img alt=""><p class="viewer-caption"></p>';
  document.body.append(dialog);
  let current = 0; let opener;
  const show = index => {
    current = (index + photos.length) % photos.length;
    const source = photos[current]; const img = dialog.querySelector('img');
    img.src = source.href; img.alt = source.querySelector('img')?.alt || '图片';
    dialog.querySelector('[data-counter]').textContent = `${current+1} / ${photos.length}`;
    dialog.querySelector('.viewer-caption').textContent = img.alt;
    dialog.querySelector('[data-prev]').hidden = dialog.querySelector('[data-next]').hidden = photos.length < 2;
  };
  photos.forEach((link,index) => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); opener = link; show(index); dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
  }));
  dialog.querySelector('[data-close]').onclick = () => dialog.close();
  dialog.querySelector('[data-prev]').onclick = () => show(current-1);
  dialog.querySelector('[data-next]').onclick = () => show(current+1);
  dialog.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') show(current-1); if (event.key === 'ArrowRight') show(current+1); });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.documentElement.style.overflow = ''; opener?.focus(); });
})();
