export interface StatsResponse {
  gender: {
    male: number
    female: number
  }
  age: {
    adult: number
    minor: number
  }
  combined: {
    maleAdult: number
    maleMinor: number
    femaleAdult: number
    femaleMinor: number
  }
}

export interface ChartData {
  label: string
  value: number
  color?: string
}
