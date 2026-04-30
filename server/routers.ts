import { COOKIE_NAME, CATEGORIES } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure, editorProcedure } from "./_core/trpc";
import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";
import {
  createPost,
  updatePost,
  deletePost,
  getPostById,
  getPostBySlug,
  getAllPublishedPosts,
  getPostsByCategory,
  searchPosts,
  getAllPostsAdmin,
  getDashboardStats,
  incrementPostViews,
  getAllUsers,
  updateUserRole,
} from "./db";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";

// Helper to generate slug from title
function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  return slug || `post-${Date.now()}`;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Public posts routes
  posts: router({
    getPublished: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await getAllPublishedPosts(input.limit, input.offset);
      }),

    getByCategory: publicProcedure
      .input(z.object({ category: z.enum(CATEGORIES), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await getPostsByCategory(input.category, input.limit, input.offset);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await getPostBySlug(input.slug);
        if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
        return post;
      }),

    incrementView: publicProcedure
      .input(z.object({ slug: z.string() }))
      .mutation(async ({ input }) => {
        const post = await getPostBySlug(input.slug);
        if (post) await incrementPostViews(post.id);
        return { ok: true };
      }),

    search: publicProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ input }) => {
        return await searchPosts(input.query);
      }),
  }),

  // Admin and Editor routes
  admin: router({
    getStats: adminProcedure.query(async () => {
      return await getDashboardStats();
    }),

    // User management (Admin only)
    users: router({
      getAll: adminProcedure.query(async () => {
        return await getAllUsers();
      }),
      updateRole: adminProcedure
        .input(z.object({ userId: z.number(), role: z.enum(["admin", "editor", "reader"]) }))
        .mutation(async ({ input }) => {
          await updateUserRole(input.userId, input.role);
          return { success: true };
        }),
    }),

    // Posts management (Admin and Editor)
    posts: router({
      getById: editorProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          const post = await getPostById(input.id);
          if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
          return post;
        }),

      getAll: editorProcedure
        .input(z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
          category: z.string().optional(),
          search: z.string().optional(),
        }))
        .query(async ({ input }) => {
          return await getAllPostsAdmin(input.limit, input.offset, input.category, input.search);
        }),

      create: editorProcedure
        .input(z.object({
          title: z.string().min(1),
          subtitle: z.string().optional(),
          content: z.string().min(1),
          category: z.enum(CATEGORIES),
          author: z.string().min(1),
          imageUrl: z.string().optional(),
          imageKey: z.string().optional(),
          published: z.boolean().default(false),
        }))
        .mutation(async ({ input }) => {
          const slug = generateSlug(input.title);
          const existing = await getPostBySlug(slug);
          if (existing) throw new TRPCError({ code: "CONFLICT", message: "A post with this title already exists" });

          return await createPost({
            ...input,
            slug,
            publishedAt: input.published ? new Date() : null,
          });
        }),

      update: editorProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().optional(),
          subtitle: z.string().optional(),
          content: z.string().optional(),
          category: z.enum(CATEGORIES).optional(),
          author: z.string().optional(),
          imageUrl: z.string().optional(),
          imageKey: z.string().optional(),
          published: z.boolean().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...updates } = input;
          const post = await getPostById(id);
          if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

          let slug = post.slug;
          if (updates.title && updates.title !== post.title) {
            slug = generateSlug(updates.title);
            const existing = await getPostBySlug(slug);
            if (existing && existing.id !== id) throw new TRPCError({ code: "CONFLICT", message: "A post with this title already exists" });
          }

          let publishedAt = post.publishedAt;
          if (updates.published !== undefined && updates.published !== post.published) {
            publishedAt = updates.published ? new Date() : null;
          }

          return await updatePost(id, { ...updates, slug, publishedAt });
        }),

      delete: editorProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const post = await getPostById(input.id);
          if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
          await deletePost(input.id);
          return { success: true };
        }),

      uploadImage: editorProcedure
        .input(z.object({ filename: z.string(), data: z.string() }))
        .mutation(async ({ input }) => {
          try {
            const buffer = Buffer.from(input.data, "base64");
            const detected = await fileTypeFromBuffer(buffer);
            if (!detected || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(detected.mime)) {
              throw new TRPCError({ code: "BAD_REQUEST", message: "Formato de imagem inválido" });
            }
            const key = `posts/${Date.now()}-${input.filename}`;
            const { url, key: storageKey } = await storagePut(key, buffer, detected.mime);
            return { url, key: storageKey };
          } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to upload image" });
          }
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
