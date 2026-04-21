export interface IShipmentItem {
	serviceId: string
	serviceName: string
	quantity: number
	price: number
	totalAmount: number
}

export interface IShipment {
	id: string
	actNumber: string // АКТ № 00445
	actDate: string // дата акта
	clientId: string
	clientName: string
	clientInn: string
	clientAddress: string
	items: IShipmentItem[]
	totalAmount: number
	status: 'draft' | 'completed'
	createdAt: string
	completedAt?: string
	notes?: string
}

export interface INewShipmentForm {
	clientId: string
	clientName: string
	clientInn: string
	clientAddress: string
	items: IShipmentItem[]
	notes?: string
}

export interface IService {
	id: string
	name: string
	price: number
	description?: string
	createdAt: string
}

export interface ISupplierInfo {
	name: string
	inn: string
	address: string
	bankName: string
	bik: string
	accountNumber: string
	correspondentAccount: string
}