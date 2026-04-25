import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { validEmail } from '@/shared/reges'
import { INewClientForm } from '@/shared/types/clients.types'
import { Button } from '@/shared/ui/Button'
import { FormInput } from '@/shared/ui/FormInput'
import { showToast } from '@/shared/ui/showToast'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore/lite'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ActivityIndicator, ScrollView, Switch, Text, View } from 'react-native'

export default function ClientDetail() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const { user } = useAuth()
	const router = useRouter()
	const { colors } = useTheme()

	const [isLoading, setIsLoading] = useState(false)
	const [clientData, setClientData] = useState<INewClientForm | null>(null)

	const { control, watch, setValue, handleSubmit } = useForm<INewClientForm>({
		mode: 'onChange'
	})

	const isPhysicalPerson = watch('isPhysicalPerson')

	useEffect(() => {
		const fetchClient = async () => {
			if (!user || !id) return
			try {
				const clientRef = doc(db, 'users', user.uid, 'clients', id)
				const clientSnapshot = await getDoc(clientRef)
				if (clientSnapshot.exists()) {
					const data = clientSnapshot.data() as INewClientForm
					setClientData(data)
					Object.entries(data).forEach(([key, value]) => {
						setValue(key as keyof INewClientForm, value)
					})
				} else {
					showToast('Клиент не найден')
					router.back()
				}
			} catch (error) {
				showToast(`Ошибка при загрузке клиента: ${error}`)
			}
		}
		fetchClient()
	}, [id, user, setValue, router])

	const onSubmit = async (data: INewClientForm) => {
		if (!user || !id) return
		try {
			setIsLoading(true)
			const clientRef = doc(db, 'users', user.uid, 'clients', id)
			await updateDoc(clientRef, { ...data, updatedAt: new Date() })
			showToast('Клиент успешно обновлен')
			router.back()
		} catch (error) {
			showToast(`Ошибка при сохранении: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}

	if (!clientData) {
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
				<ActivityIndicator size='large' color={colors.primary} />
				<Text style={{ color: colors.text, marginTop: 12 }}>Загрузка...</Text>
			</View>
		)
	}

	return (
		<ScrollView
			style={{ flex: 1, backgroundColor: colors.background }}
			contentContainerStyle={{ paddingBottom: 40 }}
		>
			<View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
				<Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
					Редактирование клиента
				</Text>

				<View style={{ gap: 8, marginBottom: 24 }}>
					<Text style={{ color: colors.text, textTransform: 'uppercase', fontSize: 12, marginBottom: 4, fontWeight: '600' }}>
						Основная информация
					</Text>
					<FormInput<INewClientForm> name='name' control={control} placeholder='Наименование' rules={{ required: 'Наименование обязательно!' }} />
					<FormInput<INewClientForm> name='phone' control={control} placeholder='Телефон' keyboardType='phone-pad' />
					<FormInput<INewClientForm> name='email' control={control} placeholder='Email' keyboardType='email-address' rules={{ pattern: { value: validEmail, message: 'Некорректный email' } }} />
					<FormInput<INewClientForm> name='actualAddress' control={control} placeholder='Фактический адрес' />
				</View>

				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, backgroundColor: colors.surface, borderRadius: 8, padding: 16 }}>
					<Text style={{ color: colors.text, fontWeight: '600' }}>Физическое лицо</Text>
					<Controller
						control={control}
						name='isPhysicalPerson'
						render={({ field: { value, onChange } }) => (
							<Switch
								value={value}
								onValueChange={onChange}
								trackColor={{ false: colors.border, true: colors.primary + '80' }}
								thumbColor={value ? colors.primary : colors.textSecondary}
							/>
						)}
					/>
				</View>

				{!isPhysicalPerson && (
					<View style={{ gap: 8, marginBottom: 24 }}>
						<Text style={{ color: colors.text, textTransform: 'uppercase', fontSize: 12, marginBottom: 4, fontWeight: '600' }}>
							Реквизиты организации
						</Text>
						<FormInput<INewClientForm> name='fullName' control={control} placeholder='Полное наименование' />
						<FormInput<INewClientForm> name='legalAddress' control={control} placeholder='Юридический адрес' />
						<FormInput<INewClientForm> name='inn' control={control} placeholder='ИНН' keyboardType='numeric' />
						<FormInput<INewClientForm> name='ogrn' control={control} placeholder='ОГРН' keyboardType='numeric' />
						<FormInput<INewClientForm> name='okpo' control={control} placeholder='ОКПО' keyboardType='numeric' />
					</View>
				)}

				<View style={{ flexDirection: 'row', gap: 8 }}>
					<Button onPress={() => router.back()} className='flex-1'>
						<Text>Отмена</Text>
					</Button>
					<Button onPress={handleSubmit(onSubmit)} isLoading={isLoading} className='flex-1'>
						<Text>Сохранить</Text>
					</Button>
				</View>
			</View>
		</ScrollView>
	)
}
