export const FNS_API_KEY = process.env.EXPO_PUBLIC_FNS_API_KEY
const url =
	'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party'

const token = FNS_API_KEY

export const fetchByINN = async (inn: string) => {
	const options = {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: 'Token ' + token
		},
		body: JSON.stringify({ query: inn })
	}

	const response = await fetch(url, options)
	const data = await response.json() as DadataSuggestionResponse
	return data
}

// Основная структура ответа от API ФНС при запросе по ИНН
// Основной тип для ответа от API
export interface DadataSuggestionResponse {
  suggestions: DadataSuggestion[];
}

// Тип для одного предложения (suggestion)
interface DadataSuggestion {
  value: string;
  unrestricted_value: string;
  data: IPData;
}

// Основные данные ИП
interface IPData {
  citizenship: Citizenship;
  fio: Fio;
  source: string | null;
  qc: string | null;
  hid: string;
  type: 'INDIVIDUAL';
  state: State;
  opf: Opf;
  name: Name;
  inn: string;
  ogrn: string;
  okpo: string;
  okato: string;
  oktmo: string;
  okogu: string;
  okfs: string;
  okved: string;
  okveds: Okved[];
  authorities: Authorities;
  documents: Documents;
  licenses: null;
  finance: null;
  address: Address;
  phones: Phones[] | null;
  emails: Email[] | null;
  ogrn_date: number; // timestamp
  okved_type: string;
  employee_count: null;
}

// Гражданство
interface Citizenship {
  code: {
    numeric: number;
    alpha_3: string;
  };
  name: {
    full: string;
    short: string;
  };
}

// ФИО
interface Fio {
  surname: string;
  name: string;
  patronymic: string;
  gender: string | null;
  source: string | null;
  qc: string | null;
}

// Состояние (статус) ИП
interface State {
  status: 'ACTIVE' | 'LIQUIDATED' | 'BANKRUPT' | 'REORGANIZING';
  code: string | null;
  actuality_date: number; // timestamp
  registration_date: number; // timestamp
  liquidation_date: number | null;
}

// Организационно-правовая форма
interface Opf {
  type: string;
  code: string;
  full: string;
  short: string;
}

// Наименование
interface Name {
  full_with_opf: string;
  short_with_opf: string;
  latin: string | null;
  full: string;
  short: string | null;
}

// Коды ОКВЭД
interface Okved {
  main: boolean;
  type: string;
  code: string;
  name: string;
}

// Органы власти
interface Authorities {
  fts_registration: Authority | null;
  fts_report: Authority | null;
  pf: Authority | null;
  sif: Authority | null;
}

// Орган власти (детально)
interface Authority {
  type: string;
  code: string;
  name: string;
  address: string | null;
}

// Документы
interface Documents {
  fts_registration: Document | null;
  fts_report: Document | null;
  pf_registration: Document | null;
  sif_registration: Document | null;
  smb: SmbDocument | null;
}

// Документ (базовый)
interface Document {
  type: string;
  series: string | null;
  number: string | null;
  issue_date: number | null; // timestamp
  issue_authority: string | null;
}

// Документ для малого бизнеса (расширенный)
interface SmbDocument extends Document {
  category: 'MICRO' | 'SMALL' | 'MEDIUM';
  type: string;
}

// Адрес
interface Address {
  value: string;
  unrestricted_value: string;
  invalidity: null;
  data: AddressData;
}

// Детальные данные адреса
interface AddressData {
  postal_code: string;
  country: string;
  country_iso_code: string;
  federal_district: string;
  region_fias_id: string;
  region_kladr_id: string;
  region_iso_code: string;
  region_with_type: string;
  region_type: string;
  region_type_full: string;
  region: string;
  area_fias_id: string | null;
  area_kladr_id: string | null;
  area_with_type: string | null;
  area_type: string | null;
  area_type_full: string | null;
  area: string | null;
  city_fias_id: string | null;
  city_kladr_id: string | null;
  city_with_type: string | null;
  city_type: string | null;
  city_type_full: string | null;
  city: string | null;
  city_area: string | null;
  city_district_fias_id: string | null;
  city_district_kladr_id: string | null;
  city_district_with_type: string | null;
  city_district_type: string | null;
  city_district_type_full: string | null;
  city_district: string | null;
  settlement_fias_id: string | null;
  settlement_kladr_id: string | null;
  settlement_with_type: string | null;
  settlement_type: string | null;
  settlement_type_full: string | null;
  settlement: string | null;
  street_fias_id: string | null;
  street_kladr_id: string | null;
  street_with_type: string | null;
  street_type: string | null;
  street_type_full: string | null;
  street: string | null;
  stead_fias_id: string | null;
  stead_cadnum: string | null;
  stead_type: string | null;
  stead_type_full: string | null;
  stead: string | null;
  house_fias_id: string | null;
  house_kladr_id: string | null;
  house_cadnum: string | null;
  house_flat_count: number | null;
  house_type: string | null;
  house_type_full: string | null;
  house: string | null;
  block_type: string | null;
  block_type_full: string | null;
  block: string | null;
  entrance: string | null;
  floor: string | null;
  flat_fias_id: string | null;
  flat_cadnum: string | null;
  flat_type: string | null;
  flat_type_full: string | null;
  flat: string | null;
  flat_area: string | null;
  square_meter_price: string | null;
  flat_price: string | null;
  room_fias_id: string | null;
  room_cadnum: string | null;
  room_type: string | null;
  room_type_full: string | null;
  room: string | null;
  postal_box: string | null;
  fias_id: string;
  fias_code: string;
  fias_level: string;
  fias_actuality_state: string;
  kladr_id: string;
  geoname_id: string;
  capital_marker: string;
  okato: string;
  oktmo: string;
  tax_office: string;
  tax_office_legal: string;
  timezone: string;
  geo_lat: string;
  geo_lon: string;
  beltway_hit: null;
  beltway_distance: null;
  metro: null;
  divisions: null;
  qc_geo: string;
  qc_complete: null;
  qc_house: null;
  history_values: null;
  unparsed_parts: null;
  source: string;
  qc: string;
}

// Email
interface Email {
  value: string;
  unrestricted_value: string;
  data: EmailData;
}

interface Phones {
  value: string;
  unrestricted_value: string;
}

// Детальные данные email
interface EmailData {
  local: string;
  domain: string;
  type: string | null;
  source: string;
  qc: string | null;
}
/* 
{
  "suggestions": [
    {
      "value": "ИП Сайфутдинов Артур Гафурович",
      "unrestricted_value": "ИП Сайфутдинов Артур Гафурович",
      "data": {
        "citizenship": {
          "code": {
            "numeric": 643,
            "alpha_3": "RUS"
          },
          "name": {
            "full": "Российская Федерация",
            "short": "Россия"
          }
        },
        "fio": {
          "surname": "Сайфутдинов",
          "name": "Артур",
          "patronymic": "Гафурович",
          "gender": null,
          "source": null,
          "qc": null
        },
        "source": null,
        "qc": null,
        "hid": "33aad062f0b722112cd960a5b39489402111e30c15b216969c02f631460db739",
        "type": "INDIVIDUAL",
        "state": {
          "status": "ACTIVE",
          "code": null,
          "actuality_date": 1763078400000,
          "registration_date": 1762992000000,
          "liquidation_date": null
        },
        "opf": {
          "type": "2014",
          "code": "50102",
          "full": "Индивидуальный предприниматель",
          "short": "ИП"
        },
        "name": {
          "full_with_opf": "Индивидуальный предприниматель Сайфутдинов Артур Гафурович",
          "short_with_opf": "ИП Сайфутдинов Артур Гафурович",
          "latin": null,
          "full": "Сайфутдинов Артур Гафурович",
          "short": null
        },
        "inn": "861501959600",
        "ogrn": "325861700099749",
        "okpo": "2047074975",
        "okato": "71124604000",
        "oktmo": "71824104001",
        "okogu": "4210015",
        "okfs": "16",
        "okved": "62.01",
        "okveds": [
          {
            "main": true,
            "type": "2014",
            "code": "62.01",
            "name": "Разработка компьютерного программного обеспечения"
          }
        ],
        "authorities": {
          "fts_registration": {
            "type": "FEDERAL_TAX_SERVICE",
            "code": "8617",
            "name": "Межрайонная инспекция Федеральной налоговой службы № 11 по Ханты-Мансийскому автономному округу - Югре",
            "address": ",628408, Ханты-Мансийский - Югра АО,, Сургут г,, Республики ул, д 73, корп 1,"
          },
          "fts_report": {
            "type": "FEDERAL_TAX_SERVICE",
            "code": "8606",
            "name": "Межрайонная инспекция Федеральной налоговой службы № 2 по Ханты-Мансийскому автономному округу - Югре",
            "address": null
          },
          "pf": {
            "type": "PENSION_FUND",
            "code": "086",
            "name": "Отделение Фонда пенсионного и социального страхования Российской Федерации по Ханты-Мансийскому автономному округу - Югре",
            "address": null
          },
          "sif": null
        },
        "documents": {
          "fts_registration": null,
          "fts_report": {
            "type": "FTS_REPORT",
            "series": null,
            "number": null,
            "issue_date": 1762992000000,
            "issue_authority": "8606"
          },
          "pf_registration": {
            "type": "PF_REGISTRATION",
            "series": null,
            "number": "1385633365",
            "issue_date": 1762992000000,
            "issue_authority": "086"
          },
          "sif_registration": null,
          "smb": {
            "category": "MICRO",
            "type": "SMB",
            "series": null,
            "number": null,
            "issue_date": 1765324800000,
            "issue_authority": null
          }
        },
        "licenses": null,
        "finance": null,
        "address": {
          "value": "Ханты-Мансийский Автономный округ - Югра, г Советский",
          "unrestricted_value": "628240, Ханты-Мансийский Автономный округ - Югра, Советский р-н, г Советский",
          "invalidity": null,
          "data": {
            "postal_code": "628240",
            "country": "Россия",
            "country_iso_code": "RU",
            "federal_district": "Уральский",
            "region_fias_id": "d66e5325-3a25-4d29-ba86-4ca351d9704b",
            "region_kladr_id": "8600000000000",
            "region_iso_code": "RU-KHM",
            "region_with_type": "Ханты-Мансийский Автономный округ - Югра",
            "region_type": "АО",
            "region_type_full": "автономный округ",
            "region": "Ханты-Мансийский Автономный округ - Югра",
            "area_fias_id": "8c62b962-58d5-42b2-a29c-710706b01bb3",
            "area_kladr_id": "8600800000000",
            "area_with_type": "Советский р-н",
            "area_type": "р-н",
            "area_type_full": "район",
            "area": "Советский",
            "city_fias_id": "b2487322-b3b1-48fc-a462-cf06c36fac91",
            "city_kladr_id": "8600800100000",
            "city_with_type": "г Советский",
            "city_type": "г",
            "city_type_full": "город",
            "city": "Советский",
            "city_area": null,
            "city_district_fias_id": null,
            "city_district_kladr_id": null,
            "city_district_with_type": null,
            "city_district_type": null,
            "city_district_type_full": null,
            "city_district": null,
            "settlement_fias_id": null,
            "settlement_kladr_id": null,
            "settlement_with_type": null,
            "settlement_type": null,
            "settlement_type_full": null,
            "settlement": null,
            "street_fias_id": null,
            "street_kladr_id": null,
            "street_with_type": null,
            "street_type": null,
            "street_type_full": null,
            "street": null,
            "stead_fias_id": null,
            "stead_cadnum": null,
            "stead_type": null,
            "stead_type_full": null,
            "stead": null,
            "house_fias_id": null,
            "house_kladr_id": null,
            "house_cadnum": null,
            "house_flat_count": null,
            "house_type": null,
            "house_type_full": null,
            "house": null,
            "block_type": null,
            "block_type_full": null,
            "block": null,
            "entrance": null,
            "floor": null,
            "flat_fias_id": null,
            "flat_cadnum": null,
            "flat_type": null,
            "flat_type_full": null,
            "flat": null,
            "flat_area": null,
            "square_meter_price": null,
            "flat_price": null,
            "room_fias_id": null,
            "room_cadnum": null,
            "room_type": null,
            "room_type_full": null,
            "room": null,
            "postal_box": null,
            "fias_id": "b2487322-b3b1-48fc-a462-cf06c36fac91",
            "fias_code": "86008001000000000000000",
            "fias_level": "4",
            "fias_actuality_state": "0",
            "kladr_id": "8600800100000",
            "geoname_id": "1491230",
            "capital_marker": "1",
            "okato": "71124604000",
            "oktmo": "71824104001",
            "tax_office": "8622",
            "tax_office_legal": "8622",
            "timezone": "UTC+5",
            "geo_lat": "61.3707009",
            "geo_lon": "63.5667177",
            "beltway_hit": null,
            "beltway_distance": null,
            "metro": null,
            "divisions": null,
            "qc_geo": "4",
            "qc_complete": null,
            "qc_house": null,
            "history_values": null,
            "unparsed_parts": null,
            "source": "Тюменская область, Советский район, г. Советский",
            "qc": "0"
          }
        },
        "phones": null,
        "emails": [
          {
            "value": "ARTURSA212@GMAIL.COM",
            "unrestricted_value": "ARTURSA212@GMAIL.COM",
            "data": {
              "local": "ARTURSA212",
              "domain": "GMAIL.COM",
              "type": null,
              "source": "ARTURSA212@GMAIL.COM",
              "qc": null
            }
          }
        ],
        "ogrn_date": 1762992000000,
        "okved_type": "2014",
        "employee_count": null
      }
    }
  ]
}
*/
