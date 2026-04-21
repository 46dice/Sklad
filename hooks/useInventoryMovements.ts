import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/shared/ui/showToast'
import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'

export type MovementType = 'sale' | 'delivery_out' | 'delivery_in' | 'adjustment' | 'return'

export interface IInventoryMovement {
	id: string
	productId: string
	productName: string
	movementType: MovementType
	quantity: number // положительное = приход, отрицательное = расход
	previousQuantity: number
	newQuantity: number
	relatedId?: string // ID продажи, доставки и т.д.
	userId: string
	userName: string
	reason?: string
	timestamp: number
	date: string
}

export const useInventoryMovements = () => {
	const { user } = useAuth()
	const [movements, setMovements] = useState<IInventoryMovement[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const fetchMovements = useCallback(async () => {
		if (!user) return

		try {
			setIsLoading(true)
			const movementsCollection = collection(db, 'users', user.uid, 'inventory_movements')
			const q = query(movementsCollection, orderBy('timestamp', 'desc'))
			const querySnapshot = await getDocs(q)
			
			const movementsList = querySnapshot.docs.map(doc => ({
				...doc.data(),
				id: doc.id
			} as IInventoryMovement))
			
			setMovements(movementsList)
		} catch (error) {
			showToast(`Ошибка при загрузке движений: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}, [user])

	const recordMovement = useCallback(async (movement: Omit<IInventoryMovement, 'id' | 'timestamp' | 'date' | 'userId' | 'userName'>) => {
		if (!user) return false

		try {
			const now = new Date()
			const timestamp = now.getTime()
			const date = now.toISOString().split('T')[0]

			const movementsCollection = collection(db, 'users', user.uid, 'inventory_movements')
			await addDoc(movementsCollection, {
				...movement,
				userId: user.uid,
				userName: user.email || 'Пользователь',
				timestamp,
				date
			})

			// Обновляем локальный список
			await fetchMovements()
			return true
		} catch (error) {
			showToast(`Ошибка при записи движения: ${error}`)
			return false
		}
	}, [user, fetchMovements])

	// Получить движения по конкретному товару
	const getProductMovements = useCallback((productId: string) => {
		return movements.filter(movement => movement.productId === productId)
	}, [movements])

	// Получить движения по типу
	const getMovementsByType = useCallback((type: MovementType) => {
		return movements.filter(movement => movement.movementType === type)
	}, [movements])

	// Получить движения за период
	const getMovementsByPeriod = useCallback((startDate: Date, endDate: Date) => {
		const startTime = startDate.getTime()
		const endTime = endDate.getTime()
		return movements.filter(movement => 
			movement.timestamp >= startTime && movement.timestamp <= endTime
		)
	}, [movements])

	useEffect(() => {
		fetchMovements()
	}, [fetchMovements])

	return {
		movements,
		isLoading,
		fetchMovements,
		recordMovement,
		getProductMovements,
		getMovementsByType,
		getMovementsByPeriod
	}
}