'use client';

import Link from 'next/link';
import { Calendar, LogIn, Ticket, User, MoreHorizontal, Share2, Heart, Shield, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Campaign } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const {
    data: campaigns = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => apiClient.get<Campaign[]>('/campaigns'),
  });

  if (isLoading || !hasHydrated) {
    return (
      <div className="p-4 space-y-8 animate-pulse bg-[#0f172a] min-h-screen">
        <div className="flex justify-between items-center py-4">
          <div className="space-y-3">
            <div className="h-3 w-20 bg-white/10 rounded-full" />
            <div className="h-8 w-32 bg-white/10 rounded-xl" />
          </div>
          <div className="h-12 w-12 bg-white/10 rounded-2xl" />
        </div>
        {[1, 2].map((item) => (
          <div key={item} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/10 rounded-full" />
              <div className="h-4 w-32 bg-white/10 rounded-full" />
            </div>
            <div className="h-[400px] bg-white/5 rounded-[32px] border border-white/5" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="max-w-xs w-full rounded-[32px] border border-rose-500/20 bg-rose-500/5 p-8 text-center space-y-6 backdrop-blur-xl">
          <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-rose-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-white">Connection Error</h1>
            <p className="text-xs text-white/50 leading-relaxed">
              {getErrorMessage(error, 'The server is currently unreachable. Please try again later.')}
            </p>
          </div>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-2xl bg-white text-[#0f172a] px-6 py-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-white/5 w-full"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] min-h-screen text-white">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 -left-[10%] w-[50%] h-[30%] bg-[#1e3a8a]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-[#f6d365]/10 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f6d365]">
            ETHIORaffle
          </p>
          <h1 className="text-2xl font-black text-white tracking-tight">Explore</h1>
        </div>

        {user ? (
          <Link
            href="/profile"
            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-xl overflow-hidden group hover:border-[#f6d365]/50 transition-all"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-[#f6d365]" />
            )}
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-6 py-3 bg-[#f6d365] text-[#0f172a] text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-500/10"
          >
            Sign In
          </Link>
        )}
      </header>

      <div className="pb-32 relative z-10">
        {campaigns.length === 0 ? (
          <div className="text-center py-40 px-6 space-y-6">
            <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto border border-white/5">
              <Ticket className="w-10 h-10 text-white/10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">No active drops</h3>
              <p className="text-white/40 text-xs font-medium tracking-wide">Stay tuned for the next premium raffle.</p>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-6 space-y-8">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="space-y-4">
                {/* Creator Header */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#f6d365] to-orange-400 p-[2px]">
                      <div className="w-full h-full rounded-full bg-[#0f172a] p-[2px]">
                        <div className="w-full h-full rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
                          {campaign.creator?.avatarUrl ? (
                            <img src={campaign.creator.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-white/20" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-black text-white tracking-tight">
                        {campaign.creator?.name || 'Premium Creator'}
                      </p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                        {campaign.creator?.id ? `@creator_${campaign.creator.id.slice(-4)}` : 'Sponsored'}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="p-2 text-white/20 hover:text-white transition-colors"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="w-6 h-6" />
                  </button>
                </div>

                {/* Main Content Card */}
                <Link href={`/campaigns/${campaign.id}`} className="block group">
                  <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden bg-white/5 border border-white/10 shadow-2xl group-active:scale-[0.98] transition-all">
                    {campaign.imageUrl ? (
                      <img
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <Sparkles className="w-20 h-20 opacity-20" />
                      </div>
                    )}
                    
                    {/* Overlay Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent flex flex-col justify-end p-8">
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-[9px] font-black text-[#f6d365] uppercase border border-white/10 tracking-[0.1em]">
                            {campaign.totalTickets} Limited Tickets
                          </span>
                          <span className="px-3 py-1.5 rounded-xl bg-[#f6d365] text-[9px] font-black text-[#0f172a] uppercase shadow-lg shadow-orange-500/20">
                            Live Draw
                          </span>
                        </div>
                        <h2 className="text-3xl font-black text-white leading-[1.1] pr-4">
                          {campaign.title}
                        </h2>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                              <Ticket className="w-5 h-5 text-[#f6d365]" />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">Entry</p>
                              <p className="text-base font-black text-white mt-1">{campaign.ticketPrice} ETB</p>
                            </div>
                          </div>
                          <button className="bg-white text-[#0f172a] px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-white/5 active:scale-95 transition-all">
                            Enter Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Social Actions */}
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 group">
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-rose-500/10 group-hover:border-rose-500/20 transition-all">
                        <Heart className="w-5 h-5 text-white/30 group-hover:text-rose-500 transition-colors" />
                      </div>
                      <span className="text-[10px] font-black text-white/40 group-hover:text-white transition-colors">24</span>
                    </button>
                    <button className="flex items-center gap-2 group">
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                        <Share2 className="w-5 h-5 text-white/30 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <span className="text-[10px] font-black text-white/40 group-hover:text-white transition-colors">Share</span>
                    </button>
                  </div>
                  {campaign.drawAt && (
                    <div className="flex items-center gap-2 bg-[#f6d365]/5 px-3 py-2 rounded-xl border border-[#f6d365]/10">
                      <Calendar className="w-3.5 h-3.5 text-[#f6d365]" />
                      <span className="text-[9px] font-black text-[#f6d365] uppercase tracking-tighter">
                        {new Date(campaign.drawAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
