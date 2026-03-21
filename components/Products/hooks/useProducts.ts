import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { INewProductForm } from '@/shared/types/products.types'
import { showToast } from '@/shared/ui/showToast'
import { collection, getDocs } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'

export const useProducts = () => {
	const { user } = useAuth()
	const [products, setProducts] = useState<(INewProductForm & { id: string })[]>(
		[]
	)
	const [filteredProducts, setFilteredProducts] = useState<
		(INewProductForm & { id: string })[]
	>([])
	const [isLoading, setIsLoading] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')

	const fetchProducts = useCallback(async () => {
		if (!user) return

		try {
			setIsLoading(true)
			const productsCollection = collection(db, 'users', user.uid, 'products')
			const querySnapshot = await getDocs(productsCollection)
			const productsList = querySnapshot.docs.map(doc => {
				const data = doc.data()
				return {
					...data,
					id: doc.id
				} as INewProductForm & { id: string }
			})
			setProducts(productsList)
			setFilteredProducts(productsList)
		} catch (error) {
			showToast(`Ошибка при загрузке товаров: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}, [user])

	const searchProducts = useCallback(
		(query: string) => {
			setSearchQuery(query)
			if (!query.trim()) {
				setFilteredProducts(products)
				return
			}

			const filtered = products.filter(
				product =>
					product.name.toLowerCase().includes(query.toLowerCase()) ||
					product.sku.toLowerCase().includes(query.toLowerCase())
			)
			setFilteredProducts(filtered)
		},
		[products]
	)

	// Refresh при загрузке экрана
	useEffect(() => {
		fetchProducts()
	}, [fetchProducts])

	return {
		products,
		filteredProducts,
		isLoading,
		searchQuery,
		setSearchQuery,
		searchProducts,
		fetchProducts,
		refreshProducts: fetchProducts
	}
}
