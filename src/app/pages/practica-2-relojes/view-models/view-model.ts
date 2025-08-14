// Equivalente a timeModel.js
export interface TimeModel {
  hours: number
  minutes: number
  seconds: number
}

export function createTimeModel(hours = 0, minutes = 0, seconds = 0): TimeModel {
  return {
    hours,
    minutes,
    seconds
  }
}

// Equivalente a themeModel.js
export interface ThemeModel {
  marco: string
  manecillas: string
  numeros: string
  puntos: string
  fondo: string
  fondoDigital: string
  numerosDigitales: string
}

export function createThemeModel({
  marco = '#333333',
  fondo = '#000000',
  manecillas = '#ffffff',
  numeros = '#ffffff',
  puntos = '#888888',
  fondoDigital = '#ffff00',
  numerosDigitales = '#00ff00'
} = {}): ThemeModel {
  return {
    marco,
    fondo,
    manecillas,
    numeros,
    puntos,
    fondoDigital,
    numerosDigitales
  }
}

// Interfaz para la configuración del reloj
export interface ClockConfig {
  time: TimeModel
  theme: ThemeModel
}
