'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, ChevronRight, Copy, Loader2, Plus, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUser } from '@/hooks/useAuth';
import { useAddStaff, useNewPin, useRemoveStaff, useTeam, useTeamMember, useUpdateRights } from '@/hooks/useTeam';
import { PHONE_ERROR, toNigerianInternational } from '@/lib/phone';
import { RIGHTS, ROLE_DEFAULTS, ROLE_LABEL } from '@/lib/permissions';
import { cn, formatCurrency, getInitials } from '@/lib/utils';
import type { ActivityEntry, StaffRight, StaffRole, TeamMember } from '@/lib/types';

const LEVELS: { value: StaffRole; title: string }[] = [
  { value: 'attendant', title: 'Sales attendant' },
  { value: 'manager', title: 'Manager' },
  { value: 'viewer', title: 'Viewer' },
];

/** Pick a level (it ticks the usual boxes), then tick or untick any right. */
function RightsPicker({
  who,
  role,
  rights,
  onRoleChange,
  onRightsChange,
}: {
  who: string;
  role: StaffRole;
  rights: StaffRight[];
  onRoleChange: (role: StaffRole) => void;
  onRightsChange: (rights: StaffRight[]) => void;
}) {
  const toggle = (key: StaffRight) =>
    onRightsChange(rights.includes(key) ? rights.filter((r) => r !== key) : [...rights, key]);

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-sm font-medium">Start from</p>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              aria-pressed={role === level.value}
              onClick={() => {
                onRoleChange(level.value);
                onRightsChange(ROLE_DEFAULTS[level.value]);
              }}
              className={cn(
                'rounded-full border px-3 py-1 text-sm',
                role === level.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
              )}
            >
              {level.title}
            </button>
          ))}
        </div>
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">{`What ${who} can do`}</legend>
        <div className="divide-y divide-border">
          {RIGHTS.map((r) => (
            <label key={r.key} className="flex cursor-pointer items-start gap-3 py-2">
              <input
                type="checkbox"
                checked={rights.includes(r.key)}
                onChange={() => toggle(r.key)}
                className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              />
              <span>
                <span className="block text-sm">{r.label}</span>
                {r.hint && (
                  <span className={cn('block text-xs', r.warn ? 'text-amber-500' : 'text-muted-foreground')}>{r.hint}</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="text-xs text-muted-foreground">You can change these any time from their page.</p>
    </div>
  );
}

/** "0803 456 7890" from "+2348034567890" */
const localPhone = (phone: string) => {
  const national = phone.replace(/^\+234/, '0');
  return national.replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3');
};

const lastSeen = (iso: string | null) => {
  if (!iso) return 'not logged in yet';
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 2) return 'active now';
  if (minutes < 60) return `last seen ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `last seen ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.round(hours / 24);
  return `last seen ${days} ${days === 1 ? 'day' : 'days'} ago`;
};

const time = (iso: string) =>
  new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });

/** One line of plain English for each thing a staff member did. */
function describe(entry: ActivityEntry): { text: string; warn?: boolean } {
  const d = entry.details || {};
  switch (entry.action) {
    case 'transaction.created':
      return { text: `Recorded ${d.type === 'expense' ? 'an expense' : 'a sale'}: ${d.item}, ${formatCurrency(d.amount)}` };
    case 'transaction.edited':
      return {
        text: `Changed ${d.after?.item || 'a sale'}: ${formatCurrency(d.before?.amount)} → ${formatCurrency(d.after?.amount)}`,
        warn: true,
      };
    case 'transaction.deleted':
      return { text: `Deleted ${d.item}, ${formatCurrency(d.amount)}`, warn: true };
    case 'staff.login':
      return { text: 'Logged in' };
    case 'stock.counted':
      return { text: `Counted ${d.item}: ${d.before} → ${d.after} (${d.reason})`, warn: true };
    case 'stock.price_changed':
      return { text: `Changed the price of ${d.item}: ${formatCurrency(d.before)} → ${formatCurrency(d.after)}`, warn: true };
    default:
      return { text: entry.action };
  }
}

export function TeamPanel() {
  const { data: user } = useUser();
  const { data: team, isLoading } = useTeam();
  const [adding, setAdding] = useState(false);
  const [openMember, setOpenMember] = useState<string | null>(null);
  const [newLogin, setNewLogin] = useState<{ name: string; phone: string; pin: string } | null>(null);

  const members = Array.isArray(team) ? team : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Your team</CardTitle>
          <CardDescription>Staff can record sales. Only you can see profit and reports.</CardDescription>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Add staff
        </Button>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0 px-6 pb-2">
        <div className="flex items-center gap-3 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {getInitials(user?.ownerName || 'You')}
          </span>
          <div>
            <p className="text-sm font-medium">{user?.ownerName ? `${user.ownerName} (you)` : 'You'}</p>
            <p className="text-xs text-muted-foreground">Owner</p>
          </div>
        </div>

        {isLoading && <Skeleton className="my-3 h-10 w-full" />}

        {!isLoading && members.length === 0 && (
          <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
            <UserPlus className="h-5 w-5 shrink-0" />
            No staff yet. Add someone so they can record sales on their own phone.
          </div>
        )}

        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setOpenMember(m.id)}
            className="flex w-full items-center gap-3 py-3 text-left hover:bg-accent/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {getInitials(m.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {ROLE_LABEL[m.role]} · {lastSeen(m.last_active_at)}
              </p>
            </div>
            {m.permissions?.includes('record_sales') && (
              <div className="text-right">
                <p className="text-sm font-medium">{formatCurrency(m.today?.total ?? 0)}</p>
                <p className="text-xs text-muted-foreground">today</p>
              </div>
            )}
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </CardContent>

      <AddStaffDialog
        open={adding}
        onOpenChange={setAdding}
        onAdded={(login) => {
          setAdding(false);
          setNewLogin(login);
        }}
      />
      <PinDialog login={newLogin} onClose={() => setNewLogin(null)} />
      <MemberDialog
        memberId={openMember}
        member={members.find((m) => m.id === openMember) || null}
        onClose={() => setOpenMember(null)}
        onNewPin={(login) => {
          setOpenMember(null);
          setNewLogin(login);
        }}
      />
    </Card>
  );
}

function AddStaffDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (login: { name: string; phone: string; pin: string }) => void;
}) {
  const addStaff = useAddStaff();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('attendant');
  const [rights, setRights] = useState<StaffRight[]>(ROLE_DEFAULTS.attendant);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setPhone('');
    setRole('attendant');
    setRights(ROLE_DEFAULTS.attendant);
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Enter the staff member's name");
    const international = toNigerianInternational(phone);
    if (!international) return setError(PHONE_ERROR);
    if (rights.length === 0) return setError('Tick at least one thing they can do');
    setError(null);
    addStaff.mutate(
      { name: name.trim(), phone: international, role, permissions: rights },
      {
        onSuccess: (res) => {
          reset();
          onAdded({ name: res.member.name, phone: res.member.phone, pin: res.pin });
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <form onSubmit={submit} noValidate className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add staff</DialogTitle>
            <DialogDescription>They&apos;ll log in on their own phone with a PIN you give them.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="staff-name" required>Name</Label>
            <Input id="staff-name" placeholder="Tolu" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-phone-new" required>Their phone number</Label>
            <Input
              id="staff-phone-new"
              type="tel"
              inputMode="tel"
              placeholder="0803 456 7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <RightsPicker
            who={name.trim().split(/\s+/)[0] || 'they'}
            role={role}
            rights={rights}
            onRoleChange={setRole}
            onRightsChange={setRights}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={addStaff.isPending} className="w-full sm:w-auto">
              {addStaff.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add and get PIN
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PinDialog({
  login,
  onClose,
}: {
  login: { name: string; phone: string; pin: string } | null;
  onClose: () => void;
}) {
  if (!login) return null;
  const pretty = `${login.pin.slice(0, 3)} ${login.pin.slice(3)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Kuditraka staff login\nPhone: ${localPhone(login.phone)}\nPIN: ${login.pin}`);
      toast.success('Copied');
    } catch {
      toast.error("Couldn't copy. Write the PIN down instead.");
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader className="items-center text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <DialogTitle>{login.name} can log in now</DialogTitle>
        </DialogHeader>
        <div className="rounded-lg bg-muted p-4 text-center">
          <p className="text-xs text-muted-foreground">Phone</p>
          <p className="font-medium">{localPhone(login.phone)}</p>
          <p className="mt-3 text-xs text-muted-foreground">PIN</p>
          <p className="text-3xl font-semibold tracking-[0.25em]">{pretty}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {`Give ${login.name} this PIN and keep it private. You won't see it here again, but you can make a new one any time.`}
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={copy}>
            <Copy className="h-4 w-4" />
            Copy login details
          </Button>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberDialog({
  memberId,
  member,
  onClose,
  onNewPin,
}: {
  memberId: string | null;
  member: TeamMember | null;
  onClose: () => void;
  onNewPin: (login: { name: string; phone: string; pin: string }) => void;
}) {
  const { data: detail, isLoading } = useTeamMember(memberId);
  const newPin = useNewPin();
  const removeStaff = useRemoveStaff();
  const [confirm, setConfirm] = useState<'pin' | 'remove' | 'rights' | null>(null);
  const updateRights = useUpdateRights();
  const [editRole, setEditRole] = useState<StaffRole>('attendant');
  const [editRights, setEditRights] = useState<StaffRight[]>([]);

  if (!memberId) return null;
  const name = detail?.name || member?.name || 'Staff';
  const close = () => {
    setConfirm(null);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        {confirm === 'remove' ? (
          <>
            <DialogHeader>
              <DialogTitle>Remove {name}?</DialogTitle>
              <DialogDescription>
                {name} will be logged out right away and can&apos;t log in again. Everything {name} recorded stays in your books.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={removeStaff.isPending}
                onClick={() =>
                  removeStaff.mutate(memberId, {
                    onSuccess: () => {
                      toast.success(`${name} removed`);
                      close();
                    },
                  })
                }
              >
                Remove
              </Button>
            </DialogFooter>
          </>
        ) : confirm === 'rights' ? (
          <>
            <DialogHeader>
              <DialogTitle>{`What ${name} can do`}</DialogTitle>
              <DialogDescription>Changes work straight away. {name} doesn&apos;t need to log in again.</DialogDescription>
            </DialogHeader>
            <RightsPicker who={name} role={editRole} rights={editRights} onRoleChange={setEditRole} onRightsChange={setEditRights} />
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
              <Button
                disabled={updateRights.isPending || editRights.length === 0}
                onClick={() =>
                  updateRights.mutate(
                    { id: memberId, role: editRole, permissions: editRights },
                    {
                      onSuccess: () => {
                        toast.success('Saved');
                        setConfirm(null);
                      },
                    }
                  )
                }
              >
                Save
              </Button>
            </DialogFooter>
          </>
        ) : confirm === 'pin' ? (
          <>
            <DialogHeader>
              <DialogTitle>Make a new PIN for {name}?</DialogTitle>
              <DialogDescription>The old PIN stops working and {name} is logged out.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
              <Button
                disabled={newPin.isPending}
                onClick={() =>
                  newPin.mutate(memberId, {
                    onSuccess: (res) => {
                      setConfirm(null);
                      onNewPin({ name: res.member.name, phone: res.member.phone, pin: res.pin });
                    },
                  })
                }
              >
                Make new PIN
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{name}</DialogTitle>
              <DialogDescription>
                {member ? `${ROLE_LABEL[member.role]} · ${localPhone(member.phone)}` : ''}
              </DialogDescription>
            </DialogHeader>

            {isLoading || !detail ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{`What ${name} can do`}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditRole(detail.role);
                        setEditRights(detail.permissions || []);
                        setConfirm('rights');
                      }}
                    >
                      Change
                    </Button>
                  </div>
                  <ul className="mt-1 text-xs text-muted-foreground">
                    {RIGHTS.filter((r) => detail.permissions?.includes(r.key)).map((r) => (
                      <li key={r.key}>{`✓ ${r.label}`}</li>
                    ))}
                  </ul>
                </div>
                {detail.permissions?.includes('record_sales') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Sales today</p>
                      <p className="font-semibold">{formatCurrency(detail.today?.total ?? 0)}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">This week</p>
                      <p className="font-semibold">{formatCurrency(detail.week?.total ?? 0)}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="mb-1 text-sm font-medium">What {name} did</p>
                  {detail.activity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nothing yet.</p>
                  ) : (
                    <ul className="divide-y divide-border text-sm">
                      {detail.activity.map((a) => {
                        const line = describe(a);
                        return (
                          <li key={a.id} className="flex justify-between gap-3 py-2">
                            <span className={cn(line.warn && 'text-amber-500')}>{line.text}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">{time(a.created_at)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">This history can&apos;t be changed or deleted.</p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirm('pin')}>New PIN</Button>
              <Button variant="destructive" onClick={() => setConfirm('remove')}>Remove</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
