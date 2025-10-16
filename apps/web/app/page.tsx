"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Button,
  Checkbox,
  Badge,
  Skeleton,
  useToast,
  Tabs,
  StyledTabsList,
  StyledTabsTrigger,
  StyledTabsContent,
} from "@jn786r1btw20hb8skemndz59hs7sjkym/components";
import { Trash2, Plus, LogOut, LayoutDashboard, CheckCircle2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type Priority = "low" | "medium" | "high";
type FilterTab = "all" | "active" | "completed";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: number;
  priority: Priority;
  dueDate?: number;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  userId: string;
}

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, isLoading: sessionLoading } = authClient.useSession();

  // Form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");

  // Convex queries and mutations
  const tasks = useQuery(api.endpoints.tasks.list) as Task[] | undefined;
  const createTask = useMutation(api.endpoints.tasks.create);
  const toggleComplete = useMutation(api.endpoints.tasks.toggleComplete);
  const removeTask = useMutation(api.endpoints.tasks.remove);
  const clearCompleted = useMutation(api.endpoints.tasks.clearCompleted);

  // Redirect to login if not authenticated
  if (!sessionLoading && !session) {
    router.push("/login");
    return null;
  }

  // Filter tasks based on active tab
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    switch (filterTab) {
      case "active":
        return tasks.filter(task => !task.completed);
      case "completed":
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  }, [tasks, filterTab]);

  // Calculate counts
  const activeCount = useMemo(() => {
    return tasks?.filter(task => !task.completed).length ?? 0;
  }, [tasks]);

  const completedCount = useMemo(() => {
    return tasks?.filter(task => task.completed).length ?? 0;
  }, [tasks]);

  // Handle add task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
      toast({
        title: "Error",
        description: "Task title cannot be empty",
        type: "danger",
      });
      return;
    }

    try {
      await createTask({
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
      });

      setNewTaskTitle("");
      setNewTaskPriority("medium");

      toast({
        title: "Success",
        description: "Task added successfully",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
        type: "danger",
      });
    }
  };

  // Handle toggle task completion
  const handleToggleComplete = async (taskId: Id<"tasks">) => {
    try {
      await toggleComplete({ id: taskId });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task",
        type: "danger",
      });
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId: Id<"tasks">) => {
    try {
      await removeTask({ id: taskId });
      toast({
        title: "Success",
        description: "Task deleted successfully",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete task",
        type: "danger",
      });
    }
  };

  // Handle clear completed
  const handleClearCompleted = async () => {
    if (completedCount === 0) {
      toast({
        title: "Info",
        description: "No completed tasks to clear",
        type: "info",
      });
      return;
    }

    try {
      await clearCompleted();
      toast({
        title: "Success",
        description: `Cleared ${completedCount} completed task${completedCount !== 1 ? 's' : ''}`,
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear completed tasks",
        type: "danger",
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
      toast({
        title: "Success",
        description: "Logged out successfully",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log out",
        type: "danger",
      });
    }
  };

  // Get priority badge variant
  const getPriorityVariant = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "subtle";
    }
  };

  // Loading state
  if (sessionLoading) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Tasks</h1>
          <p className="mt-1 text-sm text-neutral-muted">
            {activeCount} active, {completedCount} completed
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Add Task Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <Button type="submit" variant="primary">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tasks</CardTitle>
            {completedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCompleted}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Clear Completed
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filterTab} onValueChange={(value) => setFilterTab(value as FilterTab)}>
            <StyledTabsList className="w-full">
              <StyledTabsTrigger value="all" className="flex-1">
                All ({tasks?.length ?? 0})
              </StyledTabsTrigger>
              <StyledTabsTrigger value="active" className="flex-1">
                Active ({activeCount})
              </StyledTabsTrigger>
              <StyledTabsTrigger value="completed" className="flex-1">
                Completed ({completedCount})
              </StyledTabsTrigger>
            </StyledTabsList>

            <StyledTabsContent value={filterTab}>
              {!tasks ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-neutral-muted">
                    {filterTab === "all" && "No tasks yet. Add one to get started!"}
                    {filterTab === "active" && "No active tasks. Great job!"}
                    {filterTab === "completed" && "No completed tasks yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <div
                      key={task._id}
                      className={`flex items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-muted/50 ${
                        task.completed ? "opacity-60" : ""
                      }`}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleComplete(task._id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm font-medium ${
                              task.completed
                                ? "line-through text-neutral-muted"
                                : "text-text-primary"
                            }`}
                          >
                            {task.title}
                          </p>
                          <Badge variant={getPriorityVariant(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="mt-1 text-xs text-neutral-muted">
                            {task.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-neutral-muted">
                          Created {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-danger hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </StyledTabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
