"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
} from "@jn786r1btw20hb8skemndz59hs7sjkym/components";

function MetricCard({
  title,
  value,
  subtitle,
  variant = "default",
  loading = false,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  loading?: boolean;
}) {
  const bgColors = {
    default: "bg-background border-border",
    primary: "bg-primary text-primary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
  };

  return (
    <Card className={variant !== "default" ? bgColors[variant] : ""}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className={`mt-2 text-xs ${variant === "default" ? "text-text-secondary" : "opacity-80"}`}>
                {subtitle}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, "danger" | "warning" | "subtle"> = {
    high: "danger",
    medium: "warning",
    low: "subtle",
  };

  return (
    <Badge variant={variants[priority] || "subtle"}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

function StatusBadge({ completed }: { completed: boolean }) {
  return (
    <Badge variant={completed ? "success" : "outline"}>
      {completed ? "Completed" : "Active"}
    </Badge>
  );
}

function formatDate(timestamp: number | null) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function formatDueDate(timestamp: number | null) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return <span className="text-danger">Overdue</span>;
  if (days === 0) return <span className="text-warning">Today</span>;
  if (days === 1) return "Tomorrow";
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const summary = useQuery(api.endpoints.dashboard.summary);
  const recent = useQuery(api.endpoints.dashboard.recent, { limit: 10 });

  // Check authentication
  useEffect(() => {
    if (session === null) {
      router.push("/login");
    }
  }, [session, router]);

  const loading = !summary || !recent;

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  // Show nothing while checking auth
  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-96 w-full max-w-5xl" />
      </div>
    );
  }

  // Redirect is handled in useEffect
  if (session === null) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Task Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Analytics and metrics for your tasks
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Tasks
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Tasks"
          value={summary?.totalTasks ?? 0}
          subtitle="All time"
          variant="primary"
          loading={loading}
        />
        <MetricCard
          title="Active Tasks"
          value={summary?.activeTasks ?? 0}
          subtitle="In progress"
          loading={loading}
        />
        <MetricCard
          title="Completed Tasks"
          value={summary?.completedTasks ?? 0}
          subtitle="Finished"
          variant="success"
          loading={loading}
        />
        <MetricCard
          title="Overdue Tasks"
          value={summary?.overdueTasks ?? 0}
          subtitle="Past due date"
          variant={summary?.overdueTasks && summary.overdueTasks > 0 ? "danger" : "default"}
          loading={loading}
        />
      </div>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-text-secondary">High Priority</p>
                {loading ? (
                  <Skeleton className="mt-2 h-7 w-16" />
                ) : (
                  <p className="mt-2 text-2xl font-bold text-danger">
                    {summary?.highPriorityTasks ?? 0}
                  </p>
                )}
              </div>
              <Badge variant="danger">High</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-text-secondary">Medium Priority</p>
                {loading ? (
                  <Skeleton className="mt-2 h-7 w-16" />
                ) : (
                  <p className="mt-2 text-2xl font-bold text-warning">
                    {summary?.mediumPriorityTasks ?? 0}
                  </p>
                )}
              </div>
              <Badge variant="warning">Medium</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-text-secondary">Low Priority</p>
                {loading ? (
                  <Skeleton className="mt-2 h-7 w-16" />
                ) : (
                  <p className="mt-2 text-2xl font-bold text-text-primary">
                    {summary?.lowPriorityTasks ?? 0}
                  </p>
                )}
              </div>
              <Badge variant="subtle">Low</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Scheduled Tasks"
          value={summary?.scheduledTasksCount ?? 0}
          subtitle="Recurring automations"
          loading={loading}
        />
        <MetricCard
          title="AI Threads"
          value={summary?.threadsCount ?? 0}
          subtitle="Assistant conversations"
          loading={loading}
        />
      </div>

      {/* Recent Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-7 w-full" />
                  </TableCell>
                </TableRow>
              ) : recent && recent.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-sm text-text-secondary"
                  >
                    No tasks yet. Create your first task to see it here.
                  </TableCell>
                </TableRow>
              ) : (
                recent?.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <PriorityBadge priority={task.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge completed={task.completed} />
                    </TableCell>
                    <TableCell>{formatDueDate(task.dueDate)}</TableCell>
                    <TableCell className="text-text-secondary">
                      {formatDate(task.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Completion Rate Card */}
      {!loading && summary && summary.totalTasks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-success transition-all duration-500"
                    style={{
                      width: `${(summary.completedTasks / summary.totalTasks) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-text-primary">
                  {Math.round((summary.completedTasks / summary.totalTasks) * 100)}%
                </p>
                <p className="text-xs text-text-secondary">
                  {summary.completedTasks} of {summary.totalTasks} tasks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
