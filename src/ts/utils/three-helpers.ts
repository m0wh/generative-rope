import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import raf from './raf'

export function init () {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / 2 / window.innerHeight, 0.1, 100)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  const controls = new OrbitControls(camera, renderer.domElement)

  renderer.setSize(window.innerWidth / 2, window.innerHeight)
  document.getElementById('view').appendChild(renderer.domElement)

  controls.enableDamping = true

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / 2 / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth / 2, window.innerHeight)
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
