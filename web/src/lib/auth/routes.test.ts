import { describe, expect, it } from "vitest";
import { routeAfterLogin } from "./routes";
import type { UserRole } from "../../types/auth";

describe("routeAfterLogin", () => {
  it("returns leading-slash routes for every confirmed role", () => {
    const roles: UserRole[] = ["FARMER", "KITCHEN", "ORGANISATION", "CUSTOMER", "DRIVER", "ADMIN"];

    for (const role of roles) {
      expect(routeAfterLogin(role)).toMatch(/^\//);
    }
  });
});
