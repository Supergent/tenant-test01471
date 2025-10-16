import type { QueryCtx } from "../_generated/server";
import type { DataModel } from "../_generated/dataModel";

const TABLES = ["tasks", "threads", "messages", "scheduledTasks", "userPreferences"] as const;
const PRIMARY_TABLE = "tasks";

export async function loadSummary(ctx: QueryCtx, userId?: string) {
  const perTable: Record<string, number> = {};

  for (const table of TABLES) {
    // Use type assertion to tell TypeScript this is a valid table name
    const records = await ctx.db.query(table as keyof DataModel).collect();
    const scopedRecords = userId ? records.filter((record: any) => record.userId === userId) : records;
    perTable[table] = scopedRecords.length;
  }

  const totals = Object.values(perTable);
  const totalRecords = totals.reduce((sum, count) => sum + count, 0);

  // Get detailed task metrics
  const tasks = await ctx.db.query("tasks" as keyof DataModel).collect();
  const userTasks = userId ? tasks.filter((task: any) => task.userId === userId) : tasks;

  const completedTasks = userTasks.filter((task: any) => task.completed === true);
  const activeTasks = userTasks.filter((task: any) => task.completed === false);

  const now = Date.now();
  const overdueTasks = userTasks.filter(
    (task: any) => task.dueDate && task.dueDate < now && !task.completed
  );

  const highPriorityTasks = userTasks.filter((task: any) => task.priority === "high");
  const mediumPriorityTasks = userTasks.filter((task: any) => task.priority === "medium");
  const lowPriorityTasks = userTasks.filter((task: any) => task.priority === "low");

  return {
    totalRecords,
    perTable,
    activeUsers: perTable["users"] ?? 0,
    primaryTableCount: perTable[PRIMARY_TABLE] ?? 0,
    // Task-specific metrics
    totalTasks: userTasks.length,
    completedTasks: completedTasks.length,
    activeTasks: activeTasks.length,
    overdueTasks: overdueTasks.length,
    highPriorityTasks: highPriorityTasks.length,
    mediumPriorityTasks: mediumPriorityTasks.length,
    lowPriorityTasks: lowPriorityTasks.length,
    scheduledTasksCount: perTable["scheduledTasks"] ?? 0,
    threadsCount: perTable["threads"] ?? 0,
  };
}

export async function loadRecent(ctx: QueryCtx, userId?: string, limit = 5) {
  const records = await ctx.db.query(PRIMARY_TABLE as keyof DataModel).collect();
  const scopedRecords = userId ? records.filter((record: any) => record.userId === userId) : records;

  scopedRecords.sort((a: any, b: any) => {
    const aTime = a.updatedAt ?? 0;
    const bTime = b.updatedAt ?? 0;
    return bTime - aTime;
  });

  return scopedRecords.slice(0, limit).map((record: any) => ({
    _id: record._id,
    title: record.title ?? "Untitled",
    priority: record.priority ?? "medium",
    completed: record.completed ?? false,
    dueDate: record.dueDate ?? null,
    updatedAt: record.updatedAt ?? null,
  }));
}
