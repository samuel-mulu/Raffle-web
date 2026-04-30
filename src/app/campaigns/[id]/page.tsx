'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Campaign } from '@/types/api';
import { ArrowLeft, Clock, Info, Share2, Tv } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

interface TicketSummary {
  campaignId: string;
  totalTickets: number;
  taken: number;
  remaining: number;
  counts: Record<string, number>;
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const { data: campaign, isLoading: campaignLoading, error: campaignError } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => apiClient.get<Campaign>(`/campaigns/${id}`),
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['campaign-summary', id],
    queryFn: () => apiClient.get<TicketSummary>(`/campaigns/${id}/tickets/summary`),
    enabled: !!campaign,
  });

  const loading = campaignLoading || summaryLoading;
  const error = campaignError ? String(campaignError) : '';

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-72 bg-gray-200 w-full" />
        <div className="p-4 space-y-4">
          <div className="h-8 w-3/4 bg-gray-200 rounded" />
          <div className="h-20 w-full bg-gray-100 rounded-xl" />
          <div className="h-40 w-full bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-10 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-[#0f172a]">{error || 'Campaign not found'}</h2>
        <Link href="/home" className="text-[#1e3a8a] font-medium block">
          Back to home
        </Link>
      </div>
    );
  }

  const soldPercentage = summary ? Math.round((summary.taken / summary.totalTickets) * 100) : 0;
  const isAlmostFull = soldPercentage >= 80;

  return (
    <div className="bg-[#fcf8fa] min-h-screen pb-32">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Image */}
      <div className="h-72 w-full relative bg-gray-200 overflow-hidden">
        {campaign.imageUrl ? (
          <img 
            src={campaign.imageUrl} 
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative z-10 space-y-4">
        {/* Title Card */}
        <div className="bg-white rounded-xl p-5 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-[#e2e8f0] space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#0f172a] leading-tight">
                {campaign.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isAlmostFull ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                }`}>
                  {isAlmostFull ? 'Almost Full' : campaign.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#1e3a8a]">{campaign.ticketPrice}</div>
              <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-tighter">ETB / Ticket</div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-[#fcf8fa] rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1e3a8a]" />
              <div className="text-sm font-medium text-[#45464d]">
                {campaign.drawAt ? new Date(campaign.drawAt).toLocaleDateString() : 'TBD'}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-[#0f172a] leading-none">{summary?.totalTickets}</div>
                <div className="text-[10px] font-medium text-[#94a3b8]">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#1e3a8a] leading-none">{summary?.remaining}</div>
                <div className="text-[10px] font-medium text-[#94a3b8]">Left</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#45464d]">{soldPercentage}% Sold</span>
              <span className="text-[#94a3b8]">{summary?.taken} tickets taken</span>
            </div>
            <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1e3a8a] transition-all duration-500" 
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-5 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-[#e2e8f0] space-y-3">
          <div className="flex items-center gap-2 text-[#0f172a]">
            <Info className="w-5 h-5 text-[#94a3b8]" />
            <h3 className="font-bold text-lg">Description</h3>
          </div>
          <p className="text-[#45464d] text-sm leading-relaxed whitespace-pre-line">
            {campaign.description || 'No description provided for this raffle.'}
          </p>
        </div>

        {/* Livestream Links */}
        <div className="bg-white rounded-xl p-5 shadow-[0_4px_6px_rgba(0,0,0,0.05)] border border-[#e2e8f0] space-y-3">
          <div className="flex items-center gap-2 text-[#0f172a]">
            <Tv className="w-5 h-5 text-[#94a3b8]" />
            <h3 className="font-bold text-lg">Live Draw</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-[#fcf8fa] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Tv className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#0f172a]">YouTube Live</div>
                <div className="text-xs text-[#94a3b8]">Watch the results live</div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-[#f6f3f5] rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-[#1b1b1d] uppercase tracking-wider">Terms & Conditions</h4>
          <p className="text-[13px] text-[#45464d] leading-relaxed">
            Participants must be 18+. Draw is conducted by the National Lottery Administration. No cash alternative for this prize.
          </p>
          <button className="text-xs font-bold text-black border-b border-black pb-0.5">
            Read Full Terms
          </button>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 bg-white/80 backdrop-blur-lg border-t border-[#e2e8f0] z-40">
        <Link 
          href={`/campaigns/${id}/reserve`}
          className="w-full h-12 bg-black text-white font-bold rounded-xl flex items-center justify-center shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Select Ticket
        </Link>
      </div>
    </div>
  );
}
