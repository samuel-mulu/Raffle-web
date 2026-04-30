'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Campaign, CampaignStatus } from '@/types/api';
import { ArrowLeft, Clock, Info, PartyPopper, Ticket, Trophy } from 'lucide-react';
import Link from 'next/link';

interface Winner {
  prizeRank: number;
  ticketNumber: number;
  user: {
    phone: string;
  };
}

export default function WinnersPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Campaign>(`/campaigns/${id}`),
      api.get<Winner[]>(`/campaigns/${id}/winners`)
    ])
    .then(([campaignData, winnersData]) => {
      setCampaign(campaignData);
      setWinners(winnersData);
    })
    .catch((err) => {
      console.error(err);
      setError('Could not load results');
    })
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-10 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-[#0f172a]">{error || 'Campaign not found'}</h2>
        <Link href="/home" className="text-[#1e3a8a] font-medium block">Back to home</Link>
      </div>
    );
  }

  const isDrawn = winners.length > 0;

  return (
    <div className="bg-[#fcf8fa] min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-[#e2e8f0] px-4 py-3 flex items-center gap-4 z-50">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-6 h-6 text-[#0f172a]" />
        </button>
        <h1 className="text-xl font-bold text-[#0f172a]">Winners</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Campaign Info */}
        <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-sm space-y-3 text-center">
          <h2 className="text-lg font-bold text-[#0f172a]">{campaign.title}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              campaign.status === CampaignStatus.DRAWN ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {campaign.status}
            </span>
            {campaign.drawAt && (
              <span className="text-[10px] font-medium text-[#94a3b8]">
                Drawn on {new Date(campaign.drawAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Winners List / Empty State */}
        {!isDrawn ? (
          <div className="text-center py-20 px-6 space-y-6 bg-white rounded-xl border border-[#e2e8f0] shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-[#1e3a8a]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0f172a]">Draw Pending</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                The winners haven&apos;t been selected yet. Stay tuned for the live draw!
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link 
                href={`/campaigns/${id}`}
                className="inline-flex items-center justify-center px-6 py-3 bg-black text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all"
              >
                View Campaign Details
              </Link>
              <Link 
                href="/home" 
                className="text-sm font-bold text-[#1e3a8a] hover:underline"
              >
                Browse other raffles
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#0f172a] px-1">
              <PartyPopper className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold">Official Results</h3>
            </div>
            
            <div className="space-y-4">
              {winners.map((winner) => (
                <div 
                  key={winner.prizeRank} 
                  className={`relative bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden p-5 flex items-center gap-4 ${
                    winner.prizeRank === 1 ? 'border-yellow-200 bg-gradient-to-br from-white to-yellow-50/30' : ''
                  }`}
                >
                  {/* Rank Indicator */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                    winner.prizeRank === 1 
                      ? 'bg-yellow-100 text-yellow-600' 
                      : winner.prizeRank === 2
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {winner.prizeRank === 1 ? (
                      <Trophy className="w-7 h-7" />
                    ) : (
                      <span className="text-xl font-black">#{winner.prizeRank}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-1">
                      <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                        {winner.prizeRank === 1 ? 'Grand Prize Winner' : `Rank #${winner.prizeRank}`}
                      </p>
                      <div className="flex items-center gap-1 text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded-lg">
                        <Ticket className="w-3 h-3" />
                        <span className="text-xs font-black">#{winner.ticketNumber}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-xl text-[#0f172a]">{winner.user.phone}</h4>
                    </div>
                  </div>

                  {winner.prizeRank === 1 && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-yellow-400 text-white text-[10px] font-black px-4 py-1 rotate-45 translate-x-3 -translate-y-1 shadow-sm">
                        GOLD
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 pt-6">
              <Link 
                href="/home" 
                className="w-full h-12 bg-black text-white font-bold rounded-xl flex items-center justify-center shadow-lg active:scale-[0.98] transition-all"
              >
                Join Next Raffle
              </Link>
              <button 
                onClick={() => router.back()}
                className="text-sm font-bold text-[#94a3b8] hover:text-[#0f172a] transition-colors"
              >
                Back to Campaign
              </button>
            </div>
          </div>
        )}

        {/* Verification Info */}
        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-sm flex gap-4">
          <Info className="w-6 h-6 text-[#94a3b8] shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#0f172a]">Fair Draw Verification</h4>
            <p className="text-xs text-[#45464d] leading-relaxed">
              All draws are conducted using a cryptographically secure random number generator and supervised by the National Lottery Administration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
