import { useAuth } from '@/hooks/useAuth'
import { useInvoices } from '@/hooks/useInvoices'
import { useShipments } from '@/hooks/useShipments'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { ISupplierInfo } from '@/shared/types/shipment.types'
import { exportInvoiceToPDF } from '@/shared/utils/invoicePDF'
import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FC, useMemo, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

const InvoiceView: FC = () => {
	const { id } = useLocalSearchParams()
	const router = useRouter()
	const { userProfile } = useAuth()
	const { invoices } = useInvoices()
	const { shipments } = useShipments()
	const { colors } = useTheme()
	const [isExporting, setIsExporting] = useState(false)

	const invoice = useMemo(() => invoices.find(i => i.id === id), [id, invoices])

	const relatedShipments = useMemo(() => {
		if (!invoice) return []
		return shipments.filter(s => invoice.shipmentIds.includes(s.id))
	}, [invoice, shipments])

	const supplierInfo: ISupplierInfo = useMemo(() => ({
		name: userProfile?.supplierFullName || 'Поставщик',
		inn: userProfile?.supplierInn || '',
		address: userProfile?.supplierAddress || '',
		bankName: userProfile?.supplierBankName || 'Банк',
		bik: userProfile?.supplierBik || '',
		accountNumber: userProfile?.supplierAccountNumber || '',
		correspondentAccount: userProfile?.supplierCorrespondentAccount || ''
	}), [userProfile])

	if (!invoice) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
					<TouchableOpacity onPress={() => router.back()}>
						<Feather name='arrow-left' size={24} color={colors.text} />
					</TouchableOpacity>
					<Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginLeft: 16 }}>Счет</Text>
				</View>
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<Text style={{ color: colors.textSecondary }}>Счет не найден</Text>
				</View>
			</View>
		)
	}

	const handleExportPDF = async () => {
		setIsExporting(true)
		try {
			const success = await exportInvoiceToPDF(invoice, relatedShipments, supplierInfo)
			if (!success) alert('Ошибка при экспорте в PDF')
		} catch (error) {
			alert('Ошибка: ' + String(error))
		} finally {
			setIsExporting(false)
		}
	}

	const periodFrom = new Date(invoice.periodFrom).toLocaleDateString('ru-RU')
	const periodTo = new Date(invoice.periodTo).toLocaleDateString('ru-RU')

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			{/* Header */}
			<View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
				<TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
					<Feather name='arrow-left' size={24} color={colors.text} />
					<Text style={{ color: colors.text, fontWeight: '600' }}>Назад</Text>
				</TouchableOpacity>
				<Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', flex: 1, marginLeft: 16 }}>
					{invoice.invoiceNumber}
				</Text>
			</View>

			<ScrollView contentContainerStyle={{ padding: 16 }}>
				{/* Info */}
				<View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 16, gap: 12 }}>
					<View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
						<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Контрагент</Text>
						<Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{invoice.clientName}</Text>
						<Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>ИНН: {invoice.clientInn}</Text>
					</View>
					<View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
						<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Адрес</Text>
						<Text style={{ color: colors.text, fontSize: 14 }}>{invoice.clientAddress}</Text>
					</View>
					<View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
						<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Период</Text>
						<Text style={{ color: colors.text, fontSize: 14 }}>{periodFrom} - {periodTo}</Text>
					</View>
					<View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
						<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Сумма</Text>
						<Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{invoice.totalAmount.toFixed(0)} ₽</Text>
					</View>
					<View>
						<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Всего услуг</Text>
						<Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>{invoice.totalQuantity} шт</Text>
					</View>
				</View>

				{/* Услуги */}
				{invoice.items && invoice.items.length > 0 ? (
					<View style={{ marginBottom: 16 }}>
						<Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Услуги в счете</Text>
						<View style={{ backgroundColor: colors.surface, borderRadius: 8, overflow: 'hidden' }}>
							<View style={{ flexDirection: 'row', backgroundColor: colors.border, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
								<View style={{ flex: 1 }}><Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>Услуга</Text></View>
								<View style={{ width: 64 }}><Text style={{ color: colors.text, fontWeight: '600', fontSize: 12, textAlign: 'right' }}>Кол-во</Text></View>
								<View style={{ width: 80 }}><Text style={{ color: colors.text, fontWeight: '600', fontSize: 12, textAlign: 'right' }}>Цена</Text></View>
								<View style={{ width: 80 }}><Text style={{ color: colors.text, fontWeight: '600', fontSize: 12, textAlign: 'right' }}>Сумма</Text></View>
							</View>
							{invoice.items.map((item, idx) => (
								<View key={idx} style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
									<View style={{ flex: 1 }}>
										<Text style={{ color: colors.text, fontSize: 14 }}>{item.serviceName}</Text>
										<Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.actNumber}</Text>
									</View>
									<View style={{ width: 64 }}><Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'right' }}>{item.quantity}</Text></View>
									<View style={{ width: 80 }}><Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'right' }}>{item.price}₽</Text></View>
									<View style={{ width: 80 }}><Text style={{ color: colors.primary, fontSize: 14, textAlign: 'right', fontWeight: '600' }}>{item.totalAmount}₽</Text></View>
								</View>
							))}
							<View style={{ flexDirection: 'row', padding: 12, backgroundColor: colors.border }}>
								<View style={{ flex: 1 }} />
								<View style={{ width: 224, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
									<Text style={{ color: colors.text, fontWeight: '600' }}>Итого:</Text>
									<Text style={{ color: colors.primary, fontWeight: 'bold' }}>{invoice.totalAmount.toFixed(0)}₽</Text>
								</View>
							</View>
						</View>
					</View>
				) : (
					<View style={{ marginBottom: 16, backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
						<Text style={{ color: colors.textSecondary, fontSize: 14 }}>В счете нет услуг</Text>
					</View>
				)}

				{/* Акты */}
				{relatedShipments.length > 0 && (
					<View style={{ marginBottom: 16 }}>
						<Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
							Приложенные акты ({relatedShipments.length})
						</Text>
						<View style={{ gap: 8 }}>
							{relatedShipments.map(shipment => (
								<View key={shipment.id} style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 12 }}>
									<Text style={{ color: colors.text, fontWeight: '600' }}>{shipment.actNumber}</Text>
									<Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
										{new Date(shipment.createdAt).toLocaleDateString('ru-RU')} • {shipment.totalAmount}₽
									</Text>
								</View>
							))}
						</View>
					</View>
				)}

				{/* Кнопки */}
				<View style={{ gap: 12 }}>
					<TouchableOpacity
						onPress={handleExportPDF}
						disabled={isExporting}
						style={{ padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: isExporting ? colors.textSecondary : '#2563eb' }}
					>
						<Feather name='download' size={20} color='white' />
						<Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>
							{isExporting ? 'Загрузка...' : 'Скачать PDF со счетом и актами'}
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	)
}

export default InvoiceView
