import useContractStore from '@/components/Contracts/contract.model'
import { useDocuments } from '@/hooks/useDocuments'
import { ContractStatus } from '@/shared/types/contracts.types'
import { exportContractToPDF } from '@/shared/utils/contractPDF'
import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FC, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

type Props = {}

const getStatusLabel = (status: ContractStatus) => {
	const labels: Record<ContractStatus, string> = {
		draft: 'Черновик',
		active: 'Активный'
	}
	return labels[status]
}

const getStatusColor = (status: ContractStatus) => {
	switch (status) {
		case 'draft':
			return '#F59E0B'
		case 'active':
			return '#10B981'
		default:
			return '#9CA3AF'
	}
}

const generateContractContent = (contract: any) => {
	const currentDate = new Date().toLocaleDateString('ru-RU')
	return `ДОГОВОР ОБ ОКАЗАНИИ УСЛУГ ФУЛФИЛМЕНТА

Договор №: ${contract.contractNumber}
Дата заключения: ${currentDate}

1. СТОРОНЫ ДОГОВОРА

1.1 EXPRESS STOREHOUSE, юридическое лицо, именуемое в дальнейшем "ИСПОЛНИТЕЛЬ"

1.2 ${contract.clientName}, именуемое в дальнейшем "ЗАКАЗЧИК"

2. ПРЕДМЕТ ДОГОВОРА

2.1 Исполнитель обязуется оказывать услуги фулфилмента, включающие:
- Прием, хранение и управление товарно-материальными ценностями
- Обработка и упаковка заказов
- Организация отправки товаров конечным покупателям
- Ведение учета остатков товара

3. СТОИМОСТЬ УСЛУГ

3.1 Стоимость услуг: ${contract.terms.price.toLocaleString()} ${contract.terms.currency}

4. УСЛОВИЯ ОПЛАТЫ

4.1 ${contract.terms.paymentTerms}
4.2 Счета выставляются ежемесячно на основании актов выполненных работ

5. МЕСТО ИСПОЛНЕНИЯ

5.1 Услуги исполняются по адресу складского помещения Исполнителя

6. СРОКИ ИСПОЛНЕНИЯ

6.1 ${contract.terms.deliveryTerms}

7. КОНФИДЕНЦИАЛЬНОСТЬ

7.1 Стороны обязуются не разглашать конфиденциальную информацию друг друга третьим лицам без письменного согласия.

8. ОТВЕТСТВЕННОСТЬ

8.1 Исполнитель несет ответственность за сохранность товара, находящегося на складе.
8.2 Максимальный размер ответственности не превышает стоимость услуг, оказанных в течение одного месяца.

9. СРОК ДЕЙСТВИЯ

9.1 Данный договор действует с ${contract.terms.validFrom} по ${contract.terms.validUntil}.

10. РАСТОРЖЕНИЕ ДОГОВОРА

10.1 Договор может быть расторгнут любой стороной с письменным уведомлением за 30 дней до предполагаемой даты расторжения.

11. ИНЫЕ УСЛОВИЯ

11.1 Все дополнительные условия обсуждаются и согласовываются в письменном виде.

ДОГОВОР ВСТУПАЕТ В СИЛУ С МОМЕНТА ПОДПИСАНИЯ.`
}

const ContractView: FC<Props> = () => {
	const { id } = useLocalSearchParams()
	const router = useRouter()
	const { getContract, updateContract } = useContractStore()
	const { updateDocument } = useDocuments()
	const [isExporting, setIsExporting] = useState(false)
	const [isActivating, setIsActivating] = useState(false)

	const contract = getContract(id as string)

	if (!contract) {
		return (
			<View className='flex-1 bg-black items-center justify-center'>
				<Text className='text-gray-400'>Договор не найден</Text>
			</View>
		)
	}

	const handleExportPDF = async () => {
		setIsExporting(true)
		try {
			const success = await exportContractToPDF(contract)
			if (!success) {
				alert('Ошибка при экспорте в PDF')
			}
		} catch (error) {
			alert('Ошибка: ' + String(error))
		} finally {
			setIsExporting(false)
		}
	}

	const handleActivateContract = async () => {
		setIsActivating(true)
		try {
			const success = await updateDocument(contract.id, {
				status: 'active'
			})

			if (success) {
				updateContract(contract.id, {
					status: 'active'
				})
			}
		} catch (error) {
			alert('Ошибка при активации: ' + String(error))
		} finally {
			setIsActivating(false)
		}
	}

	const contractContent = generateContractContent(contract)

	return (
		<ScrollView className='flex-1 bg-black' contentContainerStyle={{ padding: 16 }}>
			{/* Header */}
			<View className='flex-row items-center justify-between mb-6'>
				<TouchableOpacity onPress={() => router.back()}>
					<Feather name='arrow-left' size={24} color='white' />
				</TouchableOpacity>
				<Text className='text-white text-xl font-bold flex-1 ml-4'>
					{contract.contractNumber}
				</Text>
			</View>

			{/* Status Badge */}
			<View className='mb-4'>
				<View
					className='px-3 py-1 rounded-full self-start'
					style={{ backgroundColor: getStatusColor(contract.status) + '20' }}
				>
					<Text
						className='text-xs font-semibold'
						style={{ color: getStatusColor(contract.status) }}
					>
						{getStatusLabel(contract.status)}
					</Text>
				</View>
			</View>

			{/* Contract Info */}
			<View className='bg-gray-default rounded-lg p-4 mb-4 gap-3'>
				<View className='pb-3 border-b border-gray-600'>
					<Text className='text-gray-400 text-sm'>Клиент</Text>
					<Text className='text-white font-semibold text-base'>{contract.clientName}</Text>
				</View>

				<View className='pb-3 border-b border-gray-600'>
					<Text className='text-gray-400 text-sm'>Сумма</Text>
					<Text className='text-white font-semibold text-base'>
						{contract.terms.price.toLocaleString()} {contract.terms.currency}
					</Text>
				</View>

				<View className='pb-3 border-b border-gray-600'>
					<Text className='text-gray-400 text-sm'>Действителен</Text>
					<Text className='text-white text-sm'>
						с {new Date(contract.terms.validFrom).toLocaleDateString('ru-RU')} по{' '}
						{new Date(contract.terms.validUntil).toLocaleDateString('ru-RU')}
					</Text>
				</View>

				<View>
					<Text className='text-gray-400 text-sm'>Условия оплаты</Text>
					<Text className='text-white text-sm'>{contract.terms.paymentTerms}</Text>
				</View>
			</View>

			{/* Contract Content */}
			<Text className='text-white text-lg font-bold mb-3'>Содержание договора</Text>
			<View className='bg-gray-default rounded-lg p-4 mb-4'>
				<Text className='text-gray-300 text-sm leading-6'>
					{contractContent}
				</Text>
			</View>

			{/* Actions */}
			<View className='gap-3'>
				{contract.status === 'draft' && (
					<TouchableOpacity
						onPress={handleActivateContract}
						disabled={isActivating}
						className={`p-3 rounded-lg flex-row items-center justify-center ${
							isActivating ? 'bg-gray-600' : 'bg-green-600'
						}`}
					>
						<Feather name='check-circle' size={20} color='white' />
						<Text className='text-white font-bold ml-2'>
							{isActivating ? 'Активация...' : 'Сделать активным'}
						</Text>
					</TouchableOpacity>
				)}

				<TouchableOpacity
					onPress={handleExportPDF}
					disabled={isExporting}
					className={`p-3 rounded-lg flex-row items-center justify-center ${
						isExporting ? 'bg-gray-600' : 'bg-blue-600'
					}`}
				>
					<Feather name='download' size={20} color='white' />
					<Text className='text-white font-bold ml-2'>
						{isExporting ? 'Загрузка...' : 'Скачать PDF'}
					</Text>
				</TouchableOpacity>

				{contract.status === 'draft' && (
					<TouchableOpacity
						onPress={() => router.push(`/app/(Contracts)/edit/${contract.id}`)}
						className='bg-primary p-3 rounded-lg flex-row items-center justify-center'
					>
						<Feather name='edit' size={20} color='white' />
						<Text className='text-white font-bold ml-2'>Редактировать</Text>
					</TouchableOpacity>
				)}
			</View>
		</ScrollView>
	)
}

export default ContractView
