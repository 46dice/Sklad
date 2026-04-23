import { InvoiceCard } from '@/components/Contracts/InvoiceCard'
import { ShipmentCard } from '@/components/Contracts/ShipmentCard'
import { useInvoices } from '@/hooks/useInvoices'
import { useShipments } from '@/hooks/useShipments'
import { Input } from '@/shared/ui/Input'
import { Feather } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { FC, useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

type Props = {}

type FilterTab = 'shipments' | 'invoices'

const Documents: FC<Props> = () => {
	const router = useRouter()
	const { shipments, isLoading: shipmentsLoading, fetchShipments, deleteShipment, completeShipment } = useShipments()
	const { invoices, isLoading: invoicesLoading, fetchInvoices, deleteInvoice } = useInvoices()
	const [activeFilter, setActiveFilter] = useState<FilterTab>('shipments')
	const [searchQuery, setSearchQuery] = useState('')

	useFocusEffect(
		useCallback(() => {
			fetchShipments()
			fetchInvoices()
		}, [fetchShipments, fetchInvoices])
	)

	const handleAddShipment = () => {
		router.push('/app/(Contracts)/new')
	}

	const handleEditShipment = (id: string) => {
		router.push(`/app/(Contracts)/edit/${id}`)
	}

	const handleViewShipment = (id: string) => {
		router.push(`/app/(Contracts)/view/${id}`)
	}

	const handleDeleteShipment = async (id: string) => {
		Alert.alert(
			'Удалить акт?',
			'Вы уверены, что хотите удалить этот акт отгрузки?',
			[
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Удалить',
					onPress: async () => {
						await deleteShipment(id)
						fetchShipments()
					},
					style: 'destructive'
				}
			]
		)
	}

	const handleCompleteShipment = async (id: string) => {
		Alert.alert(
			'Завершить акт?',
			'Вы уверены, что хотите завершить этот акт отгрузки?',
			[
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Завершить',
					onPress: async () => {
						await completeShipment(id)
						fetchShipments()
					}
				}
			]
		)
	}

	const handleViewInvoice = (id: string) => {
		router.push(`/app/(Contracts)/invoice-view/${id}`)
	}

	const handleDeleteInvoice = async (id: string) => {
		Alert.alert(
			'Удалить счет?',
			'Вы уверены, что хотите удалить этот счет?',
			[
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Удалить',
					onPress: async () => {
						await deleteInvoice(id)
						fetchInvoices()
					},
					style: 'destructive'
				}
			]
		)
	}

	const isLoading = activeFilter === 'shipments' ? shipmentsLoading : invoicesLoading

	// Фильтруем документы по поисковому запросу
	const filteredShipments = useMemo(() => {
		if (!searchQuery.trim()) return shipments
		const query = searchQuery.toLowerCase()
		return shipments.filter(shipment =>
			shipment.clientName.toLowerCase().includes(query) ||
			shipment.clientInn.toLowerCase().includes(query)
		)
	}, [shipments, searchQuery])

	const filteredInvoices = useMemo(() => {
		if (!searchQuery.trim()) return invoices
		const query = searchQuery.toLowerCase()
		return invoices.filter(invoice =>
			invoice.clientName.toLowerCase().includes(query) ||
			invoice.clientInn.toLowerCase().includes(query)
		)
	}, [invoices, searchQuery])

	return (
		<ScrollView className='flex-1 bg-black' contentContainerStyle={{ padding: 16 }}>
			<View className='flex-row items-center justify-between mb-6'>
				<Text className='text-white text-2xl font-bold'>Документы</Text>
				<View className='flex-row gap-2'>
					{activeFilter === 'invoices' && (
						<TouchableOpacity
							onPress={() => router.push('/app/(Contracts)/invoice')}
							className='bg-primary w-10 h-10 rounded-full items-center justify-center'
						>
							<Feather name='file-text' size={20} color='white' />
						</TouchableOpacity>
					)}
					{activeFilter === 'shipments' && (
						<TouchableOpacity
							onPress={handleAddShipment}
							className='bg-primary w-10 h-10 rounded-full items-center justify-center'
						>
							<Feather name='plus' size={20} color='white' />
						</TouchableOpacity>
					)}
				</View>
			</View>

			{/* Filter Tabs */}
			<View className='flex-row gap-2 mb-4'>
				<TouchableOpacity
					onPress={() => setActiveFilter('shipments')}
					className={`flex-1 px-4 py-2 rounded-full ${activeFilter === 'shipments'
							? 'bg-primary'
							: 'bg-gray-default'
						}`}
				>
					<Text
						className={`text-sm font-semibold text-center ${activeFilter === 'shipments'
								? 'text-white'
								: 'text-gray-400'
							}`}
					>
						Акты
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setActiveFilter('invoices')}
					className={`flex-1 px-4 py-2 rounded-full ${activeFilter === 'invoices'
							? 'bg-primary'
							: 'bg-gray-default'
						}`}
				>
					<Text
						className={`text-sm font-semibold text-center ${activeFilter === 'invoices'
								? 'text-white'
								: 'text-gray-400'
							}`}
					>
						Счета
					</Text>
				</TouchableOpacity>
			</View>

			{/* Search */}
			<View className='mb-4'>
				<Input
					searchIcon
					placeholder='Поиск по актам и счетам'
					className='text-white'
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
			</View>

			{/* Content */}
			{isLoading ? (
				<View className='items-center justify-center py-12'>
					<ActivityIndicator size='large' color='#3B82F6' />
					<Text className='text-gray-400 mt-4'>Загрузка...</Text>
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
							<View className='items-center justify-center py-12'>
								<Feather name='file-text' size={48} color='#666' />
								<Text className='text-gray-500 mt-4'>
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
						<View className='items-center justify-center py-12'>
							<Feather name='file-text' size={48} color='#666' />
							<Text className='text-gray-500 mt-4'>
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
