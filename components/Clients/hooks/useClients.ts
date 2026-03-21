import { db } from '@/firebase'
import { useAuth } from '@/hooks/useAuth'
import { INewClientForm } from '@/shared/types/clients.types'
import { showToast } from '@/shared/ui/showToast'
import { collection, getDocs } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'

export const useClients = () => {
	const { user } = useAuth()
	const [clients, setClients] = useState<INewClientForm[]>([])
	const [filteredClients, setFilteredClients] = useState<INewClientForm[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')

	const fetchClients = useCallback(async () => {
		if (!user) return

		try {
			setIsLoading(true)
			const clientsCollection = collection(db, 'users', user.uid, 'clients')
			const querySnapshot = await getDocs(clientsCollection)
			console.log(querySnapshot)
			const clientsList = querySnapshot.docs.map(doc => {
				const data = doc.data()
				return {
					...data,
					id: doc.id
				} as INewClientForm & { id: string }
			})
			setClients(clientsList)
			setFilteredClients(clientsList)
		} catch (error) {
			showToast(`Ошибка при загрузке клиентов: ${error}`)
		} finally {
			setIsLoading(false)
		}
	}, [user])

	const searchClients = useCallback(
		(query: string) => {
			setSearchQuery(query)
			if (!query.trim()) {
				setFilteredClients(clients)
				return
			}

			const filtered = clients.filter(
				client =>
					client.name.toLowerCase().includes(query.toLowerCase()) ||
					client.phone.toLowerCase().includes(query.toLowerCase()) ||
					client.email.toLowerCase().includes(query.toLowerCase())
			)
			setFilteredClients(filtered)
		},
		[clients]
	)

	return {
		clients,
		filteredClients,
		isLoading,
		searchQuery,
		setSearchQuery,
		searchClients,
		fetchClients
	}
}
