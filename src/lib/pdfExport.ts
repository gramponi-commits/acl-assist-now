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

function exportBradyTachySessionToPDF(pdf: jsPDF, session: StoredSession, startDate: Date, isAdult: boolean): void {
  const protocolText = isAdult ? 'ACLS' : 'PALS';
  const pathwayText = 'Bradycardia/Tachycardia';
  const outcomeText = session.outcome === 'resolved' ? 'Resolved' : session.outcome === 'rosc' ? 'ROSC' : 'Switched to Arrest';

  // Header
  const headerColor = isAdult ? [220, 38, 38] : [59, 130, 246];
  pdf.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  pdf.rect(0, 0, 210, 40, 'F');
  pdf.setTextColor(255, 255, 255);

  // Protocol name
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(protocolText, 105, 15, { align: 'center' });

  // Pathway type
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(pathwayText, 105, 24, { align: 'center' });

  // Session date and weight
  pdf.setFontSize(10);
  const patientInfo = session.patientWeight ? ` • Weight: ${session.patientWeight}kg` : '';
  pdf.text(`${startDate.toLocaleDateString()} - ${formatDeviceTime(session.startTime)}${patientInfo}`, 105, 33, { align: 'center' });

  pdf.setTextColor(0, 0, 0);

  // Key metrics boxes (2 boxes only)
  let y = 50;
  const boxWidth = 87;
  const boxHeight = 25;
  const boxGap = 6;
  const startX = 15;

  // Outcome box
  const outcomeColor = session.outcome === 'resolved' ? [34, 197, 94] : session.outcome === 'rosc' ? [34, 197, 94] : [249, 115, 22];
  pdf.setFillColor(outcomeColor[0], outcomeColor[1], outcomeColor[2]);
  pdf.roundedRect(startX, y, boxWidth, boxHeight, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('OUTCOME', startX + boxWidth/2, y + 10, { align: 'center' });
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(outcomeText, startX + boxWidth/2, y + 20, { align: 'center' });

  // Duration box
  pdf.setFillColor(59, 130, 246);
  pdf.roundedRect(startX + boxWidth + boxGap, y, boxWidth, boxHeight, 3, 3, 'F');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('SESSION DURATION', startX + boxWidth + boxGap + boxWidth/2, y + 10, { align: 'center' });
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatTime(session.duration), startX + boxWidth + boxGap + boxWidth/2, y + 20, { align: 'center' });

  pdf.setTextColor(0, 0, 0);

  // Interventions Timeline
  y = 85;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Treatment Timeline', 15, y);

  // Timeline table header
  y += 8;
  pdf.setFillColor(75, 85, 99);
  pdf.rect(15, y - 5, 180, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Time', 20, y);
  pdf.text('Elapsed', 50, y);
  pdf.text('Intervention / Assessment', 85, y);

  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  y += 6;

  let isOddRow = false;
  session.interventions.forEach((intervention) => {
    if (y > 270) {
      pdf.addPage();
      y = 20;
      // Repeat header
      pdf.setFillColor(75, 85, 99);
      pdf.rect(15, y - 5, 180, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Time', 20, y);
      pdf.text('Elapsed', 50, y);
      pdf.text('Intervention / Assessment', 85, y);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      y += 6;
      isOddRow = false;
    }

    if (isOddRow) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(15, y - 4, 180, 7, 'F');
    }
    isOddRow = !isOddRow;

    const relativeTime = intervention.timestamp - session.startTime;
    pdf.setFontSize(9);
    pdf.text(formatDeviceTime(intervention.timestamp), 20, y);
    pdf.text(formatTime(relativeTime), 50, y);

    let eventText = intervention.details || intervention.type;
    if (eventText.length > 55) {
      eventText = eventText.substring(0, 52) + '...';
    }
    pdf.text(eventText, 85, y);
    y += 7;
  });
}

function exportCardiacArrestSessionToPDF(pdf: jsPDF, session: StoredSession, startDate: Date, isAdult: boolean): void {
  const cprFraction = session.duration > 0 ? session.cprFraction.toFixed(1) : 'N/A';

  // Determine title
  let protocolText: string;
  let subtitleText: string;

  if (session.sessionType === 'bradytachy-arrest') {
    protocolText = isAdult ? 'ACLS' : 'PALS';
    subtitleText = 'Cardiac Arrest (from BradyTachy)';
  } else {
    protocolText = isAdult ? 'ACLS' : 'PALS';
    subtitleText = 'Cardiac Arrest';
  }

  const outcomeText = session.outcome === 'rosc' ? 'ROSC' : session.outcome === 'deceased' ? 'Deceased' : 'Unknown';

  // Header
  const headerColor = isAdult ? [220, 38, 38] : [59, 130, 246];
  pdf.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  pdf.rect(0, 0, 210, 40, 'F');
  pdf.setTextColor(255, 255, 255);

  // Protocol name
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(protocolText, 105, 15, { align: 'center' });

  // Subtitle
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(subtitleText, 105, 24, { align: 'center' });

  // Session info
  pdf.setFontSize(10);
  const patientInfo = session.patientWeight ? ` • Weight: ${session.patientWeight}kg` : '';
  pdf.text(`${startDate.toLocaleDateString()} - ${formatDeviceTime(session.startTime)}${patientInfo}`, 105, 33, { align: 'center' });

  pdf.setTextColor(0, 0, 0);

  // Key metrics boxes
  let y = 50;
  const boxWidth = 42;
  const boxHeight = 25;
  const boxGap = 5;
  const startX = 15;

  // Outcome box
  const outcomeColor = session.outcome === 'rosc' ? [34, 197, 94] : session.outcome === 'deceased' ? [107, 114, 128] : [234, 179, 8];
  pdf.setFillColor(outcomeColor[0], outcomeColor[1], outcomeColor[2]);
  pdf.roundedRect(startX, y, boxWidth, boxHeight, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('OUTCOME', startX + boxWidth/2, y + 9, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(outcomeText, startX + boxWidth/2, y + 18, { align: 'center' });

  // Duration box
  pdf.setFillColor(59, 130, 246);
  pdf.roundedRect(startX + boxWidth + boxGap, y, boxWidth, boxHeight, 3, 3, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('DURATION', startX + boxWidth + boxGap + boxWidth/2, y + 9, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatTime(session.duration), startX + boxWidth + boxGap + boxWidth/2, y + 18, { align: 'center' });

  // CPR Fraction box
  pdf.setFillColor(139, 92, 246);
  pdf.roundedRect(startX + 2*(boxWidth + boxGap), y, boxWidth, boxHeight, 3, 3, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('CPR FRACTION', startX + 2*(boxWidth + boxGap) + boxWidth/2, y + 9, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${cprFraction}%`, startX + 2*(boxWidth + boxGap) + boxWidth/2, y + 18, { align: 'center' });

  // Shocks box
  pdf.setFillColor(249, 115, 22);
  pdf.roundedRect(startX + 3*(boxWidth + boxGap), y, boxWidth, boxHeight, 3, 3, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('SHOCKS', startX + 3*(boxWidth + boxGap) + boxWidth/2, y + 9, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(String(session.shockCount), startX + 3*(boxWidth + boxGap) + boxWidth/2, y + 18, { align: 'center' });

  pdf.setTextColor(0, 0, 0);

  // Resuscitation Summary
  y = 85;
  pdf.setFillColor(245, 245, 245);
  pdf.roundedRect(15, y, 180, 40, 3, 3, 'F');
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Resuscitation Summary', 20, y + 10);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');

  // CPR metrics
  pdf.text(`CPR Time: ${formatTime(session.totalCPRTime)}`, 20, y + 20);
  pdf.text(`Airway: ${session.airwayStatus.toUpperCase()}`, 20, y + 28);

  // Medications
  pdf.text(`Epinephrine: ${session.epinephrineCount} dose(s)`, 105, y + 20);
  pdf.text(`Amiodarone: ${session.amiodaroneCount} dose(s)`, 105, y + 28);
  pdf.text(`Lidocaine: ${session.lidocaineCount} dose(s)`, 105, y + 36);

  y = 135;

  // H's & T's Section
  const hsTsChecked = getHsTsChecked(session.hsAndTs);
  if (hsTsChecked.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text("H's & T's Identified", 15, y);
    y += 6;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(hsTsChecked.join(', '), 15, y, { maxWidth: 180 });
    y += Math.ceil(hsTsChecked.join(', ').length / 80) * 5 + 8;
  }

  // EtCO2 Readings
  if (session.etco2Readings && session.etco2Readings.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ETCO₂ Readings', 15, y);
    y += 6;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const etco2Text = session.etco2Readings.map(r =>
      `${formatTime(r.timestamp - session.startTime)}: ${r.value} mmHg`
    ).join(' | ');
    pdf.text(etco2Text, 15, y, { maxWidth: 180 });
    y += 10;
  }

  // Pregnancy Section
  if (session.pregnancyActive && isAdult) {
    y += 3;
    pdf.setFillColor(236, 72, 153);
    pdf.roundedRect(15, y - 5, 180, 8, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSTETRIC CARDIAC ARREST', 20, y + 1);
    pdf.setTextColor(0, 0, 0);
    y += 10;

    if (session.pregnancyInterventions) {
      const pregInterventions = getPregnancyInterventionsChecked(session.pregnancyInterventions);
      if (pregInterventions.length > 0) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Interventions: ', 15, y);
        pdf.setFont('helvetica', 'normal');
        const pregInterText = pregInterventions.join(', ');
        pdf.text(pregInterText, 42, y, { maxWidth: 150 });
        y += Math.ceil(pregInterText.length / 65) * 5 + 5;
      }
    }

    if (session.pregnancyCauses) {
      const pregCauses = getPregnancyCausesChecked(session.pregnancyCauses);
      if (pregCauses.length > 0) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Suspected Causes: ', 15, y);
        pdf.setFont('helvetica', 'normal');
        const pregCausesText = pregCauses.join(', ');
        pdf.text(pregCausesText, 48, y, { maxWidth: 145 });
        y += Math.ceil(pregCausesText.length / 60) * 5 + 5;
      }
    }
  }

  // Post-ROSC Section
  if (session.outcome === 'rosc' && session.postROSCChecklist) {
    y += 5;
    pdf.setFillColor(34, 197, 94);
    pdf.roundedRect(15, y - 5, 180, 8, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('POST-ROSC CARE', 20, y + 1);
    pdf.setTextColor(0, 0, 0);
    y += 10;

    if (session.postROSCVitals) {
      const vitals = session.postROSCVitals;
      const vitalsText: string[] = [];
      if (vitals.spo2) vitalsText.push(`SpO₂: ${vitals.spo2}%`);
      if (vitals.paco2) vitalsText.push(`PaCO₂: ${vitals.paco2} mmHg`);
      if (vitals.map) vitalsText.push(`MAP: ${vitals.map} mmHg`);
      if (vitals.temperature) vitalsText.push(`Temp: ${vitals.temperature}°C`);
      if (vitals.glucose) vitalsText.push(`Glucose: ${vitals.glucose} mg/dL`);

      if (vitalsText.length > 0) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Vitals: ', 15, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(vitalsText.join(' | '), 32, y);
        y += 7;
      }
    }

    const done = getPostROSCDone(session.postROSCChecklist);
    if (done.length > 0) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Completed: ', 15, y);
      pdf.setFont('helvetica', 'normal');
      const doneText = done.join(', ');
      pdf.text(doneText, 38, y, { maxWidth: 155 });
      y += Math.ceil(doneText.length / 70) * 5 + 5;
    }

    const notDone = getPostROSCNotDone(session.postROSCChecklist);
    if (notDone.length > 0) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Not completed: ', 15, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      const notDoneText = notDone.join(', ');
      pdf.text(notDoneText, 43, y, { maxWidth: 150 });
      pdf.setTextColor(0, 0, 0);
      y += Math.ceil(notDoneText.length / 65) * 5 + 5;
    }

    const checklist = session.postROSCChecklist;
    const assessments: string[] = [];
    if (checklist.followingCommands !== null) {
      assessments.push(`Following commands: ${checklist.followingCommands ? 'Yes' : 'No'}`);
    }
    if (checklist.stElevation !== null) {
      assessments.push(`ST Elevation: ${checklist.stElevation ? 'Yes' : 'No'}`);
    }
    if (checklist.cardiogenicShock !== null) {
      assessments.push(`Cardiogenic Shock: ${checklist.cardiogenicShock ? 'Yes' : 'No'}`);
    }
    if (assessments.length > 0) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Assessments: ', 15, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(assessments.join(' | '), 40, y);
      y += 8;
    }
  }

  // Interventions Timeline
  y += 5;
  if (y > 200) {
    pdf.addPage();
    y = 20;
  }

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Code Timeline', 15, y);

  y += 8;
  pdf.setFillColor(75, 85, 99);
  pdf.rect(15, y - 5, 180, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Time', 20, y);
  pdf.text('Code +', 50, y);
  pdf.text('Event', 80, y);

  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  y += 6;

  let isOddRow = false;
  session.interventions.forEach((intervention) => {
    if (y > 270) {
      pdf.addPage();
      y = 20;
      pdf.setFillColor(75, 85, 99);
      pdf.rect(15, y - 5, 180, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Time', 20, y);
      pdf.text('Code +', 50, y);
      pdf.text('Event', 80, y);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      y += 6;
      isOddRow = false;
    }

    if (isOddRow) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(15, y - 4, 180, 7, 'F');
    }
    isOddRow = !isOddRow;

    const relativeTime = intervention.timestamp - session.startTime;
    pdf.setFontSize(9);
    pdf.text(formatDeviceTime(intervention.timestamp), 20, y);
    pdf.text(formatTime(relativeTime), 50, y);

    let eventText = intervention.details || intervention.type;
    if (eventText.length > 60) {
      eventText = eventText.substring(0, 57) + '...';
    }
    pdf.text(eventText, 80, y);
    y += 7;
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

  // Footer for all pages
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, 280, 210, 17, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Generated: ${new Date().toLocaleString()} | ResusBuddy | Page ${i}/${pageCount}`, 105, 288, { align: 'center' });
  }

  // Generate filename
  const protocolText = isAdult ? 'acls' : 'pals';
  const typeText = session.sessionType === 'bradytachy' ? 'bradytachy' : 'arrest';
  pdf.save(`resusbuddy-${protocolText}-${typeText}-${startDate.toISOString().split('T')[0]}-${formatDeviceTime(session.startTime).replace(/:/g, '')}.pdf`);
}
