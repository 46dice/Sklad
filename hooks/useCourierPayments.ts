import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { ICourierPayment, ICourierPaymentSummary, getDeliveryRate } from '@/shared/types/courier.types'
import { IDeliveryTask } from '@/shared/types/delivery.types'
import { showToast } from '@/shared/ui/showToast'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'

// Определяем адрес по названию услуги
const getAddressByServiceName = (serviceName: string): string => {
	const lowerName = serviceName.toLowerCase()
	if (lowerName.includes('озон')) return 'Озон, ул. Челюскинцев, 88'
	if (lowerName.includes('wildberries') || lowerName.includes('вб') || lowerName.includes('wb')) return 'Wildberries, ул. Машиностроителей, 32'
	if (lowerName.includes('яндекс')) return 'Яндекс.Маркет, ул. Авторская, 15'
	if (lowerName.includes('пэк') || lowerName.includes('cdek') || lowerName.includes('деловые') || lowerName.includes('энергия')) return 'Крупногабарит с транспортной компании'
	return 'Озон, ул. Челюскинцев, 88'
}

// Считаем зарплату курьера за доставку: тариф × количество для каждого товара
const calcDeliveryEarnings = (delivery: IDeliveryTask): number => {
	let total = 0
	delivery.items.forEach(item => {
		const address = getAddressByServiceName(item.productName)
		const rate = getDeliveryRate(address)
		total += rate * item.quantity
	})
	return total
}

export const useCourierPayments = () => {
	const { user } = useAuth()
	const [payments, setPayments] = useState<ICourierPayment[]>([])
	const [isLoading, setIsLoading] = useState(false)

	// Получить все доставки курьера за период
	const getCourierDeliveriesForPeriod = useCallback(
		async (courierId: string, periodFrom: string, periodTo: string): Promise<IDeliveryTask[]> => {
			if (!user) return []

			try {
				const deliveriesCollection = collection(db, 'users', user.uid, 'deliveries')
				const q = query(
					deliveriesCollection,
					where('courierId', '==', courierId)
				)
				const querySnapshot = await getDocs(q)
				
				const deliveries = querySnapshot.docs.map(doc => ({
					...doc.data(),
					id: doc.id
				} as IDeliveryTask))

				// Фильтруем по периоду
				const fromDate = new Date(periodFrom).getTime()
				const toDate = new Date(periodTo).getTime()

				return deliveries.filter(d => {
					const deliveryDate = new Date(d.deliveredAt || d.createdAt).getTime()
					return deliveryDate >= fromDate && deliveryDate <= toDate
				})
			} catch (error) {
				showToast(`Ошибка при загрузке доставок: ${error}`)
				return []
			}
		},
		[user]
	)

	// Проверить, был ли расчёт уже сделан сегодня для этого курьера
	const hasPaymentToday = useCallback((courierId: string): boolean => {
		const today = new Date().toISOString().split('T')[0]
		return payments.some(payment => {
			const paymentDate = payment.createdAt.split('T')[0]
			return payment.courierId === courierId && paymentDate === today
		})
	}, [payments])

	// Проверить, была ли доставка уже оплачена
	const isDeliveryAlreadyPaid = useCallback((deliveryTaskId: string): boolean => {
		return payments.some(payment => 
			payment.deliveries.some(d => d.taskId === deliveryTaskId)
		)
	}, [payments])

	// Рассчитать зарплату курьера за период
	const calculateCourierPayment = useCallback(
		async (courierId: string, courierName: string, periodFrom: string, periodTo: string): Promise<ICourierPayment | null> => {
			try {
				// Проверяем, был ли расчёт уже сделан сегодня
				// if (hasPaymentToday(courierId)) {
				// 	showToast('Расчёт для этого курьера уже был сделан сегодня')
				// 	return null
				// }

				const deliveries = await getCourierDeliveriesForPeriod(courierId, periodFrom, periodTo)

				// Фильтруем доставки - исключаем уже оплаченные и незавершённые
				const unPaidDeliveries = deliveries.filter(d => 
					!isDeliveryAlreadyPaid(d.id) && (d.status === 'delivered' || d.status === 'failed')
				)

				if (unPaidDeliveries.length === 0) {
					showToast('Все доставки за этот период уже оплачены')
					return null
				}

				let totalEarnings = 0
				let completedDeliveries = 0
				let failedDeliveries = 0

				const paymentDeliveries = unPaidDeliveries.map(d => {
					const rate = calcDeliveryEarnings(d)
					const isCompleted = d.status === 'delivered'

					if (isCompleted) {
						totalEarnings += rate
						completedDeliveries++
					} else if (d.status === 'failed') {
						failedDeliveries++
					}

					return {
						taskId: d.id,
						taskNumber: d.taskNumber,
						destination: d.destinationAddress,
						rate,
						status: (d.status === 'delivered' ? 'delivered' : 'failed') as 'delivered' | 'failed',
						completedAt: d.deliveredAt
					}
				})

				const payment: ICourierPayment = {
					courierId,
					courierName,
					periodFrom,
					periodTo,
					deliveries: paymentDeliveries,
					totalDeliveries: unPaidDeliveries.length,
					completedDeliveries,
					failedDeliveries,
					totalEarnings,
					createdAt: new Date().toISOString()
				}

				return payment
			} catch (error) {
				showToast(`Ошибка при расчёте зарплаты: ${error}`)
				return null
			}
		},
		[getCourierDeliveriesForPeriod, isDeliveryAlreadyPaid, hasPaymentToday]
	)

	// Сохранить расчёт зарплаты
	const savePaymentCalculation = useCallback(
		async (payment: ICourierPayment) => {
			if (!user) return false

			try {
				setIsLoading(true)
				const paymentsCollection = collection(db, 'users', user.uid, 'courierPayments')
				
				// Очищаем данные для сохранения - удаляем undefined значения
				const paymentData = {
					courierId: payment.courierId,
					courierName: payment.courierName,
					periodFrom: payment.periodFrom,
					periodTo: payment.periodTo,
					deliveries: payment.deliveries.map(d => ({
						taskId: d.taskId,
						taskNumber: d.taskNumber,
						destination: d.destination,
						rate: d.rate,
						status: d.status,
						completedAt: d.completedAt || null
					})),
					totalDeliveries: payment.totalDeliveries,
					completedDeliveries: payment.completedDeliveries,
					failedDeliveries: payment.failedDeliveries,
					totalEarnings: payment.totalEarnings,
					createdAt: new Date().toISOString()
				}
				
				await addDoc(paymentsCollection, paymentData)
				showToast('Расчёт зарплаты сохранён')
				return true
			} catch (error) {
				showToast(`Ошибка при сохранении расчёта: ${error}`)
				return false
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	// Получить все расчёты зарплаты
	const fetchPayments = useCallback(async () => {
		if (!user) return

		try {
			setIsLoading(true)
			const paymentsCollection = collection(db, 'users', user.uid, 'courierPayments')
			const querySnapshot = await getDocs(paymentsCollection)
			
			const paymentsList = querySnapshot.docs.map(doc => ({
				...doc.data(),
				id: doc.id
			} as ICourierPayment & { id: string })
			)
			
			setPayments(paymentsList)
		} catch (error) {
			showToast(`Ошибка при загрузке расчётов: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}, [user])

	// Получить сводку по курьеру
	const getCourierSummary = useCallback((courierId: string): ICourierPaymentSummary | null => {
		const courierPayments = payments.filter(p => p.courierId === courierId)
		
		if (courierPayments.length === 0) return null

		const totalEarnings = courierPayments.reduce((sum, p) => sum + p.totalEarnings, 0)
		const completedDeliveries = courierPayments.reduce((sum, p) => sum + p.completedDeliveries, 0)
		const failedDeliveries = courierPayments.reduce((sum, p) => sum + p.failedDeliveries, 0)

		return {
			courierId,
			courierName: courierPayments[0].courierName,
			totalEarnings,
			completedDeliveries,
			failedDeliveries
		}
	}, [payments])

	useEffect(() => {
		fetchPayments()
	}, [fetchPayments])

	return {
		payments,
		isLoading,
		fetchPayments,
		calculateCourierPayment,
		savePaymentCalculation,
		getCourierSummary,
		getCourierDeliveriesForPeriod,
		isDeliveryAlreadyPaid,
		hasPaymentToday
	}
}
