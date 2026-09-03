import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Printer,
  X,
  FileText,
  Share2,
  Download,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Phone,
  Building2,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AppointmentSlipData,
  AppointmentPrintFormat,
  generateAppointmentSlipHtml,
  printAppointmentDirect,
  shareAppointmentWhatsApp,
  getCleanAppointmentDetails,
  HOSPITAL_CONFIG
} from '@/lib/appointmentPrint';
import { formatDate } from '@/lib/utils';

interface AppointmentSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppointmentSlipData | null;
  defaultFormat?: AppointmentPrintFormat;
  initialFormat?: AppointmentPrintFormat;
  hospitalInfo?: any;
}

export const AppointmentSlipModal: React.FC<AppointmentSlipModalProps> = ({
  isOpen,
  onClose,
  data,
  defaultFormat = 'A5',
  initialFormat,
  hospitalInfo
}) => {
  const [format, setFormat] = useState<AppointmentPrintFormat>(initialFormat || defaultFormat);

  const hospitalDisplayName = useMemo(() => {
    const raw = hospitalInfo?.name || HOSPITAL_CONFIG.name;
    let clean = String(raw).replace(/\bnew\b/gi, 'NEO');
    if (!clean.toUpperCase().includes('NEO')) {
      clean = clean.replace(/gastro\s*plus/gi, 'NEO GASTRO PLUS');
    }
    return clean.toUpperCase();
  }, [hospitalInfo?.name]);

  const hospitalDisplayAddress = useMemo(() => {
    const raw = hospitalInfo?.address || HOSPITAL_CONFIG.address;
    return String(raw).replace(/\bnew\b/gi, 'Neo');
  }, [hospitalInfo?.address]);

  const details = useMemo(() => {
    if (!data) return null;
    return getCleanAppointmentDetails(data);
  }, [data]);

  if (!isOpen || !data || !details) return null;

  const handlePrint = (chosenFormat?: AppointmentPrintFormat) => {
    const fmt = chosenFormat || format;
    printAppointmentDirect(data, fmt);
    toast.success(`Printing ${fmt.toUpperCase()} OPD Appointment Slip for ${details.patientName}`);
  };

  const handleWhatsApp = () => {
    const sent = shareAppointmentWhatsApp(data);
    if (sent) {
      toast.success(`Opening WhatsApp to send appointment slip to ${details.patientPhone}`);
    } else {
      toast.error('Patient phone number is missing or invalid for WhatsApp sharing.');
    }
  };

  const handleDownload = () => {
    const html = generateAppointmentSlipHtml(data, format);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Appointment_Slip_${details.patientMrn}_${details.token}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded appointment slip HTML');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[750px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-slate-100/90">
        {/* Header */}
        <DialogHeader className="p-4 bg-white border-b border-slate-200 shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold shadow-xs">
              <Printer className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                OPD Appointment Slip
                <Badge className="bg-teal-100 text-teal-900 border-teal-300 text-xs font-mono font-black">
                  {details.token}
                </Badge>
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Appt Ref: {details.appointmentNo} • {details.patientName} ({details.patientMrn})
              </p>
            </div>
          </div>

          {/* Format Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs mr-6">
            <button
              type="button"
              onClick={() => setFormat('A5')}
              className={`px-2.5 py-1 rounded font-bold text-xs transition-all ${
                format === 'A5' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A5 Slip
            </button>
            <button
              type="button"
              onClick={() => setFormat('A4')}
              className={`px-2.5 py-1 rounded font-bold text-xs transition-all ${
                format === 'A4' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A4 Sheet
            </button>
            <button
              type="button"
              onClick={() => setFormat('thermal_80')}
              className={`px-2.5 py-1 rounded font-bold text-xs transition-all ${
                format === 'thermal_80' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              80mm Thermal
            </button>
            <button
              type="button"
              onClick={() => setFormat('thermal_58')}
              className={`px-2.5 py-1 rounded font-bold text-xs transition-all ${
                format === 'thermal_58' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              58mm Thermal
            </button>
          </div>
        </DialogHeader>

        {/* Live Preview Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex justify-center">
          <div
            className={`bg-white shadow-md border border-slate-200 transition-all rounded-xl p-6 ${
              format === 'thermal_58'
                ? 'w-[320px] text-[11px] p-4 font-mono'
                : format === 'thermal_80'
                ? 'w-[420px] text-xs p-5 font-mono'
                : 'w-full max-w-[620px]'
            }`}
          >
            {/* Hospital Title */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="text-lg font-black text-teal-950 uppercase tracking-wide">
                {hospitalDisplayName}
              </div>
              <div className="text-[10.5px] text-slate-500 font-medium">
                {hospitalInfo?.tagline || 'Center for Advanced Gastroenterology, Hepatology & Multispeciality Care'}
              </div>
              <div className="text-[9.5px] text-slate-400 mt-0.5">
                {hospitalDisplayAddress} • Ph: {hospitalInfo?.phone || '0771-4002000'}
              </div>
              <div className="inline-block mt-2 px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                OPD Consultation Slip
              </div>
            </div>

            {/* Token Badge */}
            <div className="my-4 p-3 bg-gradient-to-r from-teal-50/80 to-blue-50/80 border border-teal-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider">
                  OPD Queue Token
                </span>
                <div className="text-4xl font-black text-teal-900 font-mono tracking-tight leading-none mt-1">
                  {details.token}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-800">{details.appointmentNo}</div>
                <Badge
                  className={`mt-1 text-[10px] font-bold ${
                    details.urgency === 'Emergency'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : details.urgency === 'Urgent'
                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                      : 'bg-teal-100 text-teal-900 border-teal-200'
                  }`}
                >
                  {details.urgency} Priority
                </Badge>
              </div>
            </div>

            {/* Patient & Doctor Details Grid */}
            <div className={`grid ${format.startsWith('thermal') ? 'grid-cols-1' : 'grid-cols-2'} gap-3 mb-4`}>
              {/* Patient Box */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <div className="font-extrabold text-[10.5px] text-teal-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex justify-between">
                  <span>Patient Demographics</span>
                  <span className="font-mono">{details.patientMrn}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-black text-slate-900">{details.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Age / Gender:</span>
                    <span className="font-bold text-slate-800">
                      {details.patientAge} Y / {details.patientGender}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mobile Phone:</span>
                    <span className="font-bold text-slate-800 font-mono">{details.patientPhone}</span>
                  </div>
                  {details.relativeInfo && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Attendant:</span>
                      <span className="font-medium text-slate-700">{details.relativeInfo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation Details */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <div className="font-extrabold text-[10.5px] text-teal-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex justify-between">
                  <span>Consultation Session</span>
                  <span className="text-slate-500">{details.sessionTime}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Doctor:</span>
                    <span className="font-black text-teal-900">{details.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-semibold text-slate-800">{details.doctorSpeciality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chamber:</span>
                    <span className="font-bold text-slate-900">{details.doctorChamber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date & Slot:</span>
                    <span className="font-bold text-slate-900">
                      {formatDate(details.sessionDate)} ({details.sessionTime})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Strip */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg mb-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Consultation Fee</span>
                <div className="text-lg font-black text-emerald-900 font-mono">₹{details.netFee}</div>
              </div>
              <div className="text-right">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold uppercase text-[10px]">
                  {details.paymentStatus}
                </Badge>
                <div className="text-[10px] text-slate-500 mt-0.5">Mode: {details.paymentMode}</div>
              </div>
            </div>

            {/* Reporting Guidance */}
            <div className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mb-4 leading-relaxed">
              <span className="font-bold text-slate-700 uppercase">OPD Protocol: </span>
              Please report 15 minutes before scheduled slot at the OPD nursing counter. Bring this slip along with previous prescriptions and diagnostic records.
            </div>

            {/* Footer Barcode Simulation & Desk Info */}
            <div className="pt-2 border-t border-dashed border-slate-300 flex justify-between items-center text-[9px] text-slate-400">
              <div>
                <div className="font-mono text-slate-700 tracking-widest text-[11px] font-bold">
                  || | ||| | |||| | ||
                </div>
                <span>Ref: {details.patientMrn} • {details.appointmentNo}</span>
              </div>
              <div className="text-right">
                <div>Desk: {details.bookedBy}</div>
                <div>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar Footer */}
        <DialogFooter className="p-3 bg-white border-t border-slate-200 shrink-0 flex sm:flex-row flex-col justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>Patient: {details.patientPhone}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleWhatsApp}
              className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-bold gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp Slip
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => handlePrint()}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold gap-1.5 shadow-sm px-4"
            >
              <Printer className="w-4 h-4" />
              Print Slip Now ({format.toUpperCase()})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
