import PDFDocument from 'pdfkit';
import { Response } from 'express';

export class PdfService {
  /**
   * Generates a PDF invoice and pipes it directly to the Express response
   */
  static generateInvoicePdf(invoice: any, res: Response) {
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe the PDF into the response
    doc.pipe(res);
    
    // 1. Header (Workspace Name & INVOICE title)
    doc
      .fillColor('#000000')
      .fontSize(24)
      .text('INVOICE', 50, 50)
      .fontSize(10)
      .fillColor('#888888')
      .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 80);

    doc
      .fillColor('#000000')
      .fontSize(20)
      .text(invoice.workspace.name, 200, 50, { align: 'right' })
      .fontSize(10)
      .fillColor('#888888')
      .text(new Date(invoice.issueDate).toLocaleDateString(), 200, 80, { align: 'right' });

    doc.moveTo(50, 110).lineTo(550, 110).strokeColor('#EEEEEE').stroke();

    // 2. Client Details & Dates
    doc.fillColor('#000000').fontSize(12).text('Billed To', 50, 130);
    
    doc.fontSize(10).fillColor('#333333');
    let clientY = 150;
    doc.text(invoice.client.company, 50, clientY);
    clientY += 15;
    doc.text(`Attn: ${invoice.client.name}`, 50, clientY);
    if (invoice.client.email) {
      clientY += 15;
      doc.text(invoice.client.email, 50, clientY);
    }
    if (invoice.client.billingAddress) {
      clientY += 15;
      doc.text(invoice.client.billingAddress, 50, clientY);
    }

    doc.fillColor('#000000').fontSize(12).text('Invoice Details', 350, 130);
    doc.fontSize(10).fillColor('#333333');
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 350, 150);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 350, 165);
    doc.text(`Status: ${invoice.status}`, 350, 180);
    
    // 3. Line Items Table Header
    const tableTop = 250;
    doc.moveTo(50, tableTop - 10).lineTo(550, tableTop - 10).strokeColor('#EEEEEE').stroke();
    
    doc
      .fillColor('#888888')
      .fontSize(10)
      .text('Description', 50, tableTop)
      .text('Qty', 350, tableTop)
      .text('Unit Price', 400, tableTop)
      .text('Total', 480, tableTop, { width: 70, align: 'right' });
      
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#EEEEEE').stroke();

    // 4. Line Items
    let y = tableTop + 25;
    doc.fillColor('#000000');
    for (const item of invoice.items) {
      doc
        .text(item.description, 50, y, { width: 280 })
        .text(item.quantity.toString(), 350, y)
        .text(Number(item.unitPrice).toLocaleString(), 400, y)
        .text(Number(item.total).toLocaleString(), 480, y, { width: 70, align: 'right' });
      
      y += 20;
    }

    doc.moveTo(50, y + 10).lineTo(550, y + 10).strokeColor('#EEEEEE').stroke();

    // 5. Totals
    const totalsTop = y + 30;
    
    doc.fillColor('#888888').text('Subtotal', 350, totalsTop);
    doc.fillColor('#000000').text(Number(invoice.subtotal).toLocaleString(), 480, totalsTop, { width: 70, align: 'right' });

    doc.fillColor('#888888').text('Tax', 350, totalsTop + 20);
    doc.fillColor('#000000').text(Number(invoice.tax).toLocaleString(), 480, totalsTop + 20, { width: 70, align: 'right' });

    doc.moveTo(350, totalsTop + 35).lineTo(550, totalsTop + 35).strokeColor('#EEEEEE').stroke();

    doc.fillColor('#000000').fontSize(12).text('Total', 350, totalsTop + 45);
    doc.text(`${invoice.currency} ${Number(invoice.total).toLocaleString()}`, 480, totalsTop + 45, { width: 70, align: 'right' });

    if (Number(invoice.amountPaid) > 0) {
      doc.fillColor('#4CAF50').fontSize(10).text('Amount Paid', 350, totalsTop + 65);
      doc.text(`-${invoice.currency} ${Number(invoice.amountPaid).toLocaleString()}`, 480, totalsTop + 65, { width: 70, align: 'right' });
      
      doc.fillColor('#000000').text('Balance Due', 350, totalsTop + 80);
      doc.text(`${invoice.currency} ${Number(invoice.balanceDue).toLocaleString()}`, 480, totalsTop + 80, { width: 70, align: 'right' });
    }

    // 6. Notes Footer
    if (invoice.notes) {
      doc.fontSize(10).fillColor('#888888').text('Notes:', 50, totalsTop + 120);
      doc.fillColor('#333333').text(invoice.notes, 50, totalsTop + 135, { width: 500 });
    }

    // Finalize the PDF and end the stream
    doc.end();
  }
}
