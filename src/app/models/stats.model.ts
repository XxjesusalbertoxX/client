export interface StatsResponse {
  gender: {
    male: number
    female: number
  }
  age: {
    adult: number      // sin 's'
    minor: number      // sin 's'
  }
  combined: {
    maleAdult: number       // camelCase
    maleMinor: number
    femaleAdult: number
    femaleMinor: number
  }
}
