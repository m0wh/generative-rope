import { state } from './store'

const [WIDTH, HEIGHT] = [state.wiresCount * 2, state.wiresCount * 2]
const pixelSize = 20

export const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
canvas.width = WIDTH * pixelSize
canvas.height = HEIGHT * pixelSize

draw(state.colors)

export function draw (colors: [string[], string[]]) {
  state.colors = colors

  ctx.translate(WIDTH * pixelSize / 2, HEIGHT * pixelSize / 2)
  ctx.rotate(Math.PI / 4)
  ctx.scale(Math.sqrt(2), Math.sqrt(2))
  ctx.translate(-WIDTH * pixelSize / 2, -HEIGHT * pixelSize / 2)

  for (let x = -WIDTH; x < 2 * WIDTH; x++) {
    ctx.fillStyle = state.colors[0][(x + state.colors[0].length) % state.colors[0].length]
    ctx.fillRect(-WIDTH * pixelSize, x * pixelSize, 3 * WIDTH * pixelSize, pixelSize)
  }

  for (let y = -WIDTH; y < 2 * WIDTH; y++) {
    ctx.fillStyle = state.colors[1][(y + state.colors[1].length) % state.colors[1].length]

    for (let i = -HEIGHT; i < HEIGHT; i += 4) {
      ctx.fillRect(y * pixelSize, (i + 1 + y) * pixelSize, pixelSize, 2 * pixelSize)
    }
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0)
}
