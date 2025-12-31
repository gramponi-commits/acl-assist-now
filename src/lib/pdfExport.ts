import jsPDF from 'jspdf';
import { StoredSession } from './sessionStorage';
import { HsAndTs, PostROSCChecklist, PostROSCVitals, PregnancyCauses, PregnancyInterventions } from '@/types/acls';

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

const getHsTsChecked = (hsAndTs: HsAndTs): string[] => {
  const checked: string[] = [];
  if (hsAndTs.hypovolemia) checked.push('Hypovolemia');
  if (hsAndTs.hypoxia) checked.push('Hypoxia');
  if (hsAndTs.hydrogenIon) checked.push('H+ (Acidosis)');
  if (hsAndTs.hypoHyperkalemia) checked.push('Hypo/Hyperkalemia');
  if (hsAndTs.hypothermia) checked.push('Hypothermia');
  if (hsAndTs.tensionPneumothorax) checked.push('Tension Pneumothorax');
  if (hsAndTs.tamponade) checked.push('Cardiac Tamponade');
  if (hsAndTs.toxins) checked.push('Toxins');
  if (hsAndTs.thrombosisPulmonary) checked.push('Pulmonary Thrombosis');
  if (hsAndTs.thrombosisCoronary) checked.push('Coronary Thrombosis');
  return checked;
};

const getPostROSCDone = (checklist: PostROSCChecklist): string[] => {
  const done: string[] = [];
  if (checklist.airwaySecured) done.push('Airway Secured');
  if (checklist.ventilationOptimized) done.push('Ventilation Optimized');
  if (checklist.hemodynamicsOptimized) done.push('Hemodynamics Optimized');
  if (checklist.twelveLeadECG) done.push('12-Lead ECG');
  if (checklist.labsOrdered) done.push('Labs Ordered');
  if (checklist.ctHeadOrdered) done.push('CT Ordered');
  if (checklist.echoOrdered) done.push('Echo Ordered');
  if (checklist.temperatureManagement) done.push('Temperature Management');
  if (checklist.neurologicalAssessment) done.push('Neurological Assessment');
  if (checklist.eegOrdered) done.push('EEG Ordered');
  return done;
};

const getPostROSCNotDone = (checklist: PostROSCChecklist): string[] => {
  const notDone: string[] = [];
  if (!checklist.airwaySecured) notDone.push('Airway Secured');
  if (!checklist.ventilationOptimized) notDone.push('Ventilation Optimized');
  if (!checklist.hemodynamicsOptimized) notDone.push('Hemodynamics Optimized');
  if (!checklist.twelveLeadECG) notDone.push('12-Lead ECG');
  if (!checklist.labsOrdered) notDone.push('Labs Ordered');
  if (!checklist.temperatureManagement) notDone.push('Temperature Management');
  if (!checklist.neurologicalAssessment) notDone.push('Neurological Assessment');
  return notDone;
};

const getPregnancyInterventionsChecked = (interventions: PregnancyInterventions): string[] => {
  const checked: string[] = [];
  if (interventions.leftUterineDisplacement) checked.push('Left Uterine Displacement');
  if (interventions.earlyAirway) checked.push('Early Airway');
  if (interventions.ivAboveDiaphragm) checked.push('IV Above Diaphragm');
  if (interventions.stopMagnesiumGiveCalcium) checked.push('Stop Mg/Give Ca');
  if (interventions.detachFetalMonitors) checked.push('Detach Fetal Monitors');
  if (interventions.massiveTransfusion) checked.push('Massive Transfusion');
  return checked;
};

const getPregnancyCausesChecked = (causes: PregnancyCauses): string[] => {
  const checked: string[] = [];
  if (causes.anestheticComplications) checked.push('A - Anesthetic');
  if (causes.bleeding) checked.push('B - Bleeding');
  if (causes.cardiovascular) checked.push('C - Cardiovascular');
  if (causes.drugs) checked.push('D - Drugs');
  if (causes.embolic) checked.push('E - Embolic');
  if (causes.fever) checked.push('F - Fever');
  if (causes.generalCauses) checked.push('G - General (H&T)');
  if (causes.hypertension) checked.push('H - Hypertension');
  return checked;
};

// Compact header for all PDF types
function drawCompactHeader(pdf: jsPDF, session: StoredSession, startDate: Date, isAdult: boolean) {
  const protocolText = isAdult ? 'ACLS' : 'PALS';
  const sessionTypeText = session.sessionType === 'bradytachy'
    ? 'Rhythm Disturbance'
    : session.sessionType === 'bradytachy-arrest'
    ? 'Rhythm → Cardiac Arrest'
    : 'Cardiac Arrest';

  // Slim header bar (18mm height instead of 40mm)
  const headerColor = isAdult ? [220, 38, 38] : [59, 130, 246];
  pdf.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  pdf.rect(0, 0, 210, 18, 'F');

  // Protocol badge
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(protocolText, 15, 8);

  // Session type
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(sessionTypeText, 15, 13);

  // Date and time - right aligned
  pdf.setFontSize(8);
  const dateText = `${startDate.toLocaleDateString()} ${formatDeviceTime(session.startTime)}`;
  const weightText = session.patientWeight ? ` • ${session.patientWeight}kg` : '';
  pdf.text(dateText + weightText, 195, 8, { align: 'right' });

  // ResusBuddy branding - right aligned
  pdf.setFont('helvetica', 'bold');
  pdf.text('ResusBuddy', 195, 13, { align: 'right' });

  pdf.setTextColor(0, 0, 0);
  return 18; // Return header height
}

function exportBradyTachySessionToPDF(pdf: jsPDF, session: StoredSession, startDate: Date, isAdult: boolean): void {
  let y = drawCompactHeader(pdf, session, startDate, isAdult);

  const outcomeText = session.outcome === 'resolved' ? 'Resolved' : session.outcome === 'rosc' ? 'ROSC' : 'Switched to Arrest';
  const outcomeColor = session.outcome === 'resolved' || session.outcome === 'rosc'
    ? [34, 197, 94]
    : [249, 115, 22];

  // Compact summary bar
  y += 6;
  pdf.setFillColor(248, 250, 252);
  pdf.rect(15, y, 180, 14, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.rect(15, y, 180, 14, 'S');

  // Outcome indicator (small colored circle)
  pdf.setFillColor(outcomeColor[0], outcomeColor[1], outcomeColor[2]);
  pdf.circle(20, y + 7, 3, 'F');

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OUTCOME:', 26, y + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(outcomeText, 50, y + 8);

  pdf.setFont('helvetica', 'bold');
  pdf.text('DURATION:', 100, y + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatTime(session.duration), 130, y + 8);

  // Treatment timeline
  y += 22;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TREATMENT TIMELINE', 15, y);

  y += 6;
  // Table header
  pdf.setFillColor(71, 85, 105);
  pdf.rect(15, y, 180, 7, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Time', 18, y + 4.5);
  pdf.text('Elapsed', 45, y + 4.5);
  pdf.text('Event', 75, y + 4.5);

  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  y += 7;

  let isOddRow = false;
  session.interventions.forEach((intervention) => {
    if (y > 275) {
      pdf.addPage();
      y = 15;
      // Repeat header on new page
      pdf.setFillColor(71, 85, 105);
      pdf.rect(15, y, 180, 7, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Time', 18, y + 4.5);
      pdf.text('Elapsed', 45, y + 4.5);
      pdf.text('Event', 75, y + 4.5);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      y += 7;
      isOddRow = false;
    }

    if (isOddRow) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(15, y, 180, 6, 'F');
    }
    isOddRow = !isOddRow;

    const relativeTime = intervention.timestamp - session.startTime;
    pdf.setFontSize(8);
    pdf.text(formatDeviceTime(intervention.timestamp), 18, y + 4);
    pdf.text(formatTime(relativeTime), 45, y + 4);

    let eventText = intervention.details || intervention.type;
    if (eventText.length > 70) {
      eventText = eventText.substring(0, 67) + '...';
    }
    pdf.text(eventText, 75, y + 4);
    y += 6;
  });
}

function exportCardiacArrestSessionToPDF(pdf: jsPDF, session: StoredSession, startDate: Date, isAdult: boolean): void {
  let y = drawCompactHeader(pdf, session, startDate, isAdult);

  const cprFraction = session.duration > 0 ? session.cprFraction.toFixed(1) : 'N/A';
  const outcomeText = session.outcome === 'rosc' ? 'ROSC' : session.outcome === 'deceased' ? 'Deceased' : 'Unknown';
  const outcomeColor = session.outcome === 'rosc'
    ? [34, 197, 94]
    : session.outcome === 'deceased'
    ? [107, 114, 128]
    : [234, 179, 8];

  // Compact metrics bar
  y += 6;
  const metricsStartY = y;

  // Draw metrics in a single compact row
  const metricWidth = 42;
  const metricGap = 3;
  let metricX = 15;

  // Helper function to draw a metric box
  const drawMetric = (label: string, value: string, color: number[]) => {
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.roundedRect(metricX, y, metricWidth, 11, 1.5, 1.5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(label, metricX + metricWidth/2, y + 4, { align: 'center' });
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value, metricX + metricWidth/2, y + 9, { align: 'center' });
    metricX += metricWidth + metricGap;
  };

  drawMetric('OUTCOME', outcomeText, outcomeColor);
  drawMetric('DURATION', formatTime(session.duration), [59, 130, 246]);
  drawMetric('CPR FRACTION', `${cprFraction}%`, [139, 92, 246]);
  drawMetric('SHOCKS', String(session.shockCount), [249, 115, 22]);

  pdf.setTextColor(0, 0, 0);
  y += 14;

  // Compact summary section
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(15, y, 180, 18, 2, 2, 'F');

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RESUSCITATION SUMMARY', 20, y + 6);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`CPR Time: ${formatTime(session.totalCPRTime)} • Airway: ${session.airwayStatus.toUpperCase()}`, 20, y + 11);
  pdf.text(`Epinephrine: ${session.epinephrineCount} • Amiodarone: ${session.amiodaroneCount} • Lidocaine: ${session.lidocaineCount}`, 20, y + 15);

  y += 22;

  // H's & T's - more compact
  const hsTsChecked = getHsTsChecked(session.hsAndTs);
  if (hsTsChecked.length > 0) {
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text("H's & T's:", 15, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(hsTsChecked.join(', '), 35, y, { maxWidth: 160 });
    y += Math.ceil(hsTsChecked.join(', ').length / 95) * 4 + 4;
  }

  // EtCO2 - more compact
  if (session.etco2Readings && session.etco2Readings.length > 0) {
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ETCO₂:', 15, y);
    pdf.setFont('helvetica', 'normal');
    const etco2Text = session.etco2Readings.map(r =>
      `${formatTime(r.timestamp - session.startTime)}:${r.value}`
    ).join(' | ');
    pdf.text(etco2Text, 35, y, { maxWidth: 160 });
    y += 6;
  }

  // Pregnancy section - compact
  if (session.pregnancyActive && isAdult) {
    pdf.setFillColor(252, 231, 243);
    pdf.roundedRect(15, y, 180, 2, 1, 1, 'F');
    y += 4;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(219, 39, 119);
    pdf.text('OBSTETRIC CARDIAC ARREST', 15, y);
    pdf.setTextColor(0, 0, 0);
    y += 5;

    if (session.pregnancyInterventions) {
      const pregInterventions = getPregnancyInterventionsChecked(session.pregnancyInterventions);
      if (pregInterventions.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Interventions:', 15, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(pregInterventions.join(', '), 40, y, { maxWidth: 155 });
        y += Math.ceil(pregInterventions.join(', ').length / 85) * 4 + 3;
      }
    }

    if (session.pregnancyCauses) {
      const pregCauses = getPregnancyCausesChecked(session.pregnancyCauses);
      if (pregCauses.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Causes:', 15, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(pregCauses.join(', '), 35, y, { maxWidth: 160 });
        y += Math.ceil(pregCauses.join(', ').length / 90) * 4 + 4;
      }
    }
  }

  // Post-ROSC section - compact
  if (session.outcome === 'rosc' && session.postROSCChecklist) {
    pdf.setFillColor(220, 252, 231);
    pdf.roundedRect(15, y, 180, 2, 1, 1, 'F');
    y += 4;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(22, 163, 74);
    pdf.text('POST-ROSC CARE', 15, y);
    pdf.setTextColor(0, 0, 0);
    y += 5;

    if (session.postROSCVitals) {
      const vitals = session.postROSCVitals;
      const vitalsText: string[] = [];
      if (vitals.spo2) vitalsText.push(`SpO₂:${vitals.spo2}%`);
      if (vitals.paco2) vitalsText.push(`PaCO₂:${vitals.paco2}`);
      if (vitals.map) vitalsText.push(`MAP:${vitals.map}`);
      if (vitals.temperature) vitalsText.push(`Temp:${vitals.temperature}°C`);
      if (vitals.glucose) vitalsText.push(`Glucose:${vitals.glucose}`);

      if (vitalsText.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Vitals:', 15, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(vitalsText.join(' • '), 30, y);
        y += 5;
      }
    }

    const done = getPostROSCDone(session.postROSCChecklist);
    if (done.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Completed:', 15, y);
      pdf.setFont('helvetica', 'normal');
      const doneText = done.join(', ');
      pdf.text(doneText, 38, y, { maxWidth: 157 });
      y += Math.ceil(doneText.length / 90) * 4 + 3;
    }

    const notDone = getPostROSCNotDone(session.postROSCChecklist);
    if (notDone.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Pending:', 15, y);
      pdf.setTextColor(120, 120, 120);
      pdf.setFont('helvetica', 'normal');
      const notDoneText = notDone.join(', ');
      pdf.text(notDoneText, 33, y, { maxWidth: 162 });
      pdf.setTextColor(0, 0, 0);
      y += Math.ceil(notDoneText.length / 95) * 4 + 4;
    }
  }

  // Timeline
  y += 3;
  if (y > 220) {
    pdf.addPage();
    y = 15;
  }

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CODE TIMELINE', 15, y);

  y += 6;
  pdf.setFillColor(71, 85, 105);
  pdf.rect(15, y, 180, 7, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Time', 18, y + 4.5);
  pdf.text('Code +', 45, y + 4.5);
  pdf.text('Event', 75, y + 4.5);

  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  y += 7;

  let isOddRow = false;
  session.interventions.forEach((intervention) => {
    if (y > 275) {
      pdf.addPage();
      y = 15;
      pdf.setFillColor(71, 85, 105);
      pdf.rect(15, y, 180, 7, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Time', 18, y + 4.5);
      pdf.text('Code +', 45, y + 4.5);
      pdf.text('Event', 75, y + 4.5);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      y += 7;
      isOddRow = false;
    }

    if (isOddRow) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(15, y, 180, 6, 'F');
    }
    isOddRow = !isOddRow;

    const relativeTime = intervention.timestamp - session.startTime;
    pdf.setFontSize(8);
    pdf.text(formatDeviceTime(intervention.timestamp), 18, y + 4);
    pdf.text(formatTime(relativeTime), 45, y + 4);

    let eventText = intervention.details || intervention.type;
    if (eventText.length > 70) {
      eventText = eventText.substring(0, 67) + '...';
    }
    pdf.text(eventText, 75, y + 4);
    y += 6;
  });
}

export function exportSessionToPDF(session: StoredSession): void {
  const pdf = new jsPDF();
  const startDate = new Date(session.startTime);
  const isAdult = session.pathwayMode === 'adult';

  // Route to appropriate export function based on session type
  if (session.sessionType === 'bradytachy') {
    exportBradyTachySessionToPDF(pdf, session, startDate, isAdult);
  } else {
    // cardiac-arrest or bradytachy-arrest
    exportCardiacArrestSessionToPDF(pdf, session, startDate, isAdult);
  }

  // Slim footer for all pages
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(156, 163, 175);
    pdf.text(`Generated ${new Date().toLocaleString()}`, 15, 290);
    pdf.text(`Page ${i}/${pageCount}`, 195, 290, { align: 'right' });
  }

  // Generate filename
  const protocolText = isAdult ? 'acls' : 'pals';
  const typeText = session.sessionType === 'bradytachy' ? 'bradytachy' : 'arrest';
  pdf.save(`resusbuddy-${protocolText}-${typeText}-${startDate.toISOString().split('T')[0]}-${formatDeviceTime(session.startTime).replace(/:/g, '')}.pdf`);
}
