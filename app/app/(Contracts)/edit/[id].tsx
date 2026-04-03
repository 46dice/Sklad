import { ContractForm } from '@/components/Contracts/ContractForm'
import useContractStore from '@/components/Contracts/contract.model'
import { useClients } from '@/hooks/useClients'
import { useDocuments } from '@/hooks/useDocuments'
import { INewContractForm } from '@/shared/types/contracts.types'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FC, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

const EditContractModal: FC = () => {
	const { id } = useLocalSearchParams()
	const router = useRouter()
	const { getContract, updateContract } = useContractStore()
	const { clients, isLoading: clientsLoading } = useClients()
	const { updateDocument } = useDocuments()
	const [isProcessing, setIsProcessing] = useState(false)

	const contract = getContract(id as string)

	const clientsForSelect = clients.map(client => ({
		id: client.id,
		name: client.name
	}))

	if (!contract) {
		return (
			<View className='flex-1 bg-black items-center justify-center'>
				<Text className='text-gray-400'>Договор не найден</Text>
			</View>
		)
	}

	const initialFormData: INewContractForm = {
		clientId: contract.clientId,
		clientName: contract.clientName,
		contractNumber: contract.contractNumber,
		description: contract.description,
		paymentTerms: contract.terms.paymentTerms,
		deliveryTerms: contract.terms.deliveryTerms,
		price: contract.terms.price,
		validFrom: contract.terms.validFrom,
		validUntil: contract.terms.validUntil,
		currency: contract.terms.currency
	}

	const handleUpdateContract = async (formData: INewContractForm) => {
		setIsProcessing(true)
		try {
			// Обновляем в Firebase
			const success = await updateDocument(contract.id, {
				contractNumber: formData.contractNumber,
				clientId: formData.clientId,
				clientName: formData.clientName,
				description: formData.description,
				terms: {
					paymentTerms: formData.paymentTerms,
					deliveryTerms: formData.deliveryTerms,
					price: formData.price,
					validFrom: formData.validFrom,
					validUntil: formData.validUntil,
					currency: formData.currency
				}
			})

			if (success) {
				// Обновляем локальный store
				updateContract(contract.id, {
					contractNumber: formData.contractNumber,
					clientId: formData.clientId,
					clientName: formData.clientName,
					description: formData.description,
					terms: {
						paymentTerms: formData.paymentTerms,
						deliveryTerms: formData.deliveryTerms,
						price: formData.price,
						validFrom: formData.validFrom,
						validUntil: formData.validUntil,
						currency: formData.currency
					}
				})
				router.back()
			}
		} catch (error) {
			console.error('Ошибка при обновлении договора:', error)
		} finally {
			setIsProcessing(false)
		}
	}

	if (clientsLoading || isProcessing) {
		return (
			<View className='flex-1 bg-black items-center justify-center'>
				<ActivityIndicator size='large' color='#3B82F6' />
				<Text className='text-white mt-4'>
					{isProcessing ? 'Сохранение договора...' : 'Загрузка клиентов...'}
				</Text>
			</View>
		)
	}

	return (
		<View className='flex-1 bg-black'>
			<ContractForm
				initialData={initialFormData}
				onSubmit={handleUpdateContract}
				clients={clientsForSelect}
			/>
		</View>
	)
}

export default EditContractModal
