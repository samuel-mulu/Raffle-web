import { RefObject } from 'react';
import { CheckCircle2, Download, FileText, Loader2, Upload, X } from 'lucide-react';
import { Campaign, ImportPreviewResponse } from '@/types/api';

type ExportsTabProps = {
  selectedCampaignId: string | null;
  selectedCampaign: Campaign | null;
  importFileRef: RefObject<HTMLInputElement | null>;
  isImporting: boolean;
  spreadsheetPreview: ImportPreviewResponse | null;
  onImportFile: (file: File) => void;
  onMissingCampaign: () => void;
  onDownload: (format: 'xlsx' | 'pdf') => void;
  onDownloadTemplate: () => void;
  onClearPreview: () => void;
};

export function ExportsTab({
  selectedCampaignId,
  selectedCampaign,
  importFileRef,
  isImporting,
  spreadsheetPreview,
  onImportFile,
  onMissingCampaign,
  onDownload,
  onDownloadTemplate,
  onClearPreview,
}: ExportsTabProps) {
  return (
    <>
      <input
        ref={importFileRef}
        type="file"
        accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="hidden"
        onChange={(event) => {
          const pick = event.target.files?.[0];
          event.target.value = '';
          if (pick && selectedCampaignId && !isImporting) {
            onImportFile(pick);
          }
        }}
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
              Operational reports
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
              {selectedCampaign?.title || 'Choose a campaign'}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/40 font-medium">
              Download audited PDF / XLS workbooks anytime. Imports are
              preview-only-they never write to the raffle database yet.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onDownload('xlsx')}
                disabled={!selectedCampaign}
                className="inline-flex items-center justify-center gap-3 rounded-[24px] bg-[#f6d365] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#0f172a] shadow-xl shadow-orange-500/10 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all"
              >
                <Download className="h-4 w-4" />
                Export XLSX
              </button>
              <button
                type="button"
                onClick={() => onDownload('pdf')}
                disabled={!selectedCampaign}
                className="inline-flex items-center justify-center gap-3 rounded-[24px] border border-white/10 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all"
              >
                <FileText className="h-4 w-4 text-[#f6d365]" />
                Export PDF
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.035] p-8 shadow-xl backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
                  Spreadsheet toolbox
                </p>
                <h3 className="mt-2 text-xl font-black text-white">
                  Preview import
                </h3>
                <p className="mt-3 text-xs font-semibold text-white/40">
                  Supports your exported Buyers sheet (.xlsx), CSV receipts, or
                  the template headers below.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  selectedCampaignId
                    ? importFileRef.current?.click()
                    : onMissingCampaign()
                }
                disabled={isImporting}
                className="inline-flex items-center gap-3 rounded-[20px] border border-emerald-500/35 bg-emerald-500/10 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-200 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload CSV / XLSX
              </button>
              <button
                type="button"
                onClick={onDownloadTemplate}
                className="inline-flex items-center gap-2 rounded-[20px] border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/75 hover:bg-white/10"
              >
                Template CSV
              </button>
              <button
                type="button"
                onClick={onClearPreview}
                className="inline-flex items-center gap-2 rounded-[20px] border border-transparent px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-rose-300 hover:bg-rose-500/15"
                disabled={!spreadsheetPreview}
              >
                <X className="h-4 w-4" /> Clear preview
              </button>
            </div>
            {spreadsheetPreview ? (
              <div className="mt-6 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/35">
                  Detected{' '}
                  <span className="text-emerald-200">
                    {spreadsheetPreview.rows.length}{' '}
                  </span>
                  rows ({spreadsheetPreview.source.toUpperCase()})
                </p>
                {spreadsheetPreview.truncated ? (
                  <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-2 text-[11px] font-semibold text-amber-200">
                    Showing the first{' '}
                    {spreadsheetPreview.rows.length.toLocaleString()} rows only.
                  </div>
                ) : null}
                <div className="overflow-x-auto rounded-[20px] border border-white/10">
                  <table className="min-w-[620px] w-full text-left text-xs">
                    <thead className="bg-white/[0.05] text-[9px] font-black uppercase tracking-wider text-emerald-200/85">
                      <tr>
                        <th className="px-4 py-3 text-left font-black">
                          Buyer name
                        </th>
                        <th className="px-4 py-3 text-left font-black">Phone</th>
                        <th className="px-4 py-3 text-left font-black">
                          Ticket #
                        </th>
                        <th className="px-4 py-3 text-left font-black">Ticket</th>
                        <th className="px-4 py-3 text-left font-black">
                          Payment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-white/[0.02]">
                      {spreadsheetPreview.rows.map((row, index) => (
                        <tr
                          key={`preview-${index}`}
                          className="hover:bg-white/[0.045]"
                        >
                          <td className="max-w-[200px] px-4 py-2.5 font-bold text-white">
                            {row.buyerName ?? '-'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 font-mono text-emerald-100">
                            {row.buyerPhone ?? '-'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[#f6d365]">
                            {row.ticketNumber ?? '-'}
                          </td>
                          <td className="px-4 py-2.5 uppercase text-[10px] font-black text-white/45">
                            {row.ticketStatus ?? '-'}
                          </td>
                          <td className="px-4 py-2.5 uppercase text-[10px] font-black text-white/55">
                            {row.paymentStatus ?? '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="rounded-2xl bg-white/[0.04] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Preview mirrors your file-it does NOT sync roster data
                  automatically.
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
            Included insights
          </p>
          <div className="mt-8 space-y-4">
            {[
              'Complete sales performance overview',
              'Ticket reservation audit trail',
              'Verified buyer contact information',
              'Payment transaction verification',
              'Certified winner ranks and data',
            ].map((line) => (
              <div key={line} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#f6d365]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="pt-2 text-sm text-white/50 font-medium leading-relaxed">
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
