import { type Doc } from "@/convex/_generated/dataModel";

export type ServiceMenu = Doc<"services">;
export type Staff = Doc<"staffs"> & {
  user: Doc<"users">;
};

export type LastReservation = {
  menus: ServiceMenu[];
  staff: Staff | null;
  timestamp: string;
};

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
}