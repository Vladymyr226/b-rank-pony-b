export type TCustomer = {
  id?: number
  user_tg_id: number
  salon_id?: number
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
  name: string
  description: string
  address: string
  website: string
  opening_hours: Record<string, number>
  district_id?: number
  created_at?: Date
  updated_at?: Date
}

export type TService = {
  id?: number
  salon_id: number
  name: string
  description: string
  price: number
  duration: number
  created_at?: Date
  updated_at?: Date
}

export type TDistrict = {
  id?: number
  name: string
  created_at?: Date
  updated_at?: Date
}

export type TEmployee = {
  id?: number
  salon_id: number
  phone?: string
  first_name?: string
  work_hour_from?: string
  work_hour_to?: string
  created_at?: Date
  updated_at?: Date
}

export type TEmployeesServices = {
  id?: number
  employee_id: number
  service_id: number
  created_at?: Date
  updated_at?: Date
}

export type TEmployeeWithServiceName = TEmployee & { services: Array<Pick<TService, 'name'>['name']> }
