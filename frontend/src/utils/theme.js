const THEME_STORAGE_KEY = 'camptime-theme'
const DEFAULT_THEME = 'lake-stone'

const THEMES = Object.freeze({
  LAKE_STONE: 'lake-stone',
  FOREST_TRAIL: 'forest-trail',
  CAMPFIRE_DUSK: 'campfire-dusk',
  VIOLET_DEW: 'violet-dew',
  FOREST_HARMONY: 'forest-harmony',
})

const VALID_THEMES = new Set(Object.values(THEMES))

function normalizeTheme(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return VALID_THEMES.has(normalized) ? normalized : DEFAULT_THEME
}

function applyTheme(theme) {
  const resolvedTheme = normalizeTheme(theme)
  if (resolvedTheme === THEMES.LAKE_STONE) {
    document.body.removeAttribute('data-theme')
  } else {
    document.body.setAttribute('data-theme', resolvedTheme)
  }

  localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme)
  return resolvedTheme
}

function initTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  return applyTheme(storedTheme)
}

function getTheme() {
  const active = document.body.getAttribute('data-theme')
  return normalizeTheme(active || localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME)
}

function getAvailableThemes() {
  return Object.values(THEMES)
}

export {
  THEMES,
  applyTheme,
  initTheme,
  getTheme,
  getAvailableThemes,
}
