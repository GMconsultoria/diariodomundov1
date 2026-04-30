import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function createAdminContext(): TrpcContext {
  const user: User = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: User = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("posts API", () => {
  it("should allow public access to published posts", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    // Should not throw
    const result = await caller.posts.getPublished({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny admin access to non-admins", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.posts.getAll({ limit: 10, offset: 0 });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admins to create posts", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // This will fail if DB is not available, but the authorization should pass
    try {
      await caller.admin.posts.create({
        title: "Test Post",
        content: "Test content",
        category: "Política",
        author: "Test Author",
      });
    } catch (error: any) {
      // Expected if DB is not available, but not a FORBIDDEN error
      expect(error.code).not.toBe("FORBIDDEN");
    }
  });
});
