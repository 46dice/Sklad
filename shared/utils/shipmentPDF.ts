import { IShipment, ISupplierInfo } from '@/shared/types/shipment.types'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'

// Функция для преобразования числа в слова
const numberToWords = (num: number): string => {
	const ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
	const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']
	const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']
	const scales = ['', 'тысяча', 'миллион', 'миллиард']

	if (num === 0) return 'ноль'

	const parts: string[] = []
	let scaleIndex = 0

	while (num > 0) {
		const part = num % 1000
		if (part !== 0) {
			let partWords = ''
			const hundreds = Math.floor(part / 100)
			const remainder = part % 100
			const tens_digit = Math.floor(remainder / 10)
			const ones_digit = remainder % 10

			if (hundreds > 0) {
				const hundredNames = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']
				partWords += hundredNames[hundreds] + ' '
			}

			if (remainder >= 10 && remainder < 20) {
				partWords += teens[remainder - 10]
			} else {
				if (tens_digit > 0) {
					partWords += tens[tens_digit] + ' '
				}
				if (ones_digit > 0) {
					partWords += ones[ones_digit]
				}
			}

			if (scaleIndex > 0 && scales[scaleIndex]) {
				partWords += ' ' + scales[scaleIndex]
			}

			parts.unshift(partWords.trim())
		}

		num = Math.floor(num / 1000)
		scaleIndex++
	}

	return parts.join(' ').trim()
}

const generateShipmentHTML = (shipment: IShipment, supplierInfo: ISupplierInfo): string => {
	const actDate = new Date(shipment.actDate).toLocaleDateString('ru-RU')
	const totalRubles = Math.floor(shipment.totalAmount)
	const totalKopecks = Math.round((shipment.totalAmount - totalRubles) * 100)
	const totalWords = numberToWords(totalRubles)

	const itemsHTML = shipment.items
		.map(
			(item, idx) => `
		<tr>
			<td style="border: 1px solid #000; padding: 8px; text-align: center;">${idx + 1}</td>
			<td style="border: 1px solid #000; padding: 8px;">${item.serviceName}</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right;">${item.price.toFixed(2)}</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.quantity}</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: center;">шт</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right;">0,00</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right;">0,00</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right;">${item.totalAmount.toFixed(2)}</td>
		</tr>
	`
		)
		.join('')

	const totalHTML = `
		<tr>
			<td colspan="2" style="border: 1px solid #000; padding: 8px; font-weight: bold;">Итого:</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">${shipment.totalAmount.toFixed(2)}</td>
			<td colspan="2" style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">0,00</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">0,00</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">${shipment.totalAmount.toFixed(2)}</td>
		</tr>
	`

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<style>
				body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
				.header { text-align: center; margin-bottom: 20px; }
				.section { margin-bottom: 15px; }
				.section-title { font-weight: bold; margin-bottom: 5px; }
				table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
				td { padding: 5px; }
				.info-row { display: flex; margin-bottom: 5px; }
				.info-label { font-weight: bold; width: 150px; }
				.signature-line { border-top: 1px solid #000; width: 150px; display: inline-block; margin-top: 20px; }
			</style>
		</head>
		<body>
			<div class="header">
				<h2>${shipment.actNumber} от ${actDate}</h2>
			</div>

			<div class="section">
				<div class="section-title">Исполнитель</div>
				<div>${supplierInfo.name}</div>
				<div>ИНН: ${supplierInfo.inn}</div>
				<div>р/с ${supplierInfo.accountNumber}</div>
				<div>в ${supplierInfo.bankName} г Москва</div>
				<div>БИК ${supplierInfo.bik}</div>
				<div>корр/с ${supplierInfo.correspondentAccount}</div>
				<div>${supplierInfo.address}</div>
			</div>

			<div class="section">
				<div class="section-title">Заказчик</div>
				<div>${shipment.clientName}</div>
				<div>ИНН: ${shipment.clientInn}</div>
				<div>${shipment.clientAddress}</div>
			</div>

			<div class="section">
				<table>
					<thead>
						<tr style="background-color: #f0f0f0;">
							<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">№</td>
							<td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Наименование работы (услуги)</td>
							<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Цена</td>
							<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Кол-во</td>
							<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Ед. изм.</td>
							<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Без НДС</td>
							<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">НДС</td>
							<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Сумма</td>
						</tr>
					</thead>
					<tbody>
						${itemsHTML}
						${totalHTML}
					</tbody>
				</table>
			</div>

			<div class="section">
				<div>Всего оказано услуг ${shipment.items.length}, на сумму</div>
				<div><strong>${totalWords} рублей ${String(totalKopecks).padStart(2, '0')} копеек</strong></div>
			</div>

			<div class="section">
				<div>Вышеперечисленные услуги выполнены полностью и в срок. Заказчик претензий по объёму, качеству и срокам оказания услуг не имеет.</div>
			</div>

			<div class="section" style="margin-top: 40px;">
				<div style="display: flex; justify-content: space-between;">
					<div>
						<div>Исполнитель: _______________</div>
						<div style="margin-top: 20px;">подпись</div>
						<div style="margin-top: 10px;">М.П.</div>
					</div>
					<div>
						<div>Заказчик: _______________</div>
						<div style="margin-top: 20px;">подпись</div>
						<div style="margin-top: 10px;">М.П.</div>
					</div>
				</div>
			</div>
		</body>
		</html>
	`
}

export const exportShipmentToPDF = async (
	shipment: IShipment,
	supplierInfo: ISupplierInfo
): Promise<boolean> => {
	try {
		const html = generateShipmentHTML(shipment, supplierInfo)

		const { uri } = await Print.printToFileAsync({
			html,
			base64: false
		})

		if (await Sharing.isAvailableAsync()) {
			await Sharing.shareAsync(uri, {
				mimeType: 'application/pdf',
				dialogTitle: `Поделиться ${shipment.actNumber}`
			})
		}

		return true
	} catch (error) {
		console.error('Ошибка при экспорте в PDF:', error)
		return false
	}
}
