'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Calendar, LogIn, Ticket, User, MoreHorizontal, Share2, Heart, Shield, Sparkles, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Campaign } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const queryClient = useQueryClient();
  
  const [showQuickBuyModal, setShowQuickBuyModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [buyError, setBuyError] = useState('');
  const [buySuccess, setBuySuccess] = useState(false);

  const {
    data: campaigns = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => apiClient.get<Campaign[]>('/campaigns'),
  });

  const quickBuyMutation = useMutation({
    mutationFn: ({ campaignId, ticketNumber }: { campaignId: string; ticketNumber: number }) =>
      apiClient.post<{ id: string }>(`/campaigns/${campaignId}/tickets/reserve`, { ticketNumber }),
    onSuccess: (data) => {
      setBuySuccess(true);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setTimeout(() => {
        window.location.href = `/payment/${data.id}`;
      }, 1500);
    },
    onError: (mutationError: unknown) => {
      setBuyError(getErrorMessage(mutationError, 'Failed to reserve ticket'));
    },
  });

  if (!hasHydrated || !user) {
    return (
      <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading campaigns...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
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
    <div className="bg-[#0f172a] min-h-screen pb-32 text-white">
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
            className="px-6 py-3 bg-gradient-to-r from-[#f6d365] to-[#fda085] text-[#0f172a] text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-500/10 w-full"
          >
            Sign In
          </Link>
        )}
      </header>

      <div className="pb-32 relative z-10">
        {campaigns.length === 0 ? (
          <div className="text-center py-40 px-6 space-y-8">
            <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto border border-white/10">
              <Ticket className="w-12 h-12 text-white/20" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-white">No active drops</h3>
              <p className="text-white/40 font-medium leading-relaxed max-w-[240px] mx-auto">
                Stay tuned for the next premium raffle campaign.
              </p>
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
                      <p className="text-[10px] font-black text-[#f6d365] uppercase tracking-widest mb-0.5">
                        Verified Creator
                      </p>
                      <h3 className="text-lg font-black text-white leading-none">
                        {campaign.creator?.name || 'Premium Creator'}
                      </h3>
                      <p className="text-sm font-bold text-white/50 mt-1">
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
                <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden bg-white/5 border border-white/10 group">
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
                        <button 
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setSelectedNumber(null);
                            setBuyError('');
                            setBuySuccess(false);
                            setShowQuickBuyModal(true);
                          }}
                          className="bg-white text-[#0f172a] px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-white/5 active:scale-95 transition-all"
                        >
                          Buy Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Buy Modal */}
      <Modal
        isOpen={showQuickBuyModal}
        onClose={() => {
          setShowQuickBuyModal(false);
          setSelectedCampaign(null);
          setSelectedNumber(null);
          setBuyError('');
        }}
        title="Quick Purchase"
        subtitle={selectedCampaign ? `Get your ticket for ${selectedCampaign.title}` : "Select a campaign"}
      >
        {buySuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-2">Ticket Reserved!</h3>
              <p className="text-white/60">Redirecting to payment...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedCampaign && (
              <div className="text-center py-4">
                <p className="text-white/60 mb-4">
                  Select a ticket number to reserve for 5 minutes
                </p>
                <div className="text-4xl font-black text-white mb-2">
                  #{selectedNumber || '?'}
                </div>
                <p className="text-[10px] font-black text-[#f6d365] uppercase tracking-widest">
                  {selectedCampaign.ticketPrice} ETB
                </p>
              </div>
            )}

            <FormField
              label="Choose Your Lucky Number"
              id="ticketNumber"
              type="number"
              value={selectedNumber?.toString() || ''}
              onChange={(value) => setSelectedNumber(value ? parseInt(value) : null)}
              placeholder="Enter ticket number"
              required
            />

            {buyError ? (
              <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 font-bold flex justify-between items-center">
                {buyError}
                <button onClick={() => setBuyError('')}><X className="h-4 w-4" /></button>
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                onClick={() => setShowQuickBuyModal(false)}
                className="flex-1 py-3 bg-white/10 border border-white/10 text-white rounded-2xl text-sm font-black hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!selectedCampaign || !selectedNumber) return;
                  quickBuyMutation.mutate({ 
                    campaignId: selectedCampaign.id, 
                    ticketNumber: selectedNumber 
                  });
                }}
                disabled={!selectedCampaign || !selectedNumber || quickBuyMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-[#f6d365] to-[#fda085] text-[#0f172a] font-black rounded-2xl text-sm font-black hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {quickBuyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reserving...
                  </>
                ) : (
                  'Reserve & Pay'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
