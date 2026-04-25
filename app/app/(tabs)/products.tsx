import AddNewProduct from '@/components/Products/AddNewProduct/AddNewProduct'
import ProductList from '@/components/Products/ProductList'
import { useNewProduct } from '@/components/Products/hooks/useNewProduct'
import { useProducts } from '@/components/Products/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { INewProductForm } from '@/shared/types/products.types'
import { Input } from '@/shared/ui/Input'
import { useFocusEffect } from '@react-navigation/native'
import { FC, useCallback } from 'react'
import { Alert, Text, View } from 'react-native'

type Props = {}

const Products: FC<Props> = () => {
	const { filteredProducts, isLoading, searchProducts, searchQuery, refreshProducts } = useProducts()
	const { fetchDeleteProduct } = useNewProduct()
	const { user } = useAuth()
	const { colors } = useTheme()

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
				{ text: 'Отмена', onPress: () => {}, style: 'cancel' },
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
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
				<Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>Услуги</Text>
				<AddNewProduct />
			</View>
			<View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
				<Input
					searchIcon
					placeholder='Поиск по товарам'
					value={searchQuery}
					onChangeText={searchProducts}
				/>
			</View>
			<View style={{ flex: 1 }}>
				<ProductList
					products={filteredProducts}
					isLoading={isLoading}
					onEdit={() => {}}
					onDelete={handleDelete}
				/>
			</View>
		</View>
	)
}
export default Products