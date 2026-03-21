import { db } from '@/firebase'
import { DadataSuggestionResponse } from '@/shared/FnsAPI/fns.types'
import { fetchByINN } from '@/shared/FnsAPI/utils'
import { INewClientForm } from '@/shared/types/clients.types'
import { showToast } from '@/shared/ui/showToast'
import { addDoc, collection } from 'firebase/firestore/lite'
import { useCallback, useState } from 'react'

export const useNewClient = () => {
	const [data, setData] = useState<DadataSuggestionResponse | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const fetchClientINN = useCallback(async (inn: string) => {
		try {
			setIsLoading(true)
			const data = await fetchByINN(inn)
			setData(data)
		} catch (error) {
			showToast(`Ошибка при запросе данных по ИНН: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}, [])

	const fetchAddNewClient = useCallback(
		async (userId: string, newClientData: INewClientForm) => {
			try {
				await addDoc(collection(db, 'users', userId, 'clients'), {
					...newClientData,
					createdAt: new Date()
				})
			} catch (error) {
				showToast(`Ошибка добавления: ${error}`)
			}
		},
		[]
	)

	return { fetchClientINN, data, isLoading, fetchAddNewClient }
}
