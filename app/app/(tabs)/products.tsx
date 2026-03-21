import AddNewProduct from '@/components/Products/AddNewProduct/AddNewProduct'
import ProductList from '@/components/Products/ProductList'
import { useNewProduct } from '@/components/Products/hooks/useNewProduct'
import { useProducts } from '@/components/Products/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { INewProductForm } from '@/shared/types/products.types'
import { Input } from '@/shared/ui/Input'
import { useFocusEffect } from '@react-navigation/native'
import { FC, useCallback } from 'react'
import {
    Alert,
    View
} from 'react-native'

type Props = {}

const Products: FC<Props> = () => {
	const { filteredProducts, isLoading, searchProducts, searchQuery, refreshProducts } = useProducts()
	const { fetchDeleteProduct } = useNewProduct()
	const { user } = useAuth()

	useFocusEffect(
		useCallback(() => {
			refreshProducts()
		}, [refreshProducts])
	)

	const handleDelete = (product: INewProductForm & { id: string }) => {
		Alert.alert(
			'Удалить товар?',
			`Вы уверены, что хотите удалить товар "${product.name}"?`,
			[
				{
					text: 'Отмена',
					onPress: () => {},
					style: 'cancel'
				},
				{
					text: 'Удалить',
					onPress: async () => {
						if (user) {
							await fetchDeleteProduct(user.uid, product.id)
							refreshProducts()
						}
					},
					style: 'destructive'
				}
			]
		)
	}

	return (
		<View className='flex-1'>
			<View className='ml-auto flex-row gap-4 p-4'>
				<AddNewProduct />
			</View>
			<View className='px-4 mb-4'>
				<Input
					searchIcon
					placeholder='Поиск по товарам'
					className='text-white'
					value={searchQuery}
					onChangeText={searchProducts}
				/>
			</View>
			<View className='flex-1'>
				<ProductList
					products={filteredProducts}
					isLoading={isLoading}
					onEdit={() => {}} // Логика редактирования в самом ProductList
					onDelete={handleDelete}
				/>
			</View>
		</View>
	)
}
export default Products