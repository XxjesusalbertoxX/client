export interface LogEntry {
  id: string
  user_id: number
  user_name: string
  action: string
  table: string
  description?: string
  metadata?: any
  timestamp: Date
}

export interface LogsResponse {
  data: LogEntry[]
  total: number
  page: number
  perPage: number
  lastPage?: number
}

export interface LogMetadata {
  person_id?: number
  data?: any
  old_data?: any
  new_data?: any
  deleted_person?: any
}
