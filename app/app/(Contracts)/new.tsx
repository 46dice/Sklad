import { ShipmentForm } from '@/components/Contracts/ShipmentForm'
import { useProducts } from '@/components/Products/hooks/useProducts'
import { useClients } from '@/hooks/useClients'
import { useShipments } from '@/hooks/useShipments'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { INewShipmentForm } from '@/shared/types/shipment.types'
import { useRouter } from 'expo-router'
import { FC, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

const NewShipmentModal: FC = () => {
	const router = useRouter()
	const { colors } = useTheme()
	const { clients, isLoading: clientsLoading } = useClients()
	const { products, isLoading: productsLoading } = useProducts()
	const { saveShipment } = useShipments()
	const [isProcessing, setIsProcessing] = useState(false)

	const clientsForSelect = clients.map(client => ({
		id: client.id,
		name: client.name,
		inn: client.inn || '',
		address: client.actualAddress || client.legalAddress || ''
	}))

	// Преобразуем товары в услуги
	const servicesFromProducts = products.map(product => ({
		id: product.id || '',
		name: product.name,
		price: product.price
	}))

	const handleCreateShipment = async (formData: INewShipmentForm) => {
		setIsProcessing(true)
		try {
			const savedShipment = await saveShipment(formData)

			if (savedShipment) {
				router.back()
			}
		} catch (error) {
			console.error('Ошибка при создании акта:', error)
		} finally {
			setIsProcessing(false)
		}
	}

	if (clientsLoading || productsLoading || isProcessing) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
				<ActivityIndicator size='large' color={colors.primary} />
				<Text style={{ color: colors.text, marginTop: 16 }}>
					{isProcessing ? 'Сохранение акта...' : 'Загрузка данных...'}
				</Text>
			</View>
		)
	}

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<ShipmentForm
				onSubmit={handleCreateShipment}
				onBack={() => router.back()}
				clients={clientsForSelect}
				services={servicesFromProducts}
			/>
		</View>
	)
}

export default NewShipmentModal
