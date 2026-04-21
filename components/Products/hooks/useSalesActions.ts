import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useInventoryMovements } from '@/hooks/useInventoryMovements'
import { ISale } from '@/shared/types/sales.types'
import { showToast } from '@/shared/ui/showToast'
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore/lite'
import { useCallback } from 'react'

export const useSalesActions = () => {
	const { user } = useAuth()
	const { recordMovement } = useInventoryMovements()

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

				// Проверяем и уменьшаем остатки по каждому товару
				if (saleData.items && saleData.items.length > 0) {
					for (const item of saleData.items) {
						const productRef = doc(db, 'users', user.uid, 'products', item.productId)
						const productSnap = await getDoc(productRef)

						if (productSnap.exists()) {
							const currentQty: number = productSnap.data().quantity ?? 0
							const newQty = Math.max(0, currentQty - item.quantity)
							await updateDoc(productRef, { quantity: newQty })

							// Записываем движение товара
							await recordMovement({
								productId: item.productId,
								productName: item.productName,
								movementType: 'sale',
								quantity: -item.quantity, // отрицательное значение = расход
								previousQuantity: currentQty,
								newQuantity: newQty,
								reason: `Продажа клиенту: ${saleData.clientName || 'Неизвестный клиент'}`
							})
						}
					}
				}

				const salesCollection = collection(db, 'users', user.uid, 'sales')
				const docRef = await addDoc(salesCollection, {
					...saleData,
					timestamp,
					date
				})

				// Записываем движение с привязкой к продаже
				if (saleData.items && saleData.items.length > 0) {
					for (const item of saleData.items) {
						await recordMovement({
							productId: item.productId,
							productName: item.productName,
							movementType: 'sale',
							quantity: -item.quantity,
							previousQuantity: 0, // будет обновлено выше
							newQuantity: 0, // будет обновлено выше
							relatedId: docRef.id,
							reason: `Продажа клиенту: ${saleData.clientName || 'Неизвестный клиент'}`
						})
					}
				}

				showToast('Продажа успешно добавлена')
				return true
			} catch (error) {
				showToast(`Ошибка при добавлении продажи: ${error}`)
				return false
			}
		},
		[user, recordMovement]
	)

	return {
		addSale
	}
}
