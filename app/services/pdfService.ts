
import jsPDF from 'jspdf';
import { TranslationType, DEFAULT_LABELS } from '../utils/translations';

interface DiagnosisReportData {
    patient: {
        id: string;
        name: string;
        age: number;
        gender: string;
        scanType: string;
        scanDate: string;
        email?: string;
        phone?: string;
        bloodType?: string;
    };
    diagnosis: string;
    aiReport?: {
        summary: string;
        findings: string[];
        recommendations: string[];
        generatedAt: string;
        confidence?: number;
    };
}

// Helper to load image as base64
const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            } else {
                reject(new Error("Could not get canvas context"));
            }
        };
        img.onerror = (e) => reject(e);
    });
};

export async function generateDiagnosisReport(
    data: DiagnosisReportData,
    translations?: TranslationType
): Promise<void> {
    const doc = new jsPDF();
    // Default to English if no translations provided
    const t = translations || DEFAULT_LABELS;
    
    // Load logo first
    try {
        const logoData = await loadImage('/logos.png');
        doc.addImage(logoData, 'PNG', 10, 10, 20, 20);
    } catch (e) {
        console.warn("Could not load logo for PDF", e);
    }

    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Helper function to draw header on subsequent pages
    const drawPageHeader = () => {
        doc.setFillColor(0, 45, 153);
        doc.rect(0, 0, pageWidth, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(t.pdf.title, pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 255, 255);
        doc.text(`${t.fields.patientId} ${data.patient.name} | ${t.fields.patientId.replace(':', '')} ${data.patient.id}`, pageWidth / 2, 25, { align: 'center' });

        return 45; // Return starting Y position after header
    };

    // Header for first page
    doc.setFillColor(0, 45, 153); // Teal color
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(t.pdf.title, pageWidth / 2, 15, { align: 'center' });


    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    yPosition = 50;

    // Patient Information Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.pdf.patientInfo, margin, yPosition);
    yPosition += 8;

    // Draw a line under section header
    doc.setDrawColor(0, 45, 153);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const patientInfo = [
        [t.fields.name, data.patient.name],
        [t.fields.patientId, data.patient.id],
        [t.fields.age, `${data.patient.age} ${t.patientHeader.years}`],
        [t.fields.gender, data.patient.gender],
        [t.fields.scanType, data.patient.scanType],
        [t.fields.scanDate, new Date(data.patient.scanDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })],
    ];

    if (data.patient.bloodType) {
        patientInfo.push([t.fields.bloodType, data.patient.bloodType]);
    }

    patientInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 35, yPosition);
        yPosition += 6;
    });

    yPosition += 5;

    // Diagnosis Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.pdf.diagnosis, margin, yPosition);
    yPosition += 8;

    doc.setDrawColor(0, 45, 153);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (data.aiReport?.summary) {
        const summaryLines = doc.splitTextToSize(data.aiReport.summary, contentWidth);
        doc.text(summaryLines, margin, yPosition);
        yPosition += (summaryLines.length * 5) + 5;
    } else {
        doc.text(data.diagnosis, margin, yPosition);
        yPosition += 10;
    }

    // Key Findings Section
    if (data.aiReport?.findings && data.aiReport.findings.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
            doc.addPage();
            yPosition = drawPageHeader();
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(t.pdf.keyFindings, margin, yPosition);
        yPosition += 8;

        doc.setDrawColor(0, 45, 153);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        data.aiReport.findings.forEach((finding, index) => {
            // Check if we need a new page
            if (yPosition > 270) {
                doc.addPage();
                yPosition = drawPageHeader();
            }

            const bulletPoint = '•';
            doc.setFont('helvetica', 'bold');
            doc.text(bulletPoint, margin, yPosition);
            doc.setFont('helvetica', 'normal');

            const findingLines = doc.splitTextToSize(finding, contentWidth - 5);
            doc.text(findingLines, margin + 5, yPosition);
            yPosition += (findingLines.length * 5) + 3;
        });

        yPosition += 5;
    }

    // Recommendations/Impression Section
    if (data.aiReport?.recommendations && data.aiReport.recommendations.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
            doc.addPage();
            yPosition = drawPageHeader();
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(t.pdf.recommendations, margin, yPosition);
        yPosition += 8;

        doc.setDrawColor(0, 45, 153);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        data.aiReport.recommendations.forEach((rec, index) => {
            // Check if we need a new page
            if (yPosition > 270) {
                doc.addPage();
                yPosition = drawPageHeader();
            }

            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}.`, margin, yPosition);
            doc.setFont('helvetica', 'normal');

            const recLines = doc.splitTextToSize(rec, contentWidth - 5);
            doc.text(recLines, margin + 5, yPosition);
            yPosition += (recLines.length * 5) + 3;
        });
    }

    // Add authorization signature at the end
    // Check if we need space for signature
    if (yPosition > 230) {
        doc.addPage();
        yPosition = drawPageHeader();
    }

    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(t.pdf.authorizedSignature, margin, yPosition);
    yPosition += 15;

    // Signature line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, margin + 60, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.text(`${t.fields.date} 05 Dec 2025`, margin, yPosition);
    yPosition += 5;
    doc.text(`${t.fields.time} 23:32`, margin, yPosition);

    // Footer on last page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Add page number
        doc.setFontSize(8);
        doc.setTextColor(0, 45, 153);
        doc.text(`${t.common.page} ${i} ${t.common.of} ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

        // Add footer on last page
        if (i === pageCount) {
            const footerY = doc.internal.pageSize.getHeight() - 30;

            doc.setDrawColor(200, 200, 200);
            doc.line(margin, footerY, pageWidth - margin, footerY);

            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(t.common.generatedBy, margin, footerY + 5);

            if (data.aiReport?.generatedAt) {
                const generatedDate = new Date(data.aiReport.generatedAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                });
                doc.text(`${t.common.generatedAt} ${generatedDate}`, pageWidth - margin, footerY + 5, { align: 'right' });
            }
            doc.setFontSize(7);
        }
    }

    // Generate filename
    const patientNameForFile = data.patient.name.replace(/\s+/g, '_');
    const dateForFile = new Date().toISOString().split('T')[0];
    const filename = `Medical_Report_${patientNameForFile}_${dateForFile}.pdf`;

    // Save the PDF
    doc.save(filename);
}
