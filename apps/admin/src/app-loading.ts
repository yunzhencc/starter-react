export function unmountAppLoading() {
  const loading = document.querySelector('#__app-loading__');
  if (!loading || loading.classList.contains('hidden')) {
    return;
  }

  loading.classList.add('hidden');
  loading.addEventListener('transitionend', () => {
    loading.remove();
    document.querySelectorAll('[data-app-loading^="inject"]').forEach(element => element.remove());
  }, { once: true });
}
