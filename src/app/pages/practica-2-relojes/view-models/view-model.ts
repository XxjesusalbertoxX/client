import { Subject, interval, Subscription } from 'rxjs'

export interface ClockColors {
  analogBorder: string
  analogBackground: string
  analogNumbers: string
  analogDots: string
  analogCenter: string
  hourHand: string
  minuteHand: string
  secondHand: string
  digitalBorder: string
  digitalBackground: string
  digitalNumbers: string
  digitalShadow: string
}

export interface ClockTime {
  hours: number
  minutes: number
  seconds: number
}

export class ClockViewModel {
  private _time: ClockTime
  private _colors: ClockColors
  private _isRealTime = true // Siempre activo por defecto
  private _timeSubscription?: Subscription

  // Observable para cambios
  private _timeChanged = new Subject<ClockTime>()
  private _colorsChanged = new Subject<ClockColors>()

  public timeChanged$ = this._timeChanged.asObservable()
  public colorsChanged$ = this._colorsChanged.asObservable()

  // Para tiempo continuo sin interrupciones
  private _baseTimestamp: number
  private _initialTime: ClockTime

  constructor(initialTime?: ClockTime, initialColors?: Partial<ClockColors>) {
    this._initialTime = initialTime || {
      hours: new Date().getHours(),
      minutes: new Date().getMinutes(),
      seconds: new Date().getSeconds()
    }

    this._time = { ...this._initialTime }
    this._baseTimestamp = Date.now()

    this._colors = {
      analogBorder: '#2563eb',
      analogBackground: '#f8fafc',
      analogNumbers: '#1e293b',
      analogDots: '#64748b',
      analogCenter: '#dc2626',
      hourHand: '#1e293b',
      minuteHand: '#374151',
      secondHand: '#dc2626',
      digitalBorder: '#2563eb',
      digitalBackground: '#0f172a',
      digitalNumbers: '#00ff41',
      digitalShadow: '#00ff41',
      ...initialColors
    }

    // Iniciar inmediatamente
    this.startContinuousTime()
  }

  get time(): ClockTime {
    return { ...this._time }
  }

  get colors(): ClockColors {
    return { ...this._colors }
  }

  get isRealTime(): boolean {
    return this._isRealTime
  }

  // El tiempo NUNCA se detiene - solo se ajusta la base
  setTime(time: Partial<ClockTime>): void {
    // Actualizar tiempo base sin detener el reloj
    this._initialTime = { ...this._initialTime, ...time }
    this._baseTimestamp = Date.now() // Resetear timestamp base
    this.updateCurrentTime()
  }

  setColors(colors: Partial<ClockColors>): void {
    this._colors = { ...this._colors, ...colors }
    this._colorsChanged.next(this._colors)
  }

  // Tiempo continuo que NUNCA se detiene
  private startContinuousTime(): void {
    this._isRealTime = true
    this._timeSubscription = interval(50).subscribe(() => { // Más fluido con 50ms
      this.updateCurrentTime()
    })
  }

  private updateCurrentTime(): void {
    const elapsed = Math.floor((Date.now() - this._baseTimestamp) / 1000)
    const totalSeconds = this.timeToSeconds(this._initialTime) + elapsed

    this._time = this.secondsToTime(totalSeconds)
    this._timeChanged.next(this._time)
  }

  // Métodos para ajustar tiempo SIN detener el reloj
  addSeconds(seconds: number): void {
    this._initialTime = this.secondsToTime(this.timeToSeconds(this._initialTime) + seconds)
    this._baseTimestamp = Date.now()
    this.updateCurrentTime()
  }

  addMinutes(minutes: number): void {
    this.addSeconds(minutes * 60)
  }

  addHours(hours: number): void {
    this.addSeconds(hours * 3600)
  }

  // Control manual de tiempo real (opcional)
  startRealTime(): void {
    if (!this._isRealTime) {
      this.startContinuousTime()
    }
  }

  stopRealTime(): void {
    this._isRealTime = false
    if (this._timeSubscription) {
      this._timeSubscription.unsubscribe()
      this._timeSubscription = undefined
    }
  }

  // Utilidades
  private timeToSeconds(time: ClockTime): number {
    return time.hours * 3600 + time.minutes * 60 + time.seconds
  }

  private secondsToTime(totalSeconds: number): ClockTime {
    const normalizedSeconds = ((totalSeconds % (24 * 3600)) + (24 * 3600)) % (24 * 3600)

    return {
      hours: Math.floor(normalizedSeconds / 3600),
      minutes: Math.floor((normalizedSeconds % 3600) / 60),
      seconds: Math.floor(normalizedSeconds % 60)
    }
  }

  getAngles() {
    const now = Date.now()
    const ms = ((now - this._baseTimestamp) % 1000) / 1000 // Fracción suave

    const totalSeconds = this._time.seconds + ms
    const totalMinutes = this._time.minutes + (totalSeconds / 60)
    const totalHours = (this._time.hours % 12) + (totalMinutes / 60)

    return {
      hour: totalHours * 30,
      minute: totalMinutes * 6,
      second: totalSeconds * 6
    }
  }

  getFormattedTime(): string {
    const pad = (num: number) => Math.floor(num).toString().padStart(2, '0')
    return `${pad(this._time.hours)}:${pad(this._time.minutes)}:${pad(this._time.seconds)}`
  }

  destroy(): void {
    this.stopRealTime()
    this._timeChanged.complete()
    this._colorsChanged.complete()
  }
}
