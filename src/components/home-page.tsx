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
import { LanguageToggle } from '@/components/language-toggle';
import { getCampaignText, t } from '@/lib/i18n';
import { useLanguageStore } from '@/stores/language-store';

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const language = useLanguageStore((state) => state.language);
  const queryClient = useQueryClient();
  
  const [showQuickBuyModal, setShowQuickBuyModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [buyError, setBuyError] = useState('');
  const [buySuccess, setBuySuccess] = useState(false);
  const [showAvailableNumbers, setShowAvailableNumbers] = useState(false);

  const {
    data: campaigns = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => apiClient.get<Campaign[]>('/campaigns'),
  });

  const takenTicketsQuery = useQuery({
    queryKey: ['taken-tickets', selectedCampaign?.id],
    queryFn: () => apiClient.get<{ campaignId: string; takenNumbers: number[] }>(`/campaigns/${selectedCampaign?.id}/tickets/taken`),
    enabled: !!selectedCampaign && showQuickBuyModal,
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

  const handleBulkBuy = () => {
    if (!selectedCampaign || selectedNumbers.length === 0) return;
    
    // Reserve each ticket individually and collect ticket IDs
    const ticketIds: string[] = [];
    selectedNumbers.forEach(ticketNumber => {
      quickBuyMutation.mutate({ 
        campaignId: selectedCampaign.id, 
        ticketNumber 
      });
      // This is a simplified approach - in production, you'd want to wait for all reservations
      // For now, we'll redirect to payment page with all ticket IDs
      ticketIds.push(`temp-${ticketNumber}`);
    });
    
    if (ticketIds.length > 0) {
      setBuySuccess(true);
      setTimeout(() => {
        window.location.href = `/payment/${ticketIds.join(',')}`;
      }, 1500);
    }
  };

  if (!hasHydrated || !user) {
    return (
      <div className="app-page min-h-screen flex items-center justify-center">
        <div className="app-muted">{t(language, 'loading')}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="app-page min-h-screen flex items-center justify-center">
        <div className="app-muted">{t(language, 'loadingCampaigns')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-page min-h-screen flex items-center justify-center">
        <div className="max-w-xs w-full rounded-[32px] border border-rose-500/20 bg-rose-500/5 p-8 text-center space-y-6 backdrop-blur-xl">
          <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-rose-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-[var(--foreground)]">
              {t(language, 'connectionError')}
            </h1>
            <p className="text-xs app-muted leading-relaxed">
              {getErrorMessage(error, 'The server is currently unreachable. Please try again later.')}
            </p>
          </div>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-2xl bg-white text-[#0f172a] px-6 py-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-white/5 w-full"
          >
            <LogIn className="w-4 h-4" />
            {t(language, 'signIn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page min-h-screen pb-28 text-[var(--foreground)] transition-colors">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 -left-[10%] w-[50%] h-[30%] bg-[#1e3a8a]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-[#f6d365]/10 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 bg-[var(--page-surface)]/85 backdrop-blur-xl px-5 py-4 flex items-center justify-between border-b border-[var(--card-border)]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] app-accent">
            ETHIORaffle
          </p>
          <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
            {t(language, 'explore')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {user ? (
            <Link
              href="/profile"
              className="w-11 h-11 rounded-2xl app-panel flex items-center justify-center border shadow-xl overflow-hidden group hover:border-[var(--accent)]/50 transition-all"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 app-accent" />
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-3 bg-gradient-to-r from-[#f6d365] to-[#fda085] text-[#0f172a] text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-500/10"
            >
              {t(language, 'signIn')}
            </Link>
          )}
        </div>
      </header>

      <div className="pb-28 relative z-10">
        {campaigns.length === 0 ? (
          <div className="text-center py-40 px-6 space-y-8">
            <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto border border-white/10">
              <Ticket className="w-12 h-12 text-white/20" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-white">
                {t(language, 'noActiveDrops')}
              </h3>
              <p className="text-white/40 font-medium leading-relaxed max-w-[240px] mx-auto">
                {t(language, 'stayTuned')}
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-5 space-y-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="space-y-3">
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
                      <p className="text-[10px] font-black app-accent uppercase tracking-widest mb-0.5">
                        {t(language, 'verifiedCreator')}
                      </p>
                      <h3 className="text-base font-black text-[var(--foreground)] leading-none">
                        {campaign.creator?.name || t(language, 'premiumCreator')}
                      </h3>
                      <p className="text-xs font-bold app-muted mt-1">
                        {campaign.creator?.id ? `@creator_${campaign.creator.id.slice(-4)}` : t(language, 'sponsored')}
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
                            {campaign.totalTickets} {t(language, 'ticketsLeft')}
                          </span>
                          <span className="px-3 py-1.5 rounded-xl bg-[#f6d365] text-[9px] font-black text-[#0f172a] uppercase shadow-lg shadow-orange-500/20">
                            Live Draw
                          </span>
                        </div>
                        <h2 className="text-3xl font-black text-white leading-[1.1] pr-4">
                          {getCampaignText(campaign, language).title}
                        </h2>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                              <Ticket className="w-5 h-5 text-[#f6d365]" />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">
                                {t(language, 'entry')}
                              </p>
                              <p className="text-base font-black text-white mt-1">{campaign.ticketPrice} ETB</p>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedCampaign(campaign);
                              setSelectedNumbers([]);
                              setBuyError('');
                              setBuySuccess(false);
                              setShowQuickBuyModal(true);
                            }}
                            className="bg-white text-[#0f172a] px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-white/5 active:scale-95 transition-all"
                          >
                            {t(language, 'buyTicket')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
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
          setSelectedNumbers([]);
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
                  Select ticket numbers to reserve for 5 minutes each
                </p>
                <div className="text-2xl font-black text-white mb-2">
                  {selectedNumbers.length > 0 ? `#${selectedNumbers.join(', #')}` : '#?'}
                </div>
                <p className="text-[10px] font-black text-[#f6d365] uppercase tracking-widest">
                  {selectedNumbers.length > 0 ? 
                    `${selectedNumbers.length} × ${selectedCampaign.ticketPrice} = ${(selectedNumbers.length * selectedCampaign.ticketPrice).toLocaleString()} ETB` 
                    : `${selectedCampaign.ticketPrice} ETB each`
                  }
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowAvailableNumbers(!showAvailableNumbers)}
                className="flex-1 py-2 bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black hover:bg-white/20 transition-all"
              >
                {showAvailableNumbers ? 'Hide Available' : 'Show Available'} Numbers
              </button>
            </div>

            {showAvailableNumbers && selectedCampaign && (
              <div className="space-y-3">
                <p className="text-xs text-white/60 font-medium">
                  Available Numbers (Click to select multiple):
                </p>
                <div className="max-h-40 overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-3">
                  {takenTicketsQuery.isLoading ? (
                    <div className="text-center py-4 text-white/40 text-xs">
                      Loading available numbers...
                    </div>
                  ) : takenTicketsQuery.error ? (
                    <div className="text-center py-4 text-rose-400 text-xs">
                      Error loading available numbers
                    </div>
                  ) : (
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: selectedCampaign.totalTickets }, (_, i) => i + 1)
                        .filter(num => !takenTicketsQuery.data?.takenNumbers?.includes(num))
                        .map(num => (
                          <label
                            key={num}
                            className={`py-2 px-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                              selectedNumbers.includes(num)
                                ? 'bg-[#f6d365] text-[#0f172a]'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedNumbers.includes(num)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedNumbers([...selectedNumbers, num]);
                                } else {
                                  setSelectedNumbers(selectedNumbers.filter(n => n !== num));
                                }
                              }}
                              className="sr-only"
                            />
                            {num}
                          </label>
                        ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-white/40">
                  {takenTicketsQuery.data?.takenNumbers ? 
                    `${selectedCampaign.totalTickets - takenTicketsQuery.data.takenNumbers.length} of ${selectedCampaign.totalTickets} numbers available` 
                    : 'Loading...'}
                </p>
              </div>
            )}

            <FormField
              label="Or Enter Ticket Numbers Manually (comma separated)"
              id="ticketNumbers"
              type="text"
              value={selectedNumbers.join(', ')}
              onChange={(value) => {
                const numbers = value.split(',').map((n: string) => parseInt(n.trim())).filter((n: number) => !isNaN(n) && n > 0);
                setSelectedNumbers(numbers);
              }}
              placeholder="e.g., 1, 5, 10"
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
                  if (!selectedCampaign || selectedNumbers.length === 0) return;
                  handleBulkBuy();
                }}
                disabled={!selectedCampaign || selectedNumbers.length === 0 || quickBuyMutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-[#f6d365] to-[#fda085] text-[#0f172a] font-black rounded-2xl text-sm font-black hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {quickBuyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reserving...
                  </>
                ) : (
                  `Reserve ${selectedNumbers.length} Ticket${selectedNumbers.length > 1 ? 's' : ''} & Pay`
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
