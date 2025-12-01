import * as THREE from 'three'
import { Game } from './Game'

// Dev workflow: run `npm install` once, then `npm run dev` to spin up Vite's server and hot module reload loop.

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xb7dba5)
scene.fog = new THREE.Fog(scene.background.getHex(), 35, 85)

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
document.body.style.margin = '0'
document.body.appendChild(renderer.domElement)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const sunLight = new THREE.DirectionalLight(0xfff4d6, 1.2)
sunLight.position.set(15, 30, 10)
sunLight.castShadow = true
scene.add(sunLight)

const terrainSize = 30
const planeGeometry = new THREE.PlaneGeometry(terrainSize, terrainSize)
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x5eb057 })
const terrain = new THREE.Mesh(planeGeometry, planeMaterial)
terrain.rotation.x = -Math.PI / 2
terrain.receiveShadow = true
scene.add(terrain)

const grid = new THREE.GridHelper(terrainSize, terrainSize, 0xffffff, 0xffffff)
const gridMaterial = grid.material as THREE.LineBasicMaterial
gridMaterial.opacity = 0.15
gridMaterial.transparent = true
grid.position.y = 0.01
scene.add(grid)

const game = new Game({ scene })
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
