import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/providers/theme/ThemeProvider'
import { validEmail } from '@/shared/reges'
import { IAuthFormData } from '@/shared/types/auth.types'
import { UserRole } from '@/shared/types/user.types'
import { Button } from '@/shared/ui/Button'
import DismissKeyboard from '@/shared/ui/DismissKeyboard'
import { FormInput } from '@/shared/ui/FormInput'
import { Feather } from '@expo/vector-icons'
import { Redirect } from 'expo-router'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Text, TouchableOpacity, View } from 'react-native'

enum TypeAuth {
	Register = 'Регистрация',
	Login = 'Войти'
}

export default function Auth() {
	const [typeAuth, setTypeAuth] = useState<TypeAuth>(TypeAuth.Register)
	const [selectedRole, setSelectedRole] = useState<UserRole>('manager')
	const { colors } = useTheme()

	const { user, handleLogin, handleRegister, isLoading } = useAuth()

	const { control, handleSubmit } = useForm<IAuthFormData>({
		mode: 'onChange'
	})

	const text =
		typeAuth === TypeAuth.Register ? TypeAuth.Register : TypeAuth.Login

	const isRegister = typeAuth === TypeAuth.Register

	const onToggleTypeAuth = () => {
		setTypeAuth(prev =>
			prev === TypeAuth.Register ? TypeAuth.Login : TypeAuth.Register
		)
	}

	const onSubmit: SubmitHandler<IAuthFormData> = async ({
		email,
		password
	}) => {
		if (isRegister) {
			await handleRegister(email, password, selectedRole)
		} else {
			await handleLogin(email, password)
		}
	}

	if (user) {
		return <Redirect href='/app/(tabs)/monitoring' />
	}

	return (
		<DismissKeyboard>
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
				<View style={{ alignItems: 'center', width: '75%' }}>
					<Text style={{ color: colors.text, fontSize: 48, marginBottom: 12, fontWeight: 'bold' }}>{text}</Text>
					<View style={{ width: '100%', gap: 8 }}>
					<FormInput<IAuthFormData>
						name='email'
						keyboardType='email-address'
						placeholder='Email'
						control={control}
						rules={{
							required: 'Почта обязательна!',
							pattern: {
								value: validEmail,
								message: 'Введите валидную почту'
							}
						}}
						boxClassname='mb-2'
					/>
					<FormInput<IAuthFormData>
						placeholder='Password'
						control={control}
						name='password'
						secureTextEntry={true}
						rules={{
							required: 'Пароль обязателен!',
							minLength: {
								value: 6,
								message: 'пароль должен быть минимум 6 символов'
							}
						}}
					/>
				</View>

					{/* Выбор роли при регистрации */}
					{isRegister && (
						<View style={{ width: '100%', marginBottom: 16 }}>
							<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
								Выберите роль
							</Text>
							<View style={{ flexDirection: 'row', gap: 12 }}>
								<TouchableOpacity
									onPress={() => setSelectedRole('manager')}
									style={{
										flex: 1,
										padding: 16,
										borderRadius: 8,
										borderWidth: 2,
										borderColor: selectedRole === 'manager' ? colors.primary : colors.border,
										backgroundColor: selectedRole === 'manager' ? colors.primary + '20' : colors.surface
									}}
								>
									<View style={{ alignItems: 'center' }}>
										<Feather
											name='briefcase'
											size={32}
											color={selectedRole === 'manager' ? colors.primary : colors.textSecondary}
										/>
										<Text style={{ marginTop: 8, fontWeight: '600', color: selectedRole === 'manager' ? colors.primary : colors.textSecondary }}>
											Менеджер
										</Text>
										<Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
											Управление услугами и продажами
										</Text>
									</View>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => setSelectedRole('courier')}
									style={{
										flex: 1,
										padding: 16,
										borderRadius: 8,
										borderWidth: 2,
										borderColor: selectedRole === 'courier' ? colors.primary : colors.border,
										backgroundColor: selectedRole === 'courier' ? colors.primary + '20' : colors.surface
									}}
								>
									<View style={{ alignItems: 'center' }}>
										<Feather
											name='truck'
											size={32}
											color={selectedRole === 'courier' ? colors.primary : colors.textSecondary}
										/>
										<Text style={{ marginTop: 8, fontWeight: '600', color: selectedRole === 'courier' ? colors.primary : colors.textSecondary }}>
											Курьер
										</Text>
										<Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
											Выполнение доставок
										</Text>
									</View>
								</TouchableOpacity>
							</View>
						</View>
					)}

					<Text
						onPress={onToggleTypeAuth}
						style={{ color: colors.textSecondary, marginLeft: 'auto', fontSize: 14, marginBottom: 24 }}
					>
						{isRegister ? 'Есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
					</Text>

					<Button
						className='w-[250px]'
						isLoading={isLoading}
						onPress={handleSubmit(onSubmit)}
						icon='git-commit'
					>
						{isRegister ? 'Зарегистрироваться' : 'Начать работу'}
					</Button>
				</View>
			</View>
		</DismissKeyboard>
	)
}
