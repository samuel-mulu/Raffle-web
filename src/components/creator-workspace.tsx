'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Plus,
  Sparkles,
  Ticket,
  Tv,
  Users,
  X,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/errors';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import {
  Campaign,
  CampaignBuyerListResponse,
  CampaignStats,
  CampaignStatus,
  Role,
} from '@/types/api';

import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

type CreatorWorkspaceTab = 'overview' | 'campaigns' | 'sales' | 'exports';

type CreatorWorkspaceProps = {
  activeTab: CreatorWorkspaceTab;
};

const tabItems: Array<{ label: string; href: string; value: CreatorWorkspaceTab }> = [
  { label: 'Overview', href: '/creator/overview', value: 'overview' },
  { label: 'My Campaigns', href: '/creator/campaigns', value: 'campaigns' },
  { label: 'Buyers & Sales', href: '/creator/sales', value: 'sales' },
  { label: 'Exports', href: '/creator/exports', value: 'exports' },
];

export function CreatorWorkspace({ activeTab }: CreatorWorkspaceProps) {
  const queryClient = useQueryClient();
  const { user, hasHydrated } = useAuthGuard({ roles: [Role.CREATOR] });
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState<{
    id: string;
    youtube?: string;
    facebook?: string;
  } | null>(null);
  const [error, setError] = useState('');
  
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    ticketPrice: 100,
    totalTickets: 1000,
    drawAt: '',
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['creator-campaigns'],
    queryFn: () => apiClient.get<Campaign[]>('/creator/campaigns'),
    enabled: !!user && user.role === Role.CREATOR,
  });

  // ... (rest of the logic remains the same)

  useEffect(() => {
    if (!selectedCampaignId && campaigns.length > 0) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  const selectedCampaign =
    campaigns.find((campaign) => campaign.id === selectedCampaignId) || null;

  const statsQuery = useQuery({
    queryKey: ['creator-campaign-stats', selectedCampaignId],
    queryFn: () =>
      apiClient.get<CampaignStats>(
        `/creator/campaigns/${selectedCampaignId}/stats`,
      ),
    enabled: !!selectedCampaignId,
  });

  const buyersQuery = useQuery({
    queryKey: ['creator-campaign-buyers', selectedCampaignId],
    queryFn: () =>
      apiClient.get<CampaignBuyerListResponse>(
        `/creator/campaigns/${selectedCampaignId}/buyers?page=1&pageSize=25`,
      ),
    enabled: !!selectedCampaignId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post('/creator/campaigns', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-campaigns'] });
      setShowCreateModal(false);
      setError('');
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Failed to create campaign'));
    },
  });

  const updateLinksMutation = useMutation({
    mutationFn: ({
      id,
      links,
    }: {
      id: string;
      links: { youtube?: string; facebook?: string };
    }) => apiClient.patch(`/creator/campaigns/${id}/links`, links),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-campaigns'] });
      setShowLinkModal(null);
      setError('');
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Failed to save live links'));
    },
  });

  const submitMutation = useMutation({
    mutationFn: (campaignId: string) =>
      apiClient.post(`/creator/campaigns/${campaignId}/submit`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-campaigns'] });
      if (selectedCampaignId) {
        queryClient.invalidateQueries({
          queryKey: ['creator-campaign-stats', selectedCampaignId],
        });
      }
      setError('');
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Failed to submit campaign'));
    },
  });

  const summaryCards = useMemo(() => {
    const stats = statsQuery.data;
    if (!stats) {
      return [];
    }

    return [
      {
        label: 'Sold',
        value: String(stats.sold ?? stats.counts.PAID ?? 0),
        tone: 'bg-[#f0f7ff] text-[#1e3a8a]',
      },
      {
        label: 'Pending',
        value: String(stats.counts.PAYMENT_PENDING ?? 0),
        tone: 'bg-[#fff4e7] text-[#d97706]',
      },
      {
        label: 'Remaining',
        value: String(stats.remaining),
        tone: 'bg-[#edfdf2] text-[#15803d]',
      },
      {
        label: 'Expired',
        value: String(stats.expiredReservations ?? 0),
        tone: 'bg-[#f8fafc] text-[#475569]',
      },
    ];
  }, [statsQuery.data]);

  const handleDownload = async (format: 'xlsx' | 'pdf') => {
    if (!selectedCampaignId) {
      return;
    }

    try {
      setError('');
      const file = await apiClient.download(
        `/creator/campaigns/${selectedCampaignId}/exports.${format}`,
      );
      const url = URL.createObjectURL(file.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download =
        file.fileName ||
        `${selectedCampaign?.title || 'campaign-report'}.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(getErrorMessage(downloadError, 'Export failed'));
    }
  };

  if (!hasHydrated || !user || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#1e3a8a]" />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-[#94a3b8]">
            Loading creator workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] pb-28 text-white">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 -left-[10%] w-[50%] h-[30%] bg-[#1e3a8a]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-[#f6d365]/10 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0f172a]/80 px-6 py-5 backdrop-blur-2xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6d365] text-[#0f172a] shadow-lg shadow-orange-500/10">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f6d365]">
                Creator Studio
              </p>
              <h1 className="text-2xl font-black tracking-tight text-white">
                {user.name || 'Creator workspace'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
                Active phone
              </p>
              <p className="text-sm font-bold text-white">{user.phone}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#f6d365] px-5 text-sm font-black uppercase tracking-[0.16em] text-[#0f172a] shadow-lg shadow-orange-500/10 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Drop
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabItems.map((tab) => (
            <Link
              key={tab.value}
              href={tab.href}
              className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                activeTab === tab.value
                  ? 'bg-[#f6d365] text-[#0f172a] shadow-lg'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="px-6 py-6 relative z-10">
        {error ? (
          <div className="mb-5 rounded-[24px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 font-bold flex justify-between items-center">
            {error}
            <button onClick={() => setError('')}><X className="h-4 w-4" /></button>
          </div>
        ) : null}

        {campaigns.length === 0 ? (
          <div className="rounded-[40px] border border-dashed border-white/10 bg-white/5 p-10 text-center shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-[28px] bg-white/5 text-[#f6d365]">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-2xl font-black text-white">
              Start your first approved raffle
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/40 font-medium">
              Create a draft, add the prize details, and submit it for admin review when you are ready to launch.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#f6d365] px-6 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-[#0f172a] shadow-xl shadow-orange-500/10"
            >
              <Plus className="h-4 w-4" />
              Create campaign
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {campaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => setSelectedCampaignId(campaign.id)}
                  className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition-all border ${
                    campaign.id === selectedCampaignId
                      ? 'bg-[#1e3a8a] text-white border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
                  }`}
                >
                  {campaign.title}
                </button>
              ))}
            </div>

            {activeTab === 'overview' ? (
              <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                      <div
                        key={card.label}
                        className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl"
                      >
                        <div
                          className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${card.tone}`}
                        >
                          {card.label}
                        </div>
                        <p className="mt-4 text-3xl font-black tracking-tight text-white">
                          {card.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {selectedCampaign ? (
                    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                      <div className="flex flex-col gap-6 lg:flex-row">
                        <div className="h-40 w-full overflow-hidden rounded-[28px] bg-white/5 lg:w-64 border border-white/5 shadow-inner">
                          {selectedCampaign.imageUrl ? (
                            <img
                              src={selectedCampaign.imageUrl}
                              alt={selectedCampaign.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-white/10">
                              <Ticket className="h-10 w-10" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#f6d365]">
                              {selectedCampaign.status}
                            </span>
                            <span className="rounded-xl bg-[#f6d365] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#0f172a]">
                              {selectedCampaign.ticketPrice} ETB
                            </span>
                          </div>
                          <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
                            {selectedCampaign.title}
                          </h2>
                          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/40 font-medium">
                            {selectedCampaign.description ||
                              'Add a description to help buyers understand the prize, rules, and livestream details.'}
                          </p>
                          <div className="mt-6 flex flex-wrap gap-3">
                            <button
                              onClick={() =>
                                setShowLinkModal({
                                  id: selectedCampaign.id,
                                  youtube: selectedCampaign.liveLinks?.youtube,
                                  facebook: selectedCampaign.liveLinks?.facebook,
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:bg-white/10 transition-all active:scale-95"
                            >
                              <Link2 className="h-4 w-4 text-[#f6d365]" />
                              Broadcast links
                            </button>
                            <Link
                              href={`/campaigns/${selectedCampaign.id}`}
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:bg-white/10 transition-all active:scale-95"
                            >
                              <ExternalLink className="h-4 w-4 text-[#f6d365]" />
                              Public page
                            </Link>
                            {(selectedCampaign.status === CampaignStatus.DRAFT ||
                              selectedCampaign.status === CampaignStatus.REJECTED) && (
                              <button
                                onClick={() => submitMutation.mutate(selectedCampaign.id)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#f6d365] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#0f172a] shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Submit review
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
                    Approval workflow
                  </p>
                  <div className="mt-6 space-y-4">
                    {[
                      'Create or revise your draft campaign.',
                      'Submit the campaign for admin review.',
                      'Wait for activation before buyer reservations begin.',
                      'Track activity and export reports.',
                    ].map((step, index) => (
                      <div key={step} className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-xs font-black text-[#f6d365]">
                          {index + 1}
                        </div>
                        <p className="pt-2 text-sm text-white/50 font-medium leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {activeTab === 'campaigns' ? (
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
                          <button
                            onClick={() => setSelectedCampaignId(campaign.id)}
                            className="rounded-2xl border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:bg-white/5 transition-all"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() =>
                              setShowLinkModal({
                                id: campaign.id,
                                youtube: campaign.liveLinks?.youtube,
                                facebook: campaign.liveLinks?.facebook,
                              })
                            }
                            className="rounded-2xl border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:bg-white/5 transition-all"
                          >
                            Live links
                          </button>
                          {(campaign.status === CampaignStatus.DRAFT ||
                            campaign.status === CampaignStatus.REJECTED) && (
                            <button
                              onClick={() => submitMutation.mutate(campaign.id)}
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
            ) : null}

            {activeTab === 'sales' ? (
              <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
                      Real-time activity
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                      Recent buyers and ticket flow
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-[#f6d365]/10 border border-[#f6d365]/20 px-4 py-3 text-xs font-black uppercase tracking-widest text-[#f6d365]">
                    {buyersQuery.data?.total || 0} Connected
                  </div>
                </div>

                <div className="mt-8 grid gap-3">
                  {(buyersQuery.data?.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-4 rounded-[24px] border border-white/5 bg-white/5 px-5 py-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-white/20 group-hover:text-[#f6d365] transition-colors">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                            Buyer
                          </p>
                          <p className="font-bold text-white text-sm truncate">
                            {item.buyer?.name || 'Anonymous buyer'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                          Ticket #
                        </p>
                        <p className="font-black text-white text-sm">#{item.ticketNumber}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                          Status
                        </p>
                        <span className="inline-flex rounded-lg bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-tighter text-[#f6d365] border border-white/5">
                          {item.ticketStatus}
                        </span>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                          Payment
                        </p>
                        <p className="font-bold text-white text-xs opacity-60">
                          {item.payment?.status || 'NO_PAYMENT'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {buyersQuery.data?.items.length === 0 ? (
                  <div className="mt-8 rounded-[24px] bg-white/5 border border-dashed border-white/10 px-6 py-12 text-center">
                    <p className="text-white/30 font-bold text-sm tracking-wide">
                      Buyer activity appears here once reservations begin.
                    </p>
                  </div>
                ) : null}
              </section>
            ) : null}

            {activeTab === 'exports' ? (
              <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
                    Operational Reports
                  </p>
                  <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
                    {selectedCampaign?.title || 'Choose a campaign'}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-white/40 font-medium">
                    Exports include complete buyer lists, payment audit trails, and winner certifications for the selected drop.
                  </p>
                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <button
                      onClick={() => handleDownload('xlsx')}
                      disabled={!selectedCampaign}
                      className="inline-flex items-center justify-center gap-3 rounded-[24px] bg-[#f6d365] px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#0f172a] shadow-xl shadow-orange-500/10 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      Export XLSX
                    </button>
                    <button
                      onClick={() => handleDownload('pdf')}
                      disabled={!selectedCampaign}
                      className="inline-flex items-center justify-center gap-3 rounded-[24px] border border-white/10 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all"
                    >
                      <FileText className="h-4 w-4 text-[#f6d365]" />
                      Export PDF
                    </button>
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f6d365]">
                    Included insights
                  </p>
                  <div className="mt-8 space-y-4">
                    {[
                      'Complete sales performance overview',
                      'Ticket reservation audit trail',
                      'Verified buyer contact information',
                      'Payment transaction verification',
                      'Certified winner ranks and data',
                    ].map((line) => (
                      <div key={line} className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#f6d365]">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <p className="pt-2 text-sm text-white/50 font-medium leading-relaxed">{line}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Drop Request"
        subtitle="Campaign Setup"
      >
        <form 
          className="mt-6 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              ...createFormData,
              ticketPrice: Number(createFormData.ticketPrice),
              totalTickets: Number(createFormData.totalTickets),
            });
          }}
        >
          <FormField
            label="Prize Title"
            id="title"
            required
            value={createFormData.title}
            onChange={(v) => setCreateFormData({ ...createFormData, title: v })}
            placeholder="e.g. Dream House Edition"
          />

          <FormField
            label="Image Asset URL"
            id="imageUrl"
            type="url"
            value={createFormData.imageUrl}
            onChange={(v) => setCreateFormData({ ...createFormData, imageUrl: v })}
            placeholder="https://..."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Ticket Price (ETB)"
              id="ticketPrice"
              type="number"
              required
              value={createFormData.ticketPrice}
              onChange={(v) => setCreateFormData({ ...createFormData, ticketPrice: v })}
            />
            <FormField
              label="Total Supply"
              id="totalTickets"
              type="number"
              required
              hint="Max 5000"
              value={createFormData.totalTickets}
              onChange={(v) => setCreateFormData({ ...createFormData, totalTickets: v })}
            />
          </div>

          <FormField
            label="Planned Draw Date"
            id="drawAt"
            type="date"
            value={createFormData.drawAt}
            onChange={(v) => setCreateFormData({ ...createFormData, drawAt: v })}
          />

          <FormField
            label="Campaign Description"
            id="description"
            required
            multiline
            value={createFormData.description}
            onChange={(v) => setCreateFormData({ ...createFormData, description: v })}
            placeholder="Describe the rules and giveaway details..."
          />

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#f6d365] to-[#fda085] text-lg font-black uppercase tracking-[0.2em] text-[#0f172a] shadow-2xl shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Plus className="h-6 w-6" />
                <span>Submit Draft</span>
              </>
            )}
          </button>
        </form>
      </Modal>

      {/* Broadcast Links Modal */}
      <Modal
        isOpen={!!showLinkModal}
        onClose={() => setShowLinkModal(null)}
        title="Broadcast Hub"
        subtitle="Livestream Destinations"
      >
        {showLinkModal && (
          <form
            className="mt-6 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              updateLinksMutation.mutate({
                id: showLinkModal.id,
                links: {
                  youtube: showLinkModal.youtube,
                  facebook: showLinkModal.facebook,
                },
              });
            }}
          >
            <FormField
              label="YouTube Live URL"
              id="youtube"
              value={showLinkModal.youtube || ''}
              onChange={(v) => setShowLinkModal({ ...showLinkModal, youtube: v })}
              placeholder="https://youtube.com/live/..."
            />
            <FormField
              label="Facebook Live URL"
              id="facebook"
              value={showLinkModal.facebook || ''}
              onChange={(v) => setShowLinkModal({ ...showLinkModal, facebook: v })}
              placeholder="https://facebook.com/watch/..."
            />
            <button
              type="submit"
              disabled={updateLinksMutation.isPending}
              className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#f6d365] text-lg font-black uppercase tracking-[0.2em] text-[#0f172a] shadow-2xl shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {updateLinksMutation.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                'Update Links'
              )}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
