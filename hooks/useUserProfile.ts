import { db } from '@/firebase'
import { DadataSuggestionResponse } from '@/shared/FnsAPI/fns.types'
import { fetchByINN } from '@/shared/FnsAPI/utils'
import { IUserProfile } from '@/shared/types/user.types'
import { showToast } from '@/shared/ui/showToast'
import { doc, getDoc, setDoc } from 'firebase/firestore/lite'
import { useCallback, useState } from 'react'

export const useUserProfile = () => {
	const [innData, setInnData] = useState<DadataSuggestionResponse | null>(null)
	const [isLoadingInn, setIsLoadingInn] = useState(false)

	const fetchUserProfile = useCallback(async (userId: string) => {
		try {
			const userDocRef = doc(db, 'users', userId)
			const userDoc = await getDoc(userDocRef)
			if (userDoc.exists()) {
				return userDoc.data() as IUserProfile
			}
			return null
		} catch (error) {
			showToast(`Ошибка загрузки профиля: ${error}`)
			return null
		}
	}, [])

	const updateUserProfile = useCallback(
		async (userId: string, profileData: Partial<IUserProfile>) => {
			try {
				const userDocRef = doc(db, 'users', userId)
				await setDoc(
					userDocRef,
					{
						...profileData,
						updatedAt: new Date()
					},
					{ merge: true }
				)
				showToast('Профиль успешно обновлен')
				return true
			} catch (error) {
				showToast(`Ошибка обновления профиля: ${error}`)
				return false
			}
		},
		[]
	)

	const searchByInn = useCallback(async (inn: string) => {
		try {
			setIsLoadingInn(true)
			const data = await fetchByINN(inn)
			setInnData(data)
			return data
		} catch (error) {
			showToast(`Ошибка при запросе данных по ИНН: ${error}`)
			return null
		} finally {
			setIsLoadingInn(false)
		}
	}, [])

	return {
		fetchUserProfile,
		updateUserProfile,
		searchByInn,
		innData,
		isLoadingInn
	}
}
