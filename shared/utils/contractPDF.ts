import { IContract } from '@/shared/types/contracts.types'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'

export const generateContractHTML = (contract: IContract): string => {
	const currentDate = new Date().toLocaleDateString('ru-RU')

	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 40px;
          color: #333;
          line-height: 1.6;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .header h1 {
          font-size: 20px;
          margin: 0;
          font-weight: bold;
        }
        .header .date {
          font-size: 12px;
          color: #666;
          margin-top: 10px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
          text-decoration: underline;
        }
        .content {
          font-size: 11px;
          text-align: justify;
          white-space: pre-wrap;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11px;
        }
        .info-table td {
          padding: 8px;
          border: 1px solid #ddd;
        }
        .label {
          font-weight: bold;
          background-color: #f5f5f5;
          width: 30%;
        }
        .signature-block {
          display: flex;
          justify-content: space-between;
          margin-top: 60px;
          font-size: 11px;
        }
        .signature-line {
          flex: 1;
          text-align: center;
          border-top: 1px solid #000;
          padding-top: 10px;
        }
        .footer {
          margin-top: 40px;
          font-size: 10px;
          color: #999;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>ДОГОВОР ОБ ОКАЗАНИИ УСЛУГ ФУЛФИЛМЕНТА</h1>
          <div class="date">
            Договор №: ${contract.contractNumber}<br>
            Дата заключения: ${currentDate}
          </div>
        </div>

        <!-- Info Table -->
        <table class="info-table">
          <tr>
            <td class="label">Заказчик:</td>
            <td>${contract.clientName}</td>
          </tr>
          <tr>
            <td class="label">Сумма договора:</td>
            <td>${contract.terms.price.toLocaleString()} ${contract.terms.currency}</td>
          </tr>
          <tr>
            <td class="label">Период действия:</td>
            <td>с ${new Date(contract.terms.validFrom).toLocaleDateString('ru-RU')} по ${new Date(contract.terms.validUntil).toLocaleDateString('ru-RU')}</td>
          </tr>
          <tr>
            <td class="label">Условия оплаты:</td>
            <td>${contract.terms.paymentTerms}</td>
          </tr>
        </table>

        <!-- Content -->
        <div class="section">
          <div class="section-title">1. СТОРОНЫ ДОГОВОРА</div>
          <div class="content">1.1 EXPRESS STOREHOUSE, юридическое лицо, именуемое в дальнейшем "ИСПОЛНИТЕЛЬ"

1.2 ${contract.clientName}, именуемое в дальнейшем "ЗАКАЗЧИК"</div>
        </div>

        <div class="section">
          <div class="section-title">2. ПРЕДМЕТ ДОГОВОРА</div>
          <div class="content">2.1 Исполнитель обязуется оказывать услуги фулфилмента, включающие:
- Прием, хранение и управление товарно-материальными ценностями
- Обработка и упаковка заказов
- Организация отправки товаров конечным покупателям
- Ведение учета остатков товара
- Консультация по выполнению операций всем каналам сбыта</div>
        </div>

        <div class="section">
          <div class="section-title">3. СТОИМОСТЬ УСЛУГ</div>
          <div class="content">3.1 Стоимость услуг: ${contract.terms.price.toLocaleString()} ${contract.terms.currency}

3.2 Счета выставляются ежемесячно на основании актов выполненных работ</div>
        </div>

        <div class="section">
          <div class="section-title">4. УСЛОВИЯ ОПЛАТЫ</div>
          <div class="content">4.1 ${contract.terms.paymentTerms}

4.2 Оплата производится на счет Исполнителя в российских рублях</div>
        </div>

        <div class="section">
          <div class="section-title">5. МЕСТО ИСПОЛНЕНИЯ</div>
          <div class="content">5.1 Услуги исполняются по адресу складского помещения Исполнителя</div>
        </div>

        <div class="section">
          <div class="section-title">6. СРОКИ ИСПОЛНЕНИЯ</div>
          <div class="content">6.1 ${contract.terms.deliveryTerms}</div>
        </div>

        <div class="section">
          <div class="section-title">7. КОНФИДЕНЦИАЛЬНОСТЬ</div>
          <div class="content">7.1 Стороны обязуются не разглашать конфиденциальную информацию друг друга третьим лицам без письменного согласия.

7.2 Информация о товарах, заказах и финансовых показателях считается конфиденциальной.</div>
        </div>

        <div class="section">
          <div class="section-title">8. ОТВЕТСТВЕННОСТЬ</div>
          <div class="content">8.1 Исполнитель несет ответственность за сохранность товара, находящегося на складе.

8.2 Максимальный размер ответственности не превышает стоимость услуг, оказанных в течение одного месяца.

8.3 Исполнитель не несет ответственности за убытки, вызванные качеством товара.</div>
        </div>

        <div class="section">
          <div class="section-title">9. СРОК ДЕЙСТВИЯ</div>
          <div class="content">9.1 Данный договор действует с ${new Date(contract.terms.validFrom).toLocaleDateString('ru-RU')} по ${new Date(contract.terms.validUntil).toLocaleDateString('ru-RU')}.

9.2 После истечения срока договор может быть пролонгирован на условиях, согласованных Сторонами.</div>
        </div>

        <div class="section">
          <div class="section-title">10. РАСТОРЖЕНИЕ ДОГОВОРА</div>
          <div class="content">10.1 Договор может быть расторгнут любой стороной с письменным уведомлением за 30 дней до предполагаемой даты расторжения.

10.2 При расторжении договора товар возвращается Заказчику в установленные сроки.</div>
        </div>

        <div class="section">
          <div class="section-title">11. РАЗРЕШЕНИЕ СПОРОВ</div>
          <div class="content">11.1 Все споры рассматриваются в соответствии с законодательством Российской Федерации.

11.2 Стороны обязуются предварительно урегулировать споры путем переговоров.</div>
        </div>

        <div class="section">
          <div class="section-title">12. ПРОЧИЕ УСЛОВИЯ</div>
          <div class="content">12.1 Все дополнительные условия обсуждаются и согласовываются в письменном виде.

12.2 Изменения договора действительны только если произведены в письменной форме и подписаны обеими Сторонами.</div>
        </div>

        <!-- Signature Block -->
        <div class="signature-block">
          <div class="signature-line">
            <strong>Исполнитель</strong><br>
            EXPRESS STOREHOUSE<br>
            _______________
          </div>
          <div class="signature-line">
            <strong>Заказчик</strong><br>
            ${contract.clientName}<br>
            _______________
          </div>
        </div>

        <div class="footer">
          <p>Договор вступает в силу с момента подписания Сторонами.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export const exportContractToPDF = async (
	contract: IContract
): Promise<boolean> => {
	try {
		const html = generateContractHTML(contract)

		const { uri } = await Print.printToFileAsync({
			html: html,
			base64: false
		})

		if (uri) {
			await Sharing.shareAsync(uri, {
				mimeType: 'application/pdf',
				dialogTitle: `Договор ${contract.contractNumber}`
			})
			return true
		}
		return false
	} catch (error) {
		console.error('Ошибка при экспорте в PDF:', error)
		return false
	}
}
