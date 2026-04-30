import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
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
  getPostStats,
  incrementPostViews,
} from "./db";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";



// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Public posts routes
  posts: router({
    // Get all published posts with pagination
    getPublished: publicProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await getAllPublishedPosts(input.limit, input.offset);
      }),

    // Get posts by category
    getByCategory: publicProcedure
      .input(
        z.object({
          category: z.enum(["Política", "Economia", "Investimentos", "Ciência e Tecnologia", "Curiosidade"]),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await getPostsByCategory(input.category, input.limit, input.offset);
      }),

    // Get single post by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await getPostBySlug(input.slug);
        if (!post) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
        }
        // Increment views
        await incrementPostViews(post.id);
        return post;
      }),

    // Search posts
    search: publicProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ input }) => {
        return await searchPosts(input.query);
      }),

  }),

  // Admin posts routes
  admin: router({
    getStats: adminProcedure.query(async () => {
      return await getPostStats();
    }),
    posts: router({
      // Get post by ID for editing
      getById: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          const post = await getPostById(input.id);
          if (!post) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
          }
          return post;
        }),

      // Get all posts (published and unpublished) for admin
      getAll: adminProcedure
        .input(
          z.object({
            limit: z.number().default(20),
            offset: z.number().default(0),
          })
        )
        .query(async ({ input }) => {
          return await getAllPostsAdmin(input.limit, input.offset);
        }),

      // Create new post
      create: adminProcedure
        .input(
          z.object({
            title: z.string().min(1),
            subtitle: z.string().optional(),
            content: z.string().min(1),
            category: z.enum(["Política", "Economia", "Investimentos", "Ciência e Tecnologia", "Curiosidade"]),
            author: z.string().min(1),
            imageUrl: z.string().optional(),
            imageKey: z.string().optional(),
            published: z.boolean().default(false),
          })
        )
        .mutation(async ({ input }) => {
          const slug = generateSlug(input.title);
          
          // Check if slug already exists
          const existing = await getPostBySlug(slug);
          if (existing) {
            throw new TRPCError({ code: "CONFLICT", message: "A post with this title already exists" });
          }

          return await createPost({
            title: input.title,
            slug,
            subtitle: input.subtitle,
            content: input.content,
            category: input.category,
            author: input.author,
            imageUrl: input.imageUrl,
            imageKey: input.imageKey,
            published: input.published,
            publishedAt: input.published ? new Date() : null,
          });
        }),

      // Update post
      update: adminProcedure
        .input(
          z.object({
            id: z.number(),
            title: z.string().optional(),
            subtitle: z.string().optional(),
            content: z.string().optional(),
            category: z.enum(["Política", "Economia", "Investimentos", "Ciência e Tecnologia", "Curiosidade"]).optional(),
            author: z.string().optional(),
            imageUrl: z.string().optional(),
            imageKey: z.string().optional(),
            published: z.boolean().optional(),
          })
        )
        .mutation(async ({ input }) => {
          const { id, ...updates } = input;
          const post = await getPostById(id);
          
          if (!post) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
          }

          // If title changed, regenerate slug
          let slug = post.slug;
          if (updates.title && updates.title !== post.title) {
            slug = generateSlug(updates.title);
            const existing = await getPostBySlug(slug);
            if (existing && existing.id !== id) {
              throw new TRPCError({ code: "CONFLICT", message: "A post with this title already exists" });
            }
          }

          // Handle publish status change
          let publishedAt = post.publishedAt;
          if (updates.published !== undefined && updates.published !== post.published) {
            if (updates.published) {
              publishedAt = new Date();
            } else {
              publishedAt = null;
            }
          }

          return await updatePost(id, {
            ...updates,
            slug,
            publishedAt,
          });
        }),

      // Delete post
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const post = await getPostById(input.id);
          if (!post) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
          }

          await deletePost(input.id);
          return { success: true };
        }),

      // Upload image
      uploadImage: adminProcedure
        .input(
          z.object({
            filename: z.string(),
            data: z.string(), // base64 encoded
          })
        )
        .mutation(async ({ input }) => {
          try {
            const buffer = Buffer.from(input.data, "base64");
            const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
            const detected = await fileTypeFromBuffer(buffer);
            if (!detected || !ALLOWED_TYPES.includes(detected.mime)) {
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
