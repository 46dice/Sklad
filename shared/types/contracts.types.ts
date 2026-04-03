export type ContractStatus = 'draft' | 'active'

export interface IContractTerms {
	paymentTerms: string // "Оплата в течение 30 дней"
	deliveryTerms: string // "Доставка в течение 5 рабочих дней"
	price: number
	validFrom: string // ISO date
	validUntil: string // ISO date
	currency: 'RUB' | 'USD' | 'EUR'
}

export interface IContract {
	id: string
	contractNumber: string // "2026-001"
	clientId: string
	clientName: string
	status: ContractStatus
	createdAt: string
	signedAt?: string
	expiresAt?: string
	terms: IContractTerms
	description?: string
	attachments?: string[] // URLs
}

export interface INewContractForm {
	clientId: string
	clientName: string
	contractNumber: string
	description?: string
	paymentTerms: string
	deliveryTerms: string
	price: number
	validFrom: string
	validUntil: string
	currency: 'RUB' | 'USD' | 'EUR'
}

export interface IContractFilter {
	status?: ContractStatus
	clientId?: string
	searchTerm?: string
}
