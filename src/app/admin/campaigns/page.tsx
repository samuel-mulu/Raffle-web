'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Eye,
  Loader2,
  Lock,
  Play,
  Plus,
  CheckCircle2,
  ChevronRight,
  Clock,
  ShieldAlert,
  Ticket,
  Trophy,
  X,
  LayoutDashboard,
  MoreVertical,
  Calendar,
  Users,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Campaign, CampaignStatus } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';

import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

type CampaignFormData = {
  title: string;
  description: string;
  imageUrl: string;
  ticketPrice: number;
  totalTickets: number;
  drawAt: string;
  creatorId?: string;
};

export default function AdminCampaignsPage() {
  const queryClient = useQueryClient();
  const { user, hasHydrated } = useAuthGuard();
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    imageUrl: '',
    ticketPrice: 100,
    totalTickets: 1000,
    drawAt: '',
    creatorId: '',
  });

  const {
    data: campaigns = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: () => apiClient.get<Campaign[]>('/admin/campaigns'),
    enabled: !!user,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: CampaignFormData) =>
      apiClient.post<Campaign>('/admin/campaigns', {
        ...data,
        ticketPrice: Number(data.ticketPrice),
        totalTickets: Number(data.totalTickets),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        ticketPrice: 100,
        totalTickets: 1000,
        drawAt: '',
        creatorId: '',
      });
      setProcessingId(null);
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Failed to create campaign'));
      setProcessingId(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CampaignStatus }) =>
      apiClient.patch<Campaign>(`/admin/campaigns/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      setProcessingId(null);
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Update failed'));
      setProcessingId(null);
    },
  });

  const runDrawMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/campaigns/${id}/run-draw`, { winnerCount: 3 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      setProcessingId(null);
      alert('Draw completed successfully!');
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Draw failed'));
      setProcessingId(null);
    },
  });

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProcessingId('creating');
    createMutation.mutate(formData);
  };

  const handleUpdateStatus = (id: string, status: CampaignStatus) => {
    const confirmMessage =
      status === CampaignStatus.LOCKED
        ? 'Are you sure you want to lock this campaign? This stops all new reservations.'
        : `Change status to ${status}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setProcessingId(id);
    updateStatusMutation.mutate({ id, status });
  };

  const handleRunDraw = (id: string) => {
    if (
      !confirm(
        'You are about to run the final draw and pick winners. This action is irreversible. Proceed?'
      )
    ) {
      return;
    }

    setProcessingId(id);
    runDrawMutation.mutate(id);
  };

  if (!hasHydrated || !user || isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#f6d365] animate-spin mx-auto" />
          <p className="text-sm font-black uppercase tracking-widest text-white/40">Syncing Dashboard...</p>
        </div>
      </div>
    );
  }

  const isAdmin = !queryError;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-6">
        <div className="w-24 h-24 rounded-[40px] bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner border border-rose-500/20">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Restricted Area</h1>
          <p className="text-white/40 mt-2 font-medium">Your credentials do not have administrative access.</p>
        </div>
        <Link href="/home" className="px-8 py-3 bg-[#f6d365] text-[#0f172a] font-black rounded-2xl shadow-xl">
          Return to Feed
        </Link>
      </div>
    );
  }

  const stats = [
    { label: 'Active', value: campaigns.filter(c => c.status === CampaignStatus.ACTIVE).length, icon: <TrendingUp className="w-4 h-4" />, color: 'bg-emerald-500' },
    { label: 'Pending', value: campaigns.filter(c => c.status === CampaignStatus.PENDING_APPROVAL).length, icon: <Clock className="w-4 h-4" />, color: 'bg-orange-500' },
    { label: 'Total', value: campaigns.length, icon: <LayoutDashboard className="w-4 h-4" />, color: 'bg-indigo-500' },
  ];

  return (
    <div className="bg-[#0f172a] min-h-screen pb-32 text-white">
      <header className="sticky top-0 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-5 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f6d365] flex items-center justify-center text-[#0f172a]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Campaign Manager</h1>
            <p className="text-[10px] font-bold text-[#f6d365] uppercase tracking-[0.2em]">Platform Admin</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="h-11 px-5 rounded-2xl bg-[#f6d365] text-[#0f172a] flex items-center gap-2 shadow-lg shadow-orange-500/10 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest">New Drop</span>
        </button>
      </header>

      <div className="p-6 space-y-8 relative z-10">
        {/* Background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
          <div className="absolute top-0 -left-[10%] w-[50%] h-[30%] bg-[#1e3a8a]/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-[#f6d365]/10 blur-[100px] rounded-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 relative z-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-xl space-y-2">
              <div className={`w-7 h-7 rounded-lg ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[20px] font-black text-white leading-none">{stat.value}</p>
                <p className="text-[10px] font-bold text-white/30 uppercase mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-[24px] flex items-center gap-3 text-sm font-bold relative z-10">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="flex-1">{error}</p>
            <button onClick={() => setError('')} className="p-1 hover:bg-rose-500/20 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">Manage Drops</h3>
            <span className="text-[10px] font-bold text-[#f6d365] bg-[#f6d365]/10 px-2 py-0.5 rounded-md uppercase tracking-tighter">Live Updates</span>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-24 bg-white/5 rounded-[40px] border border-dashed border-white/10 backdrop-blur-xl">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Ticket className="w-8 h-8 text-white/10" />
              </div>
              <p className="text-white/40 font-bold">No campaigns yet. Time to create your first drop!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="relative bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col group transition-all hover:border-white/20"
                >
                  <div className="p-5 flex gap-4">
                    <div className="w-24 h-24 rounded-[24px] bg-white/5 overflow-hidden shrink-0 shadow-inner border border-white/10">
                      {campaign.imageUrl ? (
                        <img
                          src={campaign.imageUrl}
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10">
                          <Ticket className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h2 className="font-black text-white text-lg leading-tight truncate pr-4">
                            {campaign.title}
                          </h2>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-white/40 flex items-center gap-1">
                              <Users className="w-3 h-3 text-[#f6d365]" /> {campaign.creator?.name || 'Platform Admin'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[10px] font-bold text-[#f6d365]">{campaign.ticketPrice} ETB</span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                            campaign.status === CampaignStatus.ACTIVE
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : campaign.status === CampaignStatus.DRAWN
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : campaign.status === CampaignStatus.LOCKED
                                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                  : campaign.status === CampaignStatus.PENDING_APPROVAL
                                    ? 'bg-orange-500/10 text-orange-400 border-orange-100'
                                    : campaign.status === CampaignStatus.REJECTED
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                      : 'bg-white/5 text-white/40 border-white/10'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-white/10 w-full" />
                        </div>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter">{campaign.totalTickets} Tickets</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-white/5 border-t border-white/5 flex flex-wrap gap-2">
                    {campaign.status === CampaignStatus.PENDING_APPROVAL && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(campaign.id, CampaignStatus.ACTIVE)}
                          disabled={!!processingId}
                          className="flex-1 h-11 flex items-center justify-center gap-2 bg-emerald-600 text-[#0f172a] rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          <Play className="w-4 h-4 fill-current" /> Approve Drop
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(campaign.id, CampaignStatus.REJECTED)}
                          disabled={!!processingId}
                          className="flex-1 h-11 flex items-center justify-center gap-2 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}

                    {campaign.status === CampaignStatus.DRAFT && (
                      <button
                        onClick={() => handleUpdateStatus(campaign.id, CampaignStatus.PENDING_APPROVAL)}
                        disabled={!!processingId}
                        className="flex-1 h-11 flex items-center justify-center gap-2 bg-[#1e3a8a] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                      >
                        <Clock className="w-4 h-4" /> Submit for Review
                      </button>
                    )}

                    {campaign.status === CampaignStatus.ACTIVE && (
                      <button
                        onClick={() => handleUpdateStatus(campaign.id, CampaignStatus.LOCKED)}
                        disabled={!!processingId}
                        className="flex-1 h-11 flex items-center justify-center gap-2 bg-[#f6d365] text-[#0f172a] rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/10 active:scale-95 transition-all"
                      >
                        <Lock className="w-4 h-4" /> Lock for Draw
                      </button>
                    )}

                    {campaign.status === CampaignStatus.LOCKED && (
                      <button
                        onClick={() => handleRunDraw(campaign.id)}
                        disabled={!!processingId}
                        className="flex-1 h-11 flex items-center justify-center gap-2 bg-[#f6d365] text-[#0f172a] rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                      >
                        <Trophy className="w-4 h-4" /> Pick Winners
                      </button>
                    )}

                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/10 text-white/40 rounded-2xl hover:text-[#f6d365] hover:border-[#f6d365]/30 transition-all active:scale-90"
                      aria-label="View on platform"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </div>

                  {processingId === campaign.id && (
                    <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <Loader2 className="w-8 h-8 text-[#f6d365] animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Raffle Drop"
        subtitle="Setup Campaign Details"
      >
        <form onSubmit={handleCreate} className="space-y-6 mt-4">
          <FormField
            label="Drop Title"
            id="title"
            required
            value={formData.title}
            onChange={(v) => setFormData({ ...formData, title: v })}
            placeholder="e.g. Luxury Penthouse Edition"
          />

          <FormField
            label="Description"
            id="description"
            required
            multiline
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
            placeholder="Describe the prize and eligibility..."
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Price (ETB)"
              id="price"
              type="number"
              required
              value={formData.ticketPrice}
              onChange={(v) => setFormData({ ...formData, ticketPrice: v })}
              placeholder="100"
            />
            <FormField
              label="Inventory"
              id="inventory"
              type="number"
              required
              value={formData.totalTickets}
              onChange={(v) => setFormData({ ...formData, totalTickets: v })}
              placeholder="1000"
            />
          </div>

          <FormField
            label="Asset URL"
            id="assetUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(v) => setFormData({ ...formData, imageUrl: v })}
            placeholder="https://images.unsplash.com/..."
          />

          <FormField
            label="Schedule Draw"
            id="drawDate"
            type="date"
            value={formData.drawAt}
            onChange={(v) => setFormData({ ...formData, drawAt: v })}
          />

          <FormField
            label="Assign Creator ID"
            id="creatorId"
            value={formData.creatorId || ''}
            onChange={(v) => setFormData({ ...formData, creatorId: v })}
            placeholder="cuid of the verified creator"
            hint="Optional"
          />

          <button
            type="submit"
            disabled={!!processingId}
            className="w-full h-16 bg-gradient-to-r from-[#f6d365] to-[#fda085] text-[#0f172a] font-black rounded-[24px] shadow-2xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg mt-8"
          >
            {processingId === 'creating' ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Plus className="w-6 h-6" />
                <span>Deploy Drop</span>
              </>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
}
