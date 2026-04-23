export interface ICourierPayment {
	courierId: string
	courierName: string
	periodFrom: string
	periodTo: string
	deliveries: Array<{
		taskId: string
		taskNumber: string
		destination: string
		rate: number // тариф за доставку
		status: 'delivered' | 'failed'
		completedAt?: string
	}>
	totalDeliveries: number
	completedDeliveries: number
	failedDeliveries: number
	totalEarnings: number
	createdAt: string
}

export interface ICourierPaymentSummary {
	courierId: string
	courierName: string
	totalEarnings: number
	completedDeliveries: number
	failedDeliveries: number
	averageRating?: number
}

// Зарплаты курьеру за доставку по направлениям (Екатеринбург)
export const COURIER_RATES: Record<string, number> = {
	// Склады маркетплейсов
	'Озон, ул. Челюскинцев, 88': 300,
	'Wildberries, ул. Машиностроителей, 32': 250,
	'Яндекс.Маркет, ул. Авторская, 15': 400,
	// Заборы из транспортных компаний (крупногабаритные)
	'Крупногабарит с транспортной компании': 1000
}

// Для обратной совместимости
export const DELIVERY_RATES = COURIER_RATES

export const getDeliveryRate = (address: string): number => {
	return COURIER_RATES[address] || 0
}
