import { ContractCard } from '@/components/Contracts/ContractCard'
import { useDocuments } from '@/hooks/useDocuments'
import { Feather } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { FC, useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'

type Props = {}

type FilterTab = 'all' | 'active' | 'draft'

const Documents: FC<Props> = () => {
	const router = useRouter()
	const { contracts, isLoading, fetchDocuments, deleteDocument } = useDocuments()
	const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

	useFocusEffect(
		useCallback(() => {
			fetchDocuments()
		}, [fetchDocuments])
	)

	const filteredContracts = contracts.filter(contract => {
		if (activeFilter === 'all') return true
		if (activeFilter === 'active') return contract.status === 'active'
		if (activeFilter === 'draft') return contract.status === 'draft'
		return true
	})

	const handleAddContract = () => {
		router.push('/app/(Contracts)/new')
	}

	const handleEditContract = (id: string) => {
		router.push(`/app/(Contracts)/edit/${id}`)
	}

	const handleViewContract = (id: string) => {
		router.push(`/app/(Contracts)/view/${id}`)
	}

	const handleDeleteContract = async (id: string) => {
		await deleteDocument(id)
	}

	const filterTabs: Array<{ label: string; value: FilterTab }> = [
		{ label: 'Все', value: 'all' },
		{ label: 'Активные', value: 'active' },
		{ label: 'Черновики', value: 'draft' }
	]

	return (
		<ScrollView className='flex-1 bg-black' contentContainerStyle={{ padding: 16 }}>
			<View className='flex-row items-center justify-between mb-6'>
				<Text className='text-white text-2xl font-bold'>Договоры</Text>
				<TouchableOpacity
					onPress={handleAddContract}
					className='bg-primary w-10 h-10 rounded-full items-center justify-center'
				>
					<Feather name='plus' size={20} color='white' />
				</TouchableOpacity>
			</View>

			{/* Filter Tabs */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className='mb-4'
				contentContainerStyle={{ gap: 8 }}
			>
				{filterTabs.map(tab => (
					<TouchableOpacity
						key={tab.value}
						onPress={() => setActiveFilter(tab.value)}
						className={`px-4 py-2 rounded-full ${
							activeFilter === tab.value
								? 'bg-primary'
								: 'bg-gray-default'
						}`}
					>
						<Text
							className={`text-sm font-semibold ${
								activeFilter === tab.value
									? 'text-white'
									: 'text-gray-400'
							}`}
						>
							{tab.label}
						</Text>
					</TouchableOpacity>
				))}
			</ScrollView>

			{/* Contracts List */}
			{isLoading ? (
				<View className='items-center justify-center py-12'>
					<ActivityIndicator size='large' color='#3B82F6' />
					<Text className='text-gray-400 mt-4'>Загрузка договоров...</Text>
				</View>
			) : (
				<View>
					{filteredContracts.length > 0 ? (
						filteredContracts.map(contract => (
							<ContractCard
								key={contract.id}
								contract={contract}
								onPress={() => handleViewContract(contract.id)}
								onEdit={() => handleEditContract(contract.id)}
								onDelete={() => handleDeleteContract(contract.id)}
							/>
						))
					) : (
						<View className='items-center justify-center py-12'>
							<Feather name='file-text' size={48} color='#666' />
							<Text className='text-gray-500 mt-4'>
								{activeFilter === 'all'
									? 'Нет договоров'
									: `Нет ${filterTabs.find(t => t.value === activeFilter)?.label.toLowerCase()}`}
							</Text>
						</View>
					)}
				</View>
			)}
		</ScrollView>
	)
}

export default Documents
