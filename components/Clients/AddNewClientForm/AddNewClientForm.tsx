import { useAuth } from '@/hooks/useAuth'
import { validEmail } from '@/shared/reges'
import { INewClientForm } from '@/shared/types/clients.types'
import { Button } from '@/shared/ui/Button'
import { FormInput } from '@/shared/ui/FormInput'
import { isEqual } from 'lodash'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Switch, Text, View } from 'react-native'
import useClientStore, { initialFormState } from '../client.model'
import { useClients } from '../hooks/useClients'
import { useNewClient } from '../hooks/useNewClient'

export default function AddNewClientForm() {
	const { newClientFormState, updateFormState, setSubmitFunction, resetForm } =
		useClientStore()

	const { user } = useAuth()

	const { control, watch, reset, setValue } = useForm<INewClientForm>({
		mode: 'onChange',
		defaultValues: newClientFormState
	})

	const {
		control: controlINN,
		handleSubmit: handleSubmitINN,
		formState: formStateINN
	} = useForm<{ inn: string }>({
		mode: 'onChange'
	})

	const { fetchClientINN, data, isLoading, fetchAddNewClient } = useNewClient()
	const { fetchClients } = useClients()
	const isPhysicalPerson = watch('isPhysicalPerson')

	useEffect(() => {
		reset(newClientFormState)
	}, [newClientFormState, reset])

	useEffect(() => {
		if (data?.suggestions?.[0]) {
			const client = data.suggestions[0]
			const ipData = client.data

			const formData: INewClientForm = {
				name: ipData.name.full,
				phone: ipData.phones?.[0]?.value || '',
				email: ipData.emails?.[0]?.value || '',
				actualAddress: ipData.address.value,
				fullName: ipData.name.full,
				legalAddress: ipData.address.value,
				inn: ipData.inn,
				ogrn: ipData.ogrn,
				okpo: ipData.okpo,
				isPhysicalPerson: newClientFormState.isPhysicalPerson
			}

			Object.entries(formData).forEach(([key, value]) => {
				setValue(key as keyof INewClientForm, value)
			})

			updateFormState(formData)
		}
	}, [
		data?.suggestions,
		newClientFormState.isPhysicalPerson,
		setValue,
		updateFormState
	])

	useEffect(() => {
		setSubmitFunction(async (data: INewClientForm) => {
			if (user && !isEqual(initialFormState, data)) {
				fetchAddNewClient(user.uid, data)
				fetchClients()
			}
			resetForm()
		})
	}, [fetchAddNewClient, fetchClients, resetForm, setSubmitFunction, user])

	const onFormChange = (data: Partial<INewClientForm>) => {
		updateFormState(data)
	}

	const onSubmitSearchInn = async ({ inn }: { inn: string }) => {
		if (!inn.length) {
			return
		}
		await fetchClientINN(inn)
	}

	return (
		<>
			<View className='px-4'>
				<Text className='text-white text-center mt-4 mb-1'>
					Можно заполнить форму автоматически, указав ИНН. Просто введите ИНН
					ниже и нажмите &quot;Заполнить&quot;
				</Text>

				<View className='mx-auto w-full'>
					<FormInput<{ inn: string }>
						name='inn'
						keyboardType='numeric'
						placeholder='ИНН'
						control={controlINN}
						rules={{
							pattern: {
								value: /^\d{10,}$/,
								message: 'ИНН должен состоять минимум из 10 цифр'
							},
							minLength: {
								value: 10,
								message: 'ИНН должен состоять минимум из 10 цифр'
							}
						}}
					/>
				</View>

				<Button
					disabled={!formStateINN.isValid}
					isLoading={isLoading}
					onPress={handleSubmitINN(onSubmitSearchInn)}
					className='mt-2 mb-6 w-full'
				>
					<Text>Заполнить</Text>
				</Button>
			</View>

			<View className='gap-1 mb-2'>
				<FormInput<INewClientForm>
					name='name'
					control={control}
					placeholder='Наименование (Отобразится во вкладке "Клиенты")'
					rules={{
						required: 'Наименование обязательно!'
					}}
					onChangeText={text => onFormChange({ name: text })}
				/>
				<FormInput<INewClientForm>
					name='phone'
					control={control}
					placeholder='Телефон'
					keyboardType='phone-pad'
					onChangeText={text => onFormChange({ phone: text })}
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
					onChangeText={text => onFormChange({ email: text })}
				/>
				<FormInput<INewClientForm>
					name='actualAddress'
					control={control}
					placeholder='Фактический Адрес'
					onChangeText={text => onFormChange({ actualAddress: text })}
				/>
			</View>

			<View className='gap-1 mb-2'>
				<Text className='uppercase text-sm text-white'>Расчетный счет</Text>
				<FormInput<INewClientForm>
					name='bankAccountNumber'
					control={control}
					placeholder='Расчетный счет (20 цифр)'
					keyboardType='numeric'
					onChangeText={text => onFormChange({ bankAccountNumber: text })}
				/>
			</View>

			<View className='flex-row items-center justify-between mb-2'>
				<Text className='uppercase text-sm text-white'>Реквизиты</Text>
				<View className='items-center gap-1.5 flex-row'>
					<Text className='text-gray-500 text-sm'>Физическое лицо</Text>
					<View>
						<Controller
							control={control}
							name='isPhysicalPerson'
							render={({ field: { value, onChange } }) => (
								<Switch
									value={value}
									onValueChange={newValue => {
										onChange(newValue)
										onFormChange({ isPhysicalPerson: newValue })
									}}
								/>
							)}
						/>
					</View>
				</View>
			</View>

			{!isPhysicalPerson ? (
				<View className='gap-1'>
					<FormInput<INewClientForm>
						name='fullName'
						control={control}
						placeholder='Полное наименование'
						onChangeText={text => onFormChange({ fullName: text })}
					/>
					<FormInput<INewClientForm>
						name='legalAddress'
						control={control}
						placeholder='Адрес'
						onChangeText={text => onFormChange({ legalAddress: text })}
					/>
					<FormInput<INewClientForm>
						name='inn'
						control={control}
						placeholder='ИНН'
						keyboardType='numeric'
						onChangeText={text => onFormChange({ inn: text })}
					/>
					<FormInput<INewClientForm>
						name='ogrn'
						control={control}
						placeholder='ОГРН'
						keyboardType='numeric'
						onChangeText={text => onFormChange({ ogrn: text })}
					/>
					<FormInput<INewClientForm>
						name='okpo'
						control={control}
						placeholder='ОКПО'
						keyboardType='numeric'
						onChangeText={text => onFormChange({ okpo: text })}
					/>
				</View>
			) : null}
		</>
	)
}
