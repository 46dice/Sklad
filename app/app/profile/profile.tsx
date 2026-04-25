import SignOut from '@/components/screens/profile/SignOut'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { Colors } from '@/shared/constants/Colors'
import { IUserProfile } from '@/shared/types/user.types'
import { Button } from '@/shared/ui/Button'
import { FormInput } from '@/shared/ui/FormInput'
import { MaterialIcons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pressable, ScrollView, Switch, Text, View } from 'react-native'

export default function Profile() {
	const { user, userProfile, isLoading: authLoading } = useAuth()
	const { updateUserProfile } = useUserProfile()
	const { colors, theme, toggleTheme } = useTheme()
	const [isEditing, setIsEditing] = useState(false)
	const [initialData, setInitialData] = useState<IUserProfile | null>(null)
	const [isSaving, setIsSaving] = useState(false)
	const isCourier = userProfile?.role === 'courier'

	const { control, watch, reset } = useForm<IUserProfile>({
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

	const handleSaveChanges = async () => {
		if (!user) return

		try {
			setIsSaving(true)
			const success = await updateUserProfile(user.uid, watchedFields)

			if (success) {
				setInitialData(watchedFields)
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
				style={{ backgroundColor: colors.background }}
			>
				<Text style={{ color: colors.text }} className='text-lg'>Загрузка...</Text>
			</View>
		)
	}

	return (
		<ScrollView
			style={{ backgroundColor: colors.background }}
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

				<Text className='text-2xl font-bold mb-2' style={{ color: colors.text }}>
					{watchedFields?.name || 'Пользователь'}
				</Text>

				<Text className='text-base mb-2' style={{ color: colors.textSecondary }}>{user?.email}</Text>
				
				{/* Отображение роли */}
				{userProfile?.role && (
					<View className='flex-row items-center gap-2 mt-2 px-4 py-2 rounded-full'>
						<MaterialIcons 
							name={userProfile.role === 'manager' ? 'business-center' : 'local-shipping'} 
							size={16} 
							color={Colors.primary} 
						/>
						<Text style={{ color: Colors.primary }} className='font-semibold'>
							{userProfile.role === 'manager' ? 'Менеджер' : 'Курьер'}
						</Text>
					</View>
				)}
			</View>

			{/* Инфо секция */}
			<View className='mx-6 mb-8'>
				<View className='flex-row items-center justify-between mb-4'>
					<Text className='text-xs uppercase tracking-widest font-semibold' style={{ color: colors.textSecondary }}>
						Информация об аккаунте
					</Text>
					{!isEditing && (
						<Pressable
							onPress={() => setIsEditing(true)}
							className='flex-row items-center gap-1'
						>
							<MaterialIcons name='edit' size={18} color={Colors.primary} />
							<Text className='text-xs uppercase tracking-widest font-semibold' style={{ color: Colors.primary }}>
								Редактировать
							</Text>
						</Pressable>
					)}
				</View>

				{/* Email поле */}
				<View
					className='rounded-2xl p-6 border-2 mb-4'
					style={{ borderColor: colors.border }}
				>
					<View className='flex-row items-center'>
						<MaterialIcons name='email' size={20} color={Colors.primary} />
						<Text className='text-xs ml-3 font-semibold uppercase tracking-wider' style={{ color: colors.textSecondary }}>
							Email
						</Text>
					</View>
					<Text className='text-base font-medium leading-6 ml-6 pl-2' style={{ color: colors.text }}>
						{user?.email}
					</Text>
				</View>

				{/* ID поле */}
				<View
					className='rounded-2xl p-6 border-2 mb-4'
					style={{ borderColor: colors.border }}
				>
					<View className='flex-row items-center'>
						<MaterialIcons name='fingerprint' size={20} color={Colors.primary} />
						<Text className='text-xs ml-3 font-semibold uppercase tracking-wider' style={{ color: colors.textSecondary }}>
							ID
						</Text>
					</View>
					<Text className='text-xs font-mono tracking-wider ml-6 pl-2' style={{ color: colors.text }}>
						{user?.uid}
					</Text>
				</View>

				{isEditing && (
					<>
						{/* Основная информация */}
						<View style={{ marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, marginTop: 16 }}>
							<Text style={{ color: colors.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontWeight: '600' }}>
								Основная информация
							</Text>

							<View style={{ marginBottom: 12 }}>
								<FormInput<IUserProfile>
									name='name'
									placeholder='Имя'
									control={control}
								/>
							</View>

							<View style={{ marginBottom: 12 }}>
								<FormInput<IUserProfile>
									name='phone'
									placeholder='Телефон'
									keyboardType='phone-pad'
									control={control}
								/>
							</View>
						</View>
					</>
				)}
			</View>

			{/* Данные поставщика для актов отгрузки */}
			{!isCourier && (
				<View className='mx-6 mb-8'>
					<Text style={{ color: colors.textSecondary }} className='text-xs uppercase tracking-widest mb-4 font-semibold'>
						Данные поставщика (для актов отгрузки)
					</Text>

					{isEditing ? (
						<View className='gap-3 mb-6'>
							<FormInput<IUserProfile> name='supplierFullName' placeholder='ФИО или название компании' control={control} />
							<FormInput<IUserProfile> name='supplierInn' placeholder='ИНН' keyboardType='numeric' control={control} />
							<FormInput<IUserProfile> name='supplierAddress' placeholder='Адрес' control={control} />
							<FormInput<IUserProfile> name='supplierBankName' placeholder='Название банка' control={control} />
							<FormInput<IUserProfile> name='supplierBik' placeholder='БИК' keyboardType='numeric' control={control} />
							<FormInput<IUserProfile> name='supplierAccountNumber' placeholder='Расчетный счет' keyboardType='numeric' control={control} />
							<FormInput<IUserProfile> name='supplierCorrespondentAccount' placeholder='Корреспондентский счет' keyboardType='numeric' control={control} />
						</View>
					) : (
						<View className='gap-3'>
							{watchedFields.supplierFullName && (
								<View className='rounded-2xl p-4 border' style={{ borderColor: colors.border }}>
									<Text style={{ color: colors.textSecondary }} className='text-xs font-semibold uppercase tracking-wider mb-1'>Название</Text>
									<Text style={{ color: colors.text }} className='text-base font-medium'>{watchedFields.supplierFullName}</Text>
								</View>
							)}
							{watchedFields.supplierInn && (
								<View className='rounded-2xl p-4 border' style={{ borderColor: colors.border }}>
									<Text style={{ color: colors.textSecondary }} className='text-xs font-semibold uppercase tracking-wider mb-1'>ИНН</Text>
									<Text style={{ color: colors.text }} className='text-base font-medium'>{watchedFields.supplierInn}</Text>
								</View>
							)}
							{watchedFields.supplierAddress && (
								<View className='rounded-2xl p-4 border' style={{ borderColor: colors.border }}>
									<Text style={{ color: colors.textSecondary }} className='text-xs font-semibold uppercase tracking-wider mb-1'>Адрес</Text>
									<Text style={{ color: colors.text }} className='text-base font-medium'>{watchedFields.supplierAddress}</Text>
								</View>
							)}
							{watchedFields.supplierBankName && (
								<View className='rounded-2xl p-4 border' style={{ borderColor: colors.border }}>
									<Text style={{ color: colors.textSecondary }} className='text-xs font-semibold uppercase tracking-wider mb-1'>Банк</Text>
									<Text style={{ color: colors.text }} className='text-base font-medium'>{watchedFields.supplierBankName}</Text>
								</View>
							)}
							{watchedFields.supplierBik && (
								<View className='rounded-2xl p-4 border' style={{ borderColor: colors.border }}>
									<Text style={{ color: colors.textSecondary }} className='text-xs font-semibold uppercase tracking-wider mb-1'>БИК</Text>
									<Text style={{ color: colors.text }} className='text-base font-medium'>{watchedFields.supplierBik}</Text>
								</View>
							)}
							{watchedFields.supplierAccountNumber && (
								<View className='rounded-2xl p-4 border' style={{ borderColor: colors.border }}>
									<Text style={{ color: colors.textSecondary }} className='text-xs font-semibold uppercase tracking-wider mb-1'>Расчетный счет</Text>
									<Text style={{ color: colors.text }} className='text-base font-medium'>{watchedFields.supplierAccountNumber}</Text>
								</View>
							)}
							{watchedFields.supplierCorrespondentAccount && (
								<View className='rounded-2xl p-4 border' style={{ borderColor: colors.border }}>
									<Text style={{ color: colors.textSecondary }} className='text-xs font-semibold uppercase tracking-wider mb-1'>Корреспондентский счет</Text>
									<Text style={{ color: colors.text }} className='text-base font-medium'>{watchedFields.supplierCorrespondentAccount}</Text>
								</View>
							)}
						</View>
					)}
				</View>
			)}

			{/* Кнопки действий - в конце */}
			{isEditing && (
				<View className='mx-6 gap-3 mb-8'>
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
						onPress={() => {
							setIsEditing(false)
							reset(initialData || undefined)
						}}
						disabled={isSaving}
					>
						<Text className='text-white font-semibold'>Отмена</Text>
					</Button>
				</View>
			)}

			{/* Действия */}
			{!isEditing && (
				<View className='mx-6'>
					<Text className='text-xs uppercase tracking-widest mb-4 font-semibold' style={{ color: colors.textSecondary }}>
						Действия
					</Text>
					{/* Переключатель темы */}
					<View
						className='rounded-2xl p-4 border mb-4 flex-row items-center justify-between'
						style={{ borderColor: colors.border, backgroundColor: colors.surface }}
					>
						<View className='flex-row items-center gap-3'>
							<MaterialIcons
								name={theme === 'light' ? 'wb-sunny' : 'nightlight-round'}
								size={22}
								color={Colors.primary}
							/>
							<Text className='font-semibold' style={{ color: colors.text }}>
								{theme === 'light' ? 'Светлая тема' : 'Тёмная тема'}
							</Text>
						</View>
						<Switch
							value={theme === 'dark'}
							onValueChange={toggleTheme}
							trackColor={{ false: colors.border, true: Colors.primary + '80' }}
							thumbColor={theme === 'dark' ? Colors.primary : colors.textSecondary}
						/>
					</View>
					<SignOut />
				</View>
			)}
		</ScrollView>
	)
}
