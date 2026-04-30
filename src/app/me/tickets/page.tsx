'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Ticket as TicketIcon,
  Trophy,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { TicketStatus } from '@/types/api';

interface MyTicket {
  id: string;
  ticketNumber: number;
  status: TicketStatus;
  createdAt: string;
  campaign: {
    id: string;
    title: string;
    ticketPrice: number;
    drawAt?: string;
  };
}

export default function MyTicketsPage() {
  const { user, hasHydrated } = useAuthGuard();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => apiClient.get<MyTicket[]>('/me/tickets'),
    enabled: !!user,
  });

  if (!hasHydrated || !user || isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-32 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  const getStatusConfig = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.WINNER:
        return {
          label: 'Winner',
          className: 'bg-yellow-100 text-yellow-700',
          icon: <Trophy className="w-3 h-3" />,
          description: 'Congratulations! You won.',
        };
      case TicketStatus.PAID:
        return {
          label: 'Paid',
          className: 'bg-green-100 text-green-700',
          icon: <CheckCircle2 className="w-3 h-3" />,
          description: 'Confirmed entry',
        };
      case TicketStatus.PAYMENT_PENDING:
        return {
          label: 'Verifying',
          className: 'bg-blue-100 text-blue-700',
          icon: <Clock className="w-3 h-3" />,
          description: 'Waiting for admin approval',
        };
      case TicketStatus.RESERVED:
        return {
          label: 'Reserved',
          className: 'bg-orange-100 text-orange-700',
          icon: <Clock className="w-3 h-3" />,
          description: 'Complete payment now',
        };
      case TicketStatus.CANCELLED:
        return {
          label: 'Cancelled',
          className: 'bg-gray-100 text-gray-600',
          icon: <AlertCircle className="w-3 h-3" />,
          description: 'Ticket cancelled',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-600',
          icon: <AlertCircle className="w-3 h-3" />,
          description: '',
        };
    }
  };

  return (
    <div className="bg-[#fcf8fa] min-h-screen p-4 pb-24">
      <header className="py-4">
        <h1 className="text-2xl font-bold text-[#0f172a]">My Tickets</h1>
      </header>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-20 px-6 space-y-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <TicketIcon className="w-10 h-10 text-[#94a3b8]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#0f172a]">
                No tickets yet
              </h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                You haven&apos;t joined any raffles yet. Choose a campaign to
                start winning!
              </p>
            </div>
            <Link
              href="/home"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all"
            >
              Browse Raffles
            </Link>
          </div>
        ) : (
          tickets.map((ticket) => {
            const statusConfig = getStatusConfig(ticket.status);

            return (
              <div
                key={ticket.id}
                className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col"
              >
                <div className="p-4 flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f6f3f5] flex items-center justify-center shrink-0">
                    <TicketIcon className="w-6 h-6 text-[#1e3a8a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h2 className="font-bold text-[#0f172a] truncate pr-2">
                        {ticket.campaign.title}
                      </h2>
                      <span className="font-black text-[#1e3a8a]">
                        #{ticket.ticketNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusConfig.className}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                      <span className="text-[10px] font-medium text-[#94a3b8]">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-[#fcf8fa] border-t border-[#e2e8f0] flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#45464d]">
                    <span className="text-xs font-medium">
                      {statusConfig.description}
                    </span>
                  </div>

                  {ticket.status === TicketStatus.RESERVED ? (
                    <Link
                      href={`/payment/${ticket.id}`}
                      className="flex items-center gap-1 text-xs font-bold text-[#1e3a8a] hover:underline"
                    >
                      Pay Now <ChevronRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#94a3b8]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">
                        {ticket.campaign.drawAt
                          ? new Date(
                              ticket.campaign.drawAt
                            ).toLocaleDateString()
                          : 'Draw TBD'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
