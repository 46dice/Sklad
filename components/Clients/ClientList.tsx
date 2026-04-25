import { useTheme } from '@/providers/theme/ThemeProvider'
import { INewClientForm } from '@/shared/types/clients.types'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { FlatList, Pressable, Text, View } from 'react-native'

interface ClientListProps {
	clients: (INewClientForm & { id?: string })[]
	isLoading: boolean
}

export default function ClientList({ clients, isLoading }: ClientListProps) {
	const router = useRouter()
	const { colors } = useTheme()

	if (isLoading) {
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<Text style={{ color: colors.text }}>Загрузка клиентов...</Text>
			</View>
		)
	}

	if (clients.length === 0) {
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<Feather name='inbox' size={48} color={colors.textSecondary} />
				<Text style={{ color: colors.textSecondary, marginTop: 16 }}>Нет клиентов</Text>
				<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Добавьте первого клиента</Text>
			</View>
		)
	}

	return (
		<FlatList
			data={clients}
			keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
			renderItem={({ item }) => (
				<Pressable
					onPress={() => router.push(`/app/agent/${item.id}`)}
					style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
				>
					<View style={{ flex: 1 }}>
						<Text style={{ color: colors.text, fontWeight: '600', marginBottom: 4 }}>{item.name}</Text>
						<View style={{ gap: 4 }}>
							{item.phone && (
								<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Номер телефона: {item.phone}</Text>
							)}
							{item.inn && (
								<Text style={{ color: colors.textSecondary, fontSize: 14 }}>ИНН: {item.inn}</Text>
							)}
							{item.email && (
								<Text style={{ color: colors.textSecondary, fontSize: 14 }}>{item.email}</Text>
							)}
						</View>
					</View>
					<Feather name='chevron-right' size={20} color={colors.textSecondary} />
				</Pressable>
			)}
			scrollEnabled={true}
			contentContainerStyle={{ flexGrow: 1 }}
		/>
	)
}
