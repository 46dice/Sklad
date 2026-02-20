import cn from 'clsx'
import { JSX } from 'react'
import {
	Control,
	Controller,
	FieldPath,
	FieldValues,
	RegisterOptions
} from 'react-hook-form'
import { Text, TextInput, TextInputProps, View } from 'react-native'

interface Props<T extends FieldValues> extends Omit<
	TextInputProps,
	'onChange' | 'onChangeText' | 'value'
> {
	control: Control<T>
	name: FieldPath<T>
	rules?: Omit<
		RegisterOptions<T, FieldPath<T>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>
	label?: string
}

export const FormInput = <T extends Record<string, any>>({
	control,
	rules,
	name,
	label,
	...rest
}: Props<T>): JSX.Element => {
	return (
		<Controller
			control={control}
			name={name}
			rules={rules}
			render={({
				field: { value, onChange, onBlur },
				fieldState: { error }
			}) => (
				<>
					<View
						className={cn(
							'bg-[#232323] w-full border rounded-lg pb-4 pt-2.5 px-4 my-1.5',
							error ? 'border-red' : 'border-transparent'
						)}
					>
						<TextInput
							autoCapitalize={'none'}
							onChangeText={onChange}
							onBlur={onBlur}
							value={(value || '').toString()}
							className='text-white text-base placeholder:color-gray-300'
							{...rest}
						/>
					</View>
					{error && <Text className='text-red mb-2'>{error.message}</Text>}
				</>
			)}
		/>
	)
}
