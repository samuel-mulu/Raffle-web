'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Plus,
  Sparkles,
  Tv,
  X,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/errors';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import {
  Campaign,
  CampaignBuyerListResponse,
  CampaignStats,
  ImportPreviewResponse,
  Role,
  TicketStatus,
} from '@/types/api';
import { CampaignsTab } from '@/components/creator/campaigns-tab';
import { ExportsTab } from '@/components/creator/exports-tab';
import { OverviewTab } from '@/components/creator/overview-tab';
import { SalesTab } from '@/components/creator/sales-tab';
import { BuyerScope, CreatorWorkspaceTab } from '@/components/creator/types';

import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

type CreatorWorkspaceProps = {
  activeTab: CreatorWorkspaceTab;
};

const BUYER_PAGE_SIZE = 25;

const CREATOR_LAST_CAMPAIGN_KEY = 'rafil-creator-last-campaign';

function buildBuyerListPath(
  campaignId: string,
  opts: { page: number; pageSize: number; scope: BuyerScope; search: string },
) {
  const q = new URLSearchParams({
    page: String(opts.page),
    pageSize: String(opts.pageSize),
  });
  if (opts.search) {
    q.set('search', opts.search);
  }
  if (opts.scope === 'approved') {
    q.set('approvedOnly', 'true');
  } else if (opts.scope === 'payment_pending') {
    q.set('ticketStatus', TicketStatus.PAYMENT_PENDING);
  } else if (opts.scope === 'reserved') {
    q.set('ticketStatus', TicketStatus.RESERVED);
  }
  return `/creator/campaigns/${campaignId}/buyers?${q}`;
}

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

  const [buyerScope, setBuyerScope] = useState<BuyerScope>('approved');
  const [buyerPage, setBuyerPage] = useState(1);
  const [buyerSearchInput, setBuyerSearchInput] = useState('');
  const [debouncedBuyerSearch, setDebouncedBuyerSearch] = useState('');
  const [spreadsheetPreview, setSpreadsheetPreview] =
    useState<ImportPreviewResponse | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    ticketPrice: 100,
    totalTickets: 1000,
    drawAt: '',
  });

  const persistCampaignSelection = useCallback((campaignId: string) => {
    try {
      sessionStorage.setItem(CREATOR_LAST_CAMPAIGN_KEY, campaignId);
    } catch {
      //
    }
    setSelectedCampaignId(campaignId);
  }, []);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['creator-campaigns'],
    queryFn: () => apiClient.get<Campaign[]>('/creator/campaigns'),
    enabled: !!user && user.role === Role.CREATOR,
  });

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedBuyerSearch(buyerSearchInput.trim()),
      380,
    );
    return () => window.clearTimeout(timer);
  }, [buyerSearchInput]);

  useEffect(() => {
    if (!campaigns.length) {
      return;
    }

    const fromUrl =
      activeTab === 'sales'
        ? new URLSearchParams(window.location.search).get('campaignId')
        : null;

    if (fromUrl && campaigns.some((c) => c.id === fromUrl)) {
      persistCampaignSelection(fromUrl);
      return;
    }

    setSelectedCampaignId((current) => {
      if (current && campaigns.some((c) => c.id === current)) {
        return current;
      }

      const storedRaw =
        typeof window !== 'undefined'
          ? sessionStorage.getItem(CREATOR_LAST_CAMPAIGN_KEY)
          : null;

      const fallback =
        storedRaw && campaigns.some((c) => c.id === storedRaw)
          ? storedRaw
          : campaigns[0].id;

      try {
        sessionStorage.setItem(CREATOR_LAST_CAMPAIGN_KEY, fallback);
      } catch {
        //
      }

      return fallback;
    });
  }, [campaigns, activeTab, persistCampaignSelection]);

  useEffect(() => {
    setBuyerPage(1);
    setBuyerScope('approved');
    setBuyerSearchInput('');
    setDebouncedBuyerSearch('');
    setSpreadsheetPreview(null);
  }, [selectedCampaignId]);

  useEffect(() => {
    setBuyerPage(1);
  }, [buyerScope, debouncedBuyerSearch]);

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
    queryKey: [
      'creator-campaign-buyers',
      selectedCampaignId,
      buyerPage,
      buyerScope,
      debouncedBuyerSearch,
    ],
    queryFn: () =>
      apiClient.get<CampaignBuyerListResponse>(
        buildBuyerListPath(selectedCampaignId!, {
          page: buyerPage,
          pageSize: BUYER_PAGE_SIZE,
          scope: buyerScope,
          search: debouncedBuyerSearch,
        }),
      ),
    enabled: !!selectedCampaignId && activeTab === 'sales',
  });

  const overviewApprovedBuyersQuery = useQuery({
    queryKey: ['creator-overview-buyers', selectedCampaignId],
    queryFn: () =>
      apiClient.get<CampaignBuyerListResponse>(
        buildBuyerListPath(selectedCampaignId!, {
          page: 1,
          pageSize: 12,
          scope: 'approved',
          search: '',
        }),
      ),
    enabled: !!selectedCampaignId && activeTab === 'overview',
  });

  const importPreviewMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.postMultipart<ImportPreviewResponse>(
        `/creator/campaigns/${selectedCampaignId}/import-preview`,
        formData,
      );
    },
    onSuccess: (data) => {
      setSpreadsheetPreview(data);
      setError('');
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Could not parse file'));
      setSpreadsheetPreview(null);
    },
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

  const buyerTotalPages = useMemo(() => {
    const total = buyersQuery.data?.total ?? 0;
    return Math.max(1, Math.ceil(total / BUYER_PAGE_SIZE));
  }, [buyersQuery.data?.total]);

  const emptyBuyerCaption = useMemo(() => {
    switch (buyerScope) {
      case 'approved':
        return 'No verified (paid or winner) buyers match this filter yet.';
      case 'payment_pending':
        return 'Nobody is waiting with a proof upload for this raffle.';
      case 'reserved':
        return 'Tickets are moving fast — nobody is holding an unpaid reservation right now.';
      default:
        return 'No buyer tickets match this filter yet.';
    }
  }, [buyerScope]);

  const downloadBuyerImportTemplateCsv = () => {
    const blob = new Blob(['Buyer Name,Buyer Phone,Ticket Number\n'], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'buyer-import-template.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const resetBuyerWorkspace = () => {
    setBuyerScope('approved');
    setBuyerPage(1);
    setBuyerSearchInput('');
    setDebouncedBuyerSearch('');
    setSpreadsheetPreview(null);
  };

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
      <div className="app-page flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#1e3a8a]" />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] app-muted">
            Loading creator workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-theme app-page min-h-screen pb-24 text-[var(--foreground)] transition-colors">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 -left-[10%] w-[50%] h-[30%] bg-[#1e3a8a]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-[#f6d365]/10 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[var(--page-surface)]/85 px-5 py-3 backdrop-blur-2xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg shadow-orange-500/10">
              <Tv className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] app-accent">
                Creator Studio
              </p>
              <h1 className="text-xl font-black tracking-tight text-[var(--foreground)]">
                {user.name || 'Creator workspace'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-right shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] app-muted">
                Active phone
              </p>
              <p className="text-xs font-bold text-[var(--foreground)]">{user.phone}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--accent-foreground)] shadow-lg shadow-orange-500/10 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Drop
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {tabItems.map((tab) => (
            <Link
              key={tab.value}
              href={tab.href}
              className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] transition-all ${
                activeTab === tab.value
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg'
                  : 'bg-[var(--card)] app-muted hover:bg-[var(--panel-strong)]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="px-5 py-4 relative z-10">
        {error ? (
          <div className="mb-5 rounded-[24px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 font-bold flex justify-between items-center">
            {error}
            <button onClick={() => setError('')}><X className="h-4 w-4" /></button>
          </div>
        ) : null}

        {campaigns.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--panel-strong)] app-accent">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-xl font-black text-[var(--foreground)]">
              Start your first approved raffle
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 app-muted font-medium">
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
                  onClick={() => persistCampaignSelection(campaign.id)}
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
              <OverviewTab
                summaryCards={summaryCards}
                selectedCampaign={selectedCampaign}
                approvedBuyers={overviewApprovedBuyersQuery.data}
                approvedBuyersLoading={overviewApprovedBuyersQuery.isLoading}
                onEditLinks={(campaign) =>
                  setShowLinkModal({
                    id: campaign.id,
                    youtube: campaign.liveLinks?.youtube,
                    facebook: campaign.liveLinks?.facebook,
                  })
                }
                onSelectCampaign={persistCampaignSelection}
                onSubmitReview={(campaignId) => submitMutation.mutate(campaignId)}
              />
            ) : null}

            {activeTab === 'campaigns' ? (
              <CampaignsTab
                campaigns={campaigns}
                onSelectCampaign={persistCampaignSelection}
                onEditLinks={(campaign) =>
                  setShowLinkModal({
                    id: campaign.id,
                    youtube: campaign.liveLinks?.youtube,
                    facebook: campaign.liveLinks?.facebook,
                  })
                }
                onSubmitReview={(campaignId) => submitMutation.mutate(campaignId)}
              />
            ) : null}

            {activeTab === 'sales' ? (
              <SalesTab
                selectedCampaign={selectedCampaign}
                buyerScope={buyerScope}
                setBuyerScope={setBuyerScope}
                buyerSearchInput={buyerSearchInput}
                setBuyerSearchInput={setBuyerSearchInput}
                resetBuyerWorkspace={resetBuyerWorkspace}
                buyers={buyersQuery.data}
                isFetching={buyersQuery.isFetching}
                emptyBuyerCaption={emptyBuyerCaption}
                buyerPage={buyerPage}
                buyerTotalPages={buyerTotalPages}
                setBuyerPage={setBuyerPage}
              />
            ) : null}

            {activeTab === 'exports' ? (
              <ExportsTab
                selectedCampaignId={selectedCampaignId}
                selectedCampaign={selectedCampaign}
                importFileRef={importFileRef}
                isImporting={importPreviewMutation.isPending}
                spreadsheetPreview={spreadsheetPreview}
                onImportFile={(file) => importPreviewMutation.mutate(file)}
                onMissingCampaign={() => setError('Select a raffle first.')}
                onDownload={handleDownload}
                onDownloadTemplate={downloadBuyerImportTemplateCsv}
                onClearPreview={() => setSpreadsheetPreview(null)}
              />
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
