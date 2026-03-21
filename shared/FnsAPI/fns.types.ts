
// Основная структура ответа от API ФНС при запросе по ИНН
// Основной тип для ответа от API

export interface DadataSuggestionResponse {
  suggestions: DadataSuggestion[]
}
// Тип для одного предложения (suggestion)
interface DadataSuggestion {
  value: string
  unrestricted_value: string
  data: IPData
}
// Основные данные ИП
interface IPData {
  citizenship: Citizenship
  fio: Fio
  source: string | null
  qc: string | null
  hid: string
  type: 'INDIVIDUAL'
  state: State
  opf: Opf
  name: Name
  inn: string
  ogrn: string
  okpo: string
  okato: string
  oktmo: string
  okogu: string
  okfs: string
  okved: string
  okveds: Okved[]
  authorities: Authorities
  documents: Documents
  licenses: null
  finance: null
  address: Address
  phones: Phones[] | null
  emails: Email[] | null
  ogrn_date: number // timestamp
  okved_type: string
  employee_count: null
}
// Гражданство
interface Citizenship {
  code: {
    numeric: number
    alpha_3: string
  }
  name: {
    full: string
    short: string
  }
}
// ФИО
interface Fio {
  surname: string
  name: string
  patronymic: string
  gender: string | null
  source: string | null
  qc: string | null
}
// Состояние (статус) ИП
interface State {
  status: 'ACTIVE' | 'LIQUIDATED' | 'BANKRUPT' | 'REORGANIZING'
  code: string | null
  actuality_date: number // timestamp
  registration_date: number // timestamp
  liquidation_date: number | null
}
// Организационно-правовая форма
interface Opf {
  type: string
  code: string
  full: string
  short: string
}
// Наименование
interface Name {
  full_with_opf: string
  short_with_opf: string
  latin: string | null
  full: string
  short: string | null
}
// Коды ОКВЭД
interface Okved {
  main: boolean
  type: string
  code: string
  name: string
}
// Органы власти
interface Authorities {
  fts_registration: Authority | null
  fts_report: Authority | null
  pf: Authority | null
  sif: Authority | null
}
// Орган власти (детально)
interface Authority {
  type: string
  code: string
  name: string
  address: string | null
}
// Документы
interface Documents {
  fts_registration: Document | null
  fts_report: Document | null
  pf_registration: Document | null
  sif_registration: Document | null
  smb: SmbDocument | null
}
// Документ (базовый)
interface Document {
  type: string
  series: string | null
  number: string | null
  issue_date: number | null // timestamp
  issue_authority: string | null
}
// Документ для малого бизнеса (расширенный)
interface SmbDocument extends Document {
  category: 'MICRO' | 'SMALL' | 'MEDIUM'
  type: string
}
// Адрес
interface Address {
  value: string
  unrestricted_value: string
  invalidity: null
  data: AddressData
}
// Детальные данные адреса
interface AddressData {
  postal_code: string
  country: string
  country_iso_code: string
  federal_district: string
  region_fias_id: string
  region_kladr_id: string
  region_iso_code: string
  region_with_type: string
  region_type: string
  region_type_full: string
  region: string
  area_fias_id: string | null
  area_kladr_id: string | null
  area_with_type: string | null
  area_type: string | null
  area_type_full: string | null
  area: string | null
  city_fias_id: string | null
  city_kladr_id: string | null
  city_with_type: string | null
  city_type: string | null
  city_type_full: string | null
  city: string | null
  city_area: string | null
  city_district_fias_id: string | null
  city_district_kladr_id: string | null
  city_district_with_type: string | null
  city_district_type: string | null
  city_district_type_full: string | null
  city_district: string | null
  settlement_fias_id: string | null
  settlement_kladr_id: string | null
  settlement_with_type: string | null
  settlement_type: string | null
  settlement_type_full: string | null
  settlement: string | null
  street_fias_id: string | null
  street_kladr_id: string | null
  street_with_type: string | null
  street_type: string | null
  street_type_full: string | null
  street: string | null
  stead_fias_id: string | null
  stead_cadnum: string | null
  stead_type: string | null
  stead_type_full: string | null
  stead: string | null
  house_fias_id: string | null
  house_kladr_id: string | null
  house_cadnum: string | null
  house_flat_count: number | null
  house_type: string | null
  house_type_full: string | null
  house: string | null
  block_type: string | null
  block_type_full: string | null
  block: string | null
  entrance: string | null
  floor: string | null
  flat_fias_id: string | null
  flat_cadnum: string | null
  flat_type: string | null
  flat_type_full: string | null
  flat: string | null
  flat_area: string | null
  square_meter_price: string | null
  flat_price: string | null
  room_fias_id: string | null
  room_cadnum: string | null
  room_type: string | null
  room_type_full: string | null
  room: string | null
  postal_box: string | null
  fias_id: string
  fias_code: string
  fias_level: string
  fias_actuality_state: string
  kladr_id: string
  geoname_id: string
  capital_marker: string
  okato: string
  oktmo: string
  tax_office: string
  tax_office_legal: string
  timezone: string
  geo_lat: string
  geo_lon: string
  beltway_hit: null
  beltway_distance: null
  metro: null
  divisions: null
  qc_geo: string
  qc_complete: null
  qc_house: null
  history_values: null
  unparsed_parts: null
  source: string
  qc: string
}
// Email
interface Email {
  value: string
  unrestricted_value: string
  data: EmailData
}
interface Phones {
  value: string
  unrestricted_value: string
}
// Детальные данные email
interface EmailData {
  local: string
  domain: string
  type: string | null
  source: string
  qc: string | null
}
