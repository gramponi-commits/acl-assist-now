import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StoredSession } from './sessionStorage';
import { HsAndTs, PostROSCChecklist, PostROSCVitals, PregnancyCauses, PregnancyInterventions } from '@/types/acls';
import i18n from '@/i18n';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

const formatTime = (ms: number) => {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const formatDeviceTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const getHsTsChecked = (hsAndTs: HsAndTs, t: (key: string) => string): string[] => {
  const checked: string[] = [];
  if (hsAndTs.hypovolemia) checked.push(t('hsTs.hypovolemia'));
  if (hsAndTs.hypoxia) checked.push(t('hsTs.hypoxia'));
  if (hsAndTs.hydrogenIon) checked.push(t('hsTs.hydrogenIon'));
  if (hsAndTs.hypoHyperkalemia) checked.push(t('hsTs.hypoHyperkalemia'));
  if (hsAndTs.hypothermia) checked.push(t('hsTs.hypothermia'));
  if (hsAndTs.tensionPneumothorax) checked.push(t('hsTs.tensionPneumo'));
  if (hsAndTs.tamponade) checked.push(t('hsTs.tamponade'));
  if (hsAndTs.toxins) checked.push(t('hsTs.toxins'));
  if (hsAndTs.thrombosisPulmonary) checked.push(t('hsTs.thrombosisPulm'));
  if (hsAndTs.thrombosisCoronary) checked.push(t('hsTs.thrombosisCoro'));
  return checked;
};

const getPostROSCCompleted = (checklist: PostROSCChecklist, t: (key: string) => string): string[] => {
  const done: string[] = [];
  if (checklist.airwaySecured) done.push(t('postRosc.airwaySecured'));
  if (checklist.ventilationOptimized) done.push(t('postRosc.ventilationOptimized'));
  if (checklist.hemodynamicsOptimized) done.push(t('postRosc.hemodynamicsOptimized'));
  if (checklist.twelveLeadECG) done.push(t('postRosc.twelveLeadECG'));
  if (checklist.labsOrdered) done.push(t('postRosc.labsOrdered'));
  if (checklist.temperatureManagement) done.push(t('postRosc.temperatureManagement'));
  if (checklist.neurologicalAssessment) done.push(t('postRosc.neurologicalAssessment'));
  if (checklist.eegOrdered) done.push(t('postRosc.eegOrdered'));
  return done;
};

const getPregnancyInterventionsChecked = (interventions: PregnancyInterventions, t: (key: string) => string): string[] => {
  const checked: string[] = [];
  if (interventions.leftUterineDisplacement) checked.push(t('pregnancy.leftUterine'));
  if (interventions.earlyAirway) checked.push(t('pregnancy.earlyAirway'));
  if (interventions.ivAboveDiaphragm) checked.push(t('pregnancy.ivAbove'));
  if (interventions.stopMagnesiumGiveCalcium) checked.push(t('pregnancy.stopMagnesium'));
  if (interventions.detachFetalMonitors) checked.push(t('pregnancy.detachFetal'));
  if (interventions.massiveTransfusion) checked.push(t('pregnancy.massiveTransfusion'));
  return checked;
};

const getPregnancyCausesChecked = (causes: PregnancyCauses, t: (key: string) => string): string[] => {
  const checked: string[] = [];
  if (causes.anestheticComplications) checked.push(t('pregnancy.anesthetic'));
  if (causes.bleeding) checked.push(t('pregnancy.bleeding'));
  if (causes.cardiovascular) checked.push(t('pregnancy.cardiovascular'));
  if (causes.drugs) checked.push(t('pregnancy.drugs'));
  if (causes.embolic) checked.push(t('pregnancy.embolic'));
  if (causes.fever) checked.push(t('pregnancy.fever'));
  if (causes.generalCauses) checked.push(t('pregnancy.generalCauses'));
  if (causes.hypertension) checked.push(t('pregnancy.hypertension'));
  return checked;
};

function drawHeader(pdf: jsPDF, session: StoredSession, startDate: Date, t: (key: string, params?: any) => string): number {
  let y = 15;

  // Title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t('pdf.title'), 105, y, { align: 'center' });

  // Horizontal line
  y += 3;
  pdf.setLineWidth(0.5);
  pdf.line(15, y, 195, y);

  y += 8;

  // Session info
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${t('pdf.sessionDate')}:`, 15, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(startDate.toLocaleDateString(), 55, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text(`${t('pdf.sessionTime')}:`, 110, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDeviceTime(session.startTime), 145, y);

  y += 7;

  // Protocol
  const isAdult = session.pathwayMode === 'adult';
  let protocolText = '';

  if (session.sessionType === 'bradytachy') {
    protocolText = `${t('pdf.protocolBradyTachy')} (${isAdult ? t('pdf.protocolACLS') : t('pdf.protocolPALS')})`;
  } else if (session.sessionType === 'bradytachy-arrest') {
    protocolText = t('pdf.protocolCombined');
  } else {
    protocolText = isAdult ? t('pdf.protocolACLS') : t('pdf.protocolPALS');
  }

  pdf.setFont('helvetica', 'bold');
  pdf.text(`${t('pdf.protocol')}:`, 15, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(protocolText, 55, y);

  // Patient weight if available
  if (session.patientWeight) {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t('pdf.weight')}:`, 110, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(t('pdf.weightKg', { weight: session.patientWeight }), 145, y);
    y += 7;
  } else {
    y += 7;
  }

  // Horizontal line
  pdf.setLineWidth(0.3);
  pdf.line(15, y, 195, y);

  return y + 5;
}

function drawSummarySection(pdf: jsPDF, session: StoredSession, y: number, t: (key: string, params?: any) => string): number {
  // Section title
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t('pdf.summary'), 15, y);
  y += 6;

  // Summary data
  pdf.setFontSize(9);

  // Outcome
  let outcomeText = t('pdf.unknown');
  if (session.outcome === 'rosc') outcomeText = t('pdf.outcomeROSC');
  else if (session.outcome === 'deceased') outcomeText = t('pdf.outcomeDeceased');
  else if (session.outcome === 'resolved') outcomeText = t('pdf.outcomeResolved');

  pdf.setFont('helvetica', 'bold');
  pdf.text(`${t('pdf.outcome')}:`, 15, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(outcomeText, 55, y);

  pdf.setFont('helvetica', 'bold');
  pdf.text(`${t('pdf.totalDuration')}:`, 110, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatTime(session.duration), 145, y);
  y += 6;

  // Only show cardiac arrest metrics if this was a cardiac arrest session
  if (session.sessionType === 'cardiac-arrest' || session.sessionType === 'bradytachy-arrest') {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t('pdf.totalCPRDuration')}:`, 15, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatTime(session.totalCPRTime), 55, y);

    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t('pdf.cprFraction')}:`, 110, y);
    pdf.setFont('helvetica', 'normal');
    const cprFraction = session.duration > 0 ? session.cprFraction.toFixed(1) : '0.0';
    pdf.text(`${cprFraction}%`, 145, y);
    y += 6;

    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t('pdf.shockCount')}:`, 15, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(String(session.shockCount), 55, y);

    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t('pdf.airwayManagement')}:`, 110, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(session.airwayStatus.toUpperCase(), 145, y);
    y += 6;

    // Medications
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t('pdf.medicationsGiven')}:`, 15, y);
    pdf.setFont('helvetica', 'normal');

    const meds: string[] = [];
    if (session.epinephrineCount > 0) meds.push(`${t('pdf.epinephrine')} (${session.epinephrineCount}×)`);
    if (session.amiodaroneCount > 0) meds.push(`${t('pdf.amiodarone')} (${session.amiodaroneCount}×)`);
    if (session.lidocaineCount > 0) meds.push(`${t('pdf.lidocaine')} (${session.lidocaineCount}×)`);

    pdf.text(meds.length > 0 ? meds.join(', ') : t('pdf.unknown'), 55, y);
    y += 6;

    // H's & T's
    const hsTsChecked = getHsTsChecked(session.hsAndTs, t);
    if (hsTsChecked.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${t('pdf.reversibleCauses')}:`, 15, y);
      pdf.setFont('helvetica', 'normal');
      const splitText = pdf.splitTextToSize(hsTsChecked.join(', '), 140);
      pdf.text(splitText, 55, y);
      y += splitText.length * 5 + 2;
    }

    // Post-ROSC care
    if (session.outcome === 'rosc' && session.postROSCChecklist) {
      const completed = getPostROSCCompleted(session.postROSCChecklist, t);
      if (completed.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${t('pdf.postROSCCare')}:`, 15, y);
        pdf.setFont('helvetica', 'normal');
        const splitText = pdf.splitTextToSize(completed.join(', '), 140);
        pdf.text(splitText, 55, y);
        y += splitText.length * 5 + 2;
      }

      // Post-ROSC vitals
      if (session.postROSCVitals) {
        const vitals = session.postROSCVitals;
        const vitalsText: string[] = [];
        if (vitals.spo2) vitalsText.push(`SpO₂: ${vitals.spo2}%`);
        if (vitals.paco2) vitalsText.push(`PaCO₂: ${vitals.paco2}`);
        if (vitals.map) vitalsText.push(`MAP: ${vitals.map}`);
        if (vitals.temperature) vitalsText.push(`Temp: ${vitals.temperature}°C`);
        if (vitals.glucose) vitalsText.push(`Glucose: ${vitals.glucose}`);

        if (vitalsText.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${t('pdf.vitalsRecorded')}:`, 15, y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(vitalsText.join(' • '), 55, y);
          y += 6;
        }
      }
    }

    // Pregnancy protocol
    if (session.pregnancyActive && session.pathwayMode === 'adult') {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${t('pdf.pregnancyProtocol')}:`, 15, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(t('postRosc.yes'), 55, y);
      y += 6;

      if (session.pregnancyInterventions) {
        const pregInterventions = getPregnancyInterventionsChecked(session.pregnancyInterventions, t);
        if (pregInterventions.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${t('pdf.interventionsPerformed')}:`, 15, y);
          pdf.setFont('helvetica', 'normal');
          const splitText = pdf.splitTextToSize(pregInterventions.join(', '), 140);
          pdf.text(splitText, 55, y);
          y += splitText.length * 5 + 2;
        }
      }

      if (session.pregnancyCauses) {
        const pregCauses = getPregnancyCausesChecked(session.pregnancyCauses, t);
        if (pregCauses.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${t('pdf.causesConsidered')}:`, 15, y);
          pdf.setFont('helvetica', 'normal');
          const splitText = pdf.splitTextToSize(pregCauses.join(', '), 140);
          pdf.text(splitText, 55, y);
          y += splitText.length * 5 + 2;
        }
      }
    }
  }

  // Horizontal line
  y += 2;
  pdf.setLineWidth(0.3);
  pdf.line(15, y, 195, y);

  return y + 5;
}

function drawTimelineTable(pdf: jsPDF, session: StoredSession, y: number, t: (key: string, params?: any) => string): void {
  // Section title
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(t('pdf.timeline'), 15, y);

  y += 5;

  // Prepare table data
  const tableData = session.interventions.map((intervention) => {
    const relativeTime = intervention.timestamp - session.startTime;
    const deviceTime = formatDeviceTime(intervention.timestamp);
    const elapsed = formatTime(relativeTime);

    // Use translation if available, otherwise fall back to details or type
    let eventText = intervention.details || intervention.type;
    if (intervention.translationKey) {
      try {
        eventText = t(intervention.translationKey, intervention.translationParams || {});
      } catch (e) {
        // Fall back to details if translation fails
        eventText = intervention.details || intervention.type;
      }
    }

    return [deviceTime, elapsed, eventText];
  });

  // Draw table using autotable
  autoTable(pdf, {
    startY: y,
    head: [[t('pdf.time'), t('pdf.timeElapsed'), t('pdf.event')]],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.3,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: 15, right: 15 },
  });
}

function addFooter(pdf: jsPDF, t: (key: string, params?: any) => string): void {
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${t('pdf.generatedAt')}: ${new Date().toLocaleString()}`, 15, 287);
    pdf.text(t('pdf.pageOf', { current: i, total: pageCount }), 195, 287, { align: 'right' });
  }
  pdf.setTextColor(0, 0, 0); // Reset to black
}

export function exportSessionToPDF(session: StoredSession): void {
  // Get current language translation function
  const t = (key: string, params?: any) => i18n.t(key, params);

  const pdf = new jsPDF();
  const startDate = new Date(session.startTime);

  // Draw header
  let y = drawHeader(pdf, session, startDate, t);

  // Draw summary section
  y = drawSummarySection(pdf, session, y, t);

  // Draw timeline table
  drawTimelineTable(pdf, session, y, t);

  // Add footer to all pages
  addFooter(pdf, t);

  // Generate filename
  const protocolText = session.pathwayMode === 'adult' ? 'acls' : 'pals';
  const typeText = session.sessionType === 'bradytachy' ? 'bradytachy'
    : session.sessionType === 'bradytachy-arrest' ? 'combined'
    : 'arrest';
  const dateStr = startDate.toISOString().split('T')[0];
  const timeStr = formatDeviceTime(session.startTime).replace(/:/g, '');

  pdf.save(`resusbuddy-${protocolText}-${typeText}-${dateStr}-${timeStr}.pdf`);
}
