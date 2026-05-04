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
  X,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { TicketStatus } from '@/types/api';
import { getErrorMessage } from '@/lib/errors';
import { Modal } from '@/components/ui/modal';
import { FormField } from '@/components/ui/form-field';

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

  // Parse multiple ticket IDs from URL (comma-separated)
  const ticketIds = ticketId.split(',').map(id => id.trim()).filter(id => id.length > 0);
  const isBulkPayment = ticketIds.length > 1;

  const [transactionId, setTransactionId] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showProofModal, setShowProofModal] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  // Fetch tickets - handle both single and multiple ticket IDs
  const { data: tickets, isLoading, error: queryError } = useQuery<MyTicket[]>({
    queryKey: ['tickets', ticketIds],
    queryFn: async () => {
      if (ticketIds.length === 1) {
        return [await apiClient.get(`/tickets/${ticketIds[0]}`)];
      } else {
        // For bulk payments, fetch all tickets individually
        const results = await Promise.all(
          ticketIds.map(id => apiClient.get(`/tickets/${id}`))
        );
        return results.map((r: any) => r.data);
      }
    },
    enabled: !!user && ticketIds.length > 0,
  });

  const displayTickets = Array.isArray(tickets) ? tickets : [];

  const submitMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/payments/${ticketIds.join(',')}/submit-proof`, {
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

  const copyToClipboard = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label || text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const displayError = error || getErrorMessage(queryError, '');

  if (!hasHydrated || !user || isLoading) {
    return <div className="p-10 text-center animate-pulse">Loading details...</div>;
  }

  if (displayError || !tickets?.length) {
    return (
      <div className="p-10 text-center space-y-4">
        <div className="text-4xl">Warning</div>
        <h2 className="text-xl font-bold text-[#0f172a]">
          {displayError || 'Tickets not found'}
        </h2>
        <Link href="/home" className="text-[#1e3a8a] font-medium block">
          Back to home
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#0f172a]">
            {isBulkPayment ? 'Bulk Payment Submitted!' : 'Payment Submitted!'}
          </h1>
          <p className="text-[#45464d]">
            {isBulkPayment
              ? `Your payment for ${displayTickets.length} tickets is being verified by our team. This usually takes 10-30 minutes.`
              : 'Your payment is being verified by our team. This usually takes 10-30 minutes.'}
          </p>
          {isBulkPayment && displayTickets.length > 0 && (
            <div className="bg-white/10 rounded-xl p-4 text-left">
              <p className="text-sm font-black text-white mb-2">Tickets being paid:</p>
              <div className="space-y-1">
                {displayTickets.map((ticket, index) => (
                  <div key={ticket.id} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/60">Ticket #{ticket.ticketNumber}</span>
                      <span className="text-sm font-black text-white">{ticket.campaign.title}</span>
                    </div>
                    <div className="text-sm font-black text-white">
                      {ticket.campaign.ticketPrice} ETB
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-sm font-black text-white">
                  Total:{' '}
                  {displayTickets
                    .reduce((sum, t) => sum + t.campaign.ticketPrice, 0)
                    .toLocaleString()}{' '}
                  ETB
                </p>
              </div>
            </div>
          )}
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

  const ticket = displayTickets[0];

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
            Payment Verification
          </p>
          <h1 className="text-2xl font-black text-white">Submit Proof</h1>
        </div>
      </header>

      <div className="px-6 py-6 relative z-10 space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-black text-[#f6d365] uppercase tracking-wider">
                Reserved Ticket
              </p>
              <h2 className="text-3xl font-black text-white">
                #{ticket.ticketNumber}
              </h2>
              <p className="font-bold text-white/80">{ticket.campaign.title}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">
                {ticket.campaign.ticketPrice} ETB
              </p>
              <div className="flex items-center gap-1 justify-end text-[#f6d365]">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">Reserved</span>
              </div>
            </div>
          </div>

          {ticket.reservedUntil ? (
            <div className="mt-4 rounded-[24px] bg-[#f6d365]/10 border border-[#f6d365]/20 p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#f6d365] shrink-0" />
              <p className="text-sm text-white/80 leading-tight">
                Finish payment within 5 minutes or the reservation expires and the number returns to the pool.
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <h3 className="font-black text-xl text-white px-1 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#f6d365]" />
            Payment Instructions
          </h3>
          <div className="space-y-3">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 flex items-center gap-4 group hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#f6d365]/20 flex items-center justify-center text-[#f6d365] shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#f6d365] uppercase tracking-tighter">
                  Telebirr Merchant
                </p>
                <p className="font-black text-white">889900</p>
              </div>
              <button
                onClick={() => copyToClipboard('889900', 'Telebirr')}
                className="p-3 text-white/40 hover:text-[#f6d365] hover:bg-white/10 rounded-xl transition-all"
                aria-label="Copy Telebirr Merchant Number"
              >
                {copiedText === 'Telebirr' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 flex items-center gap-4 group hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#f6d365]/20 flex items-center justify-center text-[#f6d365] shrink-0">
                <Landmark className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#f6d365] uppercase tracking-tighter">
                  CBE (Commercial Bank)
                </p>
                <p className="font-black text-white">1000123456789</p>
                <p className="text-[10px] text-white/50">Name: ETHIORaffle PLC</p>
              </div>
              <button
                onClick={() => copyToClipboard('1000123456789', 'CBE')}
                className="p-3 text-white/40 hover:text-[#f6d365] hover:bg-white/10 rounded-xl transition-all"
                aria-label="Copy CBE Account Number"
              >
                {copiedText === 'CBE' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Transaction ID / Ref Number"
            id="transactionId"
            required
            value={transactionId}
            onChange={setTransactionId}
            placeholder="Example: TB23X9..."
          />
          
          <FormField
            label="Proof Image URL (Mock)"
            id="proofUrl"
            type="url"
            required
            value={proofUrl}
            onChange={setProofUrl}
            placeholder="https://imgur.com/screenshot.png"
            hint="* Upload to Imgur or similar and paste the link for now."
          />

          {error ? (
            <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 font-bold flex justify-between items-center">
              {error}
              <button onClick={() => setError('')}><X className="h-4 w-4" /></button>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitMutation.isPending || !transactionId || !proofUrl}
            className="w-full h-14 bg-gradient-to-r from-[#f6d365] to-[#fda085] text-[#0f172a] font-black rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20 disabled:opacity-50 disabled:scale-100 active:scale-[0.98] transition-all mt-4"
          >
            {submitMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
            ) : (
              'Submit Payment Proof'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
