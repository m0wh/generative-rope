import * as tome from 'chromotome'
import { state } from './store'
import { randomGenerator } from './utils/helpers'
import { draw } from './canvas'
import '@melloware/coloris/dist/coloris.css'
import * as Coloris from '@melloware/coloris'

const random = randomGenerator(state.seed)

const colorSelectorWrapper = document.getElementById('colorselect')
const spoolsWrapper = document.getElementById('spools')

const allPalettes = tome.getAll()
const p = allPalettes[Math.floor(random() * allPalettes.length)]

const colors = {
  palette: [...new Set([p.background, ...p.colors, p.stroke].filter(c => typeof c === 'string'))],
  current: undefined
}
colors.current = colors.palette[Math.floor(random() * colors.palette.length)]

// Creates a color selector
function createColorSelector (color: string) {
  const selector = document.createElement('button')
  selector.classList.add('color-selector-button')
  selector.setAttribute('data-color', color)
  selector.style.backgroundColor = color
  selector.style.borderColor = color
  colorSelectorWrapper.append(selector)
  selector.addEventListener('click', () => {
    colors.current = color
    document.querySelectorAll('.color-selector-button').forEach(e => e.classList.toggle('current', e.getAttribute('data-color') === color))
  })
}

function updateColorSelectors () {
  colorSelectorWrapper.innerHTML = ''

  colors.palette.forEach(color => {
    createColorSelector(color)
  })

  document.querySelectorAll('.color-selector-button').forEach(e => e.classList.toggle('current', e.getAttribute('data-color') === colors.current))
}

// creates a spool button
function createSpoolButton (i, line, distFromCenter) {
  const spool = document.createElement('button')
  spool.classList.add('spool')
  spool.setAttribute('data-color', colors.current)
  spool.setAttribute('data-spoolname', line + i.toString())
  spool.style.backgroundColor = colors.current
  spool.style.borderColor = colors.current
  spool.style.top = -Math.cos(Math.PI * 2 / state.wiresCount * i) * distFromCenter * 50 + 50 + '%'
  spool.style.left = Math.sin(Math.PI * 2 / state.wiresCount * i) * distFromCenter * 50 + 50 + '%'
  spoolsWrapper.append(spool)

  spool.addEventListener('click', () => {
    spool.setAttribute('data-color', colors.current)
    spool.style.backgroundColor = colors.current
    spool.style.borderColor = colors.current
    updateColors()
  })
}

function updateColors () {
  draw([
    Array.from(spoolsWrapper.querySelectorAll('.spool')).filter(spoolEl => spoolEl.getAttribute('data-spoolname')[0] === 'A').map(spoolEl => spoolEl.getAttribute('data-color')),
    Array.from(spoolsWrapper.querySelectorAll('.spool')).filter(spoolEl => spoolEl.getAttribute('data-spoolname')[0] === 'B').map(spoolEl => spoolEl.getAttribute('data-color'))
  ])
}

const popupsWrapper = document.querySelector('.popups') as HTMLElement
const palettePopup = document.getElementById('palette-popup')

function closeAllPopups () {
  popupsWrapper.style.display = 'none'
  popupsWrapper.querySelectorAll('.popup').forEach((p: HTMLElement) => { p.style.display = 'none' })
}

function openPalettePopup () {
  closeAllPopups()

  const colorsEl = palettePopup.querySelector('.colors')
  const oldFields = colorsEl.querySelectorAll('.clr-field')
  oldFields.forEach(cf => cf.remove())
  colors.palette.forEach((color, i) => {
    const colorPicker = document.createElement('input')
    colorPicker.setAttribute('type', 'text')
    colorPicker.setAttribute('data-color', color)
    colorPicker.classList.add('color-field')
    colorPicker.value = color
    colorsEl.append(colorPicker)

    colorPicker.addEventListener('change', () => {
      if (colorPicker.value === '') {
        colorPicker.parentElement.remove()
        colors.palette.splice(i, 1)
        openPalettePopup()
      } else {
        colors.palette[i] = colorPicker.value
        colors.current = colorPicker.value
        colorPicker.setAttribute('data-color', colorPicker.value)
      }
      updateColorSelectors()
    })
  })

  Coloris.coloris({
    el: '.color-field',
    themeMode: 'light',
    alpha: false,
    theme: 'pill',
    wrap: true,
    clearButton: true,
    clearLabel: 'Remove',
    defaultColor: '#eeeeee',
    swatches: colors.palette
  })

  popupsWrapper.style.display = 'flex'
  palettePopup.style.display = 'block'
}

function randomizeFromPalette () {
  Array.from(spoolsWrapper.children).forEach((spool: HTMLButtonElement) => {
    const color = colors.palette[Math.floor(random() * colors.palette.length)]
    spool.setAttribute('data-color', color)
    spool.style.backgroundColor = color
    spool.style.borderColor = color
  })
  updateColors()
}

export default function initUI () {
  closeAllPopups()
  updateColorSelectors()
  document.querySelectorAll('.color-selector-button').forEach(e => e.classList.toggle('current', e.getAttribute('data-color') === colors.current))

  for (let i = 0; i < state.wiresCount; i++) {
    createSpoolButton(i, 'A', i % 2 === 0 ? 1 : 0.7)
    createSpoolButton(i, 'B', i % 2 === 0 ? 0.7 : 1)
  }

  popupsWrapper.addEventListener('click', e => {
    if (e.target === popupsWrapper) closeAllPopups()
  })

  Coloris.init()

  document.getElementById('open-palette-popup').addEventListener('click', () => { openPalettePopup() })
  document.getElementById('randomize').addEventListener('click', () => { randomizeFromPalette() })

  document.querySelectorAll('button.palette-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = '#' + ('000000' + Math.floor(random() * 0xffffff).toString(16)).slice(-6)
      colors.palette.push(color)
      colors.current = color
      openPalettePopup()
      updateColorSelectors()
      document.querySelectorAll('.color-selector-button').forEach(e => e.classList.toggle('current', e.getAttribute('data-color') === color))
    })
  })

  updateColors()
}
