import { useDocuments } from '@/hooks/useDocuments'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { FC } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

type Props = {
	showViewDetailsButton?: boolean
}

export const ContractStats: FC<Props> = ({ showViewDetailsButton = true }) => {
	const { contracts } = useDocuments()
	const router = useRouter()
	const { colors } = useTheme()

	const activeContracts = contracts.filter(c => c.status === 'active')
	const draftContracts = contracts.filter(c => c.status === 'draft')
	const expiringSoon = contracts.filter(c => {
		const now = new Date()
		const validUntil = new Date(c.terms.validUntil)
		const daysLeft = Math.floor((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
		return daysLeft > 0 && daysLeft <= 30
	})

	return (
		<View style={{ gap: 12 }}>
			<View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
				<View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
						<View>
							<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Всего договоров</Text>
							<Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>
								{contracts.length}
							</Text>
						</View>
						<Feather name='file-text' size={32} color={colors.primary} />
					</View>
				</View>

				<View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
						<View>
							<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Активные</Text>
							<Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>
								{activeContracts.length}
							</Text>
						</View>
						<Feather name='check-circle' size={32} color={colors.success} />
					</View>
				</View>
			</View>

			<View style={{ flexDirection: 'row', gap: 8 }}>
				<View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
						<View>
							<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Черновики</Text>
							<Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>
								{draftContracts.length}
							</Text>
						</View>
						<Feather name='file' size={32} color={colors.warning} />
					</View>
				</View>
			</View>

			{expiringSoon.length > 0 && (
				<View style={{ backgroundColor: colors.warning + '20', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: colors.warning + '30', marginTop: 8 }}>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
						<Feather name='alert-circle' size={18} color={colors.warning} />
						<View style={{ flex: 1 }}>
							<Text style={{ color: colors.warning, fontSize: 14, fontWeight: '600' }}>
								{expiringSoon.length} договор(ов) заканчивается
							</Text>
							<Text style={{ color: colors.warning, fontSize: 12, marginTop: 4 }}>
								в течение 30 дней
							</Text>
						</View>
					</View>
				</View>
			)}

			{showViewDetailsButton && (
				<TouchableOpacity
					onPress={() => router.push('/app/(tabs)/documents')}
					style={{ backgroundColor: colors.primary, borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}
				>
					<Feather name='arrow-right' size={16} color='white' />
					<Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>
						Другие договоры
					</Text>
				</TouchableOpacity>
			)}
		</View>
	)
}
