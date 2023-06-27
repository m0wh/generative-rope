import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import raf from './raf'

let w, h
if (window.innerWidth > window.innerHeight) {
  w = window.innerWidth / 2
  h = window.innerHeight
} else {
  w = window.innerWidth
  h = window.innerHeight / 2
}

export function init () {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  const controls = new OrbitControls(camera, renderer.domElement)

  renderer.setSize(w, h)
  document.getElementById('view').appendChild(renderer.domElement)

  controls.enableDamping = true

  window.addEventListener('resize', () => {
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })

  raf.subscribe(() => {
    controls.update()
  })

  return {
    scene,
    camera,
    renderer
  }
}
