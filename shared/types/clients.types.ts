export interface INewClientForm {
	name: string
	phone: string
	email: string
	actualAddress: string
	// реквизиты 
	isPhysicalPerson: boolean
	fullName: string
	legalAddress: string
	inn: string
	ogrn: string
	okpo: string
	bankAccountNumber?: string // Расчетный счет
}
