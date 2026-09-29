/* Startup image loading. Progress counts decoded images, not elapsed time. */
(() => {
  const loaded = new Map();
  const pendingImages = new Map();
  let running = false;
  let retry = () => location.reload();
  const el = id => document.getElementById(id);
  let words = {
    loading: 'Загружаем сад…', slow: 'Загрузка продолжается. При медленном интернете нужно немного больше времени.',
    error: 'Не удалось загрузить все картинки. Проверь подключение и попробуй ещё раз.',
    retry: 'Повторить', bootError: 'Не удалось запустить игру. Попробуй загрузить её ещё раз.',
  };

  function image(url) {
    if (loaded.has(url)) return Promise.resolve();
    if (pendingImages.has(url)) return pendingImages.get(url);
    const task = new Promise((resolve, reject) => {
      const img = new Image();
      let settled = false;
      const finish = error => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        img.onload = img.onerror = null;
        if (error) reject(error);
        else { loaded.set(url, img); resolve(); }
      };
      const timer = setTimeout(() => finish(new Error('Image timeout: ' + url)), 30000);
      img.onload = async () => {
        try {
          if (img.decode) await img.decode();
          finish();
        } catch (error) { finish(error); }
      };
      img.onerror = () => finish(new Error('Image failed: ' + url));
      img.src = url;
    });
    const tracked = task.finally(() => pendingImages.delete(url));
    pendingImages.set(url, tracked);
    return tracked;
  }

  function progress(urls) {
    const count = urls.filter(url => loaded.has(url)).length;
    const percent = Math.floor(count / urls.length * 100);
    el('loading-fill').style.width = percent + '%';
    el('loading-percent').textContent = percent + '%';
    el('loading-progress').setAttribute('aria-valuenow', String(percent));
  }

  const api = {
    has: url => loaded.has(url),
    ensure: image,
    async preload(resources) {
      for (const url of resources) {
        try { await image(url); } catch { /* A visible request can retry later. */ }
      }
    },
    async load(resources, translations) {
      words = { ...words, ...translations };
      el('loading-retry').textContent = words.retry;
      const urls = [...new Set(resources)];
      // Keep this promise pending on errors until a successful user retry.
      return new Promise(resolve => {
        const attempt = async () => {
          if (running) return;
          running = true;
          el('loading-retry').hidden = true;
          el('loading-status').textContent = words.loading;
          progress(urls);
          const slowTimer = setTimeout(() => { el('loading-status').textContent = words.slow; }, 8000);
          const pending = urls.filter(url => !loaded.has(url));
          let index = 0;
          let failed = false;
          const worker = async () => {
            while (index < pending.length) {
              const url = pending[index++];
              try { await image(url); } catch { failed = true; }
              progress(urls);
            }
          };
          await Promise.all(Array.from({ length: Math.min(4, pending.length) }, worker));
          clearTimeout(slowTimer);
          running = false;
          if (failed) {
            el('loading-status').textContent = words.error;
            el('loading-retry').hidden = false;
          } else { resolve(); }
        };
        retry = attempt;
        attempt();
      });
    },
    finish() {
      document.body.classList.remove('is-loading');
      el('loading-screen').remove();
    },
    showBootError() {
      retry = () => location.reload();
      el('loading-status').textContent = words.bootError;
      el('loading-retry').hidden = false;
    },
  };
  el('loading-retry').addEventListener('click', () => retry());
  window.GardenLoader = api;
})();
