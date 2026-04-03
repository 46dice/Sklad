import { ContractForm } from '@/components/Contracts/ContractForm'
import useContractStore from '@/components/Contracts/contract.model'
import { useProducts } from '@/components/Products/hooks/useProducts'
import { useClients } from '@/hooks/useClients'
import { useDocuments } from '@/hooks/useDocuments'
import { INewContractForm } from '@/shared/types/contracts.types'
import { useRouter } from 'expo-router'
import { FC, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

const NewContractModal: FC = () => {
	const router = useRouter()
	const { addContract } = useContractStore()
	const { clients, isLoading: clientsLoading } = useClients()
	const { products, isLoading: productsLoading } = useProducts()
	const { saveDocument } = useDocuments()
	const [isProcessing, setIsProcessing] = useState(false)

	const clientsForSelect = clients.map(client => ({
		id: client.id,
		name: client.name
	}))

	const handleCreateContract = async (formData: INewContractForm) => {
		setIsProcessing(true)
		try {
			// Сохраняем в Firebase
			const savedContract = await saveDocument(formData)

			if (savedContract) {
				// Добавляем в локальный store
				addContract(savedContract)
				router.back()
			}
		} catch (error) {
			console.error('Ошибка при создании договора:', error)
		} finally {
			setIsProcessing(false)
		}
	}

	if (clientsLoading || productsLoading || isProcessing) {
		return (
			<View className='flex-1 bg-black items-center justify-center'>
				<ActivityIndicator size='large' color='#3B82F6' />
				<Text className='text-white mt-4'>
					{isProcessing ? 'Сохранение договора...' : 'Загрузка данных...'}
				</Text>
			</View>
		)
	}

	return (
		<View className='flex-1 bg-black'>
			<ContractForm
				onSubmit={handleCreateContract}
				clients={clientsForSelect}
				products={products}
			/>
		</View>
	)
}

export default NewContractModal
