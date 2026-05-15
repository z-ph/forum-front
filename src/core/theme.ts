import { forumUiConfig } from './config'

const DEFAULT_COLOR = forumUiConfig.themeColor

function clamp(value: number) {
  return Math.max(0, Math.min(255, value))
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3
    ? normalized
        .split('')
        .map((char) => char + char)
        .join('')
    : normalized

  const numeric = Number.parseInt(full, 16)

  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  }
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((value) => clamp(value).toString(16).padStart(2, '0'))
    .join('')}`
}

function mixColor(base: string, target: string, ratio: number) {
  const baseRgb = hexToRgb(base)
  const targetRgb = hexToRgb(target)

  return rgbToHex(
    Math.round(baseRgb.r + (targetRgb.r - baseRgb.r) * ratio),
    Math.round(baseRgb.g + (targetRgb.g - baseRgb.g) * ratio),
    Math.round(baseRgb.b + (targetRgb.b - baseRgb.b) * ratio),
  )
}

export function applyThemeColor(color = DEFAULT_COLOR) {
  const root = document.documentElement
  const value = color || DEFAULT_COLOR

  root.style.setProperty('--forum-primary', value)
  root.style.setProperty('--el-color-primary', value)
  root.style.setProperty('--el-color-primary-light-3', mixColor(value, '#ffffff', 0.3))
  root.style.setProperty('--el-color-primary-light-5', mixColor(value, '#ffffff', 0.5))
  root.style.setProperty('--el-color-primary-light-7', mixColor(value, '#ffffff', 0.7))
  root.style.setProperty('--el-color-primary-light-8', mixColor(value, '#ffffff', 0.8))
  root.style.setProperty('--el-color-primary-light-9', mixColor(value, '#ffffff', 0.9))
  root.style.setProperty('--el-color-primary-dark-2', mixColor(value, '#000000', 0.2))
}
