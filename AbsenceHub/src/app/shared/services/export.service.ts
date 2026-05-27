import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AbsenceRequest, ABSENCE_TYPE_LABELS, STATUS_LABELS } from '../models/absence.model';

@Injectable({ providedIn: 'root' })
export class ExportService {

  private fmt(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }

  exportPdf(rows: AbsenceRequest[], from: string, to: string): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const now = new Date().toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    // ── Header background ─────────────────────────────────────────────
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, W, 46, 'F');

    // ── Logo mark (rounded rect + initials) ───────────────────────────
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(12, 9, 27, 28, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('AH', 25.5, 27, { align: 'center' });

    // ── Brand name ────────────────────────────────────────────────────
    doc.setFontSize(21);
    doc.setTextColor(255, 255, 255);
    doc.text('AbsenceHub', 45, 22);

    // ── Tagline ───────────────────────────────────────────────────────
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(147, 197, 253);
    doc.text('Sistema de Gestión de Ausencias', 45, 30);

    // ── Metadata right ────────────────────────────────────────────────
    doc.setFontSize(7.5);
    doc.setTextColor(147, 197, 253);
    doc.text('Generado el ' + now, W - 12, 17, { align: 'right' });
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('INFORME DE AUSENCIAS', W - 12, 28, { align: 'right' });

    // ── Divider ───────────────────────────────────────────────────────
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(12, 56, W - 12, 56);

    // ── Period info ───────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 95);
    doc.text('Período analizado', 12, 64);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `${this.fmt(from)}  —  ${this.fmt(to)}   ·   ${rows.length} registro${rows.length !== 1 ? 's' : ''}`,
      12, 71,
    );

    // ── Table ─────────────────────────────────────────────────────────
    autoTable(doc, {
      startY: 78,
      head: [['Empleado', 'Tipo', 'Inicio', 'Fin', 'Días', 'Estado']],
      body: rows.map(r => [
        r.userName,
        ABSENCE_TYPE_LABELS[r.type] ?? r.type,
        this.fmt(r.startDate),
        this.fmt(r.endDate),
        String(r.days),
        STATUS_LABELS[r.status] ?? r.status,
      ]),
      margin: { left: 12, right: 12 },
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [51, 65, 85],
        cellPadding: 3.5,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 44 },
        1: { cellWidth: 30 },
        2: { cellWidth: 24 },
        3: { cellWidth: 24 },
        4: { cellWidth: 14, halign: 'center' },
        5: { cellWidth: 30 },
      },
      styles: { lineColor: [226, 232, 240], lineWidth: 0.25 },
    });

    // ── Footers (second pass once total pages is known) ───────────────
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `AbsenceHub — Documento confidencial  |  Página ${p} de ${total}`,
        W / 2,
        H - 8,
        { align: 'center' },
      );
    }

    doc.save(`ausencias_${from}_${to}.pdf`);
  }

  exportExcel(rows: AbsenceRequest[], from: string, to: string): void {
    const data = rows.map(r => ({
      'Empleado': r.userName,
      'Tipo': ABSENCE_TYPE_LABELS[r.type] ?? r.type,
      'Inicio': this.fmt(r.startDate),
      'Fin': this.fmt(r.endDate),
      'Días': r.days,
      'Estado': STATUS_LABELS[r.status] ?? r.status,
      'Motivo': r.reason,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 12 },
      { wch: 12 }, { wch: 8 },  { wch: 13 }, { wch: 40 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ausencias');
    XLSX.writeFile(wb, `ausencias_${from}_${to}.xlsx`);
  }
}
