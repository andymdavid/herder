import type { Group, PerspectiveCamera, Scene } from 'three'
import * as THREE from 'three'
import type { GameSettings } from './config'
import { Dog } from './entities/Dog'
import { Pen } from './entities/Pen'
import { SheepManager } from './entities/SheepManager'
import { InputController } from './input/Input'
import type { MovementBounds } from './types'
import { HUD } from './ui/HUD'

export interface GameConfig {
  scene: Scene
  terrain: Group
  camera: PerspectiveCamera
  settings: GameSettings
}

export interface GameSystem {
  name: string
  update(delta: number): void
}

/**
 * Central coordinator for Shepherd's Path. Future dog/sheep/pen systems should
 * register themselves via `registerSystem` so they tick in the main loop.
 */
export class Game {
  private readonly scene: Scene
  private readonly terrain: Group
  private readonly camera: PerspectiveCamera
  private readonly settings: GameSettings
  private readonly input = new InputController()
  private readonly dog: Dog
  private readonly pen: Pen
  private readonly sheepManager: SheepManager
  private readonly hud: HUD
  private readonly cameraOffset = new THREE.Vector3(18, 16, 18)
  private readonly systems: GameSystem[] = []
  private levelComplete = false
  private timeExpired = false
  private remainingTime: number
  private readonly collisionNormal = new THREE.Vector3()
  private elapsed = 0

  constructor(config: GameConfig) {
    this.scene = config.scene
    this.terrain = config.terrain
    this.camera = config.camera
    this.settings = config.settings

    this.dog = new Dog(this.settings.dog)
    const terrainBounds: MovementBounds = {
      width: this.settings.terrainSize,
      height: this.settings.terrainSize,
      padding: this.settings.dog.boundPadding
    }
    this.dog.setMovementBounds(terrainBounds)
    this.scene.add(this.dog.mesh)

    this.pen = new Pen(this.settings.pen)
    this.scene.add(this.pen.mesh)

    this.sheepManager = new SheepManager({
      scene: this.scene,
      bounds: {
        width: this.settings.terrainSize,
        height: this.settings.terrainSize,
        padding: this.settings.sheep.boundsPadding
      },
      settings: this.settings.sheep
    })

    this.hud = new HUD()
    this.remainingTime = this.settings.levelTimerSeconds
    this.hud.updateTimer(this.remainingTime)
    this.hud.updateSheepCount(0, this.sheepManager.totalSheep)
  }

  registerSystem(system: GameSystem): void {
    this.systems.push(system)
  }

  /** Called once per frame by the render loop. */
  update(delta: number): void {
    this.elapsed += delta
    this.updateTimer(delta)

    if (!this.isFrozen()) {
      const dogPrevious = this.dog.mesh.position.clone()
      const inputState = this.input.getState()
      this.dog.update(delta, inputState)
      this.pen.enforceCollision(dogPrevious, this.dog.mesh.position, 0.45)

      this.sheepManager.update(delta, this.dog.mesh.position, (sheep, prev, current) => {
        if (this.pen.enforceCollision(prev, current, 0.35, this.collisionNormal)) {
          sheep.bounceFromFence(this.collisionNormal)
        }
      })
    }

    this.trackPenProgress()
    this.updateCameraFollow()
    for (const system of this.systems) {
      system.update(delta)
    }
  }

  /** Simple hook for querying time-based effects later. */
  get time(): number {
    return this.elapsed
  }

  /** Placeholder to keep linting happy until the scene needs orchestrating. */
  get activeScene(): Scene {
    return this.scene
  }

  /** Reference to the terrain for attaching pens, props, etc. */
  get ground(): Group {
    return this.terrain
  }

  get player(): Dog {
    return this.dog
  }

  private trackPenProgress(): void {
    const sheepInside = this.sheepManager
      .getAll()
      .filter((sheep) => this.pen.isSheepInside(sheep.position)).length
    this.hud.updateSheepCount(sheepInside, this.sheepManager.totalSheep)

    if (
      !this.levelComplete &&
      !this.timeExpired &&
      sheepInside === this.sheepManager.totalSheep &&
      this.sheepManager.totalSheep > 0
    ) {
      this.handleLevelComplete()
    }
  }

  private updateTimer(delta: number): void {
    if (this.levelComplete || this.timeExpired) {
      return
    }
    this.remainingTime = Math.max(0, this.remainingTime - delta)
    this.hud.updateTimer(this.remainingTime)
    if (this.remainingTime <= 0) {
      this.handleTimeExpired()
    }
  }

  private handleLevelComplete(): void {
    this.levelComplete = true
    this.input.setEnabled(false)
    this.hud.showMessage(`Level complete! ${Math.ceil(this.remainingTime)}s left`)
    console.log('Level complete')
  }

  private handleTimeExpired(): void {
    this.timeExpired = true
    this.input.setEnabled(false)
    this.hud.showMessage("Time's up!")
  }

  private isFrozen(): boolean {
    return this.levelComplete || this.timeExpired
  }

  private updateCameraFollow(): void {
    const desiredPosition = this.dog.mesh.position.clone().add(this.cameraOffset)
    this.camera.position.lerp(desiredPosition, 0.1)
    this.camera.lookAt(this.dog.mesh.position)
  }
}
