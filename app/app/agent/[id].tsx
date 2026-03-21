import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { validEmail } from '@/shared/reges'
import { INewClientForm } from '@/shared/types/clients.types'
import { Button } from '@/shared/ui/Button'
import { FormInput } from '@/shared/ui/FormInput'
import { showToast } from '@/shared/ui/showToast'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore/lite'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, Switch, Text, View } from 'react-native'

export default function ClientDetail() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const { user } = useAuth()
	const router = useRouter()

	const [isLoading, setIsLoading] = useState(false)
	const [clientData, setClientData] = useState<INewClientForm | null>(null)

	const { control, watch, setValue, handleSubmit } = useForm<INewClientForm>({
		mode: 'onChange'
	})

	const isPhysicalPerson = watch('isPhysicalPerson')

	// Загрузка данных клиента
	useEffect(() => {
		const fetchClient = async () => {
			if (!user || !id) return

			try {
				const clientRef = doc(db, 'users', user.uid, 'clients', id)
				const clientSnapshot = await getDoc(clientRef)

				if (clientSnapshot.exists()) {
					const data = clientSnapshot.data() as INewClientForm
					setClientData(data)

					// Заполняем форму
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
			await updateDoc(clientRef, {
				...data,
				updatedAt: new Date()
			})
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
			<View className='flex-1 items-center justify-center bg-black'>
				<Text className='text-white'>Загрузка...</Text>
			</View>
		)
	}

	return (
		<ScrollView
			className='flex-1 bg-black'
			contentContainerStyle={{ paddingBottom: 40 }}
		>
			<View className='px-4 py-4'>
				<Text className='text-white text-2xl font-bold mb-6'>
					Редактирование клиента
				</Text>

				<View className='gap-1 mb-6'>
					<Text className='text-white uppercase text-sm mb-3 font-semibold'>
						Основная информация
					</Text>
					<FormInput<INewClientForm>
						name='name'
						control={control}
						placeholder='Наименование'
						rules={{
							required: 'Наименование обязательно!'
						}}
					/>
					<FormInput<INewClientForm>
						name='phone'
						control={control}
						placeholder='Телефон'
						keyboardType='phone-pad'
					/>
					<FormInput<INewClientForm>
						name='email'
						control={control}
						placeholder='Email'
						keyboardType='email-address'
						rules={{
							pattern: {
								value: validEmail,
								message: 'Некорректный email'
							}
						}}
					/>
					<FormInput<INewClientForm>
						name='actualAddress'
						control={control}
						placeholder='Фактический адрес'
					/>
				</View>

				<View className='flex-row items-center justify-between mb-6 bg-gray-default rounded-lg p-4'>
					<Text className='text-white font-semibold'>Физическое лицо</Text>
					<Controller
						control={control}
						name='isPhysicalPerson'
						render={({ field: { value, onChange } }) => (
							<Switch value={value} onValueChange={onChange} />
						)}
					/>
				</View>

				{!isPhysicalPerson && (
					<View className='gap-1 mb-6'>
						<Text className='text-white uppercase text-sm mb-3 font-semibold'>
							Реквизиты организации
						</Text>
						<FormInput<INewClientForm>
							name='fullName'
							control={control}
							placeholder='Полное наименование'
						/>
						<FormInput<INewClientForm>
							name='legalAddress'
							control={control}
							placeholder='Юридический адрес'
						/>
						<FormInput<INewClientForm>
							name='inn'
							control={control}
							placeholder='ИНН'
							keyboardType='numeric'
						/>
						<FormInput<INewClientForm>
							name='ogrn'
							control={control}
							placeholder='ОГРН'
							keyboardType='numeric'
						/>
						<FormInput<INewClientForm>
							name='okpo'
							control={control}
							placeholder='ОКПО'
							keyboardType='numeric'
						/>
					</View>
				)}

				<View className='gap-2 flex-row'>
					<Button
						onPress={() => router.back()}
						className='flex-1'
						variant='ghost'
					>
						<Text>Отмена</Text>
					</Button>
					<Button
						onPress={handleSubmit(onSubmit)}
						isLoading={isLoading}
						className='flex-1'
					>
						<Text>Сохранить</Text>
					</Button>
				</View>
			</View>
		</ScrollView>
	)
}
