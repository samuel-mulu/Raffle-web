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
} from 'lucide-react';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { getErrorMessage } from '@/lib/errors';

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
    <div className="bg-[#fcf8fa] min-h-screen pb-24">
      <header className="sticky top-0 bg-white border-b border-[#e2e8f0] px-4 py-4 z-50">
        <h1 className="text-xl font-bold text-[#0f172a]">Payment Verification</h1>
        <p className="text-xs text-[#94a3b8] mt-0.5">
          {payments.length} requests pending
        </p>
      </header>

      <div className="p-4 space-y-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {payments.length === 0 ? (
          <div className="text-center py-20 px-6 space-y-4">
            <div className="text-4xl">Done</div>
            <h3 className="text-lg font-bold text-[#0f172a]">All caught up!</h3>
            <p className="text-[#94a3b8] text-sm">
              No pending payment verifications.
            </p>
            <button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
              }
              className="text-[#1e3a8a] font-bold text-sm"
            >
              Refresh List
            </button>
          </div>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="relative bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 bg-[#fcf8fa] border-b border-[#e2e8f0] flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="font-bold text-[#0f172a] text-sm">
                    {payment.campaign.title}
                  </h2>
                  <div className="flex items-center gap-2 text-[#1e3a8a]">
                    <Hash className="w-3.5 h-3.5" />
                    <span className="text-sm font-black tracking-tight">
                      Ticket #{payment.ticket.ticketNumber}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#0f172a]">
                    {payment.amount} ETB
                  </p>
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase">
                      Buyer
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#45464d]">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{payment.user.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase">
                      Transaction ID
                    </p>
                    <p className="text-xs font-mono font-bold text-[#0f172a] break-all">
                      {payment.transactionId}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={payment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-[#1e3a8a] rounded-lg text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    View Proof Image <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-4 grid grid-cols-2 gap-3 border-t border-[#e2e8f0]">
                <button
                  onClick={() => handleAction(payment.id, 'reject')}
                  disabled={processingId !== null}
                  className="flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 disabled:opacity-50 transition-all"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleAction(payment.id, 'approve')}
                  disabled={processingId !== null}
                  className="flex items-center justify-center gap-2 py-2.5 bg-[#1e3a8a] text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 shadow-md transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
              </div>

              {processingId === payment.id ? (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a8a]"></div>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
