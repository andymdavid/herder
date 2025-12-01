import * as THREE from 'three'
import type { InputState } from '../input/Input'
import type { MovementBounds } from '../types'

export interface DogConfig {
  moveSpeed: number
  acceleration: number
}

const DEFAULT_HEIGHT = 0.6

/** Simple voxel-inspired placeholder the player will control. */
export class Dog {
  public readonly mesh: THREE.Group
  public moveSpeed: number
  public acceleration: number

  private bounds?: MovementBounds
  private readonly velocity = new THREE.Vector3()
  private readonly workVector = new THREE.Vector3()

  constructor(config: DogConfig) {
    this.moveSpeed = config.moveSpeed
    this.acceleration = config.acceleration

    this.mesh = this.buildMesh()
    this.mesh.position.y = DEFAULT_HEIGHT / 2
  }

  update(deltaTime: number, input: InputState): void {
    const x = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    const z = (input.backward ? 1 : 0) - (input.forward ? 1 : 0)
    this.workVector.set(x, 0, z)

    if (this.workVector.lengthSq() > 0) {
      this.workVector.normalize()
    }

    const targetVelocity = this.workVector.multiplyScalar(this.moveSpeed)
    const lerpFactor = Math.min(1, this.acceleration * deltaTime)
    this.velocity.lerp(targetVelocity, lerpFactor)

    this.mesh.position.addScaledVector(this.velocity, deltaTime)
    this.applyMovementBounds()
    this.mesh.position.y = DEFAULT_HEIGHT / 2

    if (this.velocity.lengthSq() > 0.0001) {
      const heading = Math.atan2(this.velocity.x, this.velocity.z)
      this.mesh.rotation.y = heading
    }
  }

  setMovementBounds(bounds: MovementBounds): void {
    this.bounds = bounds
  }

  private buildMesh(): THREE.Group {
    const group = new THREE.Group()

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.5, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x98694f, roughness: 0.8 })
    )
    body.position.y = 0.25

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.45, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xb88865 })
    )
    head.position.set(0, 0.55, 0.55)

    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x7a4e32 })
    )
    tail.position.set(0, 0.45, -0.85)

    const earMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3822 })
    const earGeometry = new THREE.BoxGeometry(0.18, 0.18, 0.1)
    const leftEar = new THREE.Mesh(earGeometry, earMaterial)
    leftEar.position.set(-0.18, 0.75, 0.35)
    const rightEar = leftEar.clone()
    rightEar.position.x *= -1

    group.add(body, head, tail, leftEar, rightEar)
    group.castShadow = true

    return group
  }

  private applyMovementBounds(): void {
    if (!this.bounds) {
      return
    }
    const padding = this.bounds.padding ?? 0
    const halfWidth = this.bounds.width / 2 - padding
    const halfHeight = this.bounds.height / 2 - padding
    this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -halfWidth, halfWidth)
    this.mesh.position.z = THREE.MathUtils.clamp(this.mesh.position.z, -halfHeight, halfHeight)
  }
}
