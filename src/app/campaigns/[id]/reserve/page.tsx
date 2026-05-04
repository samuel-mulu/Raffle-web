'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Search, Ticket, X, Loader2, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Campaign } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';

export default function TicketPickerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { user, hasHydrated } = useAuthGuard();

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRange, setCurrentRange] = useState(0);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(5 * 60); // 5 minutes in seconds

  const rangeSize = 100;

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => apiClient.get<Campaign>(`/campaigns/${id}`),
    enabled: !!user,
  });

  const { data: takenData } = useQuery({
    queryKey: ['campaign-taken', id],
    queryFn: () =>
      apiClient.get<{ takenNumbers: number[] }>(
        `/campaigns/${id}/tickets/taken`
      ),
    enabled: !!campaign && !!user,
  });

  const reserveMutation = useMutation({
    mutationFn: (ticketNumber: number) =>
      apiClient.post<{ id: string }>(
        `/campaigns/${id}/tickets/reserve`,
        { ticketNumber }
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-taken', id] });
      router.push(`/payment/${data.id}`);
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Failed to reserve ticket'));
      queryClient.invalidateQueries({ queryKey: ['campaign-taken', id] });
    },
  });

  const takenNumbers = takenData?.takenNumbers || [];

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReserve = () => {
    if (!selectedNumber) {
      return;
    }

    if (takenNumbers.includes(selectedNumber)) {
      setError('This number is already taken');
      return;
    }

    reserveMutation.mutate(selectedNumber);
  };

  if (!hasHydrated || !user || isLoading) {
    return <div className="p-10 text-center animate-pulse">Loading tickets...</div>;
  }

  if (!campaign) {
    return <div className="p-10 text-center text-red-500">Campaign not found</div>;
  }

  const totalRanges = Math.ceil(campaign.totalTickets / rangeSize);
  const ranges = Array.from({ length: totalRanges }, (_, index) => ({
    start: index * rangeSize + 1,
    end: Math.min((index + 1) * rangeSize, campaign.totalTickets),
  }));

  const numbersInRange = Array.from(
    { length: ranges[currentRange].end - ranges[currentRange].start + 1 },
    (_, index) => ranges[currentRange].start + index
  );

  return (
    <div className="bg-[#0f172a] min-h-screen pb-32 text-white">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 -left-[10%] w-[50%] h-[30%] bg-[#1e3a8a]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-[#f6d365]/10 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl px-6 py-4 flex items-center gap-4 border-b border-white/5">
        <button 
          onClick={() => router.back()} 
          className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f6d365]">
            Ticket Selection
          </p>
          <h1 className="text-2xl font-black text-white">Choose Your Number</h1>
        </div>
      </header>

      <div className="px-6 py-6 relative z-10 space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-[24px] bg-white/5 overflow-hidden shrink-0 border border-white/5">
              {campaign.imageUrl ? (
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black text-white truncate">{campaign.title}</h2>
              <p className="text-sm font-bold text-[#f6d365] mt-1">
                {campaign.ticketPrice} ETB per ticket
              </p>
              <p className="text-xs text-white/50 mt-2">
                Total: {campaign.totalTickets} tickets available
              </p>
            </div>
          </div>
          
          {/* Timer Display */}
          <div className="mt-4 rounded-[24px] bg-[#f6d365]/10 border border-[#f6d365]/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f6d365]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#f6d365]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#f6d365] uppercase tracking-wider">
                  Reservation Window
                </p>
                <p className="text-sm font-bold text-white">
                  Complete payment within {formatTime(timeLeft)}
                </p>
              </div>
            </div>
            <div className={`text-lg font-black ${timeLeft < 60 ? 'text-rose-400' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="number"
            placeholder="Search specific number..."
            value={searchQuery}
            onChange={(event) => {
              const nextValue = event.target.value;
              const parsedValue = parseInt(nextValue, 10);

              setSearchQuery(nextValue);

              if (parsedValue > 0 && parsedValue <= campaign.totalTickets) {
                setSelectedNumber(parsedValue);
                setCurrentRange(Math.floor((parsedValue - 1) / rangeSize));
              }
            }}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#f6d365]/20 focus:border-[#f6d365]/50 transition-all text-white placeholder-white/30"
          />
        </div>

        <div className="overflow-x-auto flex gap-2 pb-2 scrollbar-hide">
          {ranges.map((range, index) => (
            <button
              key={`${range.start}-${range.end}`}
              onClick={() => setCurrentRange(index)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                currentRange === index
                  ? 'bg-[#f6d365] text-[#0f172a] border-transparent'
                  : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
              }`}
            >
              {range.start}-{range.end}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {numbersInRange.map((num) => {
            const isTaken = takenNumbers.includes(num);
            const isSelected = selectedNumber === num;

            return (
              <button
                key={num}
                disabled={isTaken}
                onClick={() => setSelectedNumber(num)}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-black transition-all border ${
                  isSelected
                    ? 'bg-[#f6d365] text-[#0f172a] border-transparent scale-95 shadow-lg shadow-orange-500/20'
                    : isTaken
                      ? 'bg-white/5 text-white/20 border-white/10 cursor-not-allowed opacity-40'
                      : 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-sm">{num}</span>
                {isTaken ? (
                  <span className="text-[8px] uppercase tracking-tighter opacity-50">
                    Taken
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 font-bold flex justify-between items-center">
            {error}
            <button onClick={() => setError('')}><X className="h-4 w-4" /></button>
          </div>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-6 bg-[#0f172a]/90 backdrop-blur-2xl border-t border-white/5 shadow-[0_-4px_6px_rgba(0,0,0,0.3)] z-40">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#f6d365]" />
            <span className="text-sm font-medium text-white/60">
              {selectedNumber ? `Selected: #${selectedNumber}` : 'Select a number'}
            </span>
          </div>
          <span className="text-lg font-bold text-white">
            {selectedNumber ? `${campaign.ticketPrice} ETB` : '-'}
          </span>
        </div>
        <button
          onClick={handleReserve}
          disabled={!selectedNumber || reserveMutation.isPending}
          className="w-full h-14 bg-gradient-to-r from-[#f6d365] to-[#fda085] text-[#0f172a] font-black rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20 disabled:opacity-50 disabled:scale-100 active:scale-[0.98] transition-all"
        >
          {reserveMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Reserve Ticket'
          )}
        </button>
      </div>
    </div>
  );
}
