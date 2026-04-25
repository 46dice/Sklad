import { ProductMovements } from '@/components/Products/ProductMovements'
import { useProducts } from '@/components/Products/hooks/useProducts'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FC, useMemo } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

type Props = Record<string, never>

const ProductDetail: FC<Props> = () => {
	const { id } = useLocalSearchParams()
	const router = useRouter()
	const { products } = useProducts()
	const { colors } = useTheme()

	const product = useMemo(() => products.find(p => p.id === id), [products, id])

	if (!product) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
					<TouchableOpacity onPress={() => router.back()}>
						<Feather name='arrow-left' size={24} color={colors.text} />
					</TouchableOpacity>
					<Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginLeft: 16 }}>Товар</Text>
				</View>
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<Text style={{ color: colors.textSecondary }}>Товар не найден</Text>
				</View>
			</View>
		)
	}

	return (
		<ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
			{/* Header */}
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
				<TouchableOpacity onPress={() => router.back()}>
					<Feather name='arrow-left' size={24} color={colors.text} />
				</TouchableOpacity>
				<Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', flex: 1, marginLeft: 16 }}>
					{product.name}
				</Text>
			</View>

			{/* Product Info */}
			<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 16 }}>
				<View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
					<View style={{ flex: 1 }}>
						<Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>{product.name}</Text>
						<Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>SKU: {product.sku}</Text>
						{product.category && (
							<Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 4 }}>Категория: {product.category}</Text>
						)}
					</View>
					<View style={{ alignItems: 'flex-end' }}>
						<Text style={{ color: colors.primary, fontSize: 22, fontWeight: 'bold' }}>{product.price}₽</Text>
						<Text style={{ color: colors.textSecondary, fontSize: 14 }}>за единицу</Text>
					</View>
				</View>

				{product.description && (
					<View style={{ marginTop: 16 }}>
						<Text style={{ color: colors.text, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>Описание</Text>
						<Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20 }}>{product.description}</Text>
					</View>
				)}
			</View>

			{/* Product Movements */}
			<ProductMovements productId={product.id} productName={product.name} />

			{/* Actions */}
			<View style={{ gap: 12, marginTop: 24 }}>
				<TouchableOpacity
					onPress={() => alert('Функция редактирования будет добавлена позже')}
					style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
				>
					<Feather name='edit' size={20} color={colors.text} />
					<Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>Редактировать</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	)
}

export default ProductDetail
