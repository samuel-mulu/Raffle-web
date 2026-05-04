'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/errors';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { AdminUserListItem, Role } from '@/types/api';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user, hasHydrated } = useAuthGuard({ roles: [Role.ADMIN] });
  const [selectedRole, setSelectedRole] = useState<Role | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', selectedRole],
    queryFn: () =>
      apiClient.get<AdminUserListItem[]>(
        selectedRole === 'ALL'
          ? '/admin/users'
          : `/admin/users?role=${selectedRole}`,
      ),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post('/admin/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowCreateModal(false);
      setError('');
    },
    onError: (mutationError: unknown) => {
      setError(getErrorMessage(mutationError, 'Failed to create staff user'));
    },
  });

  if (!hasHydrated || !user || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0f172a]" />
          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-[#94a3b8]">
            Loading users
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f7efe4_0%,_#f7f9fc_40%,_#f9fbff_100%)] px-6 py-6 pb-28">
      <div className="rounded-[36px] border border-white/80 bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94a3b8]">
              Staff accounts
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0f172a]">
              Admin and creator access
            </h1>
            <p className="mt-2 text-sm text-[#64748b]">
              Create staff accounts by phone and monitor platform participation counts.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0f172a] px-5 text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Add staff
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(['ALL', Role.ADMIN, Role.CREATOR, Role.USER] as const).map((value) => (
            <button
              key={value}
              onClick={() => setSelectedRole(value)}
              className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
                selectedRole === value
                  ? 'bg-[#0f172a] text-white'
                  : 'bg-[#f3f7fb] text-[#64748b]'
              }`}
            >
              {value === 'ALL' ? 'All users' : value}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-5 rounded-[24px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {users.map((item) => (
            <article
              key={item.id}
              className="rounded-[30px] border border-[#edf2f8] bg-[#fbfdff] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-13 w-13 items-center justify-center rounded-3xl bg-[#0f172a] text-white">
                    {item.role === Role.ADMIN ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : item.role === Role.CREATOR ? (
                      <Sparkles className="h-5 w-5" />
                    ) : (
                      <Users className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-black tracking-tight text-[#0f172a]">
                      {item.name || 'Unnamed user'}
                    </p>
                    <p className="text-sm text-[#64748b]">{item.phone}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                      {item.role}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-2xl font-black text-[#0f172a]">
                      {item._count.campaigns}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                      Campaigns
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-2xl font-black text-[#0f172a]">
                      {item._count.tickets}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                      Tickets
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-2xl font-black text-[#0f172a]">
                      {item._count.payments}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                      Payments
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[540px] rounded-t-[38px] bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94a3b8]">
                  Create staff account
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#0f172a]">
                  Creator or admin profile
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4f7fb] text-[#64748b]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                createMutation.mutate({
                  phone: String(formData.get('phone') || ''),
                  name: String(formData.get('name') || ''),
                  role: String(formData.get('role') || Role.CREATOR),
                  bio: String(formData.get('bio') || ''),
                  avatarUrl: String(formData.get('avatarUrl') || ''),
                });
              }}
            >
              <input
                name="name"
                required
                placeholder="Full name"
                className="block w-full rounded-[20px] border border-[#dfe8f3] px-4 py-3.5 outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#1e3a8a]/10"
              />
              <input
                name="phone"
                required
                placeholder="+2519..."
                className="block w-full rounded-[20px] border border-[#dfe8f3] px-4 py-3.5 outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#1e3a8a]/10"
              />
              <select
                name="role"
                className="block w-full rounded-[20px] border border-[#dfe8f3] px-4 py-3.5 outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#1e3a8a]/10"
                defaultValue={Role.CREATOR}
              >
                <option value={Role.CREATOR}>Creator</option>
                <option value={Role.ADMIN}>Admin</option>
              </select>
              <input
                name="avatarUrl"
                placeholder="Avatar URL (optional)"
                className="block w-full rounded-[20px] border border-[#dfe8f3] px-4 py-3.5 outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#1e3a8a]/10"
              />
              <textarea
                name="bio"
                rows={4}
                placeholder="Short profile bio"
                className="block w-full rounded-[20px] border border-[#dfe8f3] px-4 py-3.5 outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#1e3a8a]/10"
              />
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-[22px] bg-[#0f172a] text-sm font-black uppercase tracking-[0.16em] text-white disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create staff user
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
