export interface ISaleItem {
	productId: string
	productName: string
	quantity: number
	price: number
	totalAmount: number
}

export interface ISale {
	id: string
	clientId?: string
	clientName?: string
	items: ISaleItem[]
	totalAmount: number
	timestamp: number
	date: string
	// для обратной совместимости со старыми записями
	productId?: string
	productName?: string
	quantity?: number
	price?: number
}

export interface ISalesData {
	labels: string[]
	datasets: Array<{
		data: number[]
	}>
}
