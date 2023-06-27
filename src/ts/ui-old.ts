import * as tome from 'chromotome'
import { randomGenerator } from './utils/helpers'
import { state } from './store'
import { draw } from './canvas'

// SET USER INTERFACE

const uiWrapper = document.getElementById('ui')

const colorSelectors = [
  new Array(state.wiresCount).fill(null).map((_, i) => {
    const colorInput = document.createElement('input')
    colorInput.setAttribute('type', 'color')
    colorInput.name = `color-A${i}`

    const pos = {
      x: Math.sin(2 * Math.PI / state.wiresCount * i),
      y: Math.cos(2 * Math.PI / state.wiresCount * i)
    }
    colorInput.style.setProperty('--pos-x', pos.x.toString())
    colorInput.style.setProperty('--pos-y', pos.y.toString())
    colorInput.style.setProperty('--rad', i % 2 === 0 ? '0' : '1')

    uiWrapper.append(colorInput)

    colorInput.addEventListener('change', () => {
      console.log(colorInput.value)
      state.colors[0][i] = colorInput.value
      draw(state.colors)
    })

    return colorInput
  }),
  new Array(state.wiresCount).fill(null).map((_, i) => {
    const colorInput = document.createElement('input')
    colorInput.setAttribute('type', 'color')
    colorInput.name = `color-B${i}`

    const pos = {
      x: Math.sin(2 * Math.PI / state.wiresCount * i),
      y: Math.cos(2 * Math.PI / state.wiresCount * i)
    }
    colorInput.style.setProperty('--pos-x', pos.x.toString())
    colorInput.style.setProperty('--pos-y', pos.y.toString())
    colorInput.style.setProperty('--rad', i % 2 === 0 ? '1' : '0')

    uiWrapper.append(colorInput)

    colorInput.addEventListener('change', () => {
      console.log(colorInput.value)
      state.colors[1][i] = colorInput.value
      draw(state.colors)
    })

    return colorInput
  })
]

function updateSelectors () {
  colorSelectors.forEach((cs, i) => cs.forEach((selector, j) => {
    selector.value = state.colors[i][j]
  }))
}

// INIT

export default function initUI () {
  draw(generateEuclidean(null))
  updateSelectors()

  const applyFunctionButton = document.getElementById('apply-function')
  const functionSelect = document.getElementById('fill-func') as HTMLSelectElement
  const fillAllColor = document.getElementById('fill-all') as HTMLInputElement

  applyFunctionButton.addEventListener('click', () => {
    switch (functionSelect.value) {
      case 'random':
        draw(generateRandomColors(null))
        updateSelectors()
        break
      case 'euclidean':
        draw(generateEuclidean(null))
        updateSelectors()
        break
    }
  })

  fillAllColor.addEventListener('change', () => {
    draw([
      new Array(state.wiresCount).fill(fillAllColor.value),
      new Array(state.wiresCount).fill(fillAllColor.value)
    ])
    updateSelectors()
  })
}

// FUNCTIONS

function generateRandomColors (seed): [string[], string[]] {
  const random = randomGenerator(seed) // put seed here
  const allPalettes = tome.getAll()
  const p = allPalettes[Math.floor(random() * allPalettes.length)]
  const palette = [p.background, ...p.colors, p.stroke].filter(c => typeof c === 'string')

  return [
    state.colors[0].map(() => palette[Math.floor(random() * palette.length)]),
    state.colors[1].map(() => palette[Math.floor(random() * palette.length)])
  ]
}

function generateEuclidean (seed): [string[], string[]] {
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

  return [
    euclid(state.wiresCount, Math.round(random() * state.wiresCount), Math.round(random() * state.wiresCount)).map(v => v ? '#333333' : '#dddddd'),
    euclid(state.wiresCount, Math.round(random() * state.wiresCount), Math.round(random() * state.wiresCount)).map(v => v ? '#333333' : '#dddddd')
  ]
}

// fill functions
