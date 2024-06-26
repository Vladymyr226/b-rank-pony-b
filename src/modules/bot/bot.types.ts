export type TCustomer = {
  id?: number
  user_tg_id: number
  username: string
  phone_number?: string
  first_name?: string
  last_name?: string
  created_at?: Date
  updated_at?: Date
}

export type TAdmin = {
  id?: number
  user_tg_id: number
  salon_id: number
  chat_id: number
  username: string
  phone_number?: string
  first_name?: string
  last_name?: string
  enable?: boolean
  created_at?: Date
  updated_at?: Date
}

export type TSalon = {
  id?: number
  name: number
  description: string
  address: string
  website: string
  opening_hours: Record<string, number>
  created_at?: Date
  updated_at?: Date
}
