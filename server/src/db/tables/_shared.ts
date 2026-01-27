import { sql } from "drizzle-orm";

export const idDefault = sql`(lower(hex(randomblob(16))))`;

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export type AdminActionType =
  | "CreateProduct"
  | "UpdateProduct"
  | "DeleteProduct"
  | "ManageUser"
  | "RefundOrder"
  | "Other";
