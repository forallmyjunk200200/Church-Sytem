import type { Role } from "@/lib/types";

export function isManagerRole(role: Role | undefined | null): boolean {
  return role === "pastor" || role === "staff";
}
