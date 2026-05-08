import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  columns: ExportColumn[];
  data: any[];
}

/**
 * Export data to Excel file
 */
export const exportToExcel = (options: ExportOptions) => {
  try {
    const { filename, columns, data } = options;

    // Create worksheet data with headers
    const wsData = [
      columns.map((col) => col.header),
      ...data.map((row) => columns.map((col) => row[col.key] ?? "")),
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws["!cols"] = columns.map((col) => ({ wch: col.width || 15 }));

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}.xlsx`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
};

/**
 * Export data to CSV file
 */
export const exportToCSV = (options: ExportOptions) => {
  try {
    const { filename, columns, data } = options;

    // Create CSV content
    const headers = columns.map((col) => col.header).join(",");
    const rows = data
      .map((row) =>
        columns
          .map((col) => {
            const value = row[col.key] ?? "";
            // Escape commas and quotes
            return typeof value === "string" && value.includes(",")
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(","),
      )
      .join("\n");

    const csvContent = `${headers}\n${rows}`;

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${filename}.csv`);
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    throw error;
  }
};

/**
 * Export data to PDF file with simple table
 */
export const exportToPDF = (options: ExportOptions) => {
  try {
    const { filename, title, columns, data } = options;

    const doc = new jsPDF();
    let yPosition = 20;

    // Add title
    if (title) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, yPosition);
      yPosition += 10;
    }

    // Set font for table
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Calculate column widths
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const tableWidth = pageWidth - 2 * margin;
    const colWidth = tableWidth / columns.length;

    // Draw header
    doc.setFillColor(59, 130, 246); // Primary blue
    doc.setTextColor(255, 255, 255); // White text
    doc.setFont("helvetica", "bold");
    doc.rect(margin, yPosition, tableWidth, 8, "F");

    columns.forEach((col, index) => {
      doc.text(col.header, margin + index * colWidth + 2, yPosition + 6, {
        maxWidth: colWidth - 4,
      });
    });

    yPosition += 8;

    // Draw data rows
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFont("helvetica", "normal");

    data.forEach((row, rowIndex) => {
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.setFillColor(245, 247, 250); // Light gray
        doc.rect(margin, yPosition, tableWidth, 7, "F");
      }

      columns.forEach((col, colIndex) => {
        const value = String(row[col.key] ?? "");
        doc.text(value, margin + colIndex * colWidth + 2, yPosition + 5, {
          maxWidth: colWidth - 4,
        });
      });

      yPosition += 7;

      // Add new page if needed
      if (yPosition > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPosition = 20;
      }
    });

    // Save PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
};

/**
 * Format date for export
 */
export const formatDateForExport = (date: string | Date): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format currency for export
 */
export const formatCurrencyForExport = (amount: number | string): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return "0.00 ETB";
  return `${numAmount.toFixed(2)} ETB`;
};

/**
 * Format status for export
 */
export const formatStatus = (status: string | null | undefined): string => {
  if (!status) return "N/A";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};
