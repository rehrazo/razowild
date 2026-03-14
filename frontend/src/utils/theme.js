const FIXED_THEME = 'deep-forest'

function initTheme() {
  document.body.setAttribute('data-theme', FIXED_THEME)
  return FIXED_THEME
}

export { initTheme }
