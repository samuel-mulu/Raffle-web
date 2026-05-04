'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Hash,
  Phone,
  ShieldAlert,
  XCircle,
  X,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { getErrorMessage } from '@/lib/errors';
import { Modal } from '@/components/ui/modal';

interface PendingPayment {
  id: string;
  amount: number;
  transactionId: string;
  proofUrl: string;
  createdAt: string;
  user: {
    phone: string;
  };
  ticket: {
    ticketNumber: number;
  };
  campaign: {
    title: string;
  };
}

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const { user, hasHydrated } = useAuthGuard();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  const {
    data: payments = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => apiClient.get<PendingPayment[]>('/admin/payments/pending'),
    enabled: !!user,
    retry: false,
  });

  const actionMutation = useMutation({
    mutationFn: ({
      paymentId,
      action,
    }: {
      paymentId: string;
      action: 'approve' | 'reject';
    }) => apiClient.post(`/admin/payments/${paymentId}/${action}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      setProcessingId(null);
    },
    onError: (mutationError: unknown, variables) => {
      setError(
        `Failed to ${variables.action} payment: ${getErrorMessage(
          mutationError,
          'Unknown error'
        )}`
      );
      setProcessingId(null);
    },
  });

  const handleAction = (paymentId: string, action: 'approve' | 'reject') => {
    if (
      action === 'reject' &&
      !confirm(
        'Are you sure you want to reject this payment? This will cancel the ticket.'
      )
    ) {
      return;
    }

    setProcessingId(paymentId);
    setError('');
    actionMutation.mutate({ paymentId, action });
  };

  if (!hasHydrated || !user || isLoading) {
    return (
      <div className="p-10 text-center animate-pulse">
        Loading pending payments...
      </div>
    );
  }

  const isAdmin = !queryError;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#0f172a]">Access Denied</h1>
          <p className="text-[#45464d]">
            Admin privileges are required to view this page.
          </p>
        </div>
        <Link href="/home" className="text-[#1e3a8a] font-bold">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] min-h-screen pb-24 text-white">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 -left-[10%] w-[50%] h-[30%] bg-[#1e3a8a]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-[#f6d365]/10 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl px-6 py-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f6d365]">
              Admin Control
            </p>
            <h1 className="text-2xl font-black text-white">Payment Verification</h1>
            <p className="text-xs text-white/50 mt-1">
              {payments.length} requests pending
            </p>
          </div>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
            }
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
            aria-label="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-6 py-6 relative z-10">
        {error ? (
          <div className="mb-5 rounded-[24px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 font-bold flex justify-between items-center">
            {error}
            <button onClick={() => setError('')}><X className="h-4 w-4" /></button>
          </div>
        ) : null}

        {payments.length === 0 ? (
          <div className="text-center py-32 px-6 space-y-8">
            <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto border border-white/10">
              <CheckCircle2 className="w-12 h-12 text-[#f6d365]" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-white">All caught up!</h3>
              <p className="text-white/40 font-medium">
                No pending payment verifications.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h2 className="font-black text-xl text-white">
                        {payment.campaign.title}
                      </h2>
                      <div className="flex items-center gap-2 text-[#f6d365]">
                        <Hash className="w-4 h-4" />
                        <span className="font-black tracking-tight">
                          Ticket #{payment.ticket.ticketNumber}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">
                        {payment.amount} ETB
                      </p>
                      <p className="text-[10px] font-bold text-white/40 uppercase">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-[#f6d365] uppercase">
                        Buyer
                      </p>
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Phone className="w-4 h-4 text-white/40" />
                        <span>{payment.user.phone}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-[#f6d365] uppercase">
                        Transaction ID
                      </p>
                      <p className="text-xs font-mono font-bold text-white/80 break-all">
                        {payment.transactionId}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedProofUrl(payment.proofUrl)}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#f6d365]/10 border border-[#f6d365]/20 text-[#f6d365] rounded-2xl text-sm font-black hover:bg-[#f6d365]/20 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View Proof Image
                    </button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-3 border-t border-white/5">
                  <button
                    onClick={() => handleAction(payment.id, 'reject')}
                    disabled={processingId !== null}
                    className="flex items-center justify-center gap-2 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm font-black hover:bg-rose-500/20 disabled:opacity-50 transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleAction(payment.id, 'approve')}
                    disabled={processingId !== null}
                    className="flex items-center justify-center gap-2 py-3 bg-[#f6d365] text-[#0f172a] rounded-2xl text-sm font-black hover:opacity-90 disabled:opacity-50 shadow-lg transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                </div>

                {processingId === payment.id ? (
                  <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6d365]"></div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proof Image Modal */}
      <Modal
        isOpen={!!selectedProofUrl}
        onClose={() => setSelectedProofUrl(null)}
        title="Payment Proof"
        subtitle="Review the submitted payment screenshot"
      >
        {selectedProofUrl && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <img
                src={selectedProofUrl}
                alt="Payment Proof"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(selectedProofUrl, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#f6d365]/10 border border-[#f6d365]/20 text-[#f6d365] rounded-2xl text-sm font-black hover:bg-[#f6d365]/20 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </button>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-sm font-black hover:bg-white/10 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
