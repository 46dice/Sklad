import { db } from '@/firebase'
import { IUserProfile } from '@/shared/types/user.types'
import { showToast } from '@/shared/ui/showToast'
import { collection, getDocs, query, where } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'

export interface ICourier {
	id: string
	name: string
	email: string
	phone?: string
}

export const useCouriers = () => {
	const [couriers, setCouriers] = useState<ICourier[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const fetchCouriers = useCallback(async () => {
		try {
			setIsLoading(true)
			const usersRef = collection(db, 'users')
			const q = query(usersRef, where('role', '==', 'courier'))
			const querySnapshot = await getDocs(q)

			const couriersList: ICourier[] = []
			querySnapshot.forEach(doc => {
				const data = doc.data() as IUserProfile
				couriersList.push({
					id: doc.id,
					name: data.name || data.email || 'Курьер',
					email: data.email,
					phone: data.phone
				})
			})

			setCouriers(couriersList)
		} catch (error) {
			showToast(`Ошибка при загрузке курьеров: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchCouriers()
	}, [fetchCouriers])

	return {
		couriers,
		isLoading,
		fetchCouriers
	}
}
