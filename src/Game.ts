import type { Scene } from 'three'

export interface GameConfig {
  scene: Scene
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
  private readonly systems: GameSystem[] = []
  private elapsed = 0

  constructor(config: GameConfig) {
    this.scene = config.scene
  }

  registerSystem(system: GameSystem): void {
    this.systems.push(system)
  }

  /** Called once per frame by the render loop. */
  update(delta: number): void {
    this.elapsed += delta
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
}
