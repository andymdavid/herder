import * as THREE from 'three'
import type { PenSettings } from '../config'

const FENCE_HEIGHT = 1
const FENCE_THICKNESS = 0.15

export class Pen {
  public readonly mesh: THREE.Group
  private readonly halfWidth: number
  private readonly halfHeight: number
  private readonly position = new THREE.Vector3()

  constructor(private readonly settings: PenSettings) {
    this.mesh = new THREE.Group()
    this.halfWidth = settings.width / 2
    this.halfHeight = settings.height / 2

    this.position.set(settings.position.x, 0, settings.position.z)
    this.mesh.position.copy(this.position)
    this.mesh.add(this.buildFence())
  }

  isSheepInside(sheepPosition: THREE.Vector3): boolean {
    const localX = sheepPosition.x - this.position.x
    const localZ = sheepPosition.z - this.position.z
    return Math.abs(localX) <= this.halfWidth && Math.abs(localZ) <= this.halfHeight
  }

  private buildFence(): THREE.Group {
    const group = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({ color: 0xc8a05a, roughness: 0.7 })
    const railGeometryX = new THREE.BoxGeometry(this.settings.width, FENCE_THICKNESS, FENCE_THICKNESS)
    const railGeometryZ = new THREE.BoxGeometry(FENCE_THICKNESS, FENCE_THICKNESS, this.settings.height)

    const offsets: Array<[THREE.BoxGeometry, THREE.Vector3]> = [
      [railGeometryX, new THREE.Vector3(0, FENCE_HEIGHT / 2, this.halfHeight)],
      [railGeometryX, new THREE.Vector3(0, FENCE_HEIGHT / 2, -this.halfHeight)],
      [railGeometryZ, new THREE.Vector3(this.halfWidth, FENCE_HEIGHT / 2, 0)],
      [railGeometryZ, new THREE.Vector3(-this.halfWidth, FENCE_HEIGHT / 2, 0)]
    ]

    for (const [geometry, position] of offsets) {
      const rail = new THREE.Mesh(geometry, material)
      rail.position.copy(position)
      group.add(rail)
    }

    return group
  }
}
