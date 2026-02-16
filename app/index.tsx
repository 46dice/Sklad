// app/index.tsx
import { Redirect } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

export default function Index() {
	const { user } = useAuth()

	if (user) {
		return <Redirect href='/app/(tabs)/monitoring' />
	}

	return <Redirect href='/auth' />
}
