import type { UserRole } from "@/types/auth";

export function routeAfterLogin(role: UserRole): string {
  switch (role) {
    case "FARMER":
    case "KITCHEN":
      return "/dashboard";
    case "ORGANISATION":
      return "/organisation/requests";
    case "ADMIN":
      return "/admin/users";
    case "CUSTOMER":
      return "/market";
    case "DRIVER":
      return "/deliveries";
  }
}
