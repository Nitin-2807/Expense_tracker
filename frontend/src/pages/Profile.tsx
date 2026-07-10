import { useState, useEffect } from "react";
import { useClerk, useUser } from "@clerk/react";
import { Pencil, Mail, Calendar, Wallet, TrendingUp, TrendingDown, Tags, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, Button, Input, Modal, CardSkeleton, ErrorState } from "../components/ui";
import { useProfile } from "../hooks/useProfile";
import { cn } from "../lib/utils";

// ── Schemas ─────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

type ProfileForm = z.infer<typeof profileSchema>;

// ── Helpers ─────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Page ────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user } = useUser();
  const clerk = useClerk();
  const { data: profile, isLoading, isError, error, refetch } = useProfile();

  // ── Edit profile modal ──────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.fullName || "" },
  });

  // Reset form when opening
  useEffect(() => {
    if (editOpen) {
      resetProfile({ name: user?.fullName || "" });
      setEditError(null);
    }
  }, [editOpen, user?.fullName, resetProfile]);

  const onProfileUpdate = async (data: ProfileForm) => {
    setEditError(null);
    try {
      // Update name via Clerk's API
      await user?.update({ firstName: data.name });
      refetch();
      setEditOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { errors?: Array<{ message: string }> })?.errors?.[0]?.message ||
        "Failed to update profile";
      setEditError(msg);
    }
  };

  // ── Loading state ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────
  if (isError || !profile) {
    return (
      <ErrorState
        title="Failed to load profile"
        message={error instanceof Error ? error.message : "Unable to fetch profile data"}
        onRetry={() => refetch()}
      />
    );
  }

  // ── Data state ──────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Profile Header ─────────────────────────────────────────── */}
      <Card>
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--brand)_/_0.1)] text-xl font-bold text-[rgb(var(--brand))]">
            {getInitials(user?.fullName || user?.emailAddresses?.[0]?.emailAddress || "?")}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">
              {user?.fullName || "User"}
            </h2>
            <div className="mt-1 flex flex-col gap-1 text-sm text-[rgb(var(--muted-foreground))]">
              <span className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                {user?.emailAddresses?.[0]?.emailAddress || "—"}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Joined {formatDate(profile.created_at)}
              </span>
            </div>
          </div>

          {/* Edit */}
          <Button
            variant="outline"
            size="sm"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>
        </div>
      </Card>

      {/* ── Account Statistics ─────────────────────────────────────── */}
      <Card>
        <h3 className="mb-4 text-base font-semibold text-[rgb(var(--foreground))]">
          Account Statistics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile
            icon={<Wallet className="h-5 w-5" />}
            label="Transactions"
            value={profile.transaction_count}
          />
          <StatTile
            icon={<TrendingUp className="h-5 w-5" />}
            label="Income"
            value={profile.income_count}
            color="text-green-500"
          />
          <StatTile
            icon={<TrendingDown className="h-5 w-5" />}
            label="Expenses"
            value={profile.expense_count}
            color="text-red-500"
          />
          <StatTile
            icon={<Tags className="h-5 w-5" />}
            label="Categories"
            value={profile.category_count}
          />
        </div>
      </Card>

      {/* ── Account Management (Clerk) ─────────────────────────────── */}
      <Card>
        <h3 className="mb-2 text-base font-semibold text-[rgb(var(--foreground))]">
          Account Management
        </h3>
        <p className="mb-4 text-sm text-[rgb(var(--muted-foreground))]">
          Manage your password, security settings, and connected accounts in
          Clerk's account portal.
        </p>
        <Button
          variant="outline"
          icon={<ExternalLink className="h-4 w-4" />}
          onClick={() => clerk.openUserProfile()}
        >
          Open Account Settings
        </Button>
      </Card>

      {/* ── Edit Profile Modal ──────────────────────────────────────────── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        {editError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {editError}
          </div>
        )}
        <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
          <Input
            id="edit-name"
            label="Name"
            error={profileErrors.name?.message}
            {...registerProfile("name")}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={profileSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ── Stat Tile Sub-component ─────────────────────────────────────────────

function StatTile({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-[rgb(var(--border))] p-3">
      <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))] text-xs mb-1.5">
        {icon}
        <span>{label}</span>
      </div>
      <p className={cn("text-lg font-semibold text-[rgb(var(--foreground))]", color)}>
        {value}
      </p>
    </div>
  );
}
