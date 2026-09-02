import { printHTML } from './printHelper';
import { formatDate } from './utils';

export interface AppointmentSlipData {
  appointment: any;
  patient?: any;
  doctor?: any;
  tokenNumber?: string;
  appointmentNumber?: string;
  consultationFee?: number;
  discountAmount?: number;
  netFee?: number;
  paymentStatus?: string;
  paymentMode?: string;
  bookedBy?: string;
}

export type AppointmentPrintFormat = 'A5' | 'A4' | 'thermal_80' | 'thermal_58';

export const HOSPITAL_CONFIG = {
  name: 'NEW GASTRO PLUS HOSPITAL',
  tagline: 'Center for Advanced Gastroenterology, Hepatology & Multispeciality Care',
  address: 'Opp. New Collectorate, Ring Road No. 1, Raipur (C.G.) - 492001',
  phone: '0771-4002000, +91 9109102145',
  emergency: '24x7 Emergency & Trauma: 0771-4002001',
  email: 'opd@newgastroplus.com',
  website: 'www.newgastroplus.com',
  nabh: 'NABH ACCREDITED HEALTHCARE PROVIDER'
};

export function getCleanAppointmentDetails(data: AppointmentSlipData) {
  const apt = data.appointment || {};
  const pat = data.patient || {};
  const doc = data.doctor;

  const patientName = pat.name || pat.patient_name || pat.patientName || apt.patientName || apt.patient_name || 'WALK-IN PATIENT';
  const patientMrn = pat.mrn || pat.patient_mrn || pat.patientMrn || apt.patientMrn || apt.patient_mrn || apt.mrn || 'N/A';
  const patientAge = pat.age || pat.patient_age || apt.age || apt.patientAge || '—';
  const patientGender = pat.gender || pat.patient_gender || apt.gender || apt.patientGender || '—';
  const patientPhone = pat.phone || pat.mobile || pat.contact || apt.phone || apt.patientPhone || pat.emergencyPhone || '—';
  const patientAddress = pat.address || pat.city || apt.address || 'Raipur, C.G.';
  const relativeInfo = pat.guardianName || pat.fatherName || pat.husbandName || apt.guardianName || '';

  let doctorName = 'OPD Consultant';
  let doctorSpeciality = 'General OPD / Gastroenterology';
  let doctorChamber = 'Chamber No. 1 (Ground Floor)';

  if (typeof doc === 'string') {
    doctorName = doc;
  } else if (doc && typeof doc === 'object') {
    doctorName = doc.name || doc.doctorName || 'OPD Consultant';
    doctorSpeciality = doc.specialty || doc.specialization || doc.department || 'Gastroenterology';
    doctorChamber = doc.chamber || doc.room || doc.room_number || 'Chamber No. 1';
  } else if (apt.doctor || apt.doctorName) {
    doctorName = apt.doctor || apt.doctorName;
    doctorSpeciality = apt.department || apt.doctor_department || 'General OPD & Gastroenterology';
  }

  // Token & Sequence
  const token = data.tokenNumber || apt.token_number || apt.tokenNumber || (apt.id ? `TK-${String(apt.id).slice(-3).toUpperCase()}` : 'TK-1');
  const appointmentNo = data.appointmentNumber || apt.appointment_number || apt.appointmentNumber || (apt.id ? `#${String(apt.id).slice(-4).toUpperCase()}` : '#1001');

  // Dates & Times
  const sessionDate = apt.appointment_date || apt.date || new Date().toISOString().split('T')[0];
  const sessionTime = apt.appointment_time || apt.time || '10:00 AM';
  const bookingCreatedAt = apt.created_at ? new Date(apt.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const urgency = apt.urgency || 'Routine';

  // Calculate reporting time (15 mins prior)
  const reportingInstruction = 'Please report at OPD Nursing Desk 15 minutes before scheduled time.';

  // Financials
  const fee = data.consultationFee !== undefined ? data.consultationFee : Number(apt.fee || apt.amount || 500);
  const discount = data.discountAmount !== undefined ? data.discountAmount : Number(apt.discount_amount || apt.discountAmount || 0);
  const netFee = Math.max(0, fee - discount);
  const paymentStatus = data.paymentStatus || apt.payment_status || (netFee === 0 ? 'Free / Exempted' : 'Paid');
  const paymentMode = data.paymentMode || apt.payment_method || apt.paymentMode || 'Cash / Counter';
  const bookedBy = data.bookedBy || apt.created_by_name || 'Front Desk Reception';

  return {
    patientName,
    patientMrn,
    patientAge,
    patientGender,
    patientPhone,
    patientAddress,
    relativeInfo,
    doctorName,
    doctorSpeciality,
    doctorChamber,
    token,
    appointmentNo,
    sessionDate,
    sessionTime,
    bookingCreatedAt,
    urgency,
    reportingInstruction,
    fee,
    discount,
    netFee,
    paymentStatus,
    paymentMode,
    bookedBy
  };
}

export function generateAppointmentSlipHtml(data: AppointmentSlipData, format: AppointmentPrintFormat = 'A5'): string {
  const d = getCleanAppointmentDetails(data);
  const formattedDate = formatDate(d.sessionDate);

  if (format === 'thermal_80' || format === 'thermal_58') {
    const isNarrow = format === 'thermal_58';
    const widthMm = isNarrow ? '58mm' : '80mm';
    const fontSize = isNarrow ? '10px' : '12px';
    const titleSize = isNarrow ? '14px' : '16px';
    const tokenSize = isNarrow ? '30px' : '40px';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OPD Appointment Slip - ${d.token}</title>
  <style>
    @page {
      margin: 0;
      size: ${widthMm} auto;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Courier New', monospace;
      width: ${widthMm};
      margin: 0 auto;
      padding: ${isNarrow ? '4mm' : '6mm'};
      box-sizing: border-box;
      background: #fff;
      color: #000;
      font-size: ${fontSize};
      line-height: 1.35;
      text-align: center;
    }
    .header {
      border-bottom: 2px dashed #000;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .hosp-title {
      font-size: ${titleSize};
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .hosp-sub {
      font-size: 9px;
      font-weight: 600;
      margin-top: 2px;
    }
    .slip-badge {
      font-size: 11px;
      font-weight: 800;
      border: 1px solid #000;
      display: inline-block;
      padding: 2px 8px;
      margin-top: 5px;
      text-transform: uppercase;
    }
    .token-box {
      border: 2px solid #000;
      border-radius: 6px;
      padding: 8px 4px;
      margin: 8px 0;
      background: #f8f8f8;
    }
    .token-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .token-val {
      font-size: ${tokenSize};
      font-weight: 900;
      line-height: 1.1;
      margin: 4px 0;
    }
    .appt-meta {
      font-size: 10px;
      font-weight: 700;
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    .info-table {
      width: 100%;
      text-align: left;
      font-size: ${fontSize};
      border-collapse: collapse;
      margin: 6px 0;
    }
    .info-table td {
      padding: 2px 0;
      vertical-align: top;
    }
    .info-label {
      font-weight: 700;
      width: 38%;
      color: #222;
    }
    .info-val {
      font-weight: 800;
      width: 62%;
    }
    .fee-box {
      border: 1px solid #000;
      padding: 4px;
      margin: 6px 0;
      font-weight: 800;
      text-align: center;
    }
    .instructions {
      font-size: 9px;
      line-height: 1.25;
      text-align: left;
      margin-top: 6px;
    }
    .footer {
      border-top: 1px dashed #000;
      padding-top: 6px;
      margin-top: 8px;
      font-size: 8.5px;
      color: #333;
    }
  </style>
</head>
<body onload="window.print();">
  <div class="header">
    <div class="hosp-title">${HOSPITAL_CONFIG.name}</div>
    <div class="hosp-sub">${HOSPITAL_CONFIG.tagline}</div>
    <div style="font-size: 8.5px; margin-top: 2px;">Ph: ${HOSPITAL_CONFIG.phone}</div>
    <div class="slip-badge">OPD CONSULTATION SLIP</div>
  </div>

  <div class="token-box">
    <div class="token-label">OPD QUEUE TOKEN</div>
    <div class="token-val">${d.token}</div>
    <div class="appt-meta">APPT NO: ${d.appointmentNo} | ${d.urgency.toUpperCase()}</div>
  </div>

  <table class="info-table">
    <tr>
      <td class="info-label">PATIENT:</td>
      <td class="info-val">${d.patientName}</td>
    </tr>
    <tr>
      <td class="info-label">UHID / MRN:</td>
      <td class="info-val" style="font-family: monospace;">${d.patientMrn}</td>
    </tr>
    <tr>
      <td class="info-label">AGE / GEN:</td>
      <td class="info-val">${d.patientAge} Y / ${d.patientGender}</td>
    </tr>
    <tr>
      <td class="info-label">PHONE:</td>
      <td class="info-val">${d.patientPhone}</td>
    </tr>
    <tr>
      <td class="info-label">DOCTOR:</td>
      <td class="info-val">${d.doctorName}</td>
    </tr>
    <tr>
      <td class="info-label">DEPT / ROOM:</td>
      <td class="info-val">${d.doctorSpeciality} (${d.doctorChamber})</td>
    </tr>
    <tr>
      <td class="info-label">DATE & TIME:</td>
      <td class="info-val">${formattedDate} @ ${d.sessionTime}</td>
    </tr>
  </table>

  <div class="divider"></div>

  <div class="fee-box">
    CONSULTATION FEE: ₹${d.netFee} (${d.paymentStatus.toUpperCase()})
    ${d.discount > 0 ? `<div style="font-size: 9px; font-weight: normal;">(Discount: ₹${d.discount})</div>` : ''}
  </div>

  <div class="instructions">
    • Please report 15 mins prior at OPD nursing desk.<br>
    • Carry all previous prescriptions & test reports.<br>
    • Valid strictly for scheduled session today.
  </div>

  <div class="footer">
    Booked: ${d.bookingCreatedAt}<br>
    Counter: ${d.bookedBy} | Have a healthy recovery!
  </div>
</body>
</html>`;
  }

  // Standard Sheet (A5 or A4)
  const isA4 = format === 'A4';
  const pageMargin = isA4 ? '12mm' : '8mm';
  const containerPadding = isA4 ? '28px' : '20px';
  const tokenSize = isA4 ? '56px' : '44px';
  const headerNameSize = isA4 ? '24px' : '20px';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OPD Appointment Slip - ${d.patientName} (${d.token})</title>
  <style>
    @page {
      size: ${isA4 ? 'A4 portrait' : 'A5 portrait'};
      margin: ${pageMargin};
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: ${isA4 ? '13px' : '11.5px'};
      line-height: 1.45;
    }
    .slip-container {
      border: 2px solid #0284c7;
      border-radius: 12px;
      padding: ${containerPadding};
      background: #ffffff;
      min-height: calc(100% - 4px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .hospital-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 14px;
      margin-bottom: 14px;
    }
    .hospital-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .hospital-logo-emblem {
      width: 52px;
      height: 52px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 900;
      box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2);
    }
    .hospital-name {
      font-size: ${headerNameSize};
      font-weight: 900;
      color: #0369a1;
      letter-spacing: 0.5px;
      line-height: 1.15;
    }
    .hospital-tagline {
      font-size: ${isA4 ? '11px' : '9.5px'};
      font-weight: 600;
      color: #64748b;
      margin-top: 2px;
    }
    .hospital-meta {
      font-size: ${isA4 ? '10px' : '8.5px'};
      color: #475569;
      margin-top: 3px;
    }
    .header-right-badges {
      text-align: right;
    }
    .nabh-badge {
      display: inline-block;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      font-size: 9px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .slip-title {
      font-size: ${isA4 ? '15px' : '13px'};
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .token-hero-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(to right, #f0f9ff, #e0f2fe);
      border: 1.5px solid #bae6fd;
      border-radius: 10px;
      padding: 12px 18px;
      margin-bottom: 16px;
    }
    .token-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .token-pill {
      background: #0284c7;
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .token-number {
      font-size: ${tokenSize};
      font-weight: 900;
      color: #0369a1;
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, monospace;
      line-height: 1;
    }
    .hero-meta-right {
      text-align: right;
    }
    .appt-id-badge {
      font-size: 13px;
      font-weight: 800;
      color: #1e293b;
    }
    .urgency-pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .urgency-routine { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
    .urgency-urgent { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .urgency-emergency { background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; }

    .grid-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .card-block {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
      padding: 12px;
    }
    .card-title {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0369a1;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: ${isA4 ? '12px' : '11px'};
    }
    .data-row:last-child {
      margin-bottom: 0;
    }
    .data-label {
      color: #64748b;
      font-weight: 600;
    }
    .data-val {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }

    .billing-strip {
      border: 1.5px dashed #0284c7;
      border-radius: 8px;
      background: #f0fdf4;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .fee-col-title {
      font-size: 10px;
      font-weight: 700;
      color: #15803d;
      text-transform: uppercase;
    }
    .fee-col-amount {
      font-size: 18px;
      font-weight: 900;
      color: #166534;
    }
    .status-badge-paid {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .status-badge-unpaid {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fca5a5;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .instructions-box {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 14px;
      font-size: ${isA4 ? '11px' : '9.5px'};
      color: #334155;
      line-height: 1.5;
    }
    .instructions-title {
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      margin-bottom: 4px;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    .instructions-list {
      margin: 0;
      padding-left: 18px;
    }
    .instructions-list li {
      margin-bottom: 2px;
    }

    .barcode-signature-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 8px;
      border-top: 1px dashed #cbd5e1;
    }
    .barcode-box {
      text-align: left;
    }
    .barcode-svg {
      font-family: monospace;
      font-weight: 800;
      letter-spacing: 4px;
      font-size: 14px;
      color: #1e293b;
      margin-bottom: 2px;
    }
    .barcode-sub {
      font-size: 8.5px;
      color: #64748b;
    }
    .signature-box {
      text-align: center;
      min-width: 140px;
    }
    .signature-line {
      border-top: 1px solid #0f172a;
      margin-bottom: 4px;
      width: 100%;
    }
    .signature-label {
      font-size: 9px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }

    .footer-audit {
      text-align: center;
      font-size: 8.5px;
      color: #94a3b8;
      margin-top: 8px;
    }
  </style>
</head>
<body onload="window.print();">
  <div class="slip-container">
    <div>
      <!-- Hospital Header -->
      <div class="hospital-header">
        <div class="hospital-left">
          <div class="hospital-logo-emblem">🏥</div>
          <div>
            <div class="hospital-name">${HOSPITAL_CONFIG.name}</div>
            <div class="hospital-tagline">${HOSPITAL_CONFIG.tagline}</div>
            <div class="hospital-meta">${HOSPITAL_CONFIG.address} | Phone: ${HOSPITAL_CONFIG.phone}</div>
          </div>
        </div>
        <div class="header-right-badges">
          <div class="nabh-badge">⭐ ${HOSPITAL_CONFIG.nabh}</div>
          <div class="slip-title">OPD CONSULTATION SLIP</div>
          <div style="font-size: 9px; color: #64748b; font-weight: 600;">SESSION: ${formattedDate}</div>
        </div>
      </div>

      <!-- Hero Token Bar -->
      <div class="token-hero-bar">
        <div class="token-group">
          <div class="token-pill">QUEUE TOKEN</div>
          <div class="token-number">${d.token}</div>
        </div>
        <div class="hero-meta-right">
          <div class="appt-id-badge">APPOINTMENT ${d.appointmentNo}</div>
          <div>
            <span class="urgency-pill ${
              d.urgency === 'Emergency' ? 'urgency-emergency' : d.urgency === 'Urgent' ? 'urgency-urgent' : 'urgency-routine'
            }">${d.urgency} PRIORITY</span>
          </div>
        </div>
      </div>

      <!-- 2-Column Info Grid -->
      <div class="grid-2col">
        <!-- Patient Information -->
        <div class="card-block">
          <div class="card-title">
            <span>Patient Information</span>
            <span style="font-family: monospace; font-size: 11px; color: #0f172a;">${d.patientMrn}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Patient Name:</span>
            <span class="data-val" style="font-size: 13px; color: #0369a1;">${d.patientName}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Age / Gender:</span>
            <span class="data-val">${d.patientAge} Years / ${d.patientGender}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Contact No:</span>
            <span class="data-val">${d.patientPhone}</span>
          </div>
          ${d.relativeInfo ? `
          <div class="data-row">
            <span class="data-label">Attendant:</span>
            <span class="data-val">${d.relativeInfo}</span>
          </div>
          ` : ''}
          <div class="data-row">
            <span class="data-label">City / Address:</span>
            <span class="data-val" style="font-weight: 600; max-width: 60%;">${d.patientAddress}</span>
          </div>
        </div>

        <!-- Doctor & Consultation Details -->
        <div class="card-block">
          <div class="card-title">
            <span>Consultation Schedule</span>
            <span style="font-size: 10px; color: #64748b;">${d.sessionTime}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Consulting Doctor:</span>
            <span class="data-val" style="font-size: 13px; color: #0369a1;">${d.doctorName}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Department:</span>
            <span class="data-val">${d.doctorSpeciality}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Chamber / Room:</span>
            <span class="data-val">${d.doctorChamber}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Scheduled Slot:</span>
            <span class="data-val">${formattedDate} (${d.sessionTime})</span>
          </div>
          <div class="data-row">
            <span class="data-label">Reporting Time:</span>
            <span class="data-val" style="color: #b45309;">15 Mins Before Slot</span>
          </div>
        </div>
      </div>

      <!-- Financial / Billing Strip -->
      <div class="billing-strip">
        <div>
          <div class="fee-col-title">Consultation Charges</div>
          <div class="fee-col-amount">₹${d.netFee}</div>
          ${d.discount > 0 ? `<div style="font-size: 9px; color: #166534;">Standard Fee: ₹${d.fee} (Discount Applied: ₹${d.discount})</div>` : ''}
        </div>
        <div style="text-align: right;">
          <div>
            <span class="${d.paymentStatus.toLowerCase().includes('paid') ? 'status-badge-paid' : 'status-badge-unpaid'}">
              ${d.paymentStatus}
            </span>
          </div>
          <div style="font-size: 9.5px; color: #475569; margin-top: 4px; font-weight: 600;">
            Mode: ${d.paymentMode}
          </div>
        </div>
      </div>

      <!-- Patient Instructions -->
      <div class="instructions-box">
        <div class="instructions-title">Important Guidelines for Outpatient Care:</div>
        <ul class="instructions-list">
          <li><strong>Reporting:</strong> ${d.reportingInstruction} Consultations run by token call sequence.</li>
          <li><strong>Medical Records:</strong> Please bring all previous diagnostic test reports, endoscopy records, and existing medicine strips.</li>
          <li><strong>Validity:</strong> This OPD consultation slip is valid solely for today's session with the assigned doctor.</li>
          <li><strong>Emergency:</strong> For acute abdominal pain, GI bleed, or emergency distress, immediately alert the 24x7 Casualty Desk.</li>
        </ul>
      </div>
    </div>

    <!-- Signatures and Barcode Footer -->
    <div>
      <div class="barcode-signature-row">
        <div class="barcode-box">
          <div class="barcode-svg">|| | ||| | |||| | || | ||| ||</div>
          <div class="barcode-sub">MRN: ${d.patientMrn} • APPT: ${d.appointmentNo}</div>
        </div>

        <div class="signature-box">
          <div style="height: 28px;"></div>
          <div class="signature-line"></div>
          <div class="signature-label">Receptionist / Authorised Sign</div>
        </div>
      </div>

      <div class="footer-audit">
        Booked on: ${d.bookingCreatedAt} | Desk: ${d.bookedBy} | Printed on: ${new Date().toLocaleString('en-IN')} | System Generated Slip
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers direct browser printing for an OPD appointment slip
 */
export function printAppointmentDirect(data: AppointmentSlipData, format: AppointmentPrintFormat = 'A5') {
  const html = generateAppointmentSlipHtml(data, format);
  printHTML(html);
}

/**
 * Generates WhatsApp formatted text for sending appointment details to patient
 */
export function generateWhatsAppAppointmentText(data: AppointmentSlipData): string {
  const d = getCleanAppointmentDetails(data);
  const formattedDate = formatDate(d.sessionDate);

  return `🏥 *${HOSPITAL_CONFIG.name}*
*OPD APPOINTMENT CONFIRMATION*
----------------------------------------
👤 *Patient:* ${d.patientName}
📋 *UHID / MRN:* ${d.patientMrn}
🎫 *OPD Token:* *${d.token}*
🔢 *Appt No:* ${d.appointmentNo}
📅 *Date:* ${formattedDate}
⏰ *Time Slot:* ${d.sessionTime}
👨‍⚕️ *Consultant:* ${d.doctorName}
🏢 *Speciality:* ${d.doctorSpeciality}
🚪 *Chamber:* ${d.doctorChamber}
💰 *Consultation Fee:* ₹${d.netFee} (${d.paymentStatus})
----------------------------------------
📌 *Important Instructions:*
• Please report 15 minutes before your scheduled time at the OPD Nursing Desk.
• Kindly carry previous prescriptions, discharge summaries & lab/radiology reports.
• 24x7 Emergency Contact: ${HOSPITAL_CONFIG.emergency}
• General Helpline: ${HOSPITAL_CONFIG.phone}

_We wish you a speedy recovery!_`;
}

/**
 * Opens WhatsApp web or mobile app to share appointment confirmation
 */
export function shareAppointmentWhatsApp(data: AppointmentSlipData): boolean {
  const d = getCleanAppointmentDetails(data);
  const rawPhone = String(d.patientPhone || '').replace(/\D/g, '');

  if (!rawPhone || rawPhone.length < 10) {
    return false;
  }

  const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
  const message = generateWhatsAppAppointmentText(data);
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${cleanPhone}?text=${encoded}`;

  window.open(url, '_blank');
  return true;
}
