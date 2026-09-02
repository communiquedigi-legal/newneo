import { storage, STORAGE_KEYS } from './storage';
import { printHTML } from './printHelper';

export interface ReferralCasePrintData {
  patientName: string;
  mrn: string;
  age?: string | number;
  gender?: string;
  phone?: string;
  address?: string;
  guardianName?: string;
  
  // Referral specific
  isReferral: boolean;
  referredBy: string;
  referralHospital?: string;
  referralReferenceNo?: string;
  referralContact?: string;
  referralReason?: string;
  referralType?: string;
  referralDate?: string;
  referralNotes?: string;

  // Admission specific
  admissionNo?: string;
  admissionDate?: string;
  dischargeDate?: string;
  ward?: string;
  bedNumber?: string;
  attendingDoctor?: string;
  department?: string;
  status?: string;
  provisionalDiagnosis?: string;
}

export function getReferralSlipHtml(data: ReferralCasePrintData, hospitalInfo?: any): string {
  const rawHosp = hospitalInfo || storage.get(STORAGE_KEYS.HOSPITAL_INFO, {
    name: 'GASTRO PLUS HOSPITAL',
    address: 'Plot No. 7 & 8, Om Shiv Nagar, Gufa Mandir Road, Lal Ghati Bhopal, 462030, Madhya Pradesh',
    phone: '9109102145/9109101246',
    email: 'gatroplusbhopal@gmail.com',
    website: 'www.gastroplusbhopal.com'
  });

  const hospName = (rawHosp?.name && !rawHosp.name.toLowerCase().includes('medicare') && !rawHosp.name.toLowerCase().includes('cureline'))
    ? (rawHosp.name.toUpperCase().includes('NEO GASTRO') ? 'GASTRO PLUS HOSPITAL' : rawHosp.name)
    : 'GASTRO PLUS HOSPITAL';
  const hospAddress = rawHosp?.address || 'Plot No. 7 & 8, Om Shiv Nagar, Gufa Mandir Road, Lal Ghati Bhopal, 462030, MP';
  const hospPhone = rawHosp?.phone || '9109102145 / 9109101246';
  const hospEmail = rawHosp?.email || 'gatroplusbhopal@gmail.com';
  const hospWeb = rawHosp?.website || 'www.gastroplusbhopal.com';
  const hospLogo = rawHosp?.logo || null;

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const refNo = data.referralReferenceNo || `REF-${data.mrn?.replace('MRN-', '') || Math.floor(1000 + Math.random() * 9000)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Referral Acknowledgment & Case Reference - ${data.patientName || 'Patient'}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Segoe UI', Arial, 'Helvetica Neue', sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #0f172a;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .slip-container {
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
      border: 1.5px solid #0f766e;
      padding: 14px 18px;
      background: #fff;
      border-radius: 4px;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .header-logo-left {
      width: 65px;
      vertical-align: middle;
      text-align: center;
    }
    .header-center {
      text-align: center;
      vertical-align: middle;
      padding: 0 10px;
    }
    .header-logo-right {
      width: 65px;
      vertical-align: middle;
      text-align: center;
    }
    .hosp-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #0f766e;
      text-transform: uppercase;
    }
    .hosp-address {
      font-size: 9.5px;
      color: #334155;
      font-weight: 600;
      margin-top: 2px;
    }
    .hosp-contacts {
      font-size: 9px;
      color: #475569;
      margin-top: 2px;
    }
    .nabh-badge {
      border: 1.5px solid #0f766e;
      color: #0f766e;
      font-weight: 900;
      font-size: 11px;
      text-align: center;
      padding: 4px 6px;
      border-radius: 4px;
      display: inline-block;
      line-height: 1.1;
    }
    .main-banner {
      background: #f0fdfa;
      border: 1.5px solid #0f766e;
      text-align: center;
      padding: 5px 0;
      margin: 8px 0 12px 0;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #115e59;
      text-transform: uppercase;
      border-radius: 3px;
    }
    .ref-badge-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 6px 12px;
      border-radius: 4px;
      margin-bottom: 12px;
      font-size: 10.5px;
    }
    .ref-badge-item {
      display: flex;
      gap: 5px;
    }
    .ref-label {
      font-weight: 700;
      color: #475569;
    }
    .ref-val {
      font-weight: 800;
      color: #0f766e;
      font-family: monospace;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      color: #0f766e;
      text-transform: uppercase;
      border-bottom: 1px solid #99f6e4;
      padding-bottom: 3px;
      margin: 10px 0 6px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      margin-bottom: 8px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px 12px;
      margin-bottom: 8px;
    }
    .data-item {
      display: flex;
      flex-direction: column;
    }
    .item-label {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .item-val {
      font-size: 11px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 1px;
    }
    .item-val-highlight {
      font-size: 11.5px;
      font-weight: 800;
      color: #0f766e;
    }
    .doctor-letter-box {
      background: #fdfefe;
      border: 1px solid #99f6e4;
      border-left: 4px solid #0f766e;
      padding: 10px 14px;
      border-radius: 4px;
      margin: 12px 0;
      font-size: 10.5px;
      color: #1e293b;
      line-height: 1.5;
    }
    .signatures-row {
      display: flex;
      justify-content: space-between;
      margin-top: 35px;
      padding-top: 8px;
    }
    .sig-box {
      text-align: center;
      width: 180px;
    }
    .sig-line {
      border-top: 1px solid #0f172a;
      margin-bottom: 4px;
    }
    .sig-label {
      font-size: 10px;
      font-weight: 700;
      color: #334155;
    }
    .sig-sub {
      font-size: 8.5px;
      color: #64748b;
    }
    @media print {
      body {
        margin: 0;
        background: transparent;
      }
      .slip-container {
        border: 1.5px solid #000;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="slip-container">
    <!-- Header Table -->
    <table class="header-table">
      <tr>
        <td class="header-logo-left">
          ${hospLogo ? `<img src="${hospLogo}" alt="Logo" style="max-height: 48px; max-width: 48px; object-fit: contain;" />` : `
          <div style="font-size: 22px; font-weight: 900; color: #0f766e;">+ GP</div>`}
        </td>
        <td class="header-center">
          <div class="hosp-title">${hospName}</div>
          <div class="hosp-address">${hospAddress}</div>
          <div class="hosp-contacts">📞 ${hospPhone} &nbsp;|&nbsp; 🌐 ${hospWeb} &nbsp;|&nbsp; ✉️ ${hospEmail}</div>
        </td>
        <td class="header-logo-right">
          <div class="nabh-badge">
            NABH<br/><span style="font-size:6.5px; font-weight:normal;">ACCREDITED</span>
          </div>
        </td>
      </tr>
    </table>

    <div class="main-banner">
      PATIENT ADMISSION & CASE REFERRAL ACKNOWLEDGMENT SLIP
    </div>

    <!-- Referral Reference & Date Strip -->
    <div class="ref-badge-strip">
      <div class="ref-badge-item">
        <span class="ref-label">Reference No:</span>
        <span class="ref-val">${refNo}</span>
      </div>
      <div class="ref-badge-item">
        <span class="ref-label">Referral Date:</span>
        <span class="ref-val">${data.referralDate || todayStr}</span>
      </div>
      <div class="ref-badge-item">
        <span class="ref-label">UHID / MRN:</span>
        <span class="ref-val">${data.mrn || 'N/A'}</span>
      </div>
      <div class="ref-badge-item">
        <span class="ref-label">Status:</span>
        <span class="ref-val" style="color:#0369a1;">${data.status || 'Admitted'}</span>
      </div>
    </div>

    <!-- Referring Doctor & Organization -->
    <div class="section-title">1. Referring Physician & Health Facility Details</div>
    <div class="grid-3">
      <div class="data-item">
        <span class="item-label">Referred By (Doctor)</span>
        <span class="item-val-highlight">${data.referredBy || 'Medical Practitioner'}</span>
      </div>
      <div class="data-item">
        <span class="item-label">Referring Hospital / Clinic</span>
        <span class="item-val">${data.referralHospital || 'Private Practice / Clinic'}</span>
      </div>
      <div class="data-item">
        <span class="item-label">Doctor Contact No.</span>
        <span class="item-val">${data.referralContact || 'N/A'}</span>
      </div>
    </div>
    <div class="grid-3">
      <div class="data-item">
        <span class="item-label">Referral Category</span>
        <span class="item-val">${data.referralType || 'Doctor / Specialist'}</span>
      </div>
      <div class="data-item">
        <span class="item-label">Case Reference / Slip No.</span>
        <span class="item-val font-mono">${refNo}</span>
      </div>
      <div class="data-item">
        <span class="item-label">Referral Notes / Instructions</span>
        <span class="item-val">${data.referralNotes || 'Routine clinical workup & management advised'}</span>
      </div>
    </div>

    <!-- Patient Identification -->
    <div class="section-title">2. Patient Identification & Demographics</div>
    <div class="grid-3">
      <div class="data-item">
        <span class="item-label">Patient Full Name</span>
        <span class="item-val-highlight">${data.patientName || 'N/A'}</span>
      </div>
      <div class="data-item">
        <span class="item-label">Age / Gender</span>
        <span class="item-val">${data.age ? `${data.age} Y` : 'Adult'} / ${data.gender || 'N/A'}</span>
      </div>
      <div class="data-item">
        <span class="item-label">Contact Mobile</span>
        <span class="item-val">${data.phone || 'N/A'}</span>
      </div>
    </div>
    <div class="grid-2">
      <div class="data-item">
        <span class="item-label">Father / Husband / Guardian</span>
        <span class="item-val">${data.guardianName || 'N/A'}</span>
      </div>
      <div class="data-item">
        <span class="item-label">Residential Address</span>
        <span class="item-val">${data.address || 'N/A'}</span>
      </div>
    </div>

    <!-- Hospital Inpatient / Admission Allocation -->
    <div class="section-title">3. Hospital Admission & Clinical Allocation</div>
    <div class="grid-3">
      <div class="data-item">
        <span class="item-label">Admission / Reg. No.</span>
        <span class="item-val font-mono font-bold">${data.admissionNo || `IPD-${data.mrn?.replace('MRN-', '') || 'ADM'}`}</span>
      </div>
      <div class="data-item">
        <span class="item-label">Date & Time of Admission</span>
        <span class="item-val">${data.admissionDate || todayStr}</span>
      </div>
      <div class="data-item">
        <span class="item-label">Ward & Bed Allocation</span>
        <span class="item-val font-bold text-teal-800">${data.ward || 'Inpatient Ward'} ${data.bedNumber ? `(Bed ${data.bedNumber})` : ''}</span>
      </div>
    </div>
    <div class="grid-2">
      <div class="data-item">
        <span class="item-label">Attending Senior Consultant In-Charge</span>
        <span class="item-val-highlight">${data.attendingDoctor || 'Dr. A. K. Sharma'}</span>
      </div>
      <div class="data-item">
        <span class="item-label">Provisional Clinical Diagnosis / Reason</span>
        <span class="item-val">${data.provisionalDiagnosis || data.referralReason || 'Under Inpatient Workup & Clinical Evaluation'}</span>
      </div>
    </div>

    <!-- Letter of Gratitude and Professional Communication -->
    <div class="doctor-letter-box">
      <strong>Dear Colleague (${data.referredBy || 'Doctor'}),</strong><br/>
      Thank you for referring your patient <strong>${data.patientName || 'the patient'}</strong> (Ref No: <strong>${refNo}</strong>) to <strong>${hospName}</strong>. 
      The patient has been admitted to our <strong>${data.ward || 'Inpatient Ward'}</strong> under the direct supervision of <strong>${data.attendingDoctor || 'our Senior Consultant'}</strong>. 
      Necessary diagnostic evaluations and multidisciplinary medical management have been initiated. We will keep you updated on clinical progress and share the comprehensive discharge summary.
    </div>

    <!-- Signatures -->
    <div class="signatures-row">
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">Admission Desk / Coordinator</div>
        <div class="sig-sub">Gastro Plus Hospital</div>
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">Attending Consultant</div>
        <div class="sig-sub">${data.attendingDoctor || 'Consultant In-Charge'}</div>
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-label">Medical Superintendent</div>
        <div class="sig-sub">Hospital Administration</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function printReferralSlip(data: ReferralCasePrintData, hospitalInfo?: any) {
  const html = getReferralSlipHtml(data, hospitalInfo);
  printHTML(html);
}

export function printReferralRegisterHtml(referralsList: ReferralCasePrintData[], hospitalInfo?: any): string {
  const rawHosp = hospitalInfo || storage.get(STORAGE_KEYS.HOSPITAL_INFO, {
    name: 'GASTRO PLUS HOSPITAL',
    address: 'Plot No. 7 & 8, Om Shiv Nagar, Gufa Mandir Road, Lal Ghati Bhopal, 462030, Madhya Pradesh',
    phone: '9109102145/9109101246',
    email: 'gatroplusbhopal@gmail.com',
    website: 'www.gastroplusbhopal.com'
  });

  const hospName = rawHosp?.name || 'GASTRO PLUS HOSPITAL';
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Referral Cases Register - ${todayStr}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm 12mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 10px;
      color: #0f172a;
      margin: 0;
      padding: 0;
    }
    .register-container {
      width: 100%;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    .hosp-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f766e;
    }
    .doc-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      margin-top: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 5px 6px;
      text-align: left;
    }
    th {
      background: #f0fdfa;
      color: #115e59;
      font-weight: 800;
      font-size: 9.5px;
      text-transform: uppercase;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .font-mono {
      font-family: monospace;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="register-container">
    <div class="header">
      <div class="hosp-title">${hospName}</div>
      <div class="doc-title">Master Patient Referral & Reference Register</div>
      <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Generated on: ${todayStr} • Total Referred Admissions: ${referralsList.length}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Ref. No. & Date</th>
          <th>Patient Name & MRN</th>
          <th>Age/Sex</th>
          <th>Referred By (Doctor & Hospital)</th>
          <th>Ref. Contact</th>
          <th>Ward / Bed</th>
          <th>Attending Doctor</th>
          <th>Reason / Diagnosis</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${referralsList.map((ref, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>
              <div class="font-mono text-teal-800">${ref.referralReferenceNo || `REF-${idx + 101}`}</div>
              <div style="font-size: 8.5px; color: #64748b;">${ref.referralDate || '—'}</div>
            </td>
            <td>
              <strong>${ref.patientName}</strong>
              <div style="font-size: 8.5px; color: #64748b;" class="font-mono">${ref.mrn}</div>
            </td>
            <td>${ref.age || '—'}Y / ${ref.gender || '—'}</td>
            <td>
              <strong style="color: #0f766e;">${ref.referredBy || '—'}</strong>
              <div style="font-size: 8.5px; color: #475569;">${ref.referralHospital || 'Clinic / Practice'}</div>
            </td>
            <td>${ref.referralContact || '—'}</td>
            <td>${ref.ward || 'IPD'} ${ref.bedNumber ? `(Bed ${ref.bedNumber})` : ''}</td>
            <td>${ref.attendingDoctor || '—'}</td>
            <td>${ref.provisionalDiagnosis || ref.referralReason || '—'}</td>
            <td><strong>${ref.status || 'Admitted'}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
  `;
}

export function printReferralRegister(referralsList: ReferralCasePrintData[], hospitalInfo?: any) {
  const html = printReferralRegisterHtml(referralsList, hospitalInfo);
  printHTML(html);
}
