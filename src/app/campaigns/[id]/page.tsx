'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  Info,
  MessageCircle,
  Share2,
  Ticket,
  Tv,
  User,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Campaign, CampaignStatus } from '@/types/api';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { getErrorMessage } from '@/lib/errors';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';
import { LanguageToggle } from '@/components/language-toggle';
import { getCampaignText, t } from '@/lib/i18n';
import { useLanguageStore } from '@/stores/language-store';

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
  const { user, hasHydrated } = useAuthGuard();
  const language = useLanguageStore((state) => state.language);
  const queryClient = useQueryClient();
  
  const [showQuickBuyModal, setShowQuickBuyModal] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAvailableNumbers, setShowAvailableNumbers] = useState(false);

  const campaignQuery = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => apiClient.get<Campaign>(`/campaigns/${id}`),
  });

  const summaryQuery = useQuery({
    queryKey: ['campaign-summary', id],
    queryFn: () => apiClient.get<TicketSummary>(`/campaigns/${id}/tickets/summary`),
    enabled: !!campaignQuery.data,
  });

  const takenTicketsQuery = useQuery({
    queryKey: ['taken-tickets', id],
    queryFn: () => apiClient.get<{ campaignId: string; takenNumbers: number[] }>(`/campaigns/${id}/tickets/taken`),
    enabled: !!campaignQuery.data,
  });

  const quickBuyMutation = useMutation({
    mutationFn: (ticketNumber: number) =>
      apiClient.post<{ id: string }>(`/campaigns/${id}/tickets/reserve`, { ticketNumber }),
    onSuccess: (data) => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['campaign-summary', id] });
      setTimeout(() => {
        router.push(`/payment/${data.id}`);
      }, 1500);
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Failed to reserve ticket'));
    },
  });

  if (!hasHydrated || !user) {
    return (
      <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
        <div className="text-white/60">{t(language, 'loading')}</div>
      </div>
    );
  }

  if (campaignQuery.isLoading || summaryQuery.isLoading) {
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

  const campaign = campaignQuery.data;
  const summary = summaryQuery.data;

  if (campaignQuery.isError || !campaign) {
    return (
      <div className="p-10 text-center space-y-4 flex flex-col items-center justify-center min-h-screen">
        <div className="text-6xl mb-4">?</div>
        <h2 className="text-2xl font-black text-[#0f172a]">
          {t(language, 'raffleNotFound')}
        </h2>
        <Link href="/buyer/campaigns" className="px-8 py-3 bg-[#1e3a8a] text-white font-black rounded-2xl shadow-lg">
          {t(language, 'backToCampaigns')}
        </Link>
      </div>
    );
  }

  const soldPercentage =
    summary && summary.totalTickets > 0
      ? Math.round((summary.taken / summary.totalTickets) * 100)
      : 0;
  const isAlmostFull = soldPercentage >= 80;
  const youtubeLink = campaign.liveLinks?.youtube;
  const facebookLink = campaign.liveLinks?.facebook;
  const canReserve = campaign.status === CampaignStatus.ACTIVE;
  const showWinners =
    campaign.status === CampaignStatus.DRAWN ||
    campaign.status === CampaignStatus.COMPLETED;

  return (
    <div className="bg-[#0f172a] min-h-screen pb-32 text-white">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 -left-[10%] w-[50%] h-[30%] bg-[#1e3a8a]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-[#f6d365]/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative h-[450px] w-full bg-gray-900 overflow-hidden">
        {campaign.imageUrl ? (
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gray-100">
            {t(language, 'noPreview')}
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-3">
            <LanguageToggle />
            <button
              className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
              aria-label="Like"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              className="w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-20">
          <div className="bg-gradient-to-r from-[#f6d365] to-[#fda085] text-[#0f172a] p-4 rounded-3xl shadow-2xl border-2 border-[#f6d365]/30 rotate-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">
              {t(language, 'ticketPrice')}
            </p>
            <p className="text-2xl font-black">{campaign.ticketPrice} ETB</p>
          </div>
        </div>
      </div>

      <div className="relative -mt-12 bg-[#0f172a] rounded-t-[48px] px-6 pt-10 pb-10">
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1e3a8a] to-[#f97316] p-[2px] shadow-lg">
              <div className="w-full h-full rounded-2xl bg-white/5 p-[2px]">
                <div className="w-full h-full rounded-2xl bg-white/10 overflow-hidden flex items-center justify-center">
                  {campaign.creator?.avatarUrl ? (
                    <img src={campaign.creator.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-white/40" />
                  )}
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#f6d365] uppercase tracking-widest mb-0.5">
                {t(language, 'verifiedCreator')}
              </p>
              <h3 className="text-lg font-black text-white leading-none">
                {campaign.creator?.name || 'EthioRaffle Official'}
              </h3>
              <p className="text-sm font-bold text-white/50 mt-1">
                {campaign.creator?.id ? `@creator_${campaign.creator.id.slice(-4)}` : '@official'}
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-[0.18em] text-white/60 border border-white/10">
            {campaign.status}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                isAlmostFull
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                  : 'bg-green-500/20 text-green-300 border-green-500/30'
              }`}
            >
              {isAlmostFull ? t(language, 'almostFull') : t(language, 'openCampaign')}
            </span>
            {campaign.drawAt ? (
              <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-widest">
                {t(language, 'drawDate')}: {new Date(campaign.drawAt).toLocaleDateString()}
              </span>
            ) : null}
          </div>
          <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight pr-4">
            {getCampaignText(campaign, language).title}
          </h1>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 mb-8 backdrop-blur-xl space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-[#f6d365] uppercase tracking-widest mb-1">
                {t(language, 'raffleProgress')}
              </p>
              <h4 className="text-3xl font-black text-white">
                {soldPercentage}% <span className="text-sm font-bold text-white/40">{t(language, 'filled')}</span>
              </h4>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-white leading-none">
                {summary?.remaining || 0}
              </p>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter mt-1">
                {t(language, 'ticketsLeft')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded-2xl border border-white/5 overflow-hidden p-1">
              <div className={`h-full bg-gradient-to-r from-[#f6d365] to-[#fda085] rounded-xl transition-all duration-1000 shadow-sm`} style={{ width: `${soldPercentage}%` }} />
            </div>
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-white/30" />
                <span className="text-[11px] font-bold text-white/40">
                  {summary?.taken || 0} Sold
                </span>
              </div>
              <span className="text-[11px] font-bold text-white/40">
                {summary?.totalTickets || 0} Total Capacity
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-300" />
            </div>
            <h3 className="font-black text-xl text-white">
              {t(language, 'aboutPrize')}
            </h3>
          </div>
          <p className="text-white/60 text-base leading-relaxed whitespace-pre-line font-medium">
            {getCampaignText(campaign, language).description ||
              'No description provided for this raffle yet.'}
          </p>
        </div>

        <div className="rounded-[32px] border border-rose-500/20 bg-rose-500/5 p-5 mb-8 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shadow-sm">
              <Tv className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Live links</h4>
              <p className="text-xs font-bold text-rose-300/70">
                {youtubeLink || facebookLink
                  ? 'Watch the draw on creator channels below.'
                  : 'The creator has not published any stream links yet.'}
              </p>
            </div>
          </div>

          {youtubeLink || facebookLink ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {youtubeLink ? (
                <a
                  href={youtubeLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-white/20 transition-all"
                >
                  YouTube
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
              {facebookLink ? (
                <a
                  href={facebookLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-white/20 transition-all"
                >
                  Facebook
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6d365]/20 text-[#f6d365]">
            <Ticket className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-white/40">
            {summary?.taken || 0} entries confirmed so far.
          </p>
        </div>

        {/* Available Numbers Section */}
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#f6d365] font-bold leading-relaxed uppercase tracking-widest">
              Available Ticket Numbers
            </p>
            <button
              onClick={() => setShowAvailableNumbers(!showAvailableNumbers)}
              className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-black text-white hover:bg-white/20 transition-all"
            >
              {showAvailableNumbers ? 'Hide' : 'Show'} Available
            </button>
          </div>
          
          {showAvailableNumbers && campaign && (
            <div className="space-y-3">
              {takenTicketsQuery.isLoading ? (
                <div className="text-center py-8 text-white/40 text-xs">
                  Loading available numbers...
                </div>
              ) : takenTicketsQuery.error ? (
                <div className="text-center py-8 text-rose-400 text-xs">
                  Error loading available numbers
                </div>
              ) : (
                <>
                  <div className="max-h-60 overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="grid grid-cols-8 gap-2">
                      {Array.from({ length: campaign.totalTickets }, (_, i) => i + 1)
                        .filter(num => !takenTicketsQuery.data?.takenNumbers?.includes(num))
                        .map(num => (
                          <button
                            key={num}
                            onClick={() => {
                              setSelectedNumbers([num]);
                              setShowQuickBuyModal(true);
                            }}
                            className="py-2 px-1 rounded-lg text-xs font-black bg-white/10 text-white hover:bg-[#f6d365] hover:text-[#0f172a] transition-all"
                          >
                            {num}
                          </button>
                        ))}
                    </div>
                  </div>
                  <p className="text-xs text-white/40 text-center">
                    {takenTicketsQuery.data?.takenNumbers ? 
                      `${campaign.totalTickets - takenTicketsQuery.data.takenNumbers.length} of ${campaign.totalTickets} numbers available` 
                      : 'Loading...'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-3">
          <p className="text-[11px] text-[#f6d365] font-bold leading-relaxed uppercase tracking-widest">
            Rules and Conditions
          </p>
          <p className="text-xs text-white/60 leading-relaxed font-medium">
            Reservations are available only while the campaign is active. Locked and drawn
            campaigns remain visible for transparency and winner review.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-6 bg-[#0f172a]/90 backdrop-blur-2xl border-t border-white/5 z-50 flex gap-4">
        <button
          className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 border border-white/10 active:scale-90 transition-all"
          aria-label="Contact Support"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        {canReserve ? (
          <>
            <div className="text-[10px] text-white/40 mb-2">DEBUG: Campaign is ACTIVE, showing buttons</div>
            <button
              onClick={() => setShowQuickBuyModal(true)}
              className="flex-1 h-14 bg-gradient-to-r from-[#f6d365] to-[#fda085] text-[#0f172a] font-black rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20 hover:opacity-90 active:scale-[0.98] transition-all text-lg tracking-tight"
            >
              {t(language, 'buyTicket')}
            </button>
            <Link
              href={`/campaigns/${id}/reserve`}
              className="flex-1 h-14 bg-white/10 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center hover:bg-white/20 active:scale-[0.98] transition-all text-lg tracking-tight"
            >
              Select Numbers
            </Link>
          </>
        ) : showWinners ? (
          <Link
            href={`/campaigns/${id}/winners`}
            className="flex-1 h-14 bg-white/10 border border-white/10 text-white font-black rounded-2xl flex items-center justify-center hover:bg-white/20 active:scale-[0.98] transition-all text-lg tracking-tight"
          >
            View Winners
          </Link>
        ) : (
          <>
            <div className="text-[10px] text-rose-400 mb-2">DEBUG: Campaign is NOT ACTIVE, status: {campaign.status}</div>
            <div className="flex-1 h-14 rounded-2xl bg-white/5 text-white/40 font-black flex items-center justify-center text-sm uppercase tracking-[0.14em]">
              Sales Closed
            </div>
          </>
        )}
      </div>

      {/* Quick Buy Modal */}
      <Modal
        isOpen={showQuickBuyModal}
        onClose={() => {
          setShowQuickBuyModal(false);
          setSelectedNumbers([]);
          setError('');
        }}
        title="Quick Purchase"
        subtitle="Get your ticket instantly"
      >
        {success ? (
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
            <div className="text-center py-4">
              <p className="text-white/60 mb-4">
                Select ticket numbers to reserve for 5 minutes each
              </p>
              <div className="text-2xl font-black text-white mb-2">
                {selectedNumbers.length > 0 ? `#${selectedNumbers.join(', #')}` : '#?'}
              </div>
              <p className="text-[10px] font-black text-[#f6d365] uppercase tracking-widest">
                {selectedNumbers.length > 0 ? 
                  `${selectedNumbers.length} × ${campaign.ticketPrice} = ${(selectedNumbers.length * campaign.ticketPrice).toLocaleString()} ETB` 
                  : `${campaign.ticketPrice} ETB each`
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAvailableNumbers(!showAvailableNumbers)}
                className="flex-1 py-2 bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black hover:bg-white/20 transition-all"
              >
                {showAvailableNumbers ? 'Hide Available' : 'Show Available'} Numbers
              </button>
            </div>

            {showAvailableNumbers && campaign && (
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
                      {Array.from({ length: campaign.totalTickets }, (_, i) => i + 1)
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
                    `${campaign.totalTickets - takenTicketsQuery.data.takenNumbers.length} of ${campaign.totalTickets} numbers available` 
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

            {error ? (
              <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 font-bold flex justify-between items-center">
                {error}
                <button onClick={() => setError('')}><X className="h-4 w-4" /></button>
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
                  if (selectedNumbers.length === 0) return;
                  // Reserve each ticket individually
                  selectedNumbers.forEach(ticketNumber => {
                    quickBuyMutation.mutate(ticketNumber);
                  });
                }}
                disabled={selectedNumbers.length === 0 || quickBuyMutation.isPending}
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
