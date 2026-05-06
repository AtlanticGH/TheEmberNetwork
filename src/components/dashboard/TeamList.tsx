import { useMemo, useState } from 'react'
import { addTeamMember, createTeam } from '@/lib/teams'

type Membership = {
  team_id: string
  role: 'owner' | 'admin' | 'member'
  teams: { id: string; name: string; owner_user_id: string; created_at: string } | null
}

export function TeamList({ memberships }: { memberships: Membership[] }) {
  const [teamName, setTeamName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const [inviteTeamId, setInviteTeamId] = useState<string>('')
  const [inviteUserId, setInviteUserId] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member')
  const [inviting, setInviting] = useState(false)

  const teams = useMemo(() => memberships.filter((m) => m.teams), [memberships])

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Teams</p>
          <h2 className="mt-2 text-2xl font-semibold">Workspaces</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Create a team, invite collaborators, and manage access with RLS-backed roles.
          </p>
        </div>
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200">
          {teams.length}
        </span>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Create team</p>
        <div className="mt-3 flex gap-2">
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
          />
          <button
            type="button"
            disabled={creating}
            className="shrink-0 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={async () => {
              setError('')
              setCreating(true)
              try {
                await createTeam(teamName)
                setTeamName('')
              } catch (e: any) {
                setError(e?.message || 'Unable to create team.')
              } finally {
                setCreating(false)
              }
            }}
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {teams.length ? (
          teams.map((m) => (
            <div
              key={m.team_id}
              className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{m.teams?.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">Role: {m.role}</p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
                  onClick={() => {
                    setError('')
                    setInviteTeamId(m.team_id)
                  }}
                >
                  Invite user
                </button>
              </div>

              {inviteTeamId === m.team_id ? (
                <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Invite by user id</p>
                    <button
                      type="button"
                      className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                      onClick={() => setInviteTeamId('')}
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_140px]">
                    <input
                      value={inviteUserId}
                      onChange={(e) => setInviteUserId(e.target.value)}
                      placeholder="User UUID"
                      className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={inviting}
                    className="mt-3 inline-flex w-full justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    onClick={async () => {
                      setError('')
                      const userId = inviteUserId.trim()
                      if (!userId) {
                        setError('User id is required.')
                        return
                      }
                      setInviting(true)
                      try {
                        await addTeamMember({ teamId: m.team_id, userId, role: inviteRole })
                        setInviteUserId('')
                        setInviteTeamId('')
                      } catch (e: any) {
                        setError(e?.message || 'Unable to invite user.')
                      } finally {
                        setInviting(false)
                      }
                    }}
                  >
                    {inviting ? 'Inviting…' : 'Send invite'}
                  </button>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-zinc-300 p-7 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            No teams yet. Create one to get started.
          </div>
        )}
      </div>
    </section>
  )
}

