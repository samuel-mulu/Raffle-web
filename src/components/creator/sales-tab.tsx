import { Dispatch, SetStateAction } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { Campaign, CampaignBuyerListResponse } from '@/types/api';
import { BuyerScope } from './types';

type SalesTabProps = {
  selectedCampaign: Campaign | null;
  buyerScope: BuyerScope;
  setBuyerScope: (scope: BuyerScope) => void;
  buyerSearchInput: string;
  setBuyerSearchInput: (value: string) => void;
  resetBuyerWorkspace: () => void;
  buyers: CampaignBuyerListResponse | undefined;
  isFetching: boolean;
  emptyBuyerCaption: string;
  buyerPage: number;
  buyerTotalPages: number;
  setBuyerPage: Dispatch<SetStateAction<number>>;
};

export function SalesTab({
  selectedCampaign,
  buyerScope,
  setBuyerScope,
  buyerSearchInput,
  setBuyerSearchInput,
  resetBuyerWorkspace,
  buyers,
  isFetching,
  emptyBuyerCaption,
  buyerPage,
  buyerTotalPages,
  setBuyerPage,
}: SalesTabProps) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
            Buyer intelligence
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            {selectedCampaign?.title || 'Campaign roster'}
          </h2>
          <p className="mt-1 text-xs font-medium text-white/40">
            Default view shows admins-approved tickets with full buyer phones.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-2xl bg-[#f6d365]/10 border border-[#f6d365]/25 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#f6d365]">
            {buyers?.total ?? 0} matches
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:flex-wrap">
        <div className="flex flex-wrap gap-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/35">
            View
          </label>
          <select
            aria-label="Filter buyer list"
            value={buyerScope}
            onChange={(e) => setBuyerScope(e.target.value as BuyerScope)}
            className="h-11 min-w-[200px] rounded-2xl border border-white/10 bg-[#121c37] px-4 text-[11px] font-bold uppercase tracking-wide text-white outline-none focus:border-[#f6d365]/60"
          >
            <option value="approved">Verified buyers (paid)</option>
            <option value="all">Everyone who claimed a ticket</option>
            <option value="payment_pending">Payments pending approval</option>
            <option value="reserved">Unpaid reservations</option>
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="buyer-roster-search">
            Search roster
          </label>
          <input
            id="buyer-roster-search"
            type="search"
            placeholder="Search name, phone or ticket number"
            value={buyerSearchInput}
            onChange={(e) => setBuyerSearchInput(e.target.value)}
            className="h-11 flex-1 min-w-[200px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white outline-none placeholder:text-white/35 focus:border-[#f6d365]/45"
          />
          <button
            type="button"
            onClick={resetBuyerWorkspace}
            title="Clear search, filters, and spreadsheet preview"
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 px-4 text-[10px] font-black uppercase tracking-widest text-white/70 hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" /> Clear roster
          </button>
        </div>
      </div>

      <div className="relative mt-6 overflow-x-auto rounded-[24px] border border-white/10">
        {isFetching ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0f172a]/70 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#f6d365]" />
          </div>
        ) : null}
        <table className="min-w-[720px] w-full divide-y divide-white/10 text-xs">
          <thead className="bg-white/[0.04] text-[9px] font-black uppercase tracking-widest text-white/55">
            <tr>
              <th className="px-5 py-3 text-left font-black">Ticket</th>
              <th className="px-5 py-3 text-left font-black">Buyer name</th>
              <th className="px-5 py-3 text-left font-black">Phone</th>
              <th className="px-5 py-3 text-left font-black">Ticket status</th>
              <th className="px-5 py-3 text-left font-black">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-[13px]">
            {(buyers?.items || []).length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm font-semibold text-white/40"
                >
                  {emptyBuyerCaption}
                </td>
              </tr>
            ) : (
              (buyers?.items || []).map((item) => (
                <tr
                  key={item.id}
                  className="bg-white/[0.015] hover:bg-white/[0.055] transition-colors"
                >
                  <td className="whitespace-nowrap px-5 py-3 font-mono font-black text-[#f6d365]">
                    #{item.ticketNumber}
                  </td>
                  <td className="px-5 py-3 font-bold text-white">
                    {item.buyer?.name || 'Anonymous buyer'}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-sm text-emerald-100">
                    {item.buyer?.phone || '-'}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-[#f6d365]/90">
                      {item.ticketStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[11px] font-bold text-white/60">
                    {item.payment?.status || 'NO_PAYMENT'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {buyers && buyerTotalPages > 1 ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest">
          <p className="text-white/40">
            Page {buyerPage} of {buyerTotalPages}{' '}
            <span className="mx-2 text-white/20">/</span> {buyers.total} rows
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBuyerPage((p) => Math.max(1, p - 1))}
              disabled={buyerPage <= 1}
              className="rounded-2xl border border-white/10 px-4 py-3 text-[#f6d365] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setBuyerPage((p) => Math.min(buyerTotalPages, p + 1))
              }
              disabled={buyerPage >= buyerTotalPages}
              className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-[#f6d365] hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
