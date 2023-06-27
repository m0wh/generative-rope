const wiresCount = 14

export const state = {
  seed: null,
  wiresCount,
  colors: [new Array(wiresCount).fill('#000'), new Array(wiresCount).fill('#000')] as [string[], string[]]
}
