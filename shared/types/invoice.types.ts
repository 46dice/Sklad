export interface IInvoiceItem {
	actNumber: string
	serviceName: string
	quantity: number
	price: number
	totalAmount: number
}

export interface IInvoice {
	id: string
	invoiceNumber: string // Счет № 00001
	invoiceDate: string // дата счета
	clientId: string
	clientName: string
	clientInn: string
	clientAddress: string
	items: IInvoiceItem[] // Все услуги из актов за период
	shipmentIds: string[] // ID актов, включенных в счет
	totalQuantity: number // Общее кол-во единиц
	totalAmount: number // Общая сумма
	periodFrom: string // Дата начала периода
	periodTo: string // Дата конца периода
	status: 'draft' | 'sent' | 'paid'
	createdAt: string
	notes?: string
}

export interface INewInvoiceForm {
	clientId: string
	clientName: string
	clientInn: string
	clientAddress: string
	periodFrom: string
	periodTo: string
	notes?: string
}
