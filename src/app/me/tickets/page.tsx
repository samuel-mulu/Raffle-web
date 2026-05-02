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
  ArrowLeft,
  Search,
  Filter,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { TicketStatus } from '@/types/api';
import { useRouter } from 'next/navigation';

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
    imageUrl?: string;
  };
}

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthGuard();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => apiClient.get<MyTicket[]>('/me/tickets'),
    enabled: !!user,
  });

  if (!hasHydrated || !user || isLoading) {
    return (
      <div className="bg-white min-h-screen p-6 space-y-6">
        <div className="h-10 w-48 bg-gray-100 rounded-2xl animate-pulse" />
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-40 bg-gray-50 rounded-[32px] animate-pulse" />
        ))}
      </div>
    );
  }

  const getStatusConfig = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.WINNER:
        return {
          label: 'Winner',
          className: 'bg-yellow-400 text-black',
          icon: <Trophy className="w-3.5 h-3.5" />,
          description: 'You won the prize!',
        };
      case TicketStatus.PAID:
        return {
          label: 'Confirmed',
          className: 'bg-[#1e3a8a] text-white',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          description: 'Entry is active',
        };
      case TicketStatus.PAYMENT_PENDING:
        return {
          label: 'Verifying',
          className: 'bg-blue-100 text-blue-700',
          icon: <Clock className="w-3.5 h-3.5" />,
          description: 'Pending approval',
        };
      case TicketStatus.RESERVED:
        return {
          label: 'Reserved',
          className: 'bg-orange-100 text-orange-700',
          icon: <Clock className="w-3.5 h-3.5" />,
          description: 'Payment required',
        };
      case TicketStatus.CANCELLED:
        return {
          label: 'Expired',
          className: 'bg-gray-100 text-gray-500',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          description: 'Reservation ended',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-600',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          description: '',
        };
    }
  };

  return (
    <div className="bg-white min-h-screen pb-32">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-[#0f172a]">My Tickets</h1>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400" aria-label="Filter">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {tickets.length === 0 ? (
          <div className="text-center py-32 px-6 space-y-8">
            <div className="w-24 h-24 bg-[#fcf8fa] rounded-[40px] flex items-center justify-center mx-auto shadow-inner">
              <TicketIcon className="w-12 h-12 text-gray-300" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-[#0f172a]">Empty Pocket?</h3>
              <p className="text-gray-400 font-medium leading-relaxed max-w-[240px] mx-auto">
                You haven&apos;t joined any raffles yet. Start your winning journey now!
              </p>
            </div>
            <Link
              href="/home"
              className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-black rounded-2xl shadow-xl active:scale-[0.98] transition-all"
            >
              Explore Raffles
            </Link>
          </div>
        ) : (
          tickets.map((ticket) => {
            const statusConfig = getStatusConfig(ticket.status);

            return (
              <div
                key={ticket.id}
                className="relative bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col group active:scale-[0.98] transition-all"
              >
                {/* Visual Ticket Notch Effect */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#fcf8fa] rounded-r-full border-y border-r border-gray-100" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#fcf8fa] rounded-l-full border-y border-l border-gray-100" />

                <div className="p-5 flex gap-5">
                  <div className="w-20 h-20 rounded-[24px] bg-gray-100 overflow-hidden shrink-0 shadow-inner">
                    {ticket.campaign.imageUrl ? (
                      <img src={ticket.campaign.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <TicketIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <h2 className="font-black text-[#0f172a] truncate text-lg pr-2 leading-none">
                        {ticket.campaign.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                       <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statusConfig.className}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                      <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <p className="text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest mb-1">Number</p>
                    <p className="text-3xl font-black text-[#0f172a] leading-none tracking-tighter">#{ticket.ticketNumber}</p>
                  </div>
                </div>

                <div className="px-5 py-4 bg-[#fcf8fa] border-t border-dashed border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#45464d]">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-xs font-bold">
                      {statusConfig.description}
                    </span>
                  </div>

                  {ticket.status === TicketStatus.RESERVED ? (
                    <Link
                      href={`/payment/${ticket.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg"
                    >
                      Pay Now <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 text-[#1e3a8a]">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {ticket.campaign.drawAt
                          ? new Date(ticket.campaign.drawAt).toLocaleDateString()
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

