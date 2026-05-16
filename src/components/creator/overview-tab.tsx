import Link from 'next/link';
import {
  CheckCircle2,
  ExternalLink,
  Link2,
  Loader2,
  Ticket,
  Users,
} from 'lucide-react';
import {
  Campaign,
  CampaignBuyerListResponse,
  CampaignStatus,
} from '@/types/api';

type SummaryCard = {
  label: string;
  value: string;
  tone: string;
};

type OverviewTabProps = {
  summaryCards: SummaryCard[];
  selectedCampaign: Campaign | null;
  approvedBuyers: CampaignBuyerListResponse | undefined;
  approvedBuyersLoading: boolean;
  onEditLinks: (campaign: Campaign) => void;
  onSelectCampaign: (campaignId: string) => void;
  onSubmitReview: (campaignId: string) => void;
};

export function OverviewTab({
  summaryCards,
  selectedCampaign,
  approvedBuyers,
  approvedBuyersLoading,
  onEditLinks,
  onSelectCampaign,
  onSubmitReview,
}: OverviewTabProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl"
            >
              <div
                className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${card.tone}`}
              >
                {card.label}
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-white">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {selectedCampaign ? (
          <>
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="h-40 w-full overflow-hidden rounded-[28px] bg-white/5 lg:w-64 border border-white/5 shadow-inner">
                  {selectedCampaign.imageUrl ? (
                    <img
                      src={selectedCampaign.imageUrl}
                      alt={selectedCampaign.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/10">
                      <Ticket className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#f6d365]">
                      {selectedCampaign.status}
                    </span>
                    <span className="rounded-xl bg-[#f6d365] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#0f172a]">
                      {selectedCampaign.ticketPrice} ETB
                    </span>
                  </div>
                  <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
                    {selectedCampaign.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/40 font-medium">
                    {selectedCampaign.description ||
                      'Add a description to help buyers understand the prize, rules, and livestream details.'}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => onEditLinks(selectedCampaign)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      <Link2 className="h-4 w-4 text-[#f6d365]" />
                      Broadcast links
                    </button>
                    <Link
                      href={`/campaigns/${selectedCampaign.id}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      <ExternalLink className="h-4 w-4 text-[#f6d365]" />
                      Public page
                    </Link>
                    <Link
                      href={`/creator/sales?campaignId=${encodeURIComponent(selectedCampaign.id)}`}
                      onClick={() => onSelectCampaign(selectedCampaign.id)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      <Users className="h-4 w-4 text-[#f6d365]" />
                      Buyer roster
                    </Link>
                    {(selectedCampaign.status === CampaignStatus.DRAFT ||
                      selectedCampaign.status === CampaignStatus.REJECTED) && (
                      <button
                        onClick={() => onSubmitReview(selectedCampaign.id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#f6d365] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#0f172a] shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Submit review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-emerald-500/20 bg-emerald-500/[0.05] p-6 shadow-xl backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300/90">
                    Verified buyers
                  </p>
                  <h3 className="mt-2 text-xl font-black tracking-tight text-white">
                    Paid roster snapshot
                  </h3>
                  <p className="mt-1 text-xs font-medium text-white/40">
                    Name and phone unlock after admins approve each payment.
                  </p>
                </div>
                <Link
                  href={`/creator/sales?campaignId=${encodeURIComponent(selectedCampaign.id)}`}
                  onClick={() => onSelectCampaign(selectedCampaign.id)}
                  className="rounded-2xl bg-white/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/15 transition-all"
                >
                  Full roster
                </Link>
              </div>

              {approvedBuyersLoading ? (
                <div className="mt-8 flex justify-center py-14">
                  <Loader2 className="h-10 w-10 animate-spin text-emerald-200/70" />
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full min-w-[520px] text-left text-xs">
                    <thead className="bg-white/10 text-[9px] font-black uppercase tracking-wider text-emerald-200/90">
                      <tr>
                        <th className="px-4 py-3">Ticket</th>
                        <th className="px-4 py-3">Buyer name</th>
                        <th className="px-4 py-3">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(approvedBuyers?.items || []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-10 text-center text-sm font-semibold text-white/35"
                          >
                            No approved buyers published yet - check back once
                            sales clear.
                          </td>
                        </tr>
                      ) : (
                        (approvedBuyers?.items || []).map((row) => (
                          <tr
                            key={row.id}
                            className="bg-white/[0.02] text-white hover:bg-white/[0.06]"
                          >
                            <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-[#f6d365]">
                              #{row.ticketNumber}
                            </td>
                            <td className="px-4 py-3 font-semibold text-white">
                              {row.buyer?.name || 'Anonymous buyer'}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-emerald-100/90">
                              {row.buyer?.phone || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
          Approval workflow
        </p>
        <div className="mt-6 space-y-4">
          {[
            'Create or revise your draft campaign.',
            'Submit the campaign for admin review.',
            'Wait for activation before buyer reservations begin.',
            'Track activity and export reports.',
          ].map((step, index) => (
            <div key={step} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-xs font-black text-[#f6d365]">
                {index + 1}
              </div>
              <p className="pt-2 text-sm text-white/50 font-medium leading-relaxed">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
