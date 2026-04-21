import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { IService } from '@/shared/types/shipment.types'
import { showToast } from '@/shared/ui/showToast'
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'

const DEFAULT_SERVICES = [
	{ name: 'Доставка до пункта Озон', price: 40 },
	{ name: 'Доставка до пункта Wildberries', price: 50 },
	{ name: 'Доставка до пункта Яндекс.Маркет', price: 45 },
	{ name: 'Хранение коробки', price: 20 },
	{ name: 'Упаковка товара', price: 15 },
	{ name: 'Обработка заказа', price: 10 }
]

export const useServices = () => {
	const { user } = useAuth()
	const [services, setServices] = useState<IService[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const initializeDefaultServices = useCallback(async () => {
		if (!user) return

		try {
			const servicesCollection = collection(db, 'users', user.uid, 'services')
			const querySnapshot = await getDocs(servicesCollection)

			// Если услуг нет, создаем услуги по умолчанию
			if (querySnapshot.empty) {
				for (const defaultService of DEFAULT_SERVICES) {
					await addDoc(servicesCollection, {
						name: defaultService.name,
						price: defaultService.price,
						description: '',
						createdAt: new Date().toISOString()
					})
				}
			}
		} catch (error) {
			console.error('Ошибка при инициализации услуг:', error)
		}
	}, [user])

	const fetchServices = useCallback(async () => {
		if (!user) return

		try {
			setIsLoading(true)
			
			// Сначала инициализируем услуги по умолчанию если их нет
			await initializeDefaultServices()

			const servicesCollection = collection(db, 'users', user.uid, 'services')
			const querySnapshot = await getDocs(servicesCollection)
			const servicesList = querySnapshot.docs.map(doc => {
				const data = doc.data()
				return {
					...data,
					id: doc.id
				} as IService
			})
			setServices(servicesList)
		} catch (error) {
			showToast(`Ошибка при загрузке услуг: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}, [user, initializeDefaultServices])

	const addService = useCallback(
		async (name: string, price: number, description?: string) => {
			if (!user) return null

			try {
				setIsLoading(true)
				const servicesCollection = collection(db, 'users', user.uid, 'services')

				const newServiceData = {
					name,
					price,
					description: description || '',
					createdAt: new Date().toISOString()
				}

				const docRef = await addDoc(servicesCollection, newServiceData)

				const savedService: IService = {
					...newServiceData,
					id: docRef.id
				}

				setServices(prev => [...prev, savedService])
				showToast('Услуга добавлена')
				return savedService
			} catch (error) {
				showToast(`Ошибка при добавлении услуги: ${error}`)
				return null
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	const updateService = useCallback(
		async (serviceId: string, updates: Partial<IService>) => {
			if (!user) return false

			try {
				setIsLoading(true)
				const docRef = doc(db, 'users', user.uid, 'services', serviceId)
				await updateDoc(docRef, updates)

				setServices(prev =>
					prev.map(s => (s.id === serviceId ? { ...s, ...updates } : s))
				)
				showToast('Услуга обновлена')
				return true
			} catch (error) {
				showToast(`Ошибка при обновлении услуги: ${error}`)
				return false
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	const deleteService = useCallback(
		async (serviceId: string) => {
			if (!user) return false

			try {
				setIsLoading(true)
				const docRef = doc(db, 'users', user.uid, 'services', serviceId)
				await deleteDoc(docRef)

				setServices(prev => prev.filter(s => s.id !== serviceId))
				showToast('Услуга удалена')
				return true
			} catch (error) {
				showToast(`Ошибка при удалении услуги: ${error}`)
				return false
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	useEffect(() => {
		fetchServices()
	}, [fetchServices])

	return {
		services,
		isLoading,
		fetchServices,
		addService,
		updateService,
		deleteService
	}
}
