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
          className: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black',
          icon: <Trophy className="w-3.5 h-3.5" />,
          description: 'You won the prize!',
        };
      case TicketStatus.PAID:
        return {
          label: 'Confirmed',
          className: 'bg-gradient-to-r from-[#1e3a8a] to-blue-600 text-white',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          description: 'Entry is active',
        };
      case TicketStatus.PAYMENT_PENDING:
        return {
          label: 'Verifying',
          className: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30',
          icon: <Clock className="w-3.5 h-3.5" />,
          description: 'Pending approval',
        };
      case TicketStatus.RESERVED:
        return {
          label: 'Reserved',
          className: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/30',
          icon: <Clock className="w-3.5 h-3.5" />,
          description: 'Payment required',
        };
      case TicketStatus.CANCELLED:
        return {
          label: 'Expired',
          className: 'bg-white/5 text-white/40 border border-white/10',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          description: 'Reservation ended',
        };
      default:
        return {
          label: status,
          className: 'bg-white/5 text-white/40 border border-white/10',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          description: '',
        };
    }
  };

  return (
    <div className="bg-[#0f172a] min-h-screen pb-32 text-white">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 -left-[10%] w-[50%] h-[30%] bg-[#1e3a8a]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-[#f6d365]/10 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 bg-[#0f172a]/80 backdrop-blur-xl z-40 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f6d365]">
              My Tickets
            </p>
            <h1 className="text-2xl font-black text-white">Ticket Collection</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-all" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-all" aria-label="Filter">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-6 py-6 relative z-10">
        {tickets.length === 0 ? (
          <div className="text-center py-32 px-6 space-y-8">
            <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto border border-white/10">
              <TicketIcon className="w-12 h-12 text-white/20" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-white">Empty Pocket?</h3>
              <p className="text-white/40 font-medium leading-relaxed max-w-[240px] mx-auto">
                You haven&apos;t joined any raffles yet. Start your winning journey now!
              </p>
            </div>
            <Link
              href="/home"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#f6d365] to-[#fda085] text-[#0f172a] font-black rounded-2xl shadow-2xl shadow-orange-500/10 active:scale-[0.98] transition-all"
            >
              Explore Raffles
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => {
              const statusConfig = getStatusConfig(ticket.status);

              return (
                <div
                  key={ticket.id}
                  className="relative rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl overflow-hidden group active:scale-[0.98] transition-all"
                >
                  {/* Visual Ticket Notch Effect */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#0f172a] rounded-r-full border-y border-r border-white/10" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#0f172a] rounded-l-full border-y border-l border-white/10" />

                  <div className="p-6 flex gap-5">
                    <div className="w-20 h-20 rounded-[24px] bg-white/5 overflow-hidden shrink-0 border border-white/5">
                      {ticket.campaign.imageUrl ? (
                        <img src={ticket.campaign.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10">
                          <TicketIcon className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="font-black text-white truncate text-xl pr-2 leading-none">
                          {ticket.campaign.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                         <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statusConfig.className}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                      <p className="text-[10px] font-black text-[#f6d365] uppercase tracking-widest mb-1">Number</p>
                      <p className="text-3xl font-black text-white leading-none tracking-tighter">#{ticket.ticketNumber}</p>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-white/5 border-t border-dashed border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/40">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <span className="text-xs font-bold">
                        {statusConfig.description}
                      </span>
                    </div>

                    {ticket.status === TicketStatus.RESERVED ? (
                      <Link
                        href={`/payment/${ticket.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#f6d365] to-[#fda085] text-[#0f172a] text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all"
                      >
                        Pay Now <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 text-[#f6d365]">
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}

