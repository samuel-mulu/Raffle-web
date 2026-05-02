'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Landmark,
  Wallet,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { TicketStatus } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';

interface MyTicket {
  id: string;
  ticketNumber: number;
  status: TicketStatus;
  reservedUntil?: string;
  campaign: {
    id: string;
    title: string;
    ticketPrice: number;
  };
}

export default function PaymentProofPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const router = useRouter();
  const { ticketId } = use(params);
  const { user, hasHydrated } = useAuthGuard();

  const [transactionId, setTransactionId] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { data: ticket, isLoading, error: queryError } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => apiClient.get<MyTicket>(`/tickets/${ticketId}`),
    enabled: !!user,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/payments/${ticketId}/submit-proof`, {
        transactionId,
        proofUrl,
      }),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Failed to submit proof'));
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!transactionId || !proofUrl) {
      return;
    }

    submitMutation.mutate();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!hasHydrated || !user || isLoading) {
    return <div className="p-10 text-center animate-pulse">Loading details...</div>;
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#0f172a]">Proof Submitted!</h1>
          <p className="text-[#45464d]">
            Your payment is being verified by our team. This usually takes 10-30
            minutes.
          </p>
        </div>
        <Link
          href="/me/tickets"
          className="w-full h-12 bg-black text-white font-bold rounded-xl flex items-center justify-center shadow-lg"
        >
          Go to My Tickets
        </Link>
      </div>
    );
  }

  const displayError = error || getErrorMessage(queryError, '');

  if (displayError || !ticket) {
    return (
      <div className="p-10 text-center space-y-4">
        <div className="text-4xl">Warning</div>
        <h2 className="text-xl font-bold text-[#0f172a]">
          {displayError || 'Ticket not found'}
        </h2>
        <Link href="/home" className="text-[#1e3a8a] font-medium block">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fcf8fa] min-h-screen pb-32">
      <header className="sticky top-0 bg-white border-b border-[#e2e8f0] px-4 py-3 flex items-center gap-4 z-50">
        <button 
          onClick={() => router.back()} 
          className="p-1"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-[#0f172a]" />
        </button>
        <h1 className="text-xl font-bold text-[#0f172a]">Payment Proof</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                Reserved Ticket
              </p>
              <h2 className="text-2xl font-black text-[#1e3a8a]">
                #{ticket.ticketNumber}
              </h2>
              <p className="font-bold text-[#0f172a]">{ticket.campaign.title}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#0f172a]">
                {ticket.campaign.ticketPrice} ETB
              </p>
              <div className="flex items-center gap-1 justify-end text-orange-600">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">Reserved</span>
              </div>
            </div>
          </div>

          {ticket.reservedUntil ? (
            <div className="bg-orange-50 p-3 rounded-lg flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-600 shrink-0" />
              <p className="text-xs text-orange-800 leading-tight">
                Finish payment within 5 minutes or the reservation expires and
                the number returns to the pool.
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-[#0f172a] px-1">Payment Instructions</h3>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-tighter">
                  Telebirr Merchant
                </p>
                <p className="font-bold text-[#0f172a]">889900</p>
              </div>
              <button
                onClick={() => copyToClipboard('889900')}
                className="p-2 text-[#94a3b8] hover:text-[#1e3a8a]"
                aria-label="Copy Telebirr Merchant Number"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <Landmark className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-tighter">
                  CBE (Commercial Bank)
                </p>
                <p className="font-bold text-[#0f172a]">1000123456789</p>
                <p className="text-[10px] text-[#45464d]">Name: ETHIORaffle PLC</p>
              </div>
              <button
                onClick={() => copyToClipboard('1000123456789')}
                className="p-2 text-[#94a3b8] hover:text-[#1e3a8a]"
                aria-label="Copy CBE Account Number"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#45464d] mb-1.5 ml-1">
                Transaction ID / Ref Number
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                placeholder="Example: TB23X9..."
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#45464d] mb-1.5 ml-1">
                Proof Image URL (Mock)
              </label>
              <input
                type="text"
                required
                value={proofUrl}
                onChange={(event) => setProofUrl(event.target.value)}
                placeholder="https://imgur.com/screenshot.png"
                className="w-full px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all"
              />
              <p className="text-[10px] text-[#94a3b8] mt-2 ml-1">
                * Upload to Imgur or similar and paste the link for now.
              </p>
            </div>
          </div>

          {error ? (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          ) : null}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitMutation.isPending || !transactionId || !proofUrl}
              className="w-full h-12 bg-black text-white font-bold rounded-xl shadow-lg disabled:bg-gray-400 active:scale-[0.98] transition-all"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Payment Proof'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
