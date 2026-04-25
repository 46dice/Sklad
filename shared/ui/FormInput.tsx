import { useTheme } from '@/providers/theme/ThemeProvider'
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

interface Props<T extends FieldValues> extends TextInputProps {
	control: Control<T>
	name: FieldPath<T>
	rules?: Omit<
		RegisterOptions<T, FieldPath<T>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>
	label?: string
	boxClassname?: string
}

export const FormInput = <T extends Record<string, any>>({
	control,
	rules,
	name,
	label,
	boxClassname,
	...rest
}: Props<T>): JSX.Element => {
	const { colors } = useTheme()

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
						style={{
							backgroundColor: colors.surface,
							borderWidth: 1,
							borderColor: error ? '#EF4444' : colors.border,
							borderRadius: 8,
							paddingBottom: 16,
							paddingTop: 10,
							paddingHorizontal: 16
						}}
						className={cn(boxClassname)}
					>
						<TextInput
							autoCapitalize={'none'}
							onChangeText={onChange}
							onBlur={onBlur}
							value={(value || '').toString()}
							style={{ color: colors.text, fontSize: 16 }}
							placeholderTextColor={colors.textSecondary}
							{...rest}
						/>
					</View>
					{error && <Text style={{ color: '#EF4444' }} className='mb-2'>{error.message}</Text>}
				</>
			)}
		/>
	)
}
