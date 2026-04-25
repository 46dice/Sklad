import { InvoiceCard } from '@/components/Contracts/InvoiceCard'
import { ShipmentCard } from '@/components/Contracts/ShipmentCard'
import { useInvoices } from '@/hooks/useInvoices'
import { useShipments } from '@/hooks/useShipments'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { Input } from '@/shared/ui/Input'
import { Feather } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { FC, useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'

type Props = {}

type FilterTab = 'shipments' | 'invoices'

const Documents: FC<Props> = () => {
	const router = useRouter()
	const { shipments, isLoading: shipmentsLoading, fetchShipments, deleteShipment, completeShipment } = useShipments()
	const { invoices, isLoading: invoicesLoading, fetchInvoices, deleteInvoice } = useInvoices()
	const [activeFilter, setActiveFilter] = useState<FilterTab>('shipments')
	const [searchQuery, setSearchQuery] = useState('')
	const { colors } = useTheme()

	useFocusEffect(
		useCallback(() => {
			fetchShipments()
			fetchInvoices()
		}, [fetchShipments, fetchInvoices])
	)

	const handleAddShipment = () => { router.push('/app/(Contracts)/new') }
	const handleEditShipment = (id: string) => { router.push(`/app/(Contracts)/edit/${id}`) }
	const handleViewShipment = (id: string) => { router.push(`/app/(Contracts)/view/${id}`) }

	const handleDeleteShipment = async (id: string) => {
		Alert.alert('Удалить акт?', 'Вы уверены, что хотите удалить этот акт отгрузки?', [
			{ text: 'Отмена', style: 'cancel' },
			{ text: 'Удалить', onPress: async () => { await deleteShipment(id); fetchShipments() }, style: 'destructive' }
		])
	}

	const handleCompleteShipment = async (id: string) => {
		Alert.alert('Завершить акт?', 'Вы уверены, что хотите завершить этот акт отгрузки?', [
			{ text: 'Отмена', style: 'cancel' },
			{ text: 'Завершить', onPress: async () => { await completeShipment(id); fetchShipments() } }
		])
	}

	const handleViewInvoice = (id: string) => { router.push(`/app/(Contracts)/invoice-view/${id}`) }

	const handleDeleteInvoice = async (id: string) => {
		Alert.alert('Удалить счет?', 'Вы уверены, что хотите удалить этот счет?', [
			{ text: 'Отмена', style: 'cancel' },
			{ text: 'Удалить', onPress: async () => { await deleteInvoice(id); fetchInvoices() }, style: 'destructive' }
		])
	}

	const isLoading = activeFilter === 'shipments' ? shipmentsLoading : invoicesLoading

	const filteredShipments = useMemo(() => {
		if (!searchQuery.trim()) return shipments
		const query = searchQuery.toLowerCase()
		return shipments.filter(s => s.clientName.toLowerCase().includes(query) || s.clientInn.toLowerCase().includes(query))
	}, [shipments, searchQuery])

	const filteredInvoices = useMemo(() => {
		if (!searchQuery.trim()) return invoices
		const query = searchQuery.toLowerCase()
		return invoices.filter(i => i.clientName.toLowerCase().includes(query) || i.clientInn.toLowerCase().includes(query))
	}, [invoices, searchQuery])

	return (
		<ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
				<Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>Документы</Text>
				<View style={{ flexDirection: 'row', gap: 8 }}>
					{activeFilter === 'invoices' && (
						<TouchableOpacity
							onPress={() => router.push('/app/(Contracts)/invoice')}
							style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
						>
							<Feather name='file-text' size={20} color='white' />
						</TouchableOpacity>
					)}
					{activeFilter === 'shipments' && (
						<TouchableOpacity
							onPress={handleAddShipment}
							style={{ backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
						>
							<Feather name='plus' size={20} color='white' />
						</TouchableOpacity>
					)}
				</View>
			</View>

			{/* Filter Tabs */}
			<View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
				<TouchableOpacity
					onPress={() => setActiveFilter('shipments')}
					style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: activeFilter === 'shipments' ? colors.primary : colors.surface }}
				>
					<Text style={{ fontSize: 14, fontWeight: '600', textAlign: 'center', color: activeFilter === 'shipments' ? '#FFFFFF' : colors.textSecondary }}>
						Акты
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setActiveFilter('invoices')}
					style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: activeFilter === 'invoices' ? colors.primary : colors.surface }}
				>
					<Text style={{ fontSize: 14, fontWeight: '600', textAlign: 'center', color: activeFilter === 'invoices' ? '#FFFFFF' : colors.textSecondary }}>
						Счета
					</Text>
				</TouchableOpacity>
			</View>

			{/* Search */}
			<View style={{ marginBottom: 16 }}>
				<Input
					searchIcon
					placeholder='Поиск по актам и счетам'
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
			</View>

			{/* Content */}
			{isLoading ? (
				<View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
					<ActivityIndicator size='large' color={colors.primary} />
					<Text style={{ color: colors.textSecondary, marginTop: 16 }}>Загрузка...</Text>
				</View>
			) : (
				<View>
					{activeFilter === 'shipments' ? (
						filteredShipments.length > 0 ? (
							filteredShipments.map(shipment => (
								<ShipmentCard
									key={shipment.id}
									shipment={shipment}
									onPress={() => handleViewShipment(shipment.id)}
									onEdit={() => handleEditShipment(shipment.id)}
									onDelete={() => handleDeleteShipment(shipment.id)}
									onComplete={() => handleCompleteShipment(shipment.id)}
								/>
							))
						) : (
							<View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
								<Feather name='file-text' size={48} color={colors.textSecondary} />
								<Text style={{ color: colors.textSecondary, marginTop: 16 }}>
									{searchQuery ? 'Документы не найдены' : 'Нет актов отгрузки'}
								</Text>
							</View>
						)
					) : filteredInvoices.length > 0 ? (
						filteredInvoices.map(invoice => (
							<InvoiceCard
								key={invoice.id}
								invoice={invoice}
								onPress={() => handleViewInvoice(invoice.id)}
								onDelete={() => handleDeleteInvoice(invoice.id)}
							/>
						))
					) : (
						<View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
							<Feather name='file-text' size={48} color={colors.textSecondary} />
							<Text style={{ color: colors.textSecondary, marginTop: 16 }}>
								{searchQuery ? 'Документы не найдены' : 'Нет счетов'}
							</Text>
						</View>
					)}
				</View>
			)}
		</ScrollView>
	)
}

export default Documents
