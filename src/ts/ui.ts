import * as tome from 'chromotome'
import { state } from './store'
import { randomGenerator } from './utils/helpers'
import { draw } from './canvas'
import '@melloware/coloris/dist/coloris.css'
import * as Coloris from '@melloware/coloris'

// http://localhost:1234/#palette=f83838,f83838,f83838,f83838,f83838,f83838,f83838,f83838,f83838,f83838,f83838,f83838,f83838,f83838,fff1f1,fff1f1,fff1f1,fff1f1,fff1f1,fff1f1,fff1f1,fff1f1,fff1f1,fff1f1,fff1f1,fff1f1,fff1f1,fff1f1,00a6e8,00a6e8,00a6e8,fffdb5,fffdb5,fffdb5,fffdb5,fffdb5

const data = Object.fromEntries(window.location.hash.replace('#', '').split('&').map(q => q.split('=')).filter(([a, b]) => a !== ''))

const random = randomGenerator(state.seed)

const colorSelectorWrapper = document.getElementById('colorselect')
const spoolsWrapper = document.getElementById('spools')

const allPalettes = tome.getAll()
const p = allPalettes[Math.floor(random() * allPalettes.length)]

console.log(data.palette)

const colors = {
  palette: data.palette ? data.palette.split(',').map(c => '#' + c) : [...new Set([p.background, ...p.colors, p.stroke].filter(c => typeof c === 'string'))],
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
function createSpoolButton (i, line, distFromCenter, color) {
  const spool = document.createElement('button')
  spool.classList.add('spool')
  spool.setAttribute('data-color', color)
  spool.setAttribute('data-spoolname', line + i.toString())
  spool.style.backgroundColor = color
  spool.style.borderColor = color
  spool.style.top = -Math.cos(Math.PI * 2 / state.wiresCount * i) * distFromCenter * 50 + 50 + '%'
  spool.style.left = Math.sin(Math.PI * 2 / state.wiresCount * i) * distFromCenter * 50 + 50 + '%'
  spoolsWrapper.append(spool)

  spool.addEventListener('click', () => {
    spool.setAttribute('data-color', colors.current)
    spool.style.backgroundColor = colors.current
    spool.style.borderColor = colors.current
    updateColors()
    setURL()
  })
}

function createSpoolsLinks () {
  const size = 500
  const linksCanvas = document.createElement('canvas')
  const ctx = linksCanvas.getContext('2d')
  linksCanvas.width = size
  linksCanvas.height = size

  ctx.strokeStyle = '#777777'
  ctx.setLineDash([])
  ctx.beginPath()
  for (let i = 0; i < state.wiresCount; i++) {
    const radius = size / 2 * (i % 2 === 0 ? 0.7 : 1)
    const pos = {
      x: Math.sin(Math.PI * 2 / state.wiresCount * i) * radius + size / 2,
      y: -Math.cos(Math.PI * 2 / state.wiresCount * i) * radius + size / 2
    }
    if (i === 0) { ctx.moveTo(pos.x, pos.y) } else { ctx.lineTo(pos.x, pos.y) }
  }
  ctx.closePath()
  ctx.stroke()

  ctx.setLineDash([5, 5])
  ctx.beginPath()
  for (let i = 0; i < state.wiresCount; i++) {
    const radius = size / 2 * (i % 2 !== 0 ? 0.7 : 1)
    const pos = {
      x: Math.sin(Math.PI * 2 / state.wiresCount * i) * radius + size / 2,
      y: -Math.cos(Math.PI * 2 / state.wiresCount * i) * radius + size / 2
    }
    if (i === 0) { ctx.moveTo(pos.x, pos.y) } else { ctx.lineTo(pos.x, pos.y) }
  }
  ctx.closePath()
  ctx.stroke()

  spoolsWrapper.style.backgroundImage = `url(${linksCanvas.toDataURL()})`
}

function setURL () {
  window.location.hash = [
    'palette=' + colors.palette.map(c => c.replace('#', '')).join(','),
    'spools=' + Array.from(spoolsWrapper.querySelectorAll('.spool'))
      .map(spoolEl => spoolEl.getAttribute('data-color').replace('#', ''))
      .join(',')
  ].join('&')
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
  setURL()
}

function euclidFromPalette () {
  function euclid (steps, pulses, rotation) {
    const storedRhythm = []
    let bucket = 0

    for (let i = 0; i < steps; i++) {
      bucket += pulses
      storedRhythm.push(bucket >= steps)
      if (bucket >= steps) bucket -= steps
    }

    return new Array(steps).fill(false).map((step, i) => storedRhythm[Math.abs((i + steps - (rotation + 1)) % steps)])
  }

  const colorA = colors.palette[Math.floor(random() * colors.palette.length)]
  const colorB = colors.palette[Math.floor(random() * colors.palette.length)]

  const colorC = colors.palette[Math.floor(random() * colors.palette.length)]
  const colorD = colors.palette[Math.floor(random() * colors.palette.length)]

  const values = [
    euclid(state.wiresCount, Math.round(random() * state.wiresCount), Math.round(random() * state.wiresCount)).map(v => v ? colorA : colorB),
    euclid(state.wiresCount, Math.round(random() * state.wiresCount), Math.round(random() * state.wiresCount)).map(v => v ? colorC : colorD)
  ]

  Array.from(spoolsWrapper.children).forEach((spool: HTMLButtonElement) => {
    const name = spool.getAttribute('data-spoolname')
    let color
    if (name[0] === 'A') {
      color = values[0].pop()
    } else {
      color = values[1].pop()
    }
    spool.setAttribute('data-color', color)
    spool.style.backgroundColor = color
    spool.style.borderColor = color
  })

  updateColors()
  setURL()
}

function linesFromPalette () {
  const colorA = colors.palette[Math.floor(random() * colors.palette.length)]
  const colorB = colors.palette[Math.floor(random() * colors.palette.length)]

  Array.from(spoolsWrapper.children).forEach((spool: HTMLButtonElement) => {
    const name = spool.getAttribute('data-spoolname')
    let color
    if (name[0] === 'A') {
      color = colorA
    } else {
      color = colorB
    }
    spool.setAttribute('data-color', color)
    spool.style.backgroundColor = color
    spool.style.borderColor = color
  })

  updateColors()
  setURL()
}

export default function initUI () {
  closeAllPopups()
  updateColorSelectors()
  document.querySelectorAll('.color-selector-button').forEach(e => e.classList.toggle('current', e.getAttribute('data-color') === colors.current))

  if (data.spools) {
    for (let i = 0; i < state.wiresCount; i++) {
      createSpoolButton(i, 'A', i % 2 === 0 ? 1 : 0.7, '#' + data.spools.split(',')[2 * i])
      createSpoolButton(i, 'B', i % 2 === 0 ? 0.7 : 1, '#' + data.spools.split(',')[2 * i + 1])
    }
  } else {
    for (let i = 0; i < state.wiresCount; i++) {
      createSpoolButton(i, 'A', i % 2 === 0 ? 1 : 0.7, colors.current)
      createSpoolButton(i, 'B', i % 2 === 0 ? 0.7 : 1, colors.current)
    }
  }

  createSpoolsLinks()

  popupsWrapper.addEventListener('click', e => {
    if (e.target === popupsWrapper) closeAllPopups()
  })

  Coloris.init()

  document.getElementById('open-palette-popup').addEventListener('click', () => { openPalettePopup() })
  document.getElementById('randomize').addEventListener('click', () => { randomizeFromPalette() })
  document.getElementById('euclid').addEventListener('click', () => { euclidFromPalette() })
  document.getElementById('lines').addEventListener('click', () => { linesFromPalette() })

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
