import { db } from '@/firebase'
import { INewProductForm } from '@/shared/types/products.types'
import { showToast } from '@/shared/ui/showToast'
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore/lite'
import { useCallback, useState } from 'react'

export const useNewProduct = () => {
	const [isLoading, setIsLoading] = useState(false)

	const fetchAddNewProduct = useCallback(
		async (userId: string, newProductData: INewProductForm) => {
			try {
				setIsLoading(true)
				await addDoc(collection(db, 'users', userId, 'products'), {
					...newProductData,
					createdAt: new Date()
				})
				showToast('Товар добавлен!')
			} catch (error) {
				showToast(`Ошибка добавления товара: ${error}`)
			} finally {
				setIsLoading(false)
			}
		},
		[]
	)

	const fetchUpdateProduct = useCallback(
		async (userId: string, productId: string, updatedData: INewProductForm) => {
			try {
				setIsLoading(true)
				const productRef = doc(db, 'users', userId, 'products', productId)
				await updateDoc(productRef, {
					...updatedData,
					updatedAt: new Date()
				})
				showToast('Товар обновлен!')
			} catch (error) {
				showToast(`Ошибка обновления товара: ${error}`)
			} finally {
				setIsLoading(false)
			}
		},
		[]
	)

	const fetchDeleteProduct = useCallback(
		async (userId: string, productId: string) => {
			try {
				setIsLoading(true)
				const productRef = doc(db, 'users', userId, 'products', productId)
				await deleteDoc(productRef)
				showToast('Товар удалён!')
			} catch (error) {
				showToast(`Ошибка удаления товара: ${error}`)
			} finally {
				setIsLoading(false)
			}
		},
		[]
	)

	return {
		isLoading,
		fetchAddNewProduct,
		fetchUpdateProduct,
		fetchDeleteProduct
	}
}
