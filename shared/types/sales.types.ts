export interface ISale {
	id: string
	productId: string
	productName: string
	quantity: number
	price: number
	totalAmount: number
	timestamp: number
	date: string
}

export interface ISalesData {
	labels: string[]
	datasets: Array<{
		data: number[]
	}>
}
