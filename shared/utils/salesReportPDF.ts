import { ISale } from '@/shared/types/sales.types'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'

export type ReportPeriod = 'today' | 'week' | 'month' | 'year'

const PERIOD_LABELS: Record<ReportPeriod, string> = {
	today: 'За сегодня',
	week: 'За неделю',
	month: 'За месяц',
	year: 'За год'
}

interface SalesReportOptions {
	sales: ISale[]
	period: ReportPeriod
	totalAmount: number
	totalQuantity: number
}

const buildSaleRows = (sales: ISale[]): string => {
	const rows: string[] = []

	for (const sale of sales) {
		const dateStr = new Date(sale.timestamp).toLocaleDateString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
		const clientName = sale.clientName || '—'

		if (sale.items && sale.items.length > 0) {
			sale.items.forEach((item, idx) => {
				rows.push(`
					<tr>
						${idx === 0 ? `<td rowspan="${sale.items!.length}" style="padding:8px;border:1px solid #ddd;font-size:11px;vertical-align:top;">${dateStr}</td>` : ''}
						${idx === 0 ? `<td rowspan="${sale.items!.length}" style="padding:8px;border:1px solid #ddd;font-size:11px;vertical-align:top;">${clientName}</td>` : ''}
						<td style="padding:8px;border:1px solid #ddd;font-size:11px;">${item.productName}</td>
						<td style="padding:8px;border:1px solid #ddd;font-size:11px;text-align:center;">${item.quantity}</td>
						<td style="padding:8px;border:1px solid #ddd;font-size:11px;text-align:right;">${item.price.toLocaleString()} ₽</td>
						<td style="padding:8px;border:1px solid #ddd;font-size:11px;text-align:right;font-weight:bold;">${item.totalAmount.toLocaleString()} ₽</td>
					</tr>
				`)
			})
		} else if (sale.productName) {
			rows.push(`
				<tr>
					<td style="padding:8px;border:1px solid #ddd;font-size:11px;">${dateStr}</td>
					<td style="padding:8px;border:1px solid #ddd;font-size:11px;">${clientName}</td>
					<td style="padding:8px;border:1px solid #ddd;font-size:11px;">${sale.productName}</td>
					<td style="padding:8px;border:1px solid #ddd;font-size:11px;text-align:center;">${sale.quantity ?? 0}</td>
					<td style="padding:8px;border:1px solid #ddd;font-size:11px;text-align:right;">${(sale.price ?? 0).toLocaleString()} ₽</td>
					<td style="padding:8px;border:1px solid #ddd;font-size:11px;text-align:right;font-weight:bold;">${sale.totalAmount.toLocaleString()} ₽</td>
				</tr>
			`)
		}
	}

	return rows.join('')
}

const generateReportHTML = (options: SalesReportOptions): string => {
	const { sales, period, totalAmount, totalQuantity } = options
	const generatedAt = new Date().toLocaleDateString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
	const periodLabel = PERIOD_LABELS[period]
	const saleRows = buildSaleRows(sales)

	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #222; }
    h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
    .subtitle { text-align: center; font-size: 12px; color: #666; margin-bottom: 24px; }
    .stats { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat-card { flex: 1; border: 1px solid #ddd; border-radius: 6px; padding: 12px 16px; }
    .stat-label { font-size: 11px; color: #888; }
    .stat-value { font-size: 20px; font-weight: bold; color: #BF3335; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5f5; padding: 10px 8px; border: 1px solid #ddd; font-size: 11px; text-align: left; }
    .total-row td { background: #f0f0f0; font-weight: bold; font-size: 12px; }
    .footer { margin-top: 32px; font-size: 10px; color: #aaa; text-align: center; }
    .empty { text-align: center; padding: 40px; color: #999; font-size: 13px; }
  </style>
</head>
<body>
  <h1>ОТЧЁТ ПО ПРОДАЖАМ</h1>
  <div class="subtitle">EXPRESS STOREHOUSE &nbsp;·&nbsp; ${periodLabel} &nbsp;·&nbsp; Сформирован: ${generatedAt}</div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-label">Количество продаж</div>
      <div class="stat-value">${sales.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Продано единиц товара</div>
      <div class="stat-value">${totalQuantity}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Общая выручка</div>
      <div class="stat-value">${totalAmount.toLocaleString()} ₽</div>
    </div>
  </div>

  ${
		sales.length === 0
			? '<div class="empty">Нет продаж за выбранный период</div>'
			: `
  <table>
    <thead>
      <tr>
        <th style="width:130px;">Дата и время</th>
        <th style="width:130px;">Клиент</th>
        <th>Товар</th>
        <th style="width:60px;text-align:center;">Кол-во</th>
        <th style="width:90px;text-align:right;">Цена</th>
        <th style="width:100px;text-align:right;">Сумма</th>
      </tr>
    </thead>
    <tbody>
      ${saleRows}
      <tr class="total-row">
        <td colspan="3" style="padding:10px 8px;border:1px solid #ddd;text-align:right;">ИТОГО:</td>
        <td style="padding:10px 8px;border:1px solid #ddd;text-align:center;">${totalQuantity}</td>
        <td style="padding:10px 8px;border:1px solid #ddd;"></td>
        <td style="padding:10px 8px;border:1px solid #ddd;text-align:right;">${totalAmount.toLocaleString()} ₽</td>
      </tr>
    </tbody>
  </table>
  `
	}

  <div class="footer">EXPRESS STOREHOUSE · Автоматически сформированный отчёт</div>
</body>
</html>
`
}

export const exportSalesReportToPDF = async (
	options: SalesReportOptions
): Promise<boolean> => {
	try {
		const html = generateReportHTML(options)
		const { uri } = await Print.printToFileAsync({ html, base64: false })

		if (uri) {
			await Sharing.shareAsync(uri, {
				mimeType: 'application/pdf',
				dialogTitle: `Отчёт по продажам — ${PERIOD_LABELS[options.period]}`
			})
			return true
		}
		return false
	} catch (error) {
		console.error('Ошибка при экспорте отчёта:', error)
		return false
	}
}
