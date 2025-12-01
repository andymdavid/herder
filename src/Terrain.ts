import * as THREE from 'three'

const TOP_COLOR = 0x5eb057
const EDGE_COLOR = 0x447a3c
const PLATFORM_THICKNESS = 0.8

export function createTerrain(width: number, height: number): THREE.Group {
  const group = new THREE.Group()

  const top = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({ color: TOP_COLOR, roughness: 0.9, metalness: 0 })
  )
  top.rotation.x = -Math.PI / 2
  top.receiveShadow = true
  top.position.y = 0.01

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.94, PLATFORM_THICKNESS, height * 0.94),
    new THREE.MeshStandardMaterial({ color: EDGE_COLOR, roughness: 0.8 })
  )
  base.position.y = -PLATFORM_THICKNESS / 2
  base.castShadow = true

  const gridSize = Math.max(width, height)
  const grid = new THREE.GridHelper(gridSize, gridSize, 0xffffff, 0xffffff)
  const gridMaterial = grid.material as THREE.LineBasicMaterial
  gridMaterial.opacity = 0.2
  gridMaterial.transparent = true
  grid.position.y = 0.02
  grid.scale.set(width / gridSize, 1, height / gridSize)

  group.add(base)
  group.add(top)
  group.add(grid)

  return group
}
