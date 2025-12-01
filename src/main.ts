import * as THREE from 'three'
import { GAME_CONFIG } from './config'
import { Game } from './Game'
import { createTerrain } from './Terrain'

// Dev workflow: run `npm install` once, then `npm run dev` to spin up Vite's server and hot module reload loop.

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xb7dba5)
scene.fog = new THREE.Fog(scene.background.getHex(), 30, 90)

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  150
)
camera.position.set(18, 20, 18) // Slightly elevated for an isometric-ish angle
camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
document.body.style.margin = '0'
document.body.appendChild(renderer.domElement)

const ambientLight = new THREE.AmbientLight(0xddeeff, 0.4)
scene.add(ambientLight)

const sunLight = new THREE.DirectionalLight(0xfff2cf, 1.8)
sunLight.position.set(40, 55, 20)
sunLight.target.position.set(0, 0, 0)
sunLight.castShadow = true
sunLight.shadow.mapSize.set(1024, 1024)
sunLight.shadow.camera.near = 5
sunLight.shadow.camera.far = 120
scene.add(sunLight)
scene.add(sunLight.target)

const config = GAME_CONFIG
const terrain = createTerrain(config.terrainSize, config.terrainSize, config.terrainHeight)
scene.add(terrain)

const game = new Game({
  scene,
  terrain,
  camera,
  settings: config
})
// Future dog, sheep, and pen systems should instantiate their Three.js objects here and call `game.registerSystem(...)`.

const clock = new THREE.Clock()

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', onWindowResize)

function renderLoop(): void {
  const delta = clock.getDelta()
  game.update(delta)
  renderer.render(scene, camera)
  requestAnimationFrame(renderLoop)
}

renderLoop()
