import {
	DadataSuggestionResponse,
	fetchByINN
} from '@/shared/FnsAPI/constants'
import { showToast } from '@/shared/ui/showToast'
import { useState } from 'react'

export const useNewClient = () => {
	const [data, setData] = useState<DadataSuggestionResponse | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const fetchClientINN = async (inn: string) => {
		try {
			setIsLoading(true)
			const data = await fetchByINN(inn)
			setData(data)
		} catch (error) {
			showToast(`Ошибка при запросе данных по ИНН: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}
	return { fetchClientINN, data, isLoading }
}
