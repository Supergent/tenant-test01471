// Auto-generated type stubs for development
// These will be replaced by 'npx convex dev'

export type DataModel = {
  "tasks": any;
  "threads": any;
  "messages": any;
  "scheduledTasks": any;
  "userPreferences": any;
};

export type TableNames = "tasks" | "threads" | "messages" | "scheduledTasks" | "userPreferences";

export type Id<TableName extends TableNames> = string & { __tableName: TableName };
export type Doc<TableName extends TableNames> = any;
