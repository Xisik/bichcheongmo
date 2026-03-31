(function () {
  const wrapper = document.createElement('div');
  wrapper.id = 'yt-bg-wrapper';
  wrapper.setAttribute('aria-hidden', 'true');

  const iframe = document.createElement('iframe');
  iframe.src =
    'https://www.youtube.com/embed/dQw4w9WgXcQ' +
    '?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ' +
    '&controls=0&disablekb=1&fs=0&modestbranding=1' +
    '&iv_load_policy=3&rel=0&playsinline=1';
  iframe.setAttribute('width', '100%');
  iframe.setAttribute('height', '100%');
  iframe.allow = 'autoplay; encrypted-media';
  iframe.tabIndex = -1;
  iframe.title = '';

  wrapper.appendChild(iframe);
  document.body.prepend(wrapper);
})();
