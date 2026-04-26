import { InvoiceForm } from '@/components/Contracts/InvoiceForm'
import { useClients } from '@/hooks/useClients'
import { useInvoices } from '@/hooks/useInvoices'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { INewInvoiceForm } from '@/shared/types/invoice.types'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { FC, useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

const NewInvoiceModal: FC = () => {
	const router = useRouter()
	const { colors } = useTheme()
	const { clients, isLoading: clientsLoading } = useClients()
	const { saveInvoice } = useInvoices()
	const [isProcessing, setIsProcessing] = useState(false)
	const [invoicePeriodFrom, setInvoicePeriodFrom] = useState(
		new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
	)
	const [invoicePeriodTo, setInvoicePeriodTo] = useState(new Date().toISOString().split('T')[0])
	const [invoiceClientId, setInvoiceClientId] = useState('')
	const [invoiceClientName, setInvoiceClientName] = useState('')
	const [invoiceClientInn, setInvoiceClientInn] = useState('')
	const [invoiceClientAddress, setInvoiceClientAddress] = useState('')

	const clientsForSelect = clients.map((client: any) => ({
		id: client.id,
		name: client.name,
		inn: client.inn || '',
		address: client.actualAddress || client.legalAddress || ''
	}))

	const handleCreateInvoice = async (formData: INewInvoiceForm) => {
		setIsProcessing(true)
		try {
			const savedInvoice = await saveInvoice(formData)
			if (savedInvoice) router.back()
		} catch (error) {
			console.error('Ошибка при создании счета:', error)
		} finally {
			setIsProcessing(false)
		}
	}

	if (clientsLoading || isProcessing) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
				<ActivityIndicator size='large' color={colors.primary} />
				<Text style={{ color: colors.text, marginTop: 16 }}>
					{isProcessing ? 'Создание счета...' : 'Загрузка данных...'}
				</Text>
			</View>
		)
	}

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
				<TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
					<Feather name='arrow-left' size={24} color={colors.text} />
					<Text style={{ color: colors.text, fontWeight: '600' }}>Назад</Text>
				</TouchableOpacity>
				<Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', flex: 1, marginLeft: 16 }}>Новый счет</Text>
			</View>

			<InvoiceForm
				onSubmit={handleCreateInvoice}
				clients={clientsForSelect}
				initialPeriodFrom={invoicePeriodFrom}
				initialPeriodTo={invoicePeriodTo}
				onPeriodsChange={(from, to) => { setInvoicePeriodFrom(from); setInvoicePeriodTo(to) }}
				initialClientId={invoiceClientId}
				initialClientName={invoiceClientName}
				initialClientInn={invoiceClientInn}
				initialClientAddress={invoiceClientAddress}
				onClientChange={(id, name, inn, address) => {
					setInvoiceClientId(id); setInvoiceClientName(name)
					setInvoiceClientInn(inn); setInvoiceClientAddress(address)
				}}
			/>
		</View>
	)
}

export default NewInvoiceModal
