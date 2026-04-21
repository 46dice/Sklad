import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { DeliveryStatus, IDeliveryReport, IDeliveryTask, INewDeliveryForm } from '@/shared/types/delivery.types'
import { showToast } from '@/shared/ui/showToast'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'
import { useInventoryMovements } from './useInventoryMovements'

export const useDeliveries = () => {
	const { user } = useAuth()
	const { recordMovement } = useInventoryMovements()
	const [deliveries, setDeliveries] = useState<IDeliveryTask[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const fetchDeliveries = useCallback(async () => {
		if (!user) return

		try {
			setIsLoading(true)
			const deliveriesCollection = collection(db, 'users', user.uid, 'deliveries')
			const q = query(deliveriesCollection, orderBy('createdAt', 'desc'))
			const querySnapshot = await getDocs(q)
			
			const deliveriesList = querySnapshot.docs.map(doc => ({
				...doc.data(),
				id: doc.id
			} as IDeliveryTask))
			
			setDeliveries(deliveriesList)
		} catch (error) {
			showToast(`Ошибка при загрузке доставок: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}, [user])

	const createDeliveryTask = useCallback(async (formData: INewDeliveryForm) => {
		if (!user) return null

		try {
			setIsLoading(true)
			const deliveriesCollection = collection(db, 'users', user.uid, 'deliveries')
			
			const taskNumber = `DEL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
			
			const newTask: Omit<IDeliveryTask, 'id'> = {
				taskNumber,
				courierId: formData.courierId,
				courierName: formData.courierName,
				managerId: user.uid,
				managerName: user.email || 'Менеджер',
				destination: formData.destination,
				destinationAddress: formData.destinationAddress,
				items: formData.items,
				totalCost: formData.items.reduce((sum, item) => sum + item.totalCost, 0),
				status: 'pending' as const,
				createdAt: new Date().toISOString(),
				...(formData.customDestination && { customDestination: formData.customDestination }),
				...(formData.notes && { managerNotes: formData.notes })
			}

			const docRef = await addDoc(deliveriesCollection, newTask)
			const savedTask: IDeliveryTask = { ...newTask, id: docRef.id }

			// Сохраняем копию доставки в коллекции курьера
			const courierDeliveriesCollection = collection(db, 'users', formData.courierId, 'deliveries')
			await addDoc(courierDeliveriesCollection, newTask)

			// Записываем движение товаров (резервирование для доставки)
			for (const item of formData.items) {
				const productRef = doc(db, 'users', user.uid, 'products', item.productId)
				const productSnap = await getDoc(productRef)

				if (productSnap.exists()) {
					const currentQty: number = productSnap.data().quantity ?? 0
					const newQty = Math.max(0, currentQty - item.quantity)
					await updateDoc(productRef, { quantity: newQty })

					await recordMovement({
						productId: item.productId,
						productName: item.productName,
						movementType: 'delivery_out',
						quantity: -item.quantity,
						previousQuantity: currentQty,
						newQuantity: newQty,
						relatedId: docRef.id,
						reason: `Отправка на доставку: ${formData.destination} (${taskNumber})`
					})
				}
			}
			
			setDeliveries(prev => [savedTask, ...prev])
			showToast('Задание на доставку создано')
			return savedTask
		} catch (error) {
			showToast(`Ошибка при создании задания: ${error}`)
			return null
		} finally {
			setIsLoading(false)
		}
	}, [user, recordMovement])

	const updateDeliveryStatus = useCallback(async (taskId: string, status: DeliveryStatus, additionalData?: Partial<IDeliveryTask>) => {
		if (!user) return false

		try {
			const taskRef = doc(db, 'users', user.uid, 'deliveries', taskId)
			const taskSnap = await getDoc(taskRef)
			
			if (!taskSnap.exists()) return false
			
			const task = taskSnap.data() as IDeliveryTask
			
			const updateData: Partial<IDeliveryTask> = {
				status,
				...additionalData
			}

			if (status === 'in_transit') {
				updateData.startedAt = new Date().toISOString()
			} else if (status === 'delivered') {
				updateData.deliveredAt = new Date().toISOString()
			} else if (status === 'failed') {
				// При неудачной доставке возвращаем товары на склад
				if (task) {
					for (const item of task.items) {
						const productRef = doc(db, 'users', task.managerId, 'products', item.productId)
						const productSnap = await getDoc(productRef)

						if (productSnap.exists()) {
							const currentQty: number = productSnap.data().quantity ?? 0
							const newQty = currentQty + item.quantity
							await updateDoc(productRef, { quantity: newQty })

							await recordMovement({
								productId: item.productId,
								productName: item.productName,
								movementType: 'return',
								quantity: item.quantity,
								previousQuantity: currentQty,
								newQuantity: newQty,
								relatedId: taskId,
								reason: `Возврат с неудачной доставки: ${task.taskNumber}`
							})
						}
					}
				}
			}

			// Обновляем в коллекции текущего пользователя
			await updateDoc(taskRef, updateData)
			
			// Если это курьер, обновляем также в коллекции менеджера
			if (task.managerId && task.managerId !== user.uid) {
				const managerTaskRef = doc(db, 'users', task.managerId, 'deliveries', taskId)
				try {
					await updateDoc(managerTaskRef, updateData)
				} catch (error: any) {
					// Если документ не существует в коллекции менеджера, создаем его
					if (error.code === 'not-found') {
						await setDoc(managerTaskRef, { ...task, ...updateData })
					}
				}
			}
			
			setDeliveries(prev => 
				prev.map(t => 
					t.id === taskId 
						? { ...t, ...updateData }
						: t
				)
			)
			
			showToast('Статус доставки обновлён')
			return true
		} catch (error) {
			showToast(`Ошибка при обновлении статуса: ${error}`)
			return false
		}
	}, [user, recordMovement])

	const submitDeliveryReport = useCallback(async (report: IDeliveryReport) => {
		return await updateDeliveryStatus(report.taskId, 'delivered', {
			notes: report.notes,
			deliveredAt: report.deliveredAt
		})
	}, [updateDeliveryStatus])

	// Получить доставки для конкретного курьера
	const getCourierDeliveries = useCallback((courierId: string) => {
		return deliveries.filter(delivery => delivery.courierId === courierId)
	}, [deliveries])

	// Получить доставки по статусу
	const getDeliveriesByStatus = useCallback((status: DeliveryStatus) => {
		return deliveries.filter(delivery => delivery.status === status)
	}, [deliveries])

	// Удалить доставку
	const deleteDelivery = useCallback(async (taskId: string) => {
		if (!user) return false

		try {
			const taskRef = doc(db, 'users', user.uid, 'deliveries', taskId)
			const taskSnap = await getDoc(taskRef)
			
			if (!taskSnap.exists()) return false
			
			const task = taskSnap.data() as IDeliveryTask

			// Если доставка не завершена, возвращаем товары на склад
			if (task.status !== 'delivered' && task.status !== 'failed') {
				for (const item of task.items) {
					const productRef = doc(db, 'users', user.uid, 'products', item.productId)
					const productSnap = await getDoc(productRef)

					if (productSnap.exists()) {
						const currentQty: number = productSnap.data().quantity ?? 0
						const newQty = currentQty + item.quantity
						await updateDoc(productRef, { quantity: newQty })

						await recordMovement({
							productId: item.productId,
							productName: item.productName,
							movementType: 'return',
							quantity: item.quantity,
							previousQuantity: currentQty,
							newQuantity: newQty,
							relatedId: taskId,
							reason: `Возврат при удалении доставки: ${task.taskNumber}`
						})
					}
				}
			}

			// Удаляем из коллекции менеджера
			await deleteDoc(taskRef)

			// Удаляем из коллекции курьера
			if (task.courierId) {
				const courierTaskRef = doc(db, 'users', task.courierId, 'deliveries', taskId)
				await deleteDoc(courierTaskRef)
			}

			setDeliveries(prev => prev.filter(d => d.id !== taskId))
			showToast('Доставка удалена')
			return true
		} catch (error) {
			showToast(`Ошибка при удалении доставки: ${error}`)
			return false
		}
	}, [user, recordMovement])

	useEffect(() => {
		fetchDeliveries()
	}, [fetchDeliveries])

	return {
		deliveries,
		isLoading,
		fetchDeliveries,
		createDeliveryTask,
		updateDeliveryStatus,
		submitDeliveryReport,
		getCourierDeliveries,
		getDeliveriesByStatus,
		deleteDelivery
	}
}