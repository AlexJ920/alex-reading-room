// 轻量导航交互与表单预览；书籍数据仍由 Flask 处理。
const siteHeader = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
if (siteHeader && navToggle) {
  const closeMenu = () => {
    siteHeader.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', '展开导航菜单');
  };
  navToggle.addEventListener('click', () => {
    const open = siteHeader.classList.toggle('menu-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? '收起导航菜单' : '展开导航菜单');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', (event) => {
    if (!siteHeader.contains(event.target)) closeMenu();
  });
  siteHeader.querySelectorAll('nav a').forEach((link) => link.addEventListener('click', closeMenu));
  const updateHeader = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 64);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}
document.querySelectorAll('form[data-confirm]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    if (!window.confirm(form.dataset.confirm)) event.preventDefault();
  });
});
const coverInput = document.getElementById('cover');
let previewURL;
if (coverInput) {
  coverInput.addEventListener('change', () => {
    const file = coverInput.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('封面图片请小于 5 MB。');
      coverInput.value = '';
      return;
    }
    if (previewURL) URL.revokeObjectURL(previewURL);
    previewURL = URL.createObjectURL(file);
    const preview = document.getElementById('cover-preview');
    preview.src = previewURL;
    preview.hidden = false;
    document.getElementById('cover-placeholder').hidden = true;
  });
}

document.querySelectorAll('input[data-preview-target]').forEach((input) => {
  let previewURL;
  const preview = document.getElementById(input.dataset.previewTarget);
  const originalSrc = preview.src;
  const reset = input.parentElement.querySelector('input[type=checkbox]');
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('每张图片请小于 5 MB。');
      input.value = '';
      return;
    }
    if (previewURL) URL.revokeObjectURL(previewURL);
    previewURL = URL.createObjectURL(file);
    preview.src = previewURL;
    if (reset) reset.checked = false;
  });
  if (reset) reset.addEventListener('change', () => {
    if (reset.checked) {
      input.value = '';
      if (previewURL) URL.revokeObjectURL(previewURL);
      previewURL = undefined;
      preview.src = input.dataset.defaultSrc;
    } else if (!input.files.length) {
      preview.src = originalSrc;
    }
  });
});

const articleImages = document.getElementById('article-images');
if (articleImages) {
  const preview = document.getElementById('article-upload-preview');
  const removalBoxes = [...document.querySelectorAll('input[name="remove_images"]')];
  let previewURLs = [];
  const renderArticlePreview = () => {
    previewURLs.forEach((url) => URL.revokeObjectURL(url));
    previewURLs = [];
    preview.replaceChildren();
    const files = [...articleImages.files];
    const retained = removalBoxes.filter((box) => !box.checked).length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (retained + files.length > 9 || totalSize > 30 * 1024 * 1024 ||
        files.some((file) => file.size > 10 * 1024 * 1024)) {
      alert('每篇最多 9 张图片；每张不超过 10 MB，本次上传合计不超过 30 MB。静态图片每张上限为 5 MB。');
      articleImages.value = '';
      return;
    }
    files.forEach((file) => {
      const image = document.createElement('img');
      const url = URL.createObjectURL(file);
      previewURLs.push(url);
      image.src = url;
      image.alt = `待上传：${file.name}`;
      preview.append(image);
    });
  };
  articleImages.addEventListener('change', renderArticlePreview);
  removalBoxes.forEach((box) => box.addEventListener('change', renderArticlePreview));
}

const batchOrderForm = document.getElementById('batch-order-form');
if (batchOrderForm) {
  const choices = [...batchOrderForm.querySelectorAll('[data-order-choice]')];
  const orderedIds = document.getElementById('ordered-book-ids');
  const saveButton = document.getElementById('save-book-order');
  const clearButton = document.getElementById('clear-book-order');
  let selectedIds = [];
  const updateOrder = () => {
    orderedIds.value = selectedIds.join(',');
    saveButton.disabled = selectedIds.length === 0;
    choices.forEach((choice) => {
      const position = selectedIds.indexOf(choice.value);
      choice.closest('label').querySelector('[data-order-number]').textContent =
        position < 0 ? '未选' : `第 ${position + 1} 位`;
    });
  };
  choices.forEach((choice) => {
    choice.checked = false;
    choice.addEventListener('change', () => {
      selectedIds = selectedIds.filter((id) => id !== choice.value);
      if (choice.checked) selectedIds.push(choice.value);
      updateOrder();
    });
  });
  clearButton.addEventListener('click', () => {
    choices.forEach((choice) => { choice.checked = false; });
    selectedIds = [];
    updateOrder();
  });
  updateOrder();
}
