'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Search, Ticket } from 'lucide-react';
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
    <div className="bg-[#fcf8fa] min-h-screen pb-32">
      <header className="sticky top-0 bg-white border-b border-[#e2e8f0] px-4 py-3 flex items-center gap-4 z-50">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-6 h-6 text-[#0f172a]" />
        </button>
        <h1 className="text-xl font-bold text-[#0f172a]">Choose Number</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
            {campaign.imageUrl ? (
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-[#0f172a] truncate">{campaign.title}</h2>
            <p className="text-sm text-[#1e3a8a] font-bold">
              {campaign.ticketPrice} ETB / Ticket
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
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
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all"
          />
        </div>

        <div className="overflow-x-auto flex gap-2 pb-2 scrollbar-hide">
          {ranges.map((range, index) => (
            <button
              key={`${range.start}-${range.end}`}
              onClick={() => setCurrentRange(index)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                currentRange === index
                  ? 'bg-[#1e3a8a] text-white'
                  : 'bg-white border border-[#e2e8f0] text-[#45464d]'
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
                className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-[#1e3a8a] text-white border-transparent scale-95'
                    : isTaken
                      ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed opacity-60'
                      : 'bg-white text-[#0f172a] border-[#e2e8f0] hover:border-[#1e3a8a]'
                }`}
              >
                <span>{num}</span>
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
          <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 bg-white border-t border-[#e2e8f0] shadow-[0_-4px_6px_rgba(0,0,0,0.05)] z-40">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#94a3b8]" />
            <span className="text-sm font-medium text-[#45464d]">
              {selectedNumber ? `Selected: #${selectedNumber}` : 'Select a number'}
            </span>
          </div>
          <span className="text-lg font-bold text-[#0f172a]">
            {selectedNumber ? `${campaign.ticketPrice} ETB` : '-'}
          </span>
        </div>
        <button
          onClick={handleReserve}
          disabled={!selectedNumber || reserveMutation.isPending}
          className="w-full h-12 bg-black text-white font-bold rounded-xl flex items-center justify-center shadow-lg disabled:opacity-50 disabled:bg-gray-400 active:scale-[0.98] transition-all"
        >
          {reserveMutation.isPending ? 'Reserving...' : 'Reserve Ticket'}
        </button>
      </div>
    </div>
  );
}
