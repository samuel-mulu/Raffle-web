'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Plus,
  Tv,
  Users,
  Ticket,
  ChevronRight,
  Settings,
  MoreVertical,
  Clock,
  ExternalLink,
  Loader2,
  X,
  PlusCircle,
  Video,
  Share,
  Info,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Campaign, CampaignStatus, Role } from '@/types/api';
import Link from 'next/link';

interface CreatorStats {
  campaignId: string;
  totalTickets: number;
  taken: number;
  remaining: number;
  counts: Record<string, number>;
}

export default function CreatorDashboardPage() {
  const queryClient = useQueryClient();
  const { user, hasHydrated } = useAuthGuard();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState<{ id: string; youtube?: string; facebook?: string } | null>(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['creator-campaigns'],
    queryFn: () => apiClient.get<Campaign[]>('/creator/campaigns'),
    enabled: !!user && user.role === Role.CREATOR,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/creator/campaigns', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-campaigns'] });
      setShowCreateModal(false);
    },
  });

  const updateLinksMutation = useMutation({
    mutationFn: ({ id, links }: { id: string; links: any }) => 
      apiClient.patch(`/creator/campaigns/${id}/links`, links),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-campaigns'] });
      setShowLinkModal(null);
    },
  });

  if (!hasHydrated || !user || isLoading) {
    return (
      <div className="bg-white min-h-screen p-6 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#1e3a8a] animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Loading Creator Studio</p>
      </div>
    );
  }

  return (
    <div className="bg-[#fcf8fa] min-h-screen pb-32">
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-5 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1e3a8a] to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0f172a] tracking-tight">Creator Studio</h1>
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em]">Verified Partner</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="p-6 space-y-8">
        {/* Creator Identity Card */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-gray-50 overflow-hidden border border-gray-100 p-1">
             <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#1e3a8a]" />
             </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-[#0f172a] leading-none mb-1">{user.name || 'Creator'}</h2>
            <p className="text-xs font-bold text-[#94a3b8]">{user.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-black text-[#1e3a8a] leading-none">{campaigns.length}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Drops</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Your Drops</h3>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live Performance
            </div>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
               <PlusCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-400 font-bold">Ready to drop your first raffle?</p>
               <button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-[#1e3a8a] text-sm font-black uppercase tracking-widest"
               >
                 Create Now
               </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
                  <div className="p-5 flex gap-4">
                    <div className="w-20 h-20 rounded-[24px] bg-gray-100 overflow-hidden shrink-0 shadow-inner">
                      {campaign.imageUrl ? (
                        <img src={campaign.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Ticket className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-1">
                        <h2 className="font-black text-[#0f172a] truncate text-base leading-none">
                          {campaign.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          campaign.status === CampaignStatus.ACTIVE ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {campaign.status}
                        </span>
                        <span className="text-[10px] font-bold text-[#1e3a8a]">{campaign.ticketPrice} ETB</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-50 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-[#fcf8fa] border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-500">Analytics</span>
                      </div>
                      <button 
                        onClick={() => setShowLinkModal({ 
                          id: campaign.id, 
                          youtube: (campaign as any).liveLinks?.youtube,
                          facebook: (campaign as any).liveLinks?.facebook 
                        })}
                        className="flex items-center gap-1.5 text-[#1e3a8a]"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-black uppercase tracking-tighter">Live Links</span>
                      </button>
                    </div>
                    
                    <Link 
                      href={`/campaigns/${campaign.id}`}
                      className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Link Update Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center">
           <div className="bg-white w-full max-w-[500px] rounded-t-[48px] p-8 space-y-8 animate-in slide-in-from-bottom duration-500">
             <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Social Links</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Broadcast Details</p>
                </div>
                <button 
                  onClick={() => setShowLinkModal(null)}
                  className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400"
                >
                  <X className="w-6 h-6" />
                </button>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-red-600" /> YouTube Live URL
                  </label>
                  <input 
                    type="url"
                    defaultValue={showLinkModal.youtube}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold"
                    placeholder="https://youtube.com/live/..."
                    id="youtube-link"
                    aria-label="YouTube Live URL"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Share className="w-3.5 h-3.5 text-blue-600" /> Facebook Live URL
                  </label>
                  <input 
                    type="url"
                    defaultValue={showLinkModal.facebook}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold"
                    placeholder="https://facebook.com/live/..."
                    id="facebook-link"
                    aria-label="Facebook Live URL"
                  />
                </div>

                <button 
                  onClick={() => {
                    const youtube = (document.getElementById('youtube-link') as HTMLInputElement).value;
                    const facebook = (document.getElementById('facebook-link') as HTMLInputElement).value;
                    updateLinksMutation.mutate({ id: showLinkModal.id, links: { youtube, facebook } });
                  }}
                  className="w-full py-5 bg-black text-white font-black rounded-[24px] shadow-2xl active:scale-[0.98] transition-all"
                >
                  {updateLinksMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Save Broadcast Links'}
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Creation Modal (Simplified for Creator) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center">
           <div className="bg-white w-full max-w-[500px] rounded-t-[48px] p-8 space-y-8 animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">New Drop</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Submit for Approval</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400"
                >
                  <X className="w-6 h-6" />
                </button>
             </div>

             <form className="space-y-6" onSubmit={(e) => {
               e.preventDefault();
               const formData = new FormData(e.currentTarget);
               createMutation.mutate(Object.fromEntries(formData));
             }}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prize Title</label>
                    <input name="title" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prize Image URL</label>
                    <input name="imageUrl" required type="url" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ticket Price</label>
                      <input name="ticketPrice" required type="number" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Tickets</label>
                      <input name="totalTickets" required type="number" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea name="description" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold h-32" />
                  </div>
                </div>

                <div className="p-5 bg-blue-50 rounded-3xl flex gap-4">
                   <Info className="w-5 h-5 text-[#1e3a8a] shrink-0 mt-1" />
                   <p className="text-[11px] font-bold text-[#1e3a8a] leading-relaxed">
                     Your drop will be reviewed by the platform admin before going live. Make sure your prize details are accurate!
                   </p>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-black text-white font-black rounded-[24px] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  {createMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <> <Plus className="w-5 h-5" /> Submit Drop Request </>}
                </button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}
