import { IInvoice } from '@/shared/types/invoice.types'
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

const generateInvoiceHTML = (invoice: IInvoice, supplierInfo: ISupplierInfo): string => {
	const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('ru-RU')
	const periodFrom = new Date(invoice.periodFrom).toLocaleDateString('ru-RU')
	const periodTo = new Date(invoice.periodTo).toLocaleDateString('ru-RU')
	const totalRubles = Math.floor(invoice.totalAmount)
	const totalKopecks = Math.round((invoice.totalAmount - totalRubles) * 100)
	const totalWords = numberToWords(totalRubles)

	// Группируем услуги по названию для суммирования
	const groupedItems = new Map<string, { quantity: number; price: number; totalAmount: number }>()
	invoice.items.forEach(item => {
		const key = item.serviceName
		if (groupedItems.has(key)) {
			const existing = groupedItems.get(key)!
			groupedItems.set(key, {
				quantity: existing.quantity + item.quantity,
				price: item.price,
				totalAmount: existing.totalAmount + item.totalAmount
			})
		} else {
			groupedItems.set(key, {
				quantity: item.quantity,
				price: item.price,
				totalAmount: item.totalAmount
			})
		}
	})

	const itemsHTML = Array.from(groupedItems.entries())
		.map(
			([serviceName, data], idx) => `
		<tr>
			<td style="border: 1px solid #000; padding: 8px; text-align: center;">${idx + 1}</td>
			<td style="border: 1px solid #000; padding: 8px;">${serviceName}</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right;">${data.price.toFixed(2)}</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: center;">${data.quantity}</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: center;">шт</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right;">0,00</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right;">0,00</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right;">${data.totalAmount.toFixed(2)}</td>
		</tr>
	`
		)
		.join('')

	const totalHTML = `
		<tr>
			<td colspan="2" style="border: 1px solid #000; padding: 8px; font-weight: bold;">Итого:</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;"></td>
			<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">${invoice.totalQuantity}</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">шт</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">0,00</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">0,00</td>
			<td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">${invoice.totalAmount.toFixed(2)}</td>
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
				.page-break { page-break-after: always; margin-top: 40px; }
			</style>
		</head>
		<body>
			<!-- СЧЕТ -->
			<div class="header">
				<h2>${invoice.invoiceNumber} от ${invoiceDate}</h2>
			</div>

			<div class="section">
				<div class="section-title">Поставщик (Исполнитель)</div>
				<div>${supplierInfo.name}</div>
				<div>ИНН: ${supplierInfo.inn}</div>
				<div>р/с ${supplierInfo.accountNumber}</div>
				<div>в ${supplierInfo.bankName} г Москва</div>
				<div>БИК ${supplierInfo.bik}</div>
				<div>корр/с ${supplierInfo.correspondentAccount}</div>
				<div>${supplierInfo.address}</div>
			</div>

			<div class="section">
				<div class="section-title">Покупатель (Заказчик)</div>
				<div>${invoice.clientName}</div>
				<div>ИНН: ${invoice.clientInn}</div>
				<div>${invoice.clientAddress}</div>
			</div>

			<div class="section">
				<div class="section-title">Период: ${periodFrom} - ${periodTo}</div>
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
				<div>Всего оказано услуг ${groupedItems.size}, на сумму</div>
				<div><strong>${totalWords} рублей ${String(totalKopecks).padStart(2, '0')} копеек</strong></div>
			</div>

			<div class="section">
				<div>Внимание! Оплата данного счета означает согласие с условиями поставки товара.</div>
				<div>Уведомление об оплате обязательно, в противном случае не гарантируется наличие товара на складе.</div>
				<div>Товар отпускается по факту прихода денег на р/с Поставщика, самовывозом, при наличии доверенности и паспорта.</div>
			</div>

			<div class="section" style="margin-top: 40px;">
				<div style="display: flex; justify-content: space-between;">
					<div>
						<div>Поставщик: _______________</div>
						<div style="margin-top: 20px;">подпись</div>
						<div style="margin-top: 10px;">М.П.</div>
					</div>
					<div>
						<div>Покупатель: _______________</div>
						<div style="margin-top: 20px;">подпись</div>
						<div style="margin-top: 10px;">М.П.</div>
					</div>
				</div>
			</div>

			<!-- ПРИЛОЖЕННЫЕ АКТЫ -->
			<div class="page-break">
				<h3>Приложение: Акты отгрузки</h3>
			</div>
		</body>
		</html>
	`
}

export const exportInvoiceToPDF = async (
	invoice: IInvoice,
	shipments: IShipment[],
	supplierInfo: ISupplierInfo
): Promise<boolean> => {
	try {
		const invoiceHTML = generateInvoiceHTML(invoice, supplierInfo)

		// Генерируем HTML для каждого акта
		let shipmentsHTML = ''
		shipments.forEach((shipment, idx) => {
			const actDate = new Date(shipment.actDate).toLocaleDateString('ru-RU')
			const itemsHTML = shipment.items
				.map(
					(item, itemIdx) => `
				<tr>
					<td style="border: 1px solid #000; padding: 8px; text-align: center;">${itemIdx + 1}</td>
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

			const totalAmount = shipment.items.reduce((sum, item) => sum + item.totalAmount, 0)

			shipmentsHTML += `
				<div style="page-break-after: always; margin-bottom: 40px;">
					<h3>${shipment.actNumber} от ${actDate}</h3>
					<div style="margin-bottom: 15px;">
						<div><strong>Исполнитель:</strong> ${supplierInfo.name}</div>
						<div><strong>Заказчик:</strong> ${shipment.clientName}</div>
					</div>
					<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
						<thead>
							<tr style="background-color: #f0f0f0;">
								<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">№</td>
								<td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Наименование</td>
								<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Цена</td>
								<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Кол-во</td>
								<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Ед.</td>
								<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Без НДС</td>
								<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">НДС</td>
								<td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Сумма</td>
							</tr>
						</thead>
						<tbody>
							${itemsHTML}
							<tr>
								<td colspan="7" style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">Итого:</td>
								<td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;">${totalAmount.toFixed(2)}</td>
							</tr>
						</tbody>
					</table>
				</div>
			`
		})

		const fullHTML = invoiceHTML.replace('<!-- ПРИЛОЖЕННЫЕ АКТЫ -->', shipmentsHTML)

		const { uri } = await Print.printToFileAsync({
			html: fullHTML,
			base64: false
		})

		if (await Sharing.isAvailableAsync()) {
			await Sharing.shareAsync(uri, {
				mimeType: 'application/pdf',
				dialogTitle: `Поделиться ${invoice.invoiceNumber}`
			})
		}

		return true
	} catch (error) {
		console.error('Ошибка при экспорте счета в PDF:', error)
		return false
	}
}
