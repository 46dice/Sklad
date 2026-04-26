import { useAuth } from '@/hooks/useAuth'
import { useShipments } from '@/hooks/useShipments'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { ISupplierInfo } from '@/shared/types/shipment.types'
import { exportShipmentToPDF } from '@/shared/utils/shipmentPDF'
import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FC, useMemo, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

const getStatusLabel = (status: string) => {
	const labels: Record<string, string> = { draft: 'Черновик', completed: 'Завершен' }
	return labels[status] || status
}

const getStatusColor = (status: string) => {
	switch (status) {
		case 'draft': return '#F59E0B'
		case 'completed': return '#10B981'
		default: return '#9CA3AF'
	}
}

const ShipmentView: FC = () => {
	const { id } = useLocalSearchParams()
	const router = useRouter()
	const { userProfile } = useAuth()
	const { shipments, completeShipment } = useShipments()
	const { colors } = useTheme()
	const [isCompleting, setIsCompleting] = useState(false)
	const [isExporting, setIsExporting] = useState(false)

	const shipment = useMemo(() => shipments.find(s => s.id === id), [id, shipments])

	const supplierInfo: ISupplierInfo = useMemo(() => ({
		name: userProfile?.supplierFullName || 'Поставщик',
		inn: userProfile?.supplierInn || '',
		address: userProfile?.supplierAddress || '',
		bankName: userProfile?.supplierBankName || 'Банк',
		bik: userProfile?.supplierBik || '',
		accountNumber: userProfile?.supplierAccountNumber || '',
		correspondentAccount: userProfile?.supplierCorrespondentAccount || ''
	}), [userProfile])

	if (!shipment) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
					<TouchableOpacity onPress={() => router.back()}>
						<Feather name='arrow-left' size={24} color={colors.text} />
					</TouchableOpacity>
					<Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginLeft: 16 }}>Акт отгрузки</Text>
				</View>
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<Text style={{ color: colors.textSecondary }}>Акт не найден</Text>
				</View>
			</View>
		)
	}

	const handleCompleteShipment = async () => {
		setIsCompleting(true)
		try {
			await completeShipment(shipment.id)
			router.back()
		} catch (error) {
			alert('Ошибка при завершении акта: ' + String(error))
		} finally {
			setIsCompleting(false)
		}
	}

	const handleExportPDF = async () => {
		setIsExporting(true)
		try {
			const success = await exportShipmentToPDF(shipment, supplierInfo)
			if (!success) alert('Ошибка при экспорте в PDF')
		} catch (error) {
			alert('Ошибка: ' + String(error))
		} finally {
			setIsExporting(false)
		}
	}

	const totalAmount = shipment.items.reduce((sum, item) => sum + item.totalAmount, 0)

	return (
		<ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
			{/* Header */}
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
				<TouchableOpacity onPress={() => router.back()}>
					<Feather name='arrow-left' size={24} color={colors.text} />
				</TouchableOpacity>
				<Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', flex: 1, marginLeft: 16 }}>
					{shipment.actNumber}
				</Text>
			</View>

			{/* Status */}
			<View style={{ marginBottom: 16 }}>
				<View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start', backgroundColor: getStatusColor(shipment.status) + '20' }}>
					<Text style={{ fontSize: 12, fontWeight: '600', color: getStatusColor(shipment.status) }}>
						{getStatusLabel(shipment.status)}
					</Text>
				</View>
			</View>

			{/* Info */}
			<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 16, gap: 12 }}>
				<View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
					<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Контрагент</Text>
					<Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{shipment.clientName}</Text>
					<Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>ИНН: {shipment.clientInn}</Text>
				</View>
				<View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
					<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Адрес</Text>
					<Text style={{ color: colors.text, fontSize: 14 }}>{shipment.clientAddress}</Text>
				</View>
				<View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
					<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Сумма</Text>
					<Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{totalAmount.toFixed(0)} ₽</Text>
				</View>
				<View>
					<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Дата создания</Text>
					<Text style={{ color: colors.text, fontSize: 14 }}>{new Date(shipment.createdAt).toLocaleDateString('ru-RU')}</Text>
				</View>
			</View>

			{/* Services */}
			{shipment.items && shipment.items.length > 0 ? (
				<View style={{ marginBottom: 16 }}>
					<Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Услуги в акте</Text>
					<View style={{ backgroundColor: colors.surface, borderRadius: 8, overflow: 'hidden' }}>
						{/* Заголовок */}
						<View style={{ flexDirection: 'row', backgroundColor: colors.border, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
							<View style={{ flex: 1 }}><Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>Услуга</Text></View>
							<View style={{ width: 64 }}><Text style={{ color: colors.text, fontWeight: '600', fontSize: 12, textAlign: 'right' }}>Кол-во</Text></View>
							<View style={{ width: 80 }}><Text style={{ color: colors.text, fontWeight: '600', fontSize: 12, textAlign: 'right' }}>Цена</Text></View>
							<View style={{ width: 80 }}><Text style={{ color: colors.text, fontWeight: '600', fontSize: 12, textAlign: 'right' }}>Сумма</Text></View>
						</View>
						{shipment.items.map((item, idx) => (
							<View key={idx} style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
								<View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 14 }}>{item.serviceName}</Text></View>
								<View style={{ width: 64 }}><Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'right' }}>{item.quantity}</Text></View>
								<View style={{ width: 80 }}><Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'right' }}>{item.price}₽</Text></View>
								<View style={{ width: 80 }}><Text style={{ color: colors.primary, fontSize: 14, textAlign: 'right', fontWeight: '600' }}>{item.totalAmount}₽</Text></View>
							</View>
						))}
						{/* Итого */}
						<View style={{ flexDirection: 'row', padding: 12, backgroundColor: colors.border }}>
							<View style={{ flex: 1 }} />
							<View style={{ width: 224, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
								<Text style={{ color: colors.text, fontWeight: '600' }}>Итого:</Text>
								<Text style={{ color: colors.primary, fontWeight: 'bold' }}>{totalAmount.toFixed(0)}₽</Text>
							</View>
						</View>
					</View>
				</View>
			) : (
				<View style={{ marginBottom: 16, backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
					<Text style={{ color: colors.textSecondary, fontSize: 14 }}>В акте нет услуг</Text>
				</View>
			)}

			{/* Notes */}
			{shipment.notes && (
				<View style={{ marginBottom: 16, backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
					<Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 8 }}>Примечания</Text>
					<Text style={{ color: colors.text, fontSize: 14 }}>{shipment.notes}</Text>
				</View>
			)}

			{/* Actions */}
			<View style={{ gap: 12 }}>
				<TouchableOpacity
					onPress={handleExportPDF}
					disabled={isExporting}
					style={{ padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: isExporting ? colors.textSecondary : '#2563eb' }}
				>
					<Feather name='download' size={20} color='white' />
					<Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>
						{isExporting ? 'Загрузка...' : 'Скачать PDF'}
					</Text>
				</TouchableOpacity>

				{shipment.status === 'draft' && (
					<TouchableOpacity
						onPress={handleCompleteShipment}
						disabled={isCompleting}
						style={{ padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: isCompleting ? colors.textSecondary : '#16a34a' }}
					>
						<Feather name='check-circle' size={20} color='white' />
						<Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>
							{isCompleting ? 'Завершение...' : 'Завершить акт'}
						</Text>
					</TouchableOpacity>
				)}

				{shipment.status === 'draft' && (
					<TouchableOpacity
						onPress={() => router.push(`/app/(Contracts)/edit/${shipment.id}`)}
						style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
					>
						<Feather name='edit' size={20} color='white' />
						<Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>Редактировать</Text>
					</TouchableOpacity>
				)}
			</View>
		</ScrollView>
	)
}

export default ShipmentView
