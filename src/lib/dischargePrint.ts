import { printHTML } from './printHelper';
import { formatDate } from './utils';

export interface DischargeSummaryPrintData {
  id?: string;
  admissionId?: string;
  patientId?: string;
  patientName: string;
  mrn?: string;
  uhid?: string;
  ipdNo?: string;
  age?: string | number;
  gender?: string;
  phone?: string;
  address?: string;
  guardianName?: string;
  ward?: string;
  bedNumber?: string;
  admissionDate?: string;
  dischargeDate?: string;
  dischargeType: string;
  dischargeBy: string;
  attendingDoctor?: string;
  department?: string;
  
  // Clinical
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  operativeProcedure?: string;
  surgeryDate?: string;
  surgeonName?: string;
  anaesthesiaType?: string;
  clinicalSummary?: string;
  hospitalCourse?: string;
  dischargeVitals?: string;
  investigationHighlights?: string;
  conditionAtDischarge?: string;
  medications?: string | any[];
  dietaryAdvice?: string;
  emergencyWarningSigns?: string;
  followUpDate?: string;
  followUpInstructions?: string;
  
  // LAMA Specific
  relativeName?: string;
  relativeContact?: string;
  lamaReason?: string;
  riskExplained?: string;
  witnessName?: string;
  
  // Deceased Specific
  timeOfDeath?: string;
  causeOfDeathDirect?: string;
  causeOfDeathAntecedent?: string;
  causeOfDeathUnderlying?: string;
  deathCertNo?: string;
  bodyHandedOverTo?: string;
  bodyHandoverTime?: string;
  policeIntimation?: string;
  mlcStatus?: string;
}

export function getDischargeSummaryHtml(data: DischargeSummaryPrintData, hospitalInfo?: any): string {
  const hospName = hospitalInfo?.name || 'GASTRO PLUS HOSPITAL';
  const hospAddress = hospitalInfo?.address || 'Plot No. 7 & 8, Om Shiv Nagar, Gufa Mandir Road, Lal Ghati Bhopal, 462030, Madhya Pradesh';
  const hospPhone = hospitalInfo?.phone || '9109102145 / 9109101246';
  const hospEmail = hospitalInfo?.email || 'gastroplusbhopal@gmail.com';
  const hospReg = hospitalInfo?.regNo || 'REG-MP-BPL-2024-8891';

  const isLama = data.dischargeType?.toLowerCase().includes('lama');
  const isDeceased = data.dischargeType?.toLowerCase().includes('deceased') || data.dischargeType?.toLowerCase().includes('expired');

  const formattedAdmDate = data.admissionDate ? formatDate(data.admissionDate) : 'On Admission';
  const formattedDischDate = data.dischargeDate ? formatDate(data.dischargeDate) : formatDate(new Date());
  const formattedFollowUp = data.followUpDate ? formatDate(data.followUpDate) : 'As Advised / 7 Days';

  // Format Medications
  let medsHtml = '';
  if (Array.isArray(data.medications)) {
    medsHtml = `
      <table class="meds-table">
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 35%;">Medicine Name & Composition</th>
            <th style="width: 15%;">Dosage</th>
            <th style="width: 15%;">Frequency / Timing</th>
            <th style="width: 15%;">Duration</th>
            <th style="width: 15%;">Instructions</th>
          </tr>
        </thead>
        <tbody>
          ${data.medications.map((m, idx) => `
            <tr>
              <td style="text-align: center;">${idx + 1}</td>
              <td><strong>${m.name || m.medicineName || m.item_name || 'Medicine'}</strong></td>
              <td>${m.dosage || m.dose || '-'}</td>
              <td>${m.frequency || m.timing || 'As Directed'}</td>
              <td>${m.duration || '-'}</td>
              <td>${m.instructions || m.instruction || 'After Meals'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (typeof data.medications === 'string' && data.medications.trim()) {
    const lines = data.medications.split('\n').filter(l => l.trim().length > 0);
    medsHtml = `
      <div class="meds-text-box">
        <ol style="margin: 0; padding-left: 20px;">
          ${lines.map(line => `<li style="margin-bottom: 4px;"><strong>${line.replace(/^[0-9]+[.\-)]\s*/, '')}</strong></li>`).join('')}
        </ol>
      </div>
    `;
  } else {
    medsHtml = `<p style="margin: 4px 0; font-style: italic; color: #475569;">No specific take-home medications recorded. Continue regular baseline prescriptions as advised.</p>`;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Discharge Summary - ${data.patientName} (${data.mrn || 'IPD'})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 10mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Segoe UI', Arial, 'Helvetica Neue', sans-serif;
      font-size: 11px;
      line-height: 1.35;
      color: #0f172a;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .summary-container {
      width: 100%;
      max-width: 194mm;
      margin: 0 auto;
      border: 1.5px solid #0f766e;
      padding: 10px 14px;
      background: #fff;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .hosp-title {
      font-size: 19px;
      font-weight: 900;
      color: #0f766e;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .hosp-sub {
      font-size: 9.5px;
      color: #334155;
      margin: 2px 0;
    }
    .doc-banner {
      background: #0f766e;
      color: #ffffff;
      text-align: center;
      padding: 4px 0;
      margin: 6px 0 8px 0;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      border-radius: 2px;
    }
    .banner-sub {
      font-size: 9.5px;
      font-weight: normal;
      display: block;
      opacity: 0.95;
      letter-spacing: 0.2px;
    }
    .status-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-routine { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .status-lama { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .status-deceased { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .status-transfer { background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe; }

    .demographics-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
    }
    .demographics-table td {
      padding: 4px 6px;
      border: 1px solid #e2e8f0;
      font-size: 10.5px;
      vertical-align: top;
    }
    .demo-label {
      font-weight: 700;
      color: #1e293b;
      width: 17%;
      background: #f1f5f9;
    }
    .demo-val {
      font-weight: 600;
      color: #0f172a;
      width: 33%;
    }

    .section-head {
      background: #e6fffa;
      border-left: 4px solid #0f766e;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 800;
      color: #0f766e;
      text-transform: uppercase;
      margin: 8px 0 4px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .content-box {
      border: 1px solid #e2e8f0;
      padding: 6px 8px;
      border-radius: 3px;
      margin-bottom: 6px;
      background: #ffffff;
      font-size: 10.5px;
      line-height: 1.45;
    }
    .content-box p {
      margin: 0 0 4px 0;
    }
    .content-box p:last-child {
      margin-bottom: 0;
    }

    .meds-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      margin-bottom: 6px;
      font-size: 10px;
    }
    .meds-table th {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 4px;
      font-weight: 700;
      text-align: left;
      color: #1e293b;
    }
    .meds-table td {
      border: 1px solid #e2e8f0;
      padding: 4px 6px;
      vertical-align: middle;
    }
    .meds-text-box {
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      border-radius: 3px;
      background: #fbfcfe;
      font-size: 10.5px;
      line-height: 1.5;
    }

    .warning-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 4px solid #d97706;
      padding: 6px 8px;
      border-radius: 3px;
      margin-bottom: 6px;
      font-size: 10px;
    }
    .emergency-box {
      background: #fef2f2;
      border: 1px solid #fee2e2;
      border-left: 4px solid #dc2626;
      padding: 6px 8px;
      border-radius: 3px;
      margin-bottom: 6px;
      font-size: 10px;
    }

    .signature-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 22px;
      padding-top: 8px;
      border-top: 1px dashed #94a3b8;
    }
    .sig-col {
      text-align: center;
      width: 30%;
      font-size: 10px;
    }
    .sig-line {
      border-top: 1px solid #334155;
      margin-top: 28px;
      padding-top: 3px;
      font-weight: bold;
    }
    .footer-note {
      text-align: center;
      font-size: 8.5px;
      color: #64748b;
      margin-top: 10px;
      border-top: 1px solid #e2e8f0;
      padding-top: 4px;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .summary-container {
        border: none;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="summary-container">
    <!-- Header -->
    <table class="header-table">
      <tr>
        <td style="width: 75%; vertical-align: middle;">
          <h1 class="hosp-title">${hospName}</h1>
          <p class="hosp-sub">${hospAddress}</p>
          <p class="hosp-sub"><strong>Emergency Helpline:</strong> ${hospPhone} | <strong>Email:</strong> ${hospEmail} | <strong>Reg. No:</strong> ${hospReg}</p>
        </td>
        <td style="width: 25%; text-align: right; vertical-align: middle;">
          <div style="border: 1.5px solid #0f766e; padding: 4px 6px; border-radius: 4px; text-align: center; background: #f0fdfa;">
            <div style="font-size: 9px; font-weight: bold; color: #0f766e;">CLINICAL SUMMARY</div>
            <div style="font-size: 11px; font-weight: 900; color: #0f766e; margin-top: 1px;">IPD DISCHARGE</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Banner -->
    <div class="doc-banner">
      ${isDeceased ? 'CLINICAL DEATH / EXPIRED SUMMARY' : isLama ? 'LAMA DISCHARGE SUMMARY & CLINICAL RECORD' : 'OFFICIAL INPATIENT DISCHARGE SUMMARY'}
      <span class="banner-sub">Comprehensive Clinical Course, Post-Discharge Treatment Protocol & Follow-up Advice</span>
    </div>

    <!-- Patient Demographics -->
    <table class="demographics-table">
      <tr>
        <td class="demo-label">Patient Name:</td>
        <td class="demo-val"><strong>${data.patientName || 'N/A'}</strong></td>
        <td class="demo-label">MRN / UHID:</td>
        <td class="demo-val"><strong style="color: #0f766e;">${data.mrn || data.uhid || 'IPD-ACTIVE'}</strong></td>
      </tr>
      <tr>
        <td class="demo-label">Age / Gender:</td>
        <td class="demo-val">${data.age || 'Adult'} Yrs / ${data.gender || 'N/A'}</td>
        <td class="demo-label">Ward / Bed No.:</td>
        <td class="demo-val"><strong>${data.ward || 'General Ward'} / ${data.bedNumber || 'Bed-01'}</strong></td>
      </tr>
      <tr>
        <td class="demo-label">Date of Admission:</td>
        <td class="demo-val">${formattedAdmDate}</td>
        <td class="demo-label">Date of Discharge:</td>
        <td class="demo-val"><strong>${formattedDischDate}</strong></td>
      </tr>
      <tr>
        <td class="demo-label">Attending Consultant:</td>
        <td class="demo-val"><strong>${data.attendingDoctor || data.dischargeBy || 'Dr. Rajesh Sharma'}</strong></td>
        <td class="demo-label">Discharge Status:</td>
        <td class="demo-val">
          <span class="status-pill ${isDeceased ? 'status-deceased' : isLama ? 'status-lama' : 'status-routine'}">
            ${data.dischargeType || 'Routine / Improved'}
          </span>
        </td>
      </tr>
      <tr>
        <td class="demo-label">Contact / Phone:</td>
        <td class="demo-val">${data.phone || 'N/A'}</td>
        <td class="demo-label">Guardian / Kin:</td>
        <td class="demo-val">${data.guardianName || data.relativeName || 'Family / Relative'}</td>
      </tr>
      ${data.address ? `
      <tr>
        <td class="demo-label">Residential Address:</td>
        <td class="demo-val" colspan="3">${data.address}</td>
      </tr>
      ` : ''}
    </table>

    <!-- Diagnosis Section -->
    <div class="section-head">
      <span>1. Clinical Diagnosis & Operative Procedures</span>
      <span style="font-size: 9px; font-weight: normal; text-transform: none; color: #044e45;">ICD-10 / Clinical Coding</span>
    </div>
    <div class="content-box">
      <p><strong>Primary Final Diagnosis:</strong> ${data.primaryDiagnosis || 'Acute Medical Management / Post-Intervention Recovery'}</p>
      ${data.secondaryDiagnosis ? `<p><strong>Secondary Diagnosis / Co-morbidities:</strong> ${data.secondaryDiagnosis}</p>` : ''}
      ${data.operativeProcedure ? `
        <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1;">
          <p><strong>Surgical / Endoscopic / Interventional Procedure:</strong> <strong>${data.operativeProcedure}</strong></p>
          ${data.surgeonName ? `<p><strong>Operating Surgeon / Endoscopist:</strong> ${data.surgeonName} ${data.anaesthesiaType ? `| <strong>Anaesthesia:</strong> ${data.anaesthesiaType}` : ''}</p>` : ''}
        </div>
      ` : ''}
    </div>

    <!-- Clinical Course & Hospital Treatment -->
    <div class="section-head">
      <span>2. Hospital Course & Clinical Treatment Summary</span>
    </div>
    <div class="content-box">
      <p>${data.clinicalSummary || data.hospitalCourse || 'Patient admitted and placed under active observation and intravenous protocol. Vital parameters monitored round-the-clock. Multi-specialty supportive care and clinical management delivered according to hospital standard operating procedures. Patient demonstrated significant clinical and symptomatic improvement.'}</p>
    </div>

    <!-- Discharge Vitals & Clinical Examination -->
    <div class="section-head">
      <span>3. Condition & Physical Vitals at Discharge</span>
    </div>
    <div class="content-box">
      <p><strong>Vitals at Discharge:</strong> ${data.dischargeVitals || 'BP: 124/82 mmHg | Pulse: 76 bpm | SpO2: 98% on Room Air | Temp: 98.4°F | Afebrile'}</p>
      <p><strong>General Condition:</strong> ${data.conditionAtDischarge || 'Hemodynamically stable, active, conscious, oriented, ambulatory, tolerating oral intake.'}</p>
      ${data.investigationHighlights ? `<p style="margin-top: 4px;"><strong>Significant Lab / Imaging Findings:</strong> ${data.investigationHighlights}</p>` : ''}
    </div>

    <!-- Take-Home Medications -->
    <div class="section-head">
      <span>4. Take-Home Prescribed Medications & Administration Schedule</span>
    </div>
    ${medsHtml}

    <!-- Dietary & Activity Advice -->
    <div class="section-head">
      <span>5. Dietary Advice, Lifestyle & Wound Care</span>
    </div>
    <div class="content-box">
      <p><strong>Diet & Hydration:</strong> ${data.dietaryAdvice || 'Soft, easily digestible, high-protein balanced diet. Drink 2.5–3 Litres of clean boiled water daily. Strictly avoid deep-fried, excessively oily, or spicy foods.'}</p>
      <p style="margin-top: 3px;"><strong>Activity & Wound Care:</strong> Adequate rest advised. Avoid strenuous physical lifting (>5 kg) for 2 weeks. Keep surgical/dressing site clean and dry.</p>
    </div>

    <!-- Emergency Red Flags & Follow-up -->
    <div class="section-head">
      <span>6. Emergency Warning Signs & Follow-Up Protocol</span>
    </div>
    <div class="emergency-box">
      <strong>🚨 EMERGENCY WARNING SIGNS (Report to Casualty / Hospital Immediately):</strong><br>
      ${data.emergencyWarningSigns || 'Persistent high fever (>101°F) with chills, severe abdominal pain, projectile vomiting, acute shortness of breath / chest tightness, sudden bleeding, altered consciousness, or surgical site purulent discharge.'}
    </div>

    <div class="warning-box" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong>Next OPD Follow-Up Visit:</strong> <span style="font-size: 11px; font-weight: bold; color: #0f766e;">${formattedFollowUp}</span> with <strong>${data.attendingDoctor || data.dischargeBy || 'Treating Consultant'}</strong> in OPD.
      </div>
      <div style="font-size: 9.5px; font-weight: bold; color: #b45309;">
        Bring this Discharge Summary & All Diagnostic Reports
      </div>
    </div>

    ${isLama ? `
    <!-- LAMA Statutory Addendum -->
    <div class="section-head" style="background: #fffbeb; border-left-color: #d97706; color: #b45309;">
      <span>7. Statutory LAMA (Left Against Medical Advice) Acknowledgment</span>
    </div>
    <div class="content-box" style="background: #fffdf5; border-color: #fde68a;">
      <p><strong>Reason for LAMA:</strong> ${data.lamaReason || 'Personal / Domestic reasons & financial considerations requested by patient/family.'}</p>
      <p><strong>Risks Explained:</strong> ${data.riskExplained || 'The attending medical team has thoroughly explained the grave health risks including clinical deterioration, recurrence of acute symptoms, irreversible complications, and potential mortality associated with premature discharge before completing the mandatory hospital course.'}</p>
      <p style="font-size: 9.5px; color: #78350f; margin-top: 4px;"><strong>Declaration:</strong> I/we the undersigned patient / legal kin willingly take discharge against medical advice and hold neither the treating hospital nor the consultants legally or clinically liable for any subsequent complications.</p>
    </div>
    ` : ''}

    ${isDeceased ? `
    <!-- Death Summary Addendum -->
    <div class="section-head" style="background: #fee2e2; border-left-color: #b91c1c; color: #991b1b;">
      <span>7. Statutory Clinical Death Summary & Handover</span>
    </div>
    <div class="content-box" style="background: #fff5f5; border-color: #fecaca;">
      <p><strong>Time of Death:</strong> <strong>${data.timeOfDeath || 'As Recorded in Death Certificate'}</strong> | <strong>Death Cert. No:</strong> <strong>${data.deathCertNo || 'MCCD/2026/0842'}</strong></p>
      <p><strong>Direct Cause of Death:</strong> ${data.causeOfDeathDirect || 'Cardiopulmonary Arrest'}</p>
      <p><strong>Antecedent Cause:</strong> ${data.causeOfDeathAntecedent || 'Severe Sepsis with Multi-Organ Dysfunction'}</p>
      <p><strong>Underlying Cause:</strong> ${data.causeOfDeathUnderlying || 'Chronic Systemic Disease'}</p>
      <p><strong>Body Handed Over To:</strong> ${data.bodyHandedOverTo || data.relativeName || 'Next of Kin'} ${data.bodyHandoverTime ? `at ${data.bodyHandoverTime}` : ''}</p>
    </div>
    ` : ''}

    <!-- Signatures -->
    <div class="signature-grid">
      <div class="sig-col">
        <div class="sig-line">Prepared By (RMO / Nurse)</div>
        <div style="font-size: 8.5px; color: #64748b; margin-top: 2px;">Name & Stamp</div>
      </div>
      <div class="sig-col">
        <div class="sig-line">${isLama ? 'Patient / Kin Signature' : 'Patient / Relative Signature'}</div>
        <div style="font-size: 8.5px; color: #64748b; margin-top: 2px;">Received Summary in Good Condition</div>
      </div>
      <div class="sig-col">
        <div class="sig-line">${data.dischargeBy || data.attendingDoctor || 'Consultant In-Charge'}</div>
        <div style="font-size: 8.5px; color: #0f766e; font-weight: bold; margin-top: 2px;">Treating Specialist / Stamp</div>
      </div>
    </div>

    <!-- Statutory Footer -->
    <div class="footer-note">
      This is an official statutory medical record generated by NEO GASTRO PLUS Hospital Information System (HIS). In case of emergency medical query or urgent assistance, contact Hospital Emergency Casualty: ${hospPhone} (24x7).
    </div>
  </div>
</body>
</html>
  `;
}

export function printDischargeSummary(data: DischargeSummaryPrintData, hospitalInfo?: any) {
  const html = getDischargeSummaryHtml(data, hospitalInfo);
  printHTML(html);
}
