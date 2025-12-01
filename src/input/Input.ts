export interface InputState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  bark: boolean
}

const KEY_MAP: Record<string, keyof InputState | undefined> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  Space: 'bark'
}

const DEFAULT_STATE: InputState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  bark: false
}

/** Simple keyboard controller for WASD/arrow keys plus a bark action. */
export class InputController {
  private readonly state: InputState = { ...DEFAULT_STATE }
  private readonly pressedKeys = new Set<string>()

  constructor(private readonly target: Window = window) {
    this.target.addEventListener('keydown', this.handleKeyDown)
    this.target.addEventListener('keyup', this.handleKeyUp)
    this.target.addEventListener('blur', this.reset)
  }

  dispose(): void {
    this.reset()
    this.target.removeEventListener('keydown', this.handleKeyDown)
    this.target.removeEventListener('keyup', this.handleKeyUp)
    this.target.removeEventListener('blur', this.reset)
  }

  getState(): InputState {
    return { ...this.state }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const action = KEY_MAP[event.code]
    if (!action) {
      return
    }
    this.pressedKeys.add(event.code)
    this.state[action] = true
    if (action === 'bark') {
      event.preventDefault()
    }
  }

  private handleKeyUp = (event: KeyboardEvent): void => {
    const action = KEY_MAP[event.code]
    if (!action) {
      return
    }
    this.pressedKeys.delete(event.code)
    this.state[action] = false
  }

  private reset = (): void => {
    this.pressedKeys.clear()
    Object.assign(this.state, DEFAULT_STATE)
  }
}
