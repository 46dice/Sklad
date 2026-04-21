export type DeliveryStatus = 'pending' | 'in_transit' | 'delivered' | 'failed'

export type DeliveryDestination = 'ozon' | 'wildberries' | 'yandex_market' | 'custom'

export interface IDeliveryItem {
	productId: string
	productName: string
	quantity: number
	price: number // стоимость доставки за единицу
	totalCost: number // общая стоимость доставки
}

export interface IDeliveryTask {
	id: string
	taskNumber: string // номер задания (например: DEL-2026-001)
	courierId: string
	courierName: string
	managerId: string // кто создал задание
	managerName: string
	destination: DeliveryDestination
	customDestination?: string // если destination = 'custom'
	destinationAddress: string
	items: IDeliveryItem[]
	totalCost: number // общая стоимость доставки
	status: DeliveryStatus
	createdAt: string
	assignedAt?: string
	startedAt?: string // когда курьер начал доставку
	deliveredAt?: string // когда доставлено
	notes?: string // заметки курьера
	managerNotes?: string // заметки менеджера
}

export interface INewDeliveryForm {
	courierId: string
	courierName: string
	destination: DeliveryDestination
	customDestination?: string
	destinationAddress: string
	items: IDeliveryItem[]
	notes?: string
}

export interface IDeliveryReport {
	taskId: string
	deliveredAt: string
	notes: string
}