'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Loader2,
  Shield,
  Ticket,
  Users,
  WalletCards,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { AdminUserListItem, Campaign, CampaignStatus, Role } from '@/types/api';

type PendingPayment = {
  id: string;
};

export default function AdminOverviewPage() {
  const { user, hasHydrated } = useAuthGuard({ roles: [Role.ADMIN] });

  const campaignsQuery = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: () => apiClient.get<Campaign[]>('/admin/campaigns'),
    enabled: !!user,
  });

  const paymentsQuery = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => apiClient.get<PendingPayment[]>('/admin/payments/pending'),
    enabled: !!user,
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get<AdminUserListItem[]>('/admin/users'),
    enabled: !!user,
  });

  if (
    !hasHydrated ||
    !user ||
    campaignsQuery.isLoading ||
    paymentsQuery.isLoading ||
    usersQuery.isLoading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0f172a]" />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-[#94a3b8]">
            Loading admin overview
          </p>
        </div>
      </div>
    );
  }

  const campaigns = campaignsQuery.data || [];
  const pendingPayments = paymentsQuery.data || [];
  const users = usersQuery.data || [];
  const pendingReview = campaigns.filter(
    (campaign) => campaign.status === CampaignStatus.PENDING_APPROVAL,
  );

  const cards = [
    {
      label: 'Campaigns',
      value: String(campaigns.length),
      icon: Ticket,
      href: '/admin/campaigns',
    },
    {
      label: 'Pending Review',
      value: String(pendingReview.length),
      icon: Clock3,
      href: '/admin/campaigns',
    },
    {
      label: 'Pending Payments',
      value: String(pendingPayments.length),
      icon: WalletCards,
      href: '/admin/payments',
    },
    {
      label: 'Users',
      value: String(users.length),
      icon: Users,
      href: '/admin/users',
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f7efe4_0%,_#f7f9fc_40%,_#f9fbff_100%)] px-6 py-6 pb-28">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[36px] border border-white/80 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f172a] text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#94a3b8]">
                Platform admin
              </p>
              <h1 className="text-3xl font-black tracking-tight text-[#0f172a]">
                Control tower
              </h1>
              <p className="text-sm text-[#64748b]">
                Keep reviews, staff accounts, payments, and draws moving smoothly.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="rounded-[28px] border border-[#edf2f8] bg-[#fbfdff] p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f172a] text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-3xl font-black tracking-tight text-[#0f172a]">
                    {card.value}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#94a3b8]">
                    {card.label}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-[36px] border border-white/80 bg-white p-7 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94a3b8]">
            Priority queue
          </p>
          <div className="mt-5 space-y-3">
            {pendingReview.slice(0, 4).map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-[24px] border border-[#edf2f8] bg-[#fbfdff] px-4 py-4"
              >
                <p className="text-sm font-black text-[#0f172a]">{campaign.title}</p>
                <p className="mt-1 text-xs text-[#64748b]">
                  {campaign.creator?.name || campaign.creator?.phone || 'Unassigned creator'}
                </p>
              </div>
            ))}
            {pendingReview.length === 0 ? (
              <div className="rounded-[24px] bg-[#f8fafc] px-4 py-6 text-sm text-[#64748b]">
                No campaigns are waiting for review right now.
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/admin/campaigns"
              className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-[#0f172a] px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white"
            >
              <BarChart3 className="h-4 w-4" />
              Open campaigns
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-[#dae4ef] bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#0f172a]"
            >
              <CheckCircle2 className="h-4 w-4" />
              Manage staff
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
