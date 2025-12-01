import * as THREE from 'three'
import type { Scene } from 'three'
import type { SheepSettings } from '../config'
import type { MovementBounds } from '../types'
import { Sheep } from './Sheep'

interface SheepManagerConfig {
  scene: Scene
  bounds: MovementBounds
  settings: SheepSettings
}

export class SheepManager {
  private readonly sheep: Sheep[]

  constructor(config: SheepManagerConfig) {
    const { spawnPoints, boundsPadding, ...behavior } = config.settings
    this.sheep = spawnPoints.map((spawnPoint) =>
      new Sheep({
        ...behavior,
        bounds: config.bounds,
        spawnPoint,
        boundsPadding
      })
    )

    for (const sheep of this.sheep) {
      config.scene.add(sheep.mesh)
    }
  }

  update(deltaTime: number, dogPosition: THREE.Vector3): void {
    for (const sheep of this.sheep) {
      sheep.update(deltaTime, dogPosition)
    }
  }

  get totalSheep(): number {
    return this.sheep.length
  }

  getAll(): readonly Sheep[] {
    return this.sheep
  }
}
