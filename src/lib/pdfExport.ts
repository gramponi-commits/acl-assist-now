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

export function exportSessionToPDF(session: StoredSession): void {
  const pdf = new jsPDF();
  const startDate = new Date(session.startTime);
  const cprFraction = session.duration > 0
    ? session.cprFraction.toFixed(1)
    : 'N/A';

  const isAdult = session.pathwayMode === 'adult';

  // Determine protocol text based on pathway mode AND session type
  let protocolText: string;
  if (session.sessionType === 'bradytachy') {
    protocolText = isAdult ? 'ACLS Bradycardia/Tachycardia' : 'PALS Bradycardia/Tachycardia';
  } else if (session.sessionType === 'bradytachy-arrest') {
    protocolText = isAdult ? 'ACLS (BradyTachy → Arrest)' : 'PALS (BradyTachy → Arrest)';
  } else {
    // cardiac-arrest
    protocolText = isAdult ? 'ACLS Cardiac Arrest' : 'PALS Cardiac Arrest';
  }

  const outcomeText = session.outcome === 'rosc' ? 'ROSC' : session.outcome === 'deceased' ? 'Deceased' : session.outcome === 'resolved' ? 'Resolved' : 'Unknown';

  // Header with background
  const headerColor = isAdult ? [220, 38, 38] : [59, 130, 246]; // Red for ACLS, Blue for PALS
  pdf.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  pdf.rect(0, 0, 210, 35, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(session.sessionType === 'bradytachy' ? 18 : 22);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${protocolText.toUpperCase()} REPORT`, 105, 18, { align: 'center' });
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const patientInfo = isAdult ? '' : session.patientWeight ? ` | Weight: ${session.patientWeight}kg` : ' | Weight: Unknown';
  pdf.text(`${startDate.toLocaleDateString()} - ${formatDeviceTime(session.startTime)}${patientInfo}`, 105, 28, { align: 'center' });
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  
  // Key metrics boxes
  let y = 45;
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
  pdf.text('OUTCOME', startX + boxWidth/2, y + 8, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(outcomeText, startX + boxWidth/2, y + 18, { align: 'center' });
  
  // Duration box
  pdf.setFillColor(59, 130, 246); // Blue
  pdf.roundedRect(startX + boxWidth + boxGap, y, boxWidth, boxHeight, 3, 3, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('DURATION', startX + boxWidth + boxGap + boxWidth/2, y + 8, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatTime(session.duration), startX + boxWidth + boxGap + boxWidth/2, y + 18, { align: 'center' });
  
  // CPR Fraction box
  pdf.setFillColor(139, 92, 246); // Purple
  pdf.roundedRect(startX + 2*(boxWidth + boxGap), y, boxWidth, boxHeight, 3, 3, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('CPR FRACTION', startX + 2*(boxWidth + boxGap) + boxWidth/2, y + 8, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${cprFraction}%`, startX + 2*(boxWidth + boxGap) + boxWidth/2, y + 18, { align: 'center' });
  
  // Shocks box
  pdf.setFillColor(249, 115, 22); // Orange
  pdf.roundedRect(startX + 3*(boxWidth + boxGap), y, boxWidth, boxHeight, 3, 3, 'F');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('SHOCKS', startX + 3*(boxWidth + boxGap) + boxWidth/2, y + 8, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(String(session.shockCount), startX + 3*(boxWidth + boxGap) + boxWidth/2, y + 18, { align: 'center' });
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  
  // Summary section
  y = 80;
  pdf.setFillColor(245, 245, 245);
  pdf.roundedRect(15, y, 180, 40, 3, 3, 'F');
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Session Summary', 20, y + 10);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  // Left column
  pdf.text(`Protocol: ${protocolText}`, 20, y + 20);
  pdf.text(`CPR Time: ${formatTime(session.totalCPRTime)}`, 20, y + 28);
  pdf.text(`Airway: ${session.airwayStatus.toUpperCase()}`, 20, y + 36);
  
  // Right column
  pdf.text(`Epinephrine: ${session.epinephrineCount} dose(s)`, 110, y + 20);
  pdf.text(`Amiodarone: ${session.amiodaroneCount} dose(s)`, 110, y + 28);
  pdf.text(`Lidocaine: ${session.lidocaineCount} dose(s)`, 110, y + 36);
  
  y = 130;
  
  // H's & T's Section (if any checked)
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
  
  // EtCO2 Readings (if any)
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
  
  // Pregnancy Section (if active)
  if (session.pregnancyActive && isAdult) {
    y += 3;
    pdf.setFillColor(236, 72, 153); // Pink
    pdf.roundedRect(15, y - 5, 180, 8, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSTETRIC CARDIAC ARREST', 20, y + 1);
    pdf.setTextColor(0, 0, 0);
    y += 10;
    
    // Pregnancy interventions
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
    
    // Pregnancy causes (A-H)
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
  
  // Post-ROSC Section (if applicable)
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
    
    // Vitals if present
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
    
    // Actions completed
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
    
    // Actions not completed
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
    
    // Special assessments
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
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Interventions Timeline', 15, y);
  
  // Table header
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
      // Repeat header on new page
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
    
    // Alternating row colors
    if (isOddRow) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(15, y - 4, 180, 7, 'F');
    }
    isOddRow = !isOddRow;
    
    const relativeTime = intervention.timestamp - session.startTime;
    pdf.setFontSize(9);
    pdf.text(formatDeviceTime(intervention.timestamp), 20, y);
    pdf.text(formatTime(relativeTime), 50, y);
    
    // Truncate long details
    let eventText = intervention.details || intervention.type;
    if (eventText.length > 60) {
      eventText = eventText.substring(0, 57) + '...';
    }
    pdf.text(eventText, 80, y);
    y += 7;
  });
  
  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, 280, 210, 17, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Generated: ${new Date().toLocaleString()} | ResusBuddy | Page ${i}/${pageCount}`, 105, 288, { align: 'center' });
  }
  
  pdf.save(`resusbuddy-${protocolText.toLowerCase()}-${startDate.toISOString().split('T')[0]}-${formatDeviceTime(session.startTime).replace(/:/g, '')}.pdf`);
}
