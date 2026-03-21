import { token, url } from './constants'
import { DadataSuggestionResponse } from './fns.types'

export const fetchByINN = async (inn: string) => {
	const options = {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: 'Token ' + token
		},
		body: JSON.stringify({ query: inn })
	}

	const response = await fetch(url, options)
	const data = (await response.json()) as DadataSuggestionResponse
	return data
}
