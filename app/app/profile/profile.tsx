import SignOut from '@/components/screens/profile/SignOut'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Colors } from '@/shared/constants/Colors'
import { IUserProfile } from '@/shared/types/user.types'
import { Button } from '@/shared/ui/Button'
import { FormInput } from '@/shared/ui/FormInput'
import { MaterialIcons } from '@expo/vector-icons'
import { isEqual } from 'lodash'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pressable, ScrollView, Text, View } from 'react-native'

export default function Profile() {
	const { user, userProfile, isLoading: authLoading } = useAuth()
	const { updateUserProfile } = useUserProfile()
	const [isEditing, setIsEditing] = useState(false)
	const [hasChanges, setHasChanges] = useState(false)
	const [initialData, setInitialData] = useState<IUserProfile | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	const { control, watch, reset, setValue } = useForm<IUserProfile>({
		mode: 'onChange',
		defaultValues: {
			email: '',
			role: 'manager',
			name: '',
			phone: '',
			permissions: [],
			isActive: true,
			createdAt: new Date(),
			supplierFullName: '',
			supplierInn: '',
			supplierAddress: '',
			supplierBankName: '',
			supplierBik: '',
			supplierAccountNumber: '',
			supplierCorrespondentAccount: ''
		}
	})

	useEffect(() => {
		if (userProfile) {
			reset(userProfile)
			setInitialData(userProfile)
		}
	}, [userProfile, reset])

	const watchedFields = watch()

	useEffect(() => {
		if (initialData && !isEqual(initialData, watchedFields)) {
			setHasChanges(true)
		} else {
			setHasChanges(false)
		}
	}, [watchedFields, initialData])

	const handleSaveChanges = async () => {
		if (!user) return

		try {
			setIsSaving(true)
			const success = await updateUserProfile(user.uid, watchedFields)

			if (success) {
				setInitialData(watchedFields)
				setHasChanges(false)
				setIsEditing(false)
			}
		} finally {
			setIsSaving(false)
		}
	}

	if (authLoading) {
		return (
			<View
				className='flex-1 items-center justify-center'
				style={{ backgroundColor: Colors.black }}
			>
				<Text className='text-white text-lg'>Загрузка...</Text>
			</View>
		)
	}

	return (
		<ScrollView
			style={{ backgroundColor: Colors.black }}
			className='flex-1'
			contentContainerClassName='pb-10'
		>
			{/* Профиль аватар и основная информация */}
			<View className='items-center px-6 pt-8 pb-8'>
				<View
					className='mb-6 justify-center items-center rounded-full'
					style={{
						width: 120,
						height: 120,
						backgroundColor: Colors.primary
					}}
				>
					<MaterialIcons
						name='account-circle'
						size={120}
						color={Colors.white}
					/>
				</View>

				<Text className='text-2xl font-bold text-white mb-2'>
					{watchedFields?.name ||
						'Пользователь'}
				</Text>

				<Text className='text-base text-gray-400 mb-2'>{user?.email}</Text>
				
				{/* Отображение роли */}
				{userProfile?.role && (
					<View className='flex-row items-center gap-2 mt-2 px-4 py-2 rounded-full bg-primary/20'>
						<MaterialIcons 
							name={userProfile.role === 'manager' ? 'business-center' : 'local-shipping'} 
							size={16} 
							color={Colors.primary} 
						/>
						<Text className='text-primary font-semibold'>
							{userProfile.role === 'manager' ? 'Менеджер' : 'Курьер'}
						</Text>
					</View>
				)}
			</View>

			{/* Инфо секция */}
			<View className='mx-6 mb-8'>
				<View className='flex-row items-center justify-between mb-4'>
					<Text className='text-xs text-gray-500 uppercase tracking-widest font-semibold'>
						Информация об аккаунте
					</Text>
					{!isEditing && (
						<Pressable
							onPress={() => setIsEditing(true)}
							className='flex-row items-center gap-1'
						>
							<MaterialIcons name='edit' size={18} color={Colors.primary} />
							<Text className='text-xs text-primary uppercase tracking-widest font-semibold'>
								Редактировать
							</Text>
						</Pressable>
					)}
				</View>

				{/* Email поле (не редактируется) */}
				<View
					className='rounded-2xl p-6 border-2 mb-4'
					style={{ borderColor: '#333333' }}
				>
					<View className='flex-row items-center '>
						<MaterialIcons name='email' size={20} color={Colors.primary} />
						<Text className='text-xs text-gray-400 ml-3 font-semibold uppercase tracking-wider'>
							Email
						</Text>
					</View>
					<Text className='text-base text-white font-medium leading-6 ml-6 pl-2'>
						{user?.email}
					</Text>
				</View>

				{/* ID пользователя поле (не редактируется) */}
				<View
					className='rounded-2xl p-6 border-2 mb-4'
					style={{ borderColor: '#333333' }}
				>
					<View className='flex-row items-center'>
						<MaterialIcons
							name='fingerprint'
							size={20}
							color={Colors.primary}
						/>
						<Text className='text-xs text-gray-400 ml-3 font-semibold uppercase tracking-wider'>
							ID
						</Text>
					</View>
					<Text className='text-xs text-gray-300 font-mono tracking-wider ml-6 pl-2'>
						{user?.uid}
					</Text>
				</View>

				{isEditing && (
					<>
						{/* Поиск по ИНН */}
						<View className='mb-6 pb-4 border-b border-gray-700 mt-4'>
							<Text className='text-xs text-gray-500 uppercase tracking-widest mb-3 font-semibold'>
								Основная информация
							</Text>

							<View className='mb-3'>
								<FormInput<IUserProfile>
									name='name'
									placeholder='Имя'
									control={control}
								/>
							</View>

							<View className='mb-3'>
								<FormInput<IUserProfile>
									name='phone'
									placeholder='Телефон'
									keyboardType='phone-pad'
									control={control}
								/>
							</View>
						</View>

						{/* Редактируемые поля */}
						<View className='gap-3 mb-6'>
							<FormInput<IUserProfile>
								name='name'
								placeholder='Полное имя'
								control={control}
							/>
						</View>

						{/* Кнопки действий */}
						<View className='gap-3'>
							<Button
								className='w-full'
								disabled={isSaving}
								onPress={handleSaveChanges}
							>
								<Text className='text-white font-semibold'>
									{isSaving ? 'Сохранение...' : 'Сохранить изменения'}
								</Text>
							</Button>

							<Button
								className='w-full'
								variant='ghost'
								onPress={() => {
									setIsEditing(false)
									reset(initialData || undefined)
									setHasChanges(false)
								}}
								disabled={isSaving}
							>
								<Text className='text-white font-semibold'>Отмена</Text>
							</Button>
						</View>
					</>
				)}
			</View>

			{/* Данные поставщика для актов отгрузки */}
			{isEditing && (
				<View className='mx-6 mb-8'>
					<Text className='text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold'>
						Данные поставщика (для актов отгрузки)
					</Text>

					<View className='gap-3 mb-6'>
						<FormInput<IUserProfile>
							name='supplierFullName'
							placeholder='ФИО или название компании'
							control={control}
						/>
						<FormInput<IUserProfile>
							name='supplierInn'
							placeholder='ИНН'
							keyboardType='numeric'
							control={control}
						/>
						<FormInput<IUserProfile>
							name='supplierAddress'
							placeholder='Адрес'
							control={control}
						/>
						<FormInput<IUserProfile>
							name='supplierBankName'
							placeholder='Название банка'
							control={control}
						/>
						<FormInput<IUserProfile>
							name='supplierBik'
							placeholder='БИК'
							keyboardType='numeric'
							control={control}
						/>
						<FormInput<IUserProfile>
							name='supplierAccountNumber'
							placeholder='Расчетный счет'
							keyboardType='numeric'
							control={control}
						/>
						<FormInput<IUserProfile>
							name='supplierCorrespondentAccount'
							placeholder='Корреспондентский счет'
							keyboardType='numeric'
							control={control}
						/>
					</View>
				</View>
			)}

			{/* Действия */}
			{!isEditing && (
				<View className='mx-6'>
					<Text className='text-xs text-gray-500 uppercase tracking-widest mb-4 font-semibold'>
						Действия
					</Text>
					<SignOut />
				</View>
			)}
		</ScrollView>
	)
}
