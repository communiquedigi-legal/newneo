import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  X, 
  Share2, 
  Calendar, 
  User, 
  Clock, 
  Building2, 
  AlertTriangle, 
  ShieldCheck, 
  Stethoscope,
  HeartPulse,
  Pill,
  CheckCircle2,
  Phone,
  Edit,
  Download,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { printDischargeSummary, DischargeSummaryPrintData } from '@/lib/dischargePrint';
import { sendWhatsAppMessage } from '@/lib/whatsappService';

interface DischargeSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: any | null;
  patient?: any | null;
  admission?: any | null;
  onEdit?: (summary: any) => void;
}

export const DischargeSummaryModal: React.FC<DischargeSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  patient,
  admission,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'medications' | 'advice'>('preview');

  if (!summary && !patient) return null;

  // Derive consolidated data
  const patientName = summary?.patientName || patient?.name || 'Inpatient';
  const mrn = summary?.mrn || patient?.mrn || 'MRN-IPD-ACTIVE';
  const age = summary?.age || patient?.age || 'Adult';
  const gender = summary?.gender || patient?.gender || 'N/A';
  const phone = summary?.phone || patient?.phone || '';
  const address = summary?.address || patient?.address || '';
  const ward = summary?.ward || admission?.ward || 'General Ward';
  const bedNumber = summary?.bedNumber || summary?.bed_id || admission?.bed_id || 'Bed-01';
  const admissionDate = summary?.admissionDate || admission?.admission_date || admission?.created_at;
  const dischargeDate = summary?.dischargeDate || summary?.discharge_date || new Date().toISOString();
  const dischargeType = summary?.dischargeType || summary?.discharge_type || 'Routine / Improved';
  const dischargeBy = summary?.dischargeBy || summary?.discharge_by || 'Dr. Rajesh Sharma';
  const primaryDiagnosis = summary?.primaryDiagnosis || summary?.primary_diagnosis || admission?.diagnosis || 'Acute Medical Management & Recovery';
  const secondaryDiagnosis = summary?.secondaryDiagnosis || summary?.secondary_diagnosis || '';
  const operativeProcedure = summary?.operativeProcedure || summary?.operative_procedure || '';
  const clinicalSummary = summary?.clinicalSummary || summary?.clinical_summary || 'Patient managed in IPD and stabilized.';
  const dischargeVitals = summary?.dischargeVitals || summary?.discharge_vitals || 'BP: 120/80 mmHg | Pulse: 76 bpm | SpO2: 98% RA | Temp: 98.4°F';
  const conditionAtDischarge = summary?.conditionAtDischarge || summary?.condition_at_discharge || 'Hemodynamically Stable, Afebrile, Ambulatory';
  const dietaryAdvice = summary?.dietaryAdvice || summary?.dietary_advice || 'Nutritious soft diet. Hydrate well (2.5-3L water/day). Avoid spicy foods.';
  const emergencyWarningSigns = summary?.emergencyWarningSigns || summary?.emergency_warning_signs || 'High fever (>101°F), severe pain, persistent vomiting, shortness of breath.';
  const followUpDate = summary?.followUpDate || summary?.follow_up_date || '';
  const medications = summary?.medications || '';

  const isLama = dischargeType.toLowerCase().includes('lama');
  const isDeceased = dischargeType.toLowerCase().includes('deceased') || dischargeType.toLowerCase().includes('expired');

  const printPayload: DischargeSummaryPrintData = {
    patientName,
    mrn,
    age,
    gender,
    phone,
    address,
    ward,
    bedNumber,
    admissionDate,
    dischargeDate,
    dischargeType,
    dischargeBy,
    attendingDoctor: dischargeBy,
    primaryDiagnosis,
    secondaryDiagnosis,
    operativeProcedure,
    clinicalSummary,
    dischargeVitals,
    investigationHighlights: summary?.investigationHighlights || summary?.investigation_highlights,
    conditionAtDischarge,
    medications,
    dietaryAdvice,
    emergencyWarningSigns,
    followUpDate,
    relativeName: summary?.relativeName,
    relativeContact: summary?.relativeContact,
    lamaReason: summary?.lamaReason,
    riskExplained: summary?.riskExplained,
    witnessName: summary?.witnessName,
    timeOfDeath: summary?.timeOfDeath,
    causeOfDeathDirect: summary?.causeOfDeathDirect,
    causeOfDeathAntecedent: summary?.causeOfDeathAntecedent,
    causeOfDeathUnderlying: summary?.causeOfDeathUnderlying,
    deathCertNo: summary?.deathCertNo,
    bodyHandedOverTo: summary?.bodyHandedOverTo
  };

  const handlePrint = () => {
    printDischargeSummary(printPayload);
  };

  const handleShareWhatsApp = () => {
    if (!phone) {
      toast.error('Patient phone number not found.');
      return;
    }
    const text = `*GASTRO PLUS HOSPITAL - DISCHARGE SUMMARY*\n\n` +
      `*Patient:* ${patientName} (${mrn})\n` +
      `*Discharge Date:* ${formatDate(dischargeDate)}\n` +
      `*Discharge Type:* ${dischargeType}\n` +
      `*Consultant:* ${dischargeBy}\n\n` +
      `*Diagnosis:* ${primaryDiagnosis}\n` +
      `*Condition:* ${conditionAtDischarge}\n\n` +
      `*Take-Home Medications:*\n${typeof medications === 'string' ? medications : 'Please review physical summary.'}\n\n` +
      `*Follow-Up Date:* ${followUpDate ? formatDate(followUpDate) : 'After 7 days in OPD'}\n\n` +
      `*Emergency Helpline:* 9109102145 (24x7)`;
    
    sendWhatsAppMessage(phone, text);
    toast.success(`Opening WhatsApp for ${patientName}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-white">
        {/* Header */}
        <DialogHeader className="p-4 bg-slate-900 text-white flex flex-row items-center justify-between border-b">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              <DialogTitle className="text-base font-bold text-white">
                Official Inpatient Discharge Summary
              </DialogTitle>
              <Badge className={
                isDeceased ? "bg-rose-500 text-white" :
                isLama ? "bg-amber-500 text-white" :
                "bg-emerald-600 text-white"
              }>
                {dischargeType}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-300">
              <span className="font-semibold text-white">{patientName}</span> • MRN: <span className="font-mono text-teal-300">{mrn}</span> • {age}y / {gender} • Ward: {ward} (Bed: {bedNumber})
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2 pr-6">
            <Button 
              size="sm" 
              onClick={handlePrint} 
              className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold gap-1.5 h-8 text-xs shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Official Summary
            </Button>
            {phone && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleShareWhatsApp} 
                className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white h-8 text-xs gap-1"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
            <TabsList className="bg-slate-200/80 p-0.5 h-8">
              <TabsTrigger value="preview" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-teal-900">
                Summary Document Preview
              </TabsTrigger>
              <TabsTrigger value="medications" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-teal-900">
                Prescribed Take-Home Medications
              </TabsTrigger>
              <TabsTrigger value="advice" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-teal-900">
                Diet, Instructions & Red Flags
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 text-xs text-slate-800">
          {activeTab === 'preview' && (
            <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              {/* Demographics Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">PATIENT NAME</span>
                  <span className="font-bold text-slate-900">{patientName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">MRN / UHID</span>
                  <span className="font-mono font-bold text-teal-700">{mrn}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">ADMISSION DATE</span>
                  <span className="font-semibold text-slate-800">{formatDate(admissionDate)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">DISCHARGE DATE</span>
                  <span className="font-semibold text-slate-800">{formatDate(dischargeDate)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">ATTENDING CONSULTANT</span>
                  <span className="font-bold text-slate-900">{dischargeBy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">WARD / BED</span>
                  <span className="font-semibold text-slate-800">{ward} / {bedNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">DISCHARGE TYPE</span>
                  <span className="font-bold text-slate-900">{dischargeType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">NEXT FOLLOW-UP</span>
                  <span className="font-bold text-teal-700">{followUpDate ? formatDate(followUpDate) : 'In 7 Days (OPD)'}</span>
                </div>
              </div>

              {/* Clinical Diagnosis */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Primary Final Diagnosis
                </div>
                <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-100 text-slate-900 font-semibold">
                  {primaryDiagnosis}
                </div>
                {secondaryDiagnosis && (
                  <p className="text-[11px] text-slate-600 pl-1">
                    <span className="font-semibold">Secondary Diagnosis / Co-morbidities:</span> {secondaryDiagnosis}
                  </p>
                )}
                {operativeProcedure && (
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-950 font-medium mt-1">
                    <span className="font-bold text-blue-900">Procedure Performed:</span> {operativeProcedure}
                  </div>
                )}
              </div>

              {/* Treatment Course Summary */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Hospital Course & Treatment Summary
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line">
                  {clinicalSummary}
                </div>
              </div>

              {/* Vitals & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    Vitals at Discharge
                  </span>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-medium">
                    {dischargeVitals}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Condition at Discharge
                  </span>
                  <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-200 text-emerald-950 font-semibold">
                    {conditionAtDischarge}
                  </div>
                </div>
              </div>

              {/* Special LAMA box if LAMA */}
              {isLama && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-950 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    LAMA Statutory Record
                  </div>
                  <p className="text-[11px]"><span className="font-bold">Reason:</span> {summary?.lamaReason || 'Patient/Family Request'}</p>
                  <p className="text-[11px]"><span className="font-bold">Risks Explained:</span> {summary?.riskExplained || 'Grave health risks explained to relative.'}</p>
                  <p className="text-[11px]"><span className="font-bold">Relative / Kin:</span> {summary?.relativeName || 'Family'} ({summary?.relativeContact || 'N/A'})</p>
                </div>
              )}

              {/* Special Deceased box if Deceased */}
              {isDeceased && (
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-950 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-rose-900">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Clinical Death Summary
                  </div>
                  <p className="text-[11px]"><span className="font-bold">Time of Death:</span> {summary?.timeOfDeath || 'Recorded'}</p>
                  <p className="text-[11px]"><span className="font-bold">Direct Cause:</span> {summary?.causeOfDeathDirect || 'Cardiopulmonary Arrest'}</p>
                  <p className="text-[11px]"><span className="font-bold">Death Cert No:</span> {summary?.deathCertNo || 'MCCD/2026/0842'}</p>
                  <p className="text-[11px]"><span className="font-bold">Handed Over To:</span> {summary?.bodyHandedOverTo || 'Kin'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'medications' && (
            <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Pill className="w-4 h-4 text-teal-600" />
                  Prescribed Take-Home Medication Chart
                </div>
                <Badge variant="outline" className="text-teal-700 bg-teal-50 border-teal-200">
                  To be continued post-discharge
                </Badge>
              </div>

              {typeof medications === 'string' && medications.trim() ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs whitespace-pre-line leading-relaxed text-slate-800">
                  {medications}
                </div>
              ) : Array.isArray(medications) && medications.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="p-2.5 text-left">#</th>
                        <th className="p-2.5 text-left">Medicine Name</th>
                        <th className="p-2.5 text-left">Dosage</th>
                        <th className="p-2.5 text-left">Frequency</th>
                        <th className="p-2.5 text-left">Duration</th>
                        <th className="p-2.5 text-left">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {medications.map((m: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{m.name || m.medicineName || 'Medicine'}</td>
                          <td className="p-2.5">{m.dosage || '-'}</td>
                          <td className="p-2.5">{m.frequency || 'As Directed'}</td>
                          <td className="p-2.5">{m.duration || '-'}</td>
                          <td className="p-2.5 text-slate-600">{m.instructions || 'After food'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                  No take-home medications entered. You can edit this summary to add prescribed medications.
                </div>
              )}
            </div>
          )}

          {activeTab === 'advice' && (
            <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Dietary & Lifestyle Advice
                </span>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                  {dietaryAdvice}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Emergency Red Flags & Warning Signs
                </span>
                <div className="p-3.5 bg-rose-50/80 rounded-lg border border-rose-200 text-rose-950 font-medium leading-relaxed">
                  {emergencyWarningSigns}
                </div>
              </div>

              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-teal-950 block">Next Scheduled Follow-Up Consultation</span>
                  <span className="text-teal-800">
                    {followUpDate ? formatDate(followUpDate) : 'Within 7 Days in OPD'} with {dischargeBy}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-teal-700">
                  Room / OPD Counter No. 04
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs font-semibold gap-1 text-slate-700"
                onClick={() => {
                  onEdit(summary);
                  onClose();
                }}
              >
                <Edit className="w-3.5 h-3.5 text-slate-600" />
                Edit / Revise Summary
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
            <Button 
              size="sm" 
              onClick={handlePrint}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold gap-1.5 text-xs shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Discharge Summary
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
