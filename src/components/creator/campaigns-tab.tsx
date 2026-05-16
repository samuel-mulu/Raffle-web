import Link from 'next/link';
import { Ticket } from 'lucide-react';
import { Campaign, CampaignStatus } from '@/types/api';

type CampaignsTabProps = {
  campaigns: Campaign[];
  onSelectCampaign: (campaignId: string) => void;
  onEditLinks: (campaign: Campaign) => void;
  onSubmitReview: (campaignId: string) => void;
};

export function CampaignsTab({
  campaigns,
  onSelectCampaign,
  onEditLinks,
  onSubmitReview,
}: CampaignsTabProps) {
  return (
    <section className="grid gap-4">
      {campaigns.map((campaign) => (
        <article
          key={campaign.id}
          className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl group hover:border-white/20 transition-all"
        >
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="h-32 w-full overflow-hidden rounded-[24px] bg-white/5 lg:w-48 border border-white/5">
              {campaign.imageUrl ? (
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="h-full w-full object-cover group-hover:scale-110 transition-all duration-500"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/10">
                  <Ticket className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {campaign.title}
                  </h2>
                  <p className="mt-1.5 text-xs text-white/40 font-bold uppercase tracking-wider">
                    {campaign.ticketPrice} ETB · {campaign.totalTickets} tickets
                  </p>
                </div>
                <span className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#f6d365]">
                  {campaign.status}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/creator/sales?campaignId=${encodeURIComponent(campaign.id)}`}
                  onClick={() => onSelectCampaign(campaign.id)}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:bg-white/5 transition-all"
                >
                  Buyer roster
                </Link>
                <button
                  onClick={() => onEditLinks(campaign)}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:bg-white/5 transition-all"
                >
                  Live links
                </button>
                {(campaign.status === CampaignStatus.DRAFT ||
                  campaign.status === CampaignStatus.REJECTED) && (
                  <button
                    onClick={() => onSubmitReview(campaign.id)}
                    className="rounded-2xl bg-[#f6d365] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#0f172a] shadow-lg shadow-orange-500/10 active:scale-95 transition-all"
                  >
                    Submit review
                  </button>
                )}
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
