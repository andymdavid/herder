import * as THREE from 'three'
import type { SheepSettings } from '../config'
import type { MovementBounds, SpawnPoint } from '../types'

export enum SheepState {
  Idle = 'Idle',
  Wander = 'Wander',
  Flee = 'Flee'
}

export interface SheepConfig extends Omit<SheepSettings, 'spawnPoints' | 'boundsPadding'> {
  bounds: MovementBounds
  spawnPoint: SpawnPoint
  boundsPadding: number
}

const SHEEP_HEIGHT = 0.5

export class Sheep {
  public readonly mesh: THREE.Group
  private state: SheepState = SheepState.Idle
  private stateTimer = 0
  private readonly velocity = new THREE.Vector3()
  private readonly desiredVelocity = new THREE.Vector3()
  private readonly wanderDirection = new THREE.Vector3(1, 0, 0)

  constructor(private readonly config: SheepConfig) {
    this.mesh = this.buildMesh()
    this.mesh.position.set(config.spawnPoint.x, SHEEP_HEIGHT / 2, config.spawnPoint.z)
    this.applyState(SheepState.Idle)
  }

  update(deltaTime: number, dogPosition: THREE.Vector3): void {
    const flatDog = new THREE.Vector3(dogPosition.x, 0, dogPosition.z)
    const flatPos = new THREE.Vector3(this.mesh.position.x, 0, this.mesh.position.z)
    const distanceToDog = flatPos.distanceTo(flatDog)

    if (distanceToDog <= this.config.fearRadius) {
      this.setState(SheepState.Flee)
    } else if (this.state === SheepState.Flee && distanceToDog > this.config.fearRadius * 1.3) {
      this.setState(SheepState.Wander)
    }

    if (this.state !== SheepState.Flee) {
      this.stateTimer -= deltaTime
      if (this.stateTimer <= 0) {
        this.setState(this.state === SheepState.Idle ? SheepState.Wander : SheepState.Idle)
      }
    }

    this.computeDesiredVelocity(flatDog)
    this.velocity.lerp(this.desiredVelocity, Math.min(1, deltaTime * 3))
    this.mesh.position.addScaledVector(this.velocity, deltaTime)
    this.mesh.position.y = SHEEP_HEIGHT / 2
    this.enforceBounds()

    if (this.velocity.lengthSq() > 0.0001) {
      this.mesh.rotation.y = Math.atan2(this.velocity.x, this.velocity.z)
    }
  }

  get position(): THREE.Vector3 {
    return this.mesh.position
  }

  private computeDesiredVelocity(flatDog: THREE.Vector3): void {
    switch (this.state) {
      case SheepState.Idle:
        this.desiredVelocity.set(0, 0, 0)
        break
      case SheepState.Wander:
        this.desiredVelocity.copy(this.wanderDirection).multiplyScalar(this.config.wanderSpeed)
        break
      case SheepState.Flee: {
        const fleeDir = this.mesh.position.clone().setY(0).sub(flatDog)
        if (fleeDir.lengthSq() === 0) {
          fleeDir.set(Math.random() - 0.5, 0, Math.random() - 0.5)
        }
        fleeDir.normalize()
        this.desiredVelocity.copy(fleeDir).multiplyScalar(this.config.fleeSpeed)
        break
      }
    }
  }

  bounceFromFence(normal: THREE.Vector3): void {
    const incident = this.velocity.lengthSq() > 0 ? this.velocity.clone() : this.wanderDirection.clone()
    if (incident.lengthSq() === 0) {
      incident.set(Math.random() - 0.5, 0, Math.random() - 0.5)
    }
    incident.normalize()
    const reflected = incident.reflect(normal).normalize()
    this.wanderDirection.copy(reflected)
    this.state = SheepState.Wander
    this.stateTimer = randomInRange(this.config.wanderDuration)
    this.desiredVelocity.copy(reflected).multiplyScalar(this.config.wanderSpeed)
    this.velocity.copy(reflected).multiplyScalar(this.config.wanderSpeed * 0.5)
  }

  private setState(next: SheepState): void {
    if (this.state === next) {
      return
    }
    this.applyState(next)
  }

  private applyState(next: SheepState): void {
    this.state = next
    switch (next) {
      case SheepState.Idle:
        this.stateTimer = randomInRange(this.config.idleDuration)
        this.desiredVelocity.set(0, 0, 0)
        break
      case SheepState.Wander: {
        this.stateTimer = randomInRange(this.config.wanderDuration)
        const angle = Math.random() * Math.PI * 2
        this.wanderDirection.set(Math.cos(angle), 0, Math.sin(angle))
        break
      }
      case SheepState.Flee:
        this.stateTimer = 0
        break
    }
  }

  private enforceBounds(): void {
    const padding = this.config.bounds.padding ?? this.config.boundsPadding
    const halfWidth = this.config.bounds.width / 2 - padding
    const halfHeight = this.config.bounds.height / 2 - padding
    this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -halfWidth, halfWidth)
    this.mesh.position.z = THREE.MathUtils.clamp(this.mesh.position.z, -halfHeight, halfHeight)
  }

  private buildMesh(): THREE.Group {
    const group = new THREE.Group()

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 0.8), bodyMaterial)
    body.position.y = 0.25
    body.castShadow = true

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.35, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x55524d })
    )
    head.position.set(0, 0.5, 0.55)

    const legGeometry = new THREE.BoxGeometry(0.15, 0.35, 0.15)
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8f8a83 })
    const offsets = [
      [-0.3, -0.25],
      [0.3, -0.25],
      [-0.3, 0.25],
      [0.3, 0.25]
    ] as const
    for (const [x, z] of offsets) {
      const leg = new THREE.Mesh(legGeometry, legMaterial)
      leg.position.set(x, 0.175, z)
      leg.castShadow = true
      group.add(leg)
    }

    head.castShadow = true
    group.add(body, head)
    group.castShadow = true
    group.receiveShadow = false
    return group
  }
}

function randomInRange([min, max]: [number, number]): number {
  return Math.random() * (max - min) + min
}
