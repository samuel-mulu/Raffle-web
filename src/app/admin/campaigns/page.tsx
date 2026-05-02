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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-black animate-spin mx-auto" />
          <p className="text-sm font-black uppercase tracking-widest text-gray-400">Syncing Dashboard...</p>
        </div>
      </div>
    );
  }

  const isAdmin = !queryError;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-6">
        <div className="w-24 h-24 rounded-[40px] bg-red-50 flex items-center justify-center text-red-600 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Restricted Area</h1>
          <p className="text-gray-500 mt-2 font-medium">Your credentials do not have administrative access.</p>
        </div>
        <Link href="/home" className="px-8 py-3 bg-black text-white font-black rounded-2xl shadow-xl">
          Return to Feed
        </Link>
      </div>
    );
  }

  const stats = [
    { label: 'Active', value: campaigns.filter(c => c.status === CampaignStatus.ACTIVE).length, icon: <TrendingUp className="w-4 h-4" />, color: 'bg-green-500' },
    { label: 'Pending', value: campaigns.filter(c => c.status === CampaignStatus.PENDING_APPROVAL).length, icon: <Clock className="w-4 h-4" />, color: 'bg-orange-500' },
    { label: 'Total', value: campaigns.length, icon: <LayoutDashboard className="w-4 h-4" />, color: 'bg-blue-500' },
  ];

  return (
    <div className="bg-[#fcf8fa] min-h-screen pb-32">
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-5 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0f172a] tracking-tight">Campaign Manager</h1>
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em]">Platform Admin</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="h-11 px-5 rounded-2xl bg-black text-white flex items-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest">New Drop</span>
        </button>
      </header>

      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2">
              <div className={`w-7 h-7 rounded-lg ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[20px] font-black text-[#0f172a] leading-none">{stat.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-[24px] flex items-center gap-3 text-sm font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="flex-1">{error}</p>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Manage Drops</h3>
            <span className="text-[10px] font-bold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">Live Updates</span>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-400 font-bold">No campaigns yet. Time to create your first drop!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="relative bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col group"
                >
                  <div className="p-5 flex gap-4">
                    <div className="w-24 h-24 rounded-[24px] bg-gray-100 overflow-hidden shrink-0 shadow-inner">
                      {campaign.imageUrl ? (
                        <img
                          src={campaign.imageUrl}
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Ticket className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h2 className="font-black text-[#0f172a] text-lg leading-tight truncate pr-4">
                            {campaign.title}
                          </h2>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                              <Users className="w-3 h-3" /> {campaign.creator?.name || 'Platform'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-200" />
                            <span className="text-[10px] font-bold text-[#1e3a8a]">{campaign.ticketPrice} ETB</span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                            campaign.status === CampaignStatus.ACTIVE
                              ? 'bg-green-50 text-green-600 border-green-100'
                              : campaign.status === CampaignStatus.DRAWN
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                : campaign.status === CampaignStatus.LOCKED
                                  ? 'bg-purple-50 text-purple-700 border-purple-100'
                                  : campaign.status === CampaignStatus.PENDING_APPROVAL
                                    ? 'bg-orange-50 text-orange-700 border-orange-100'
                                    : campaign.status === CampaignStatus.REJECTED
                                      ? 'bg-red-50 text-red-700 border-red-100'
                                      : 'bg-gray-50 text-gray-500 border-gray-100'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-200 w-full" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{campaign.totalTickets} Tickets</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-[#fcf8fa] border-t border-gray-50 flex flex-wrap gap-2">
                    {campaign.status === CampaignStatus.PENDING_APPROVAL && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(campaign.id, CampaignStatus.ACTIVE)}
                          disabled={!!processingId}
                          className="flex-1 h-11 flex items-center justify-center gap-2 bg-green-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                        >
                          <Play className="w-4 h-4 fill-current" /> Approve Drop
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(campaign.id, CampaignStatus.REJECTED)}
                          disabled={!!processingId}
                          className="flex-1 h-11 flex items-center justify-center gap-2 bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}

                    {campaign.status === CampaignStatus.DRAFT && (
                      <button
                        onClick={() => handleUpdateStatus(campaign.id, CampaignStatus.PENDING_APPROVAL)}
                        disabled={!!processingId}
                        className="flex-1 h-11 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                      >
                        <Clock className="w-4 h-4" /> Submit for Review
                      </button>
                    )}

                    {campaign.status === CampaignStatus.ACTIVE && (
                      <button
                        onClick={() => handleUpdateStatus(campaign.id, CampaignStatus.LOCKED)}
                        disabled={!!processingId}
                        className="flex-1 h-11 flex items-center justify-center gap-2 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                      >
                        <Lock className="w-4 h-4" /> Lock for Draw
                      </button>
                    )}

                    {campaign.status === CampaignStatus.LOCKED && (
                      <button
                        onClick={() => handleRunDraw(campaign.id)}
                        disabled={!!processingId}
                        className="flex-1 h-11 flex items-center justify-center gap-2 bg-yellow-400 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                      >
                        <Trophy className="w-4 h-4" /> Pick Winners
                      </button>
                    )}

                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="w-11 h-11 flex items-center justify-center bg-white border border-gray-100 text-gray-400 rounded-2xl hover:text-black transition-colors"
                      aria-label="View on platform"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </div>

                  {processingId === campaign.id && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <Loader2 className="w-8 h-8 text-black animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-[500px] rounded-t-[48px] p-8 space-y-8 animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">New Raffle Drop</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Setup Campaign Details</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Drop Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 font-bold transition-all"
                    placeholder="e.g. Luxury Penthouse Edition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 font-bold transition-all h-32"
                    placeholder="Describe the prize and eligibility..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (ETB)</label>
                    <input
                      id="price"
                      type="number"
                      required
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: Number(e.target.value) })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 font-black transition-all text-xl"
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="inventory" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Inventory</label>
                    <input
                      id="inventory"
                      type="number"
                      required
                      value={formData.totalTickets}
                      onChange={(e) => setFormData({ ...formData, totalTickets: Number(e.target.value) })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 font-black transition-all text-xl"
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="assetUrl" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset URL</label>
                  <input
                    id="assetUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 font-bold transition-all"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="drawDate" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Schedule Draw</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="drawDate"
                      type="date"
                      value={formData.drawAt}
                      onChange={(e) => setFormData({ ...formData, drawAt: e.target.value })}
                      className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 font-bold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assign Creator ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.creatorId}
                    onChange={(e) => setFormData({ ...formData, creatorId: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 font-bold transition-all"
                    placeholder="cuid of the verified creator"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!!processingId}
                className="w-full py-5 bg-black text-white font-black rounded-[24px] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
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
          </div>
        </div>
      )}
    </div>
  );
}
