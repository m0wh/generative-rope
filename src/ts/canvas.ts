import * as tome from 'chromotome'
import { randomGenerator } from './utils/helpers'

const wiresCount = 14

const [WIDTH, HEIGHT] = [wiresCount * 2, wiresCount * 2]
const pixelSize = 10

export const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
canvas.width = WIDTH * pixelSize
canvas.height = HEIGHT * pixelSize

// First generation is random

export const colors = [
  new Array(wiresCount).fill('#000'),
  new Array(wiresCount).fill('#000')
]

generateEuclidean(null)

function generateRandom (seed) {
  const random = randomGenerator(seed) // put seed here
  const allPalettes = tome.getAll()
  const p = allPalettes[Math.floor(random() * allPalettes.length)]
  const palette = [p.background, ...p.colors, p.stroke].filter(c => typeof c === 'string')

  colors[0] = colors[0].map(() => palette[Math.floor(random() * palette.length)])
  colors[1] = colors[1].map(() => palette[Math.floor(random() * palette.length)])

  createCanvas(colors)
}

function generateEuclidean (seed) {
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

  const random = randomGenerator(seed) // put seed here

  colors[0] = euclid(wiresCount, Math.round(random() * wiresCount), Math.round(random() * wiresCount)).map(v => v ? '#333333' : '#dddddd')
  colors[1] = euclid(wiresCount, Math.round(random() * wiresCount), Math.round(random() * wiresCount)).map(v => v ? '#333333' : '#dddddd')

  createCanvas(colors)
}

// Set UI

const uiWrapper = document.getElementById('ui')

const colorSelectors = [
  new Array(wiresCount).fill(null).map((_, i) => {
    const colorInput = document.createElement('input')
    colorInput.setAttribute('type', 'color')
    colorInput.name = `color-A${i}`
    return colorInput
  }),
  new Array(wiresCount).fill(null).map((_, i) => {
    const colorInput = document.createElement('input')
    colorInput.setAttribute('type', 'color')
    colorInput.name = `color-B${i}`
    return colorInput
  })
]

colorSelectors.forEach((cs, i) => cs.forEach((selector, j) => {
  uiWrapper.append(selector)
  const pos = {
    x: Math.sin(2 * Math.PI / wiresCount * j),
    y: Math.cos(2 * Math.PI / wiresCount * j)
  }
  selector.style.setProperty('--pos-x', pos.x.toString())
  selector.style.setProperty('--pos-y', pos.y.toString())
  selector.style.setProperty('--rad', ((i === 0 && j % 2 === 0) || (i !== 0 && j % 2 !== 0)) ? '0' : '1')
}))

const fillAllColor = document.getElementById('fill-all') as HTMLInputElement
fillAllColor.addEventListener('change', () => {
  colors[0] = new Array(wiresCount).fill(fillAllColor.value)
  colors[1] = new Array(wiresCount).fill(fillAllColor.value)
  updateSelectors()
  createCanvas(colors)
})

function updateSelectors () {
  colorSelectors.forEach((cs, i) => cs.forEach((selector, j) => {
    selector.value = colors[i][j]
  }))
}

colorSelectors.forEach((cs, i) => cs.forEach((selector, j) => {
  selector.addEventListener('change', () => {
    console.log(selector.value)
    colors[i][j] = selector.value
    createCanvas(colors)
  })
}))
updateSelectors()

// fill functions

const applyFunctionButton = document.getElementById('apply-function')
const functionSelect = document.getElementById('fill-func') as HTMLSelectElement
applyFunctionButton.addEventListener('click', () => {
  switch (functionSelect.value) {
    case 'random':
      generateRandom(null)
      updateSelectors()
      break
    case 'euclidean':
      generateEuclidean(null)
      updateSelectors()
      break
  }
})

function createCanvas (colors) {
  ctx.translate(WIDTH * pixelSize / 2, HEIGHT * pixelSize / 2)
  ctx.rotate(Math.PI / 4)
  ctx.scale(Math.sqrt(2), Math.sqrt(2))
  ctx.translate(-WIDTH * pixelSize / 2, -HEIGHT * pixelSize / 2)

  for (let x = -WIDTH; x < 2 * WIDTH; x++) {
    ctx.fillStyle = colors[0][(x + colors[0].length) % colors[0].length]
    ctx.fillRect(-WIDTH * pixelSize, x * pixelSize, 3 * WIDTH * pixelSize, pixelSize)
  }

  for (let y = -WIDTH; y < 2 * WIDTH; y++) {
    ctx.fillStyle = colors[1][(y + colors[1].length) % colors[1].length]

    for (let i = -HEIGHT; i < HEIGHT; i += 4) {
      ctx.fillRect(y * pixelSize, (i + 1 + y) * pixelSize, pixelSize, 2 * pixelSize)
    }
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0)
}
