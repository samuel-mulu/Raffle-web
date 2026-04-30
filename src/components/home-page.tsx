'use client';

import Link from 'next/link';
import { Calendar, LogIn, Ticket } from 'lucide-react';
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
      <div className="p-6 flex flex-col gap-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-4" />
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-48 bg-gray-100 rounded-xl" />
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
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#94a3b8]">
            ETHIORaffle
          </p>
          <h1 className="text-2xl font-bold text-[#0f172a]">Active Raffles</h1>
        </div>

        {user ? (
          <Link
            href="/profile"
            className="flex h-10 min-w-10 items-center justify-center rounded-full bg-[#f6f3f5] px-3 text-sm font-bold text-[#1e3a8a]"
          >
            {user.phone.slice(-2)}
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white"
          >
            Login
          </Link>
        )}
      </header>

      <div className="grid gap-6 pb-20">
        {campaigns.length === 0 ? (
          <div className="text-center py-20 px-6 space-y-4">
            <div className="text-4xl">Tickets</div>
            <h3 className="text-lg font-bold text-[#0f172a]">
              No active raffles yet
            </h3>
            <p className="text-[#94a3b8] text-sm">
              Check back later or follow creators for updates.
            </p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="block group"
            >
              <div className="bg-white rounded-xl overflow-hidden border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[16/9] relative bg-gray-100">
                  {campaign.imageUrl ? (
                    <img
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-[#1e3a8a]">
                    {campaign.ticketPrice} ETB
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <h2 className="text-lg font-bold text-[#0f172a] group-hover:text-[#1e3a8a] transition-colors">
                    {campaign.title}
                  </h2>

                  <div className="flex items-center gap-4 text-sm text-[#45464d]">
                    <div className="flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-[#94a3b8]" />
                      <span>{campaign.totalTickets} tickets</span>
                    </div>
                    {campaign.drawAt ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#94a3b8]" />
                        <span>
                          {new Date(campaign.drawAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <button className="w-full py-2.5 bg-[#f6f3f5] text-[#1e3a8a] font-bold rounded-lg group-hover:bg-[#1e3a8a] group-hover:text-white transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
