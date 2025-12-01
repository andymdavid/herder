export class HUD {
  private readonly root: HTMLDivElement
  private readonly timerEl: HTMLDivElement
  private readonly sheepEl: HTMLDivElement
  private readonly messageEl: HTMLDivElement

  constructor() {
    this.root = document.createElement('div')
    this.root.style.position = 'fixed'
    this.root.style.top = '0'
    this.root.style.left = '0'
    this.root.style.right = '0'
    this.root.style.padding = '16px'
    this.root.style.display = 'flex'
    this.root.style.justifyContent = 'space-between'
    this.root.style.fontFamily = 'sans-serif'
    this.root.style.color = '#1b2315'
    this.root.style.fontSize = '18px'
    this.root.style.pointerEvents = 'none'
    this.root.style.textShadow = '0 1px 3px rgba(255,255,255,0.6)'

    this.timerEl = document.createElement('div')
    this.sheepEl = document.createElement('div')

    this.messageEl = document.createElement('div')
    this.messageEl.style.position = 'fixed'
    this.messageEl.style.top = '50%'
    this.messageEl.style.left = '50%'
    this.messageEl.style.transform = 'translate(-50%, -50%)'
    this.messageEl.style.background = 'rgba(255, 255, 255, 0.9)'
    this.messageEl.style.padding = '24px 32px'
    this.messageEl.style.borderRadius = '12px'
    this.messageEl.style.fontSize = '28px'
    this.messageEl.style.fontWeight = 'bold'
    this.messageEl.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)'
    this.messageEl.style.display = 'none'

    this.root.appendChild(this.timerEl)
    this.root.appendChild(this.sheepEl)
    document.body.appendChild(this.root)
    document.body.appendChild(this.messageEl)
  }

  updateTimer(seconds: number): void {
    this.timerEl.textContent = `Time: ${Math.max(0, Math.ceil(seconds)).toString()}s`
  }

  updateSheepCount(inPen: number, total: number): void {
    this.sheepEl.textContent = `Sheep: ${inPen}/${total}`
  }

  showMessage(text: string): void {
    this.messageEl.textContent = text
    this.messageEl.style.display = 'block'
  }

  hideMessage(): void {
    this.messageEl.style.display = 'none'
  }
}
