import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { ISale } from '@/shared/types/sales.types'
import { showToast } from '@/shared/ui/showToast'
import { addDoc, collection } from 'firebase/firestore/lite'
import { useCallback } from 'react'

export const useSalesActions = () => {
	const { user } = useAuth()

	const addSale = useCallback(
		async (saleData: Omit<ISale, 'id' | 'timestamp' | 'date'>) => {
			if (!user) {
				showToast('Пользователь не найден')
				return false
			}

			try {
				const now = new Date()
				const timestamp = now.getTime()
				const date = now.toISOString().split('T')[0]

				const salesCollection = collection(db, 'users', user.uid, 'sales')
				await addDoc(salesCollection, {
					...saleData,
					timestamp,
					date
				})

				showToast('Продажа успешно добавлена')
				return true
			} catch (error) {
				showToast(`Ошибка при добавлении продажи: ${error}`)
				return false
			}
		},
		[user]
	)

	return {
		addSale
	}
}
