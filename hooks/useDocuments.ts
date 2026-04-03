import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { IContract, INewContractForm } from '@/shared/types/contracts.types'
import { showToast } from '@/shared/ui/showToast'
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'

export const useDocuments = () => {
	const { user } = useAuth()
	const [contracts, setContracts] = useState<IContract[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const fetchDocuments = useCallback(async () => {
		if (!user) return

		try {
			setIsLoading(true)
			const documentsCollection = collection(db, 'users', user.uid, 'documents')
			const querySnapshot = await getDocs(documentsCollection)
			const documentsList = querySnapshot.docs.map(doc => {
				const data = doc.data()
				return {
					...data,
					id: doc.id
				} as IContract
			})
			setContracts(documentsList)
		} catch (error) {
			showToast(`Ошибка при загрузке документов: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}, [user])

	const saveDocument = useCallback(
		async (formData: INewContractForm) => {
			if (!user) return null

			try {
				setIsLoading(true)
				const documentsCollection = collection(db, 'users', user.uid, 'documents')

				const newContractData = {
					contractNumber: formData.contractNumber,
					clientId: formData.clientId,
					clientName: formData.clientName,
					status: 'draft' as const,
					createdAt: new Date().toISOString(),
					terms: {
						paymentTerms: formData.paymentTerms,
						deliveryTerms: formData.deliveryTerms,
						price: formData.price,
						validFrom: formData.validFrom,
						validUntil: formData.validUntil,
						currency: formData.currency
					},
					description: formData.description,
					attachments: [],
					items: formData.items || []
				}

				const docRef = await addDoc(documentsCollection, newContractData)

				const savedContract: IContract = {
					...newContractData,
					id: docRef.id
				}

				setContracts(prev => [...prev, savedContract])
				showToast('Договор сохранен')
				return savedContract
			} catch (error) {
				showToast(`Ошибка при сохранении договора: ${error}`)
				return null
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	const updateDocument = useCallback(
		async (contractId: string, updates: Partial<IContract>) => {
			if (!user) return false

			try {
				setIsLoading(true)
				const docRef = doc(db, 'users', user.uid, 'documents', contractId)
				await updateDoc(docRef, updates)

				setContracts(prev =>
					prev.map(c => (c.id === contractId ? { ...c, ...updates } : c))
				)
				showToast('Договор обновлен')
				return true
			} catch (error) {
				showToast(`Ошибка при обновлении договора: ${error}`)
				return false
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	const deleteDocument = useCallback(
		async (contractId: string) => {
			if (!user) return false

			try {
				setIsLoading(true)
				const docRef = doc(db, 'users', user.uid, 'documents', contractId)
				await deleteDoc(docRef)

				setContracts(prev => prev.filter(c => c.id !== contractId))
				showToast('Договор удален')
				return true
			} catch (error) {
				showToast(`Ошибка при удалении договора: ${error}`)
				return false
			} finally {
				setIsLoading(false)
			}
		},
		[user]
	)

	useEffect(() => {
		fetchDocuments()
	}, [fetchDocuments])

	return {
		contracts,
		isLoading,
		fetchDocuments,
		saveDocument,
		updateDocument,
		deleteDocument
	}
}
