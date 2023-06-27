import { init } from './utils/three-helpers'
import raf from './utils/raf'
import fx from './utils/effects'
import { CylinderGeometry, Mesh, CanvasTexture, MeshBasicMaterial, RepeatWrapping, Color } from 'three'
import { state } from './store'

export default function createView (canvas) {
  const { camera, renderer, scene } = init()
  const { composer } = fx({ renderer, scene, camera })

  camera.position.z = 4
  camera.position.x = 0
  camera.position.y = 0

  const ropeLength = 10

  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.wrapT = RepeatWrapping
  texture.repeat.setY(ropeLength / (0.2 * Math.PI))

  const geo = new CylinderGeometry(0.1, 0.1, ropeLength, 14)
  const capMat = new MeshBasicMaterial({ color: state.colors[0][0] })
  const sideMat = new MeshBasicMaterial({ map: texture })
  const rope = new Mesh(geo, [sideMat, capMat, capMat])
  rope.rotateZ(Math.PI / 4)
  scene.add(rope)

  scene.background = new Color(0xeeeeee)

  raf.subscribe((time) => {
    capMat.color = new Color(state.colors[0][0])
    texture.needsUpdate = true
    composer.render()
  })
}
