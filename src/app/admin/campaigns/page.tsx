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
  ShieldAlert,
  Ticket,
  Trophy,
  X,
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
    return <div className="p-10 text-center animate-pulse">Loading campaigns...</div>;
  }

  const isAdmin = !queryError;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-6">
        <ShieldAlert className="w-20 h-20 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">
            Admin Access Required
          </h1>
          <p className="text-[#45464d] mt-2">
            You do not have permission to manage campaigns.
          </p>
        </div>
        <Link href="/home" className="text-[#1e3a8a] font-bold">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fcf8fa] min-h-screen pb-24">
      <header className="sticky top-0 bg-white border-b border-[#e2e8f0] px-4 py-4 z-40 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a]">Campaign Admin</h1>
          <p className="text-xs text-[#94a3b8]">{campaigns.length} Total Campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="p-4 space-y-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        {campaigns.length === 0 ? (
          <div className="text-center py-20 text-[#94a3b8]">
            <p>No campaigns found.</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="relative bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {campaign.imageUrl ? (
                    <img
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h2 className="font-bold text-[#0f172a] truncate">
                      {campaign.title}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        campaign.status === CampaignStatus.ACTIVE
                          ? 'bg-green-100 text-green-700'
                          : campaign.status === CampaignStatus.DRAWN
                            ? 'bg-yellow-100 text-yellow-700'
                            : campaign.status === CampaignStatus.LOCKED
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#94a3b8] font-bold">
                    <div className="flex items-center gap-1">
                      <Ticket className="w-3 h-3" /> {campaign.totalTickets}
                    </div>
                    <div className="flex items-center gap-1 text-[#1e3a8a]">
                      {campaign.ticketPrice} ETB
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-[#fcf8fa] border-t border-[#e2e8f0] flex flex-wrap gap-2">
                {campaign.status === CampaignStatus.DRAFT ? (
                  <button
                    onClick={() =>
                      handleUpdateStatus(campaign.id, CampaignStatus.ACTIVE)
                    }
                    disabled={!!processingId}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" /> Activate
                  </button>
                ) : null}

                {campaign.status === CampaignStatus.ACTIVE ? (
                  <button
                    onClick={() =>
                      handleUpdateStatus(campaign.id, CampaignStatus.LOCKED)
                    }
                    disabled={!!processingId}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" /> Lock for Draw
                  </button>
                ) : null}

                {campaign.status === CampaignStatus.LOCKED ? (
                  <button
                    onClick={() => handleRunDraw(campaign.id)}
                    disabled={!!processingId}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-yellow-500 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    <Trophy className="w-3.5 h-3.5" /> Run Draw
                  </button>
                ) : null}

                {campaign.status === CampaignStatus.DRAWN ||
                (campaign.status as string) === 'COMPLETED' ? (
                  <Link
                    href={`/campaigns/${campaign.id}/winners`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-[#e2e8f0] text-[#0f172a] rounded-lg text-xs font-bold shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Winners
                  </Link>
                ) : null}

                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="flex items-center justify-center p-2 bg-white border border-[#e2e8f0] text-[#94a3b8] rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>

              {processingId === campaign.id ? (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 text-[#1e3a8a] animate-spin" />
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#0f172a]">New Campaign</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-6 h-6 text-[#94a3b8]" />
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 pb-6"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#45464d] uppercase ml-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({ ...formData, title: event.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#fcf8fa] border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  placeholder="e.g. Luxury Apartment Raffle"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#45464d] uppercase ml-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description: event.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-[#fcf8fa] border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a] h-24"
                  placeholder="Tell people about the prize..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="ticketPrice"
                    className="text-xs font-bold text-[#45464d] uppercase ml-1"
                  >
                    Price (ETB)
                  </label>
                  <input
                    id="ticketPrice"
                    type="number"
                    required
                    value={formData.ticketPrice}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        ticketPrice: Number(event.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-[#fcf8fa] border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="totalTickets"
                    className="text-xs font-bold text-[#45464d] uppercase ml-1"
                  >
                    Total Tickets
                  </label>
                  <input
                    id="totalTickets"
                    type="number"
                    required
                    value={formData.totalTickets}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        totalTickets: Number(event.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-[#fcf8fa] border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="imageUrl"
                  className="text-xs font-bold text-[#45464d] uppercase ml-1"
                >
                  Hero Image URL
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(event) =>
                    setFormData({ ...formData, imageUrl: event.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#fcf8fa] border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="drawAt"
                  className="text-xs font-bold text-[#45464d] uppercase ml-1"
                >
                  Draw Date (Optional)
                </label>
                <input
                  id="drawAt"
                  type="date"
                  value={formData.drawAt}
                  onChange={(event) =>
                    setFormData({ ...formData, drawAt: event.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#fcf8fa] border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                />
              </div>

              <button
                type="submit"
                disabled={!!processingId}
                className="w-full py-4 bg-black text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {processingId === 'creating' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Create Campaign'
                )}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
