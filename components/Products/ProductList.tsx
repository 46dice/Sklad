import { useTheme } from '@/providers/theme/ThemeProvider'
import { INewProductForm } from '@/shared/types/products.types'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { FlatList, Pressable, Text, View } from 'react-native'
import useProductStore from './product.model'

interface ProductListProps {
	products: (INewProductForm & { id?: string })[]
	isLoading: boolean
	onEdit: (product: INewProductForm & { id: string }) => void
	onDelete: (product: INewProductForm & { id: string }) => void
}

export default function ProductList({
	products,
	isLoading,
	onEdit,
	onDelete
}: ProductListProps) {
	const router = useRouter()
	const { setEditingProductId, updateFormState } = useProductStore()
	const { colors } = useTheme()

	const handleEditPress = (product: INewProductForm & { id: string }) => {
		setEditingProductId(product.id)
		updateFormState(product)
		router.push('/app/(NewProduct)/modal')
	}

	const handleQuickSale = (product: INewProductForm & { id: string }) => {
		router.push({
			pathname: '/app/(QuickSale)/modal',
			params: { product: JSON.stringify(product) }
		})
	}

	if (isLoading) {
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<Text style={{ color: colors.text }}>Загрузка товаров...</Text>
			</View>
		)
	}

	if (products.length === 0) {
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<Feather name='inbox' size={48} color={colors.textSecondary} />
				<Text style={{ color: colors.textSecondary, marginTop: 16 }}>Нет товаров</Text>
				<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Добавьте первый товар</Text>
			</View>
		)
	}

	return (
		<FlatList
			data={products}
			keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
			renderItem={({ item }) => (
				<View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 16 }}>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
						<View style={{ flex: 1 }}>
							<Text style={{ color: colors.text, fontWeight: '600', marginBottom: 4 }}>{item.name}</Text>
							<Text style={{ color: colors.textSecondary, fontSize: 14 }}>SKU: {item.sku}</Text>
						</View>
						<Text style={{ color: colors.primary, fontWeight: 'bold' }}>{item.price} ₽</Text>
					</View>

					{item.description && (
						<Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 12 }}>{item.description}</Text>
					)}
					<View style={{ flexDirection: 'row', gap: 8 }}>
						<Pressable
							onPress={() => item.id && router.push(`/app/product/${item.id}`)}
							style={{ backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}
						>
							<Feather name='eye' size={14} color='white' />
							<Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Подробнее</Text>
						</Pressable>
						<Pressable
							onPress={() => item.id && handleEditPress({ ...item, id: item.id })}
							style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
						>
							<Feather name='edit-2' size={16} color='white' />
							<Text style={{ color: 'white', fontWeight: '600' }}>Изменить</Text>
						</Pressable>
						<Pressable
							onPress={() => item.id && onDelete({ ...item, id: item.id })}
							style={{ flex: 1, backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
						>
							<Feather name='trash-2' size={16} color='white' />
							<Text style={{ color: 'white', fontWeight: '600' }}>Удалить</Text>
						</Pressable>
					</View>
				</View>
			)}
			scrollEnabled={true}
			contentContainerStyle={{ flexGrow: 1 }}
		/>
	)
}
