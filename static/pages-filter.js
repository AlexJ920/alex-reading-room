// GitHub Pages 公开快照的本地筛选；不会向服务器提交数据。
const filterForm = document.querySelector('.filter-bar');
const bookCards = [...document.querySelectorAll('.book-grid .book-card')];
if (filterForm && bookCards.length) {
  const search = filterForm.querySelector('input[name="q"]');
  const tabs = [...filterForm.querySelectorAll('.filter-tab')];
  const grid = document.querySelector('.book-grid');
  const result = document.createElement('p');
  result.className = 'results-label';
  result.setAttribute('role', 'status');
  grid.before(result);
  const params = new URLSearchParams(location.search);
  let category = params.get('category') || '';
  search.value = params.get('q') || '';

  const apply = () => {
    const keyword = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    bookCards.forEach((card) => {
      const title = card.querySelector('.book-info h3').textContent.toLocaleLowerCase();
      const bookCategory = card.querySelector('.category-label').textContent.trim();
      const show = (!category || category === bookCategory) && (!keyword || title.includes(keyword));
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    tabs.forEach((tab) => tab.classList.toggle('selected', tab.value === category));
    result.textContent = category || keyword ? `找到 ${visible} 本书` : '';
    const next = new URL(location.href);
    next.searchParams.delete('q');
    next.searchParams.delete('category');
    if (keyword) next.searchParams.set('q', search.value.trim());
    if (category) next.searchParams.set('category', category);
    if (location.protocol !== 'file:') history.replaceState(null, '', next);
  };

  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (event.submitter?.classList.contains('filter-tab')) category = event.submitter.value;
    apply();
  });
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      apply();
    }
  });
  apply();
}
