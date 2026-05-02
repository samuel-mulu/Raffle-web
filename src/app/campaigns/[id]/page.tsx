'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Campaign } from '@/types/api';
import { ArrowLeft, Clock, Info, Share2, Tv, Ticket, User, ChevronRight, Heart, MessageCircle } from 'lucide-react';
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
      <div className="animate-pulse bg-white min-h-screen">
        <div className="h-[450px] bg-gray-200 w-full" />
        <div className="p-6 space-y-6 -mt-10 relative bg-white rounded-t-[40px]">
          <div className="flex justify-between items-center">
            <div className="h-10 w-48 bg-gray-200 rounded-xl" />
            <div className="h-10 w-10 bg-gray-200 rounded-full" />
          </div>
          <div className="h-20 w-full bg-gray-100 rounded-2xl" />
          <div className="h-40 w-full bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-10 text-center space-y-4 flex flex-col items-center justify-center min-h-screen">
        <div className="text-6xl mb-4">🌪️</div>
        <h2 className="text-2xl font-black text-[#0f172a]">{error || 'Raffle not found'}</h2>
        <Link href="/home" className="px-8 py-3 bg-[#1e3a8a] text-white font-black rounded-2xl shadow-lg">
          Back to feed
        </Link>
      </div>
    );
  }

  const soldPercentage = summary ? Math.round((summary.taken / summary.totalTickets) * 100) : 0;
  const isAlmostFull = soldPercentage >= 80;

  return (
    <div className="bg-white min-h-screen pb-40">
      {/* Immersive Hero Header */}
      <div className="relative h-[450px] w-full bg-gray-900 overflow-hidden">
        {campaign.imageUrl ? (
          <img 
            src={campaign.imageUrl} 
            alt={campaign.title}
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gray-100">
            No Preview Available
          </div>
        )}
        
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-3">
            <button 
              className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
              aria-label="Like"
            >
              <Heart className="w-6 h-6" />
            </button>
            <button 
              className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
              aria-label="Share"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Floating Price Tag */}
        <div className="absolute bottom-20 right-6 z-20">
          <div className="bg-[#1e3a8a] text-white p-4 rounded-3xl shadow-2xl border-4 border-white transform rotate-3">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">Ticket Price</p>
            <p className="text-2xl font-black">{campaign.ticketPrice} ETB</p>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative -mt-12 bg-white rounded-t-[48px] px-6 pt-10 pb-10 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-gray-50">
        
        {/* Creator Identity Bar */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1e3a8a] to-purple-500 p-[2px] shadow-lg">
              <div className="w-full h-full rounded-2xl bg-white p-[2px]">
                <div className="w-full h-full rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
                  {campaign.creator?.avatarUrl ? (
                    <img src={campaign.creator.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest mb-0.5">Verified Creator</p>
              <h3 className="text-lg font-black text-[#0f172a] leading-none">
                {campaign.creator?.name || 'EthioRaffle Official'}
              </h3>
              <p className="text-sm font-bold text-[#94a3b8] mt-1">
                {campaign.creator?.id ? `@creator_${campaign.creator.id.slice(-4)}` : '@official'}
              </p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-[#f6f3f5] text-[#1e3a8a] text-xs font-black rounded-xl hover:bg-[#1e3a8a] hover:text-white transition-all">
            Follow
          </button>
        </div>

        {/* Title & Status */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
              isAlmostFull ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'
            }`}>
              {isAlmostFull ? '🔥 Almost Full' : `✨ ${campaign.status}`}
            </span>
            {campaign.drawAt && (
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-black uppercase tracking-widest">
                📅 Live Draw: {new Date(campaign.drawAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black text-[#0f172a] leading-[1.1] tracking-tight pr-4">
            {campaign.title}
          </h1>
        </div>

        {/* Live Progress Card */}
        <div className="bg-[#fcf8fa] rounded-[32px] p-6 mb-8 border border-[#e2e8f0]/50 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-1">Raffle Progress</p>
              <h4 className="text-3xl font-black text-[#1e3a8a]">{soldPercentage}% <span className="text-sm font-bold text-gray-400">Filled</span></h4>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-[#0f172a] leading-none">{summary?.remaining || 0}</p>
              <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-tighter mt-1">Tickets Left</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 bg-white rounded-2xl border border-gray-100 overflow-hidden p-1">
              <div 
                className="h-full bg-gradient-to-r from-[#1e3a8a] to-purple-500 rounded-xl transition-all duration-1000 shadow-sm" 
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] font-bold text-gray-500">{summary?.taken || 0} Sold</span>
              </div>
              <span className="text-[11px] font-bold text-gray-500">{summary?.totalTickets || 0} Total Capacity</span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Info className="w-4 h-4 text-[#1e3a8a]" />
            </div>
            <h3 className="font-black text-xl text-[#0f172a]">About the Prize</h3>
          </div>
          <p className="text-[#45464d] text-base leading-relaxed whitespace-pre-line font-medium">
            {campaign.description || 'No description provided for this raffle. Good luck to all participants!'}
          </p>
        </div>

        {/* Live Stream Integration */}
        <div className="bg-red-50 rounded-3xl p-5 mb-8 border border-red-100 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              <Tv className="w-6 h-6 text-red-600 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#0f172a]">Live Results Stream</h4>
              <p className="text-xs font-bold text-red-600/70">Broadcasting on YouTube</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-red-300 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Small Social Proof */}
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <p className="text-xs font-bold text-[#94a3b8]">Joined by 1.2k participants</p>
        </div>

        {/* Terms Disclaimer */}
        <div className="p-6 bg-[#fcf8fa] rounded-3xl space-y-3 border border-gray-100">
          <p className="text-[11px] text-[#94a3b8] font-bold leading-relaxed uppercase tracking-widest">Rules & Conditions</p>
          <p className="text-xs text-[#45464d] leading-relaxed font-medium">
            Must be 18+. Draw handled by the National Lottery Administration. Digital verification required for prize collection.
          </p>
        </div>
      </div>

      {/* Sticky Premium Action Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-6 bg-white/90 backdrop-blur-2xl border-t border-gray-100 z-50 flex gap-4">
        <button 
          className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 active:scale-90 transition-all"
          aria-label="Contact Support"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        <Link 
          href={`/campaigns/${id}/reserve`}
          className="flex-1 h-14 bg-black text-white font-black rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:opacity-90 active:scale-[0.98] transition-all text-lg tracking-tight"
        >
          Select Your Numbers
        </Link>
      </div>
    </div>
  );
}
