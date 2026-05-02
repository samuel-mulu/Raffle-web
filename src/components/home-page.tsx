'use client';

import Link from 'next/link';
import { Calendar, LogIn, Ticket, User, MoreHorizontal, Share2, Heart } from 'lucide-react';
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
      <div className="p-4 space-y-6 animate-pulse">
        <div className="flex justify-between items-center py-2">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-40 bg-gray-200 rounded" />
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
        </div>
        {[1, 2].map((item) => (
          <div key={item} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
            <div className="h-64 bg-gray-100 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-[70vh] flex items-center justify-center">
        <div className="max-w-sm rounded-2xl border border-red-100 bg-red-50 p-6 text-center space-y-3">
          <h1 className="text-xl font-bold text-[#0f172a]">
            We couldn&apos;t load raffles
          </h1>
          <p className="text-sm text-[#45464d]">
            {getErrorMessage(
              error,
              'Please make sure the backend is running and reachable.'
            )}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white"
          >
            <LogIn className="w-4 h-4" />
            Open Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 px-4 py-3 flex items-center justify-between border-b border-gray-50">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1e3a8a]">
            ETHIORaffle
          </p>
          <h1 className="text-xl font-black text-[#0f172a]">Explore</h1>
        </div>

        {user ? (
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full bg-[#f6f3f5] flex items-center justify-center border-2 border-white shadow-sm overflow-hidden"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-[#1e3a8a]" />
            )}
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-5 py-2 bg-black text-white text-xs font-black rounded-full shadow-lg"
          >
            Login
          </Link>
        )}
      </header>

      <div className="pb-24">
        {campaigns.length === 0 ? (
          <div className="text-center py-32 px-6 space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Ticket className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a]">No active raffles</h3>
            <p className="text-[#94a3b8] text-sm">Follow creators to see their latest drops.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="pt-4 pb-6 px-4 space-y-3">
                {/* Creator Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1e3a8a] to-purple-500 p-[2px]">
                      <div className="w-full h-full rounded-full bg-white p-[2px]">
                        <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                          {campaign.creator?.avatarUrl ? (
                            <img src={campaign.creator.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#0f172a] leading-none">
                        {campaign.creator?.name || campaign.creator?.phone || 'Verified Creator'}
                      </p>
                      <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-tighter mt-1">
                        {campaign.creator?.id ? `@creator_${campaign.creator.id.slice(-4)}` : 'Sponsored'}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="p-2 text-gray-400"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Content Card */}
                <Link href={`/campaigns/${campaign.id}`} className="block group">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 shadow-xl group-active:scale-[0.98] transition-all">
                    {campaign.imageUrl ? (
                      <img
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        No Preview
                      </div>
                    )}
                    
                    {/* Overlay Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <span className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-black text-white uppercase border border-white/10">
                            {campaign.totalTickets} Tickets
                          </span>
                          <span className="px-2 py-1 rounded-md bg-[#1e3a8a] text-[10px] font-black text-white uppercase border border-white/10">
                            Live Draw
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-white leading-tight pr-8">
                          {campaign.title}
                        </h2>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                              <Ticket className="w-4 h-4 text-[#1e3a8a]" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-white/60 uppercase leading-none">Ticket Price</p>
                              <p className="text-sm font-black text-white">{campaign.ticketPrice} ETB</p>
                            </div>
                          </div>
                          <button className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black shadow-lg">
                            Enter Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Social Actions */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 group">
                      <Heart className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                      <span className="text-xs font-bold text-gray-500">24</span>
                    </button>
                    <button className="flex items-center gap-1.5 group">
                      <Share2 className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-xs font-bold text-gray-500">Share</span>
                    </button>
                  </div>
                  {campaign.drawAt && (
                    <div className="flex items-center gap-1.5 text-[#1e3a8a]">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">
                        {new Date(campaign.drawAt).toLocaleDateString()}
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
