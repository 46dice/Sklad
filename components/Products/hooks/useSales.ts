import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { ISale } from '@/shared/types/sales.types'
import { showToast } from '@/shared/ui/showToast'
import { collection, getDocs, orderBy, query } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'

type FilterPeriod = 'today' | 'week' | 'month'

export const useSales = () => {
	const { user } = useAuth()
	const [sales, setSales] = useState<ISale[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today')
	const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

	const fetchSales = useCallback(async () => {
		if (!user) return

		try {
			setIsLoading(true)
			const salesCollection = collection(db, 'users', user.uid, 'sales')
			const q = query(salesCollection, orderBy('timestamp', 'desc'))
			const querySnapshot = await getDocs(q)
			const salesList = querySnapshot.docs.map(doc => {
				return {
					...doc.data(),
					id: doc.id
				} as ISale
			})
			setSales(salesList)
		} catch (error) {
			showToast(`Ошибка при загрузке продаж: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}, [user])

	useEffect(() => {
		fetchSales()
	}, [fetchSales])

	// Получить отфильтрованные продажи по периоду
	const getFilteredSales = useCallback(() => {
		let startTime = 0

		switch (filterPeriod) {
			case 'today': {
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				startTime = today.getTime()
				break
			}
			case 'week': {
				const weekAgo = new Date()
				weekAgo.setDate(weekAgo.getDate() - 7)
				weekAgo.setHours(0, 0, 0, 0)
				startTime = weekAgo.getTime()
				break
			}
			case 'month': {
				const monthAgo = new Date()
				monthAgo.setMonth(monthAgo.getMonth() - 1)
				monthAgo.setHours(0, 0, 0, 0)
				startTime = monthAgo.getTime()
				break
			}
		}

		return sales.filter(sale => sale.timestamp >= startTime)
	}, [sales, filterPeriod])

	// Получить продажи за конкретный год
	const getSalesByYear = useCallback(() => {
		const startOfYear = new Date(selectedYear, 0, 1).getTime()
		const endOfYear = new Date(selectedYear + 1, 0, 1).getTime()

		return sales.filter(
			sale => sale.timestamp >= startOfYear && sale.timestamp < endOfYear
		)
	}, [sales, selectedYear])

	// Получить все года из продаж
	const getAvailableYears = useCallback(() => {
		const years = new Set<number>()
		sales.forEach(sale => {
			const year = new Date(sale.timestamp).getFullYear()
			years.add(year)
		})
		return Array.from(years).sort((a, b) => b - a)
	}, [sales])

	// Получить данные для графика по часам
	const getSalesChartData = useCallback(() => {
		const filteredSales = getFilteredSales()
		const now = Date.now()

		if (filterPeriod === 'today') {
			// График по часам за сегодня
			const hours: { label: string; timestamp: number }[] = []
			for (let i = 7; i >= 0; i--) {
				const hourTime = now - i * 60 * 60 * 1000
				const date = new Date(hourTime)
				const label = date.getHours().toString().padStart(2, '0') + ':00'
				hours.push({ label, timestamp: hourTime })
			}

			const salesByHour = hours.map(hour => {
				const startOfHour = hour.timestamp - 60 * 60 * 1000
				const hourSales = filteredSales.filter(sale => {
					return sale.timestamp >= startOfHour && sale.timestamp < hour.timestamp
				})
				return hourSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
			})

			return {
				labels: hours.map(h => h.label),
				datasets: [{ data: salesByHour.length > 0 ? salesByHour : [0, 0, 0, 0, 0, 0, 0, 0] }]
			}
		} else if (filterPeriod === 'week') {
			// График по дням за неделю
			const days: { label: string; date: Date }[] = []
			for (let i = 6; i >= 0; i--) {
				const date = new Date(now)
				date.setDate(date.getDate() - i)
				date.setHours(0, 0, 0, 0)
				const label = date.toLocaleDateString('ru-RU', { weekday: 'short' })
				days.push({ label, date })
			}

			const salesByDay = days.map(day => {
				const endOfDay = new Date(day.date)
				endOfDay.setDate(endOfDay.getDate() + 1)
				const daySales = filteredSales.filter(
					sale => sale.timestamp >= day.date.getTime() && sale.timestamp < endOfDay.getTime()
				)
				return daySales.reduce((sum, sale) => sum + sale.totalAmount, 0)
			})

			return {
				labels: days.map(d => d.label),
				datasets: [{ data: salesByDay }]
			}
		} else {
			// График по неделям за месяц
			const weeks: { label: string; startTime: number; endTime: number }[] = []
			for (let i = 3; i >= 0; i--) {
				const date = new Date(now)
				date.setDate(date.getDate() - i * 7)
				date.setHours(0, 0, 0, 0)
				const weekStart = date.getTime()
				const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000
				const label = `Неделя ${Math.floor((now - weekStart) / (7 * 24 * 60 * 60 * 1000)) + 1}`
				weeks.push({ label, startTime: weekStart, endTime: weekEnd })
			}

			const salesByWeek = weeks.map(week => {
				const weekSales = filteredSales.filter(
					sale => sale.timestamp >= week.startTime && sale.timestamp < week.endTime
				)
				return weekSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
			})

			return {
				labels: weeks.map(w => w.label),
				datasets: [{ data: salesByWeek }]
			}
		}
	}, [filterPeriod, getFilteredSales])

	// Получить статистику за выбранный период
	const getPeriodStats = useCallback(() => {
		const filteredSales = getFilteredSales()
		// Учитываем как items массив (новая структура) так и старую структуру с quantity
		const totalQuantity = filteredSales.reduce((sum, sale) => {
			if (sale.items && Array.isArray(sale.items)) {
				return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
			}
			return sum + (sale.quantity || 0)
		}, 0)
		const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0)

		return {
			totalQuantity,
			totalAmount,
			salesCount: filteredSales.length
		}
	}, [getFilteredSales])

	return {
		sales,
		isLoading,
		filterPeriod,
		setFilterPeriod,
		selectedYear,
		setSelectedYear,
		getSalesChartData,
		getPeriodStats,
		getFilteredSales,
		getSalesByYear,
		getAvailableYears,
		fetchSales
	}
}
