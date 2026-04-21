import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { INewShipmentForm, IShipment } from '@/shared/types/shipment.types'
import { showToast } from '@/shared/ui/showToast'
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'

export const useShipments = () => {
	const { user } = useAuth()
	const [shipments, setShipments] = useState<IShipment[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const fetchShipments = useCallback(async () => {
		if (!user) return

		try {
			setIsLoading(true)
			const shipmentsCollection = collection(db, 'users', user.uid, 'shipments')
			const querySnapshot = await getDocs(shipmentsCollection)
			const shipmentsList = querySnapshot.docs.map(doc => {
				const data = doc.data()
				return {
					...data,
					id: doc.id
				} as IShipment
			})
			setShipments(shipmentsList)
		} catch (error) {
			showToast(`Ошибка при загрузке актов: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}, [user])

	const saveShipment = useCallback(
		async (formData: INewShipmentForm) => {
			if (!user) return null

			try {
				setIsLoading(true)
				const shipmentsCollection = collection(db, 'users', user.uid, 'shipments')

				// Генерируем номер акта (АКТ № XXXXX)
				const allShipments = await getDocs(shipmentsCollection)
				const actNumber = String(allShipments.size + 1).padStart(5, '0')
				const actDate = new Date().toISOString().split('T')[0]

				const newShipmentData = {
					actNumber: `АКТ № ${actNumber}`,
					actDate,
					clientId: formData.clientId,
					clientName: formData.clientName,
					clientInn: formData.clientInn,
					clientAddress: formData.clientAddress,
					items: formData.items,
					totalAmount: formData.items.reduce((sum, item) => sum + item.totalAmount, 0),
					status: 'draft' as const,
					createdAt: new Date().toISOString(),
					notes: formData.notes || ''
				}

				const docRef = await addDoc(shipmentsCollection, newShipmentData)

				const savedShipment: IShipment = {
					...newShipmentData,
					id: docRef.id
				}

				setShipments(prev => [...prev, savedShipment])
				showToast('Акт отгрузки создан')
				return savedShipment
			} catch (error) {
				showToast(`Ошибка при создании акта: ${error}`)
				return null
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	const updateShipment = useCallback(
		async (shipmentId: string, updates: Partial<IShipment>) => {
			if (!user) return false

			try {
				setIsLoading(true)
				const docRef = doc(db, 'users', user.uid, 'shipments', shipmentId)
				await updateDoc(docRef, updates)

				setShipments(prev =>
					prev.map(s => (s.id === shipmentId ? { ...s, ...updates } : s))
				)
				showToast('Акт обновлен')
				return true
			} catch (error) {
				showToast(`Ошибка при обновлении акта: ${error}`)
				return false
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	const deleteShipment = useCallback(
		async (shipmentId: string) => {
			if (!user) return false

			try {
				setIsLoading(true)
				const docRef = doc(db, 'users', user.uid, 'shipments', shipmentId)
				await deleteDoc(docRef)

				setShipments(prev => prev.filter(s => s.id !== shipmentId))
				showToast('Акт удален')
				return true
			} catch (error) {
				showToast(`Ошибка при удалении акта: ${error}`)
				return false
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	const completeShipment = useCallback(
		async (shipmentId: string) => {
			if (!user) return false

			try {
				setIsLoading(true)
				const docRef = doc(db, 'users', user.uid, 'shipments', shipmentId)
				await updateDoc(docRef, {
					status: 'completed',
					completedAt: new Date().toISOString()
				})

				setShipments(prev =>
					prev.map(s =>
						s.id === shipmentId
							? {
									...s,
									status: 'completed',
									completedAt: new Date().toISOString()
								}
							: s
					)
				)
				showToast('Акт завершен')
				return true
			} catch (error) {
				showToast(`Ошибка при завершении акта: ${error}`)
				return false
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	useEffect(() => {
		fetchShipments()
	}, [fetchShipments])

	return {
		shipments,
		isLoading,
		fetchShipments,
		saveShipment,
		updateShipment,
		deleteShipment,
		completeShipment
	}
}
