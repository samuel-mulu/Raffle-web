'use client';

import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { getLandingPath } from '@/lib/role-ui';
import { useAuthStore } from '@/stores/auth-store';
import { Role } from '@/types/api';

export default function WinnersHubPage() {
  const user = useAuthStore((state) => state.user);
  const showWorkspaceLink = !!user && user.role !== Role.USER;

  return (
    <div className="min-h-screen bg-[#fcf8fa] px-4 py-10 pb-24">
      <div className="rounded-3xl border border-[#e2e8f0] bg-white p-8 text-center shadow-sm space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
          <Trophy className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#0f172a]">
            Winners are published per campaign
          </h1>
          <p className="text-sm leading-relaxed text-[#45464d]">
            Open any raffle to view its live draw status or official winners
            after the campaign is drawn.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/buyer/campaigns"
            className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white"
          >
            Browse Campaigns
          </Link>

          {showWorkspaceLink ? (
            <Link
              href={getLandingPath(user)}
              className="text-sm font-bold text-[#1e3a8a]"
            >
              Open {user?.role === Role.ADMIN ? 'Admin Dashboard' : 'Creator Studio'}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
