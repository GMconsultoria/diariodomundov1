import { COOKIE_NAME, CATEGORIES } from "@shared/const";
import { getSessionCookieOptions } from "./_core/sdk";
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure, editorProcedure } from "./_core/trpc";
import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";
import {
  createPost,
  updatePost,
  deletePost,
  deleteUser,
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
  createContactMessage,
  getAllContactMessages,
  markMessageAsRead,
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
    deleteMe: publicProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await deleteUser(ctx.user.id);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
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
      .input(z.object({ query: z.string().min(2).max(100).trim() }))
      .query(async ({ input }) => {
        return await searchPosts(input.query.trim());
      }),
  }),

  // Admin and Editor routes
  admin: router({
    getStats: adminProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await getDashboardStats(input?.startDate, input?.endDate);
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

    // Posts management
    posts: router({
      getById: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          const post = await getPostById(input.id);
          if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
          return post;
        }),

      getAll: adminProcedure
        .input(z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
          category: z.string().optional(),
          search: z.string().optional(),
          author: z.string().optional(),
        }))
        .query(async ({ input }) => {
          return await getAllPostsAdmin(input.limit, input.offset, input.category, input.search, input.author);
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
          publishedAt: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const slug = generateSlug(input.title);
          const existing = await getPostBySlug(slug);
          if (existing) throw new TRPCError({ code: "CONFLICT", message: "A post with this title already exists" });

          let publishedAtDate = input.publishedAt ? new Date(input.publishedAt) : null;
          if (input.published && !publishedAtDate) {
            publishedAtDate = new Date();
          }

          const { publishedAt, ...postData } = input;

          return await createPost({
            ...postData,
            slug,
            publishedAt: publishedAtDate,
          });
        }),

      update: adminProcedure
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
          publishedAt: z.string().optional(),
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
          if (updates.publishedAt) {
            publishedAt = new Date(updates.publishedAt);
          } else if (updates.published === true && !post.published) {
            // If turning on publishing and no date was set, use now
            publishedAt = new Date();
          }

          const { publishedAt: _, ...finalUpdates } = updates;

          return await updatePost(id, { ...finalUpdates, slug, publishedAt });
        }),

      delete: adminProcedure
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
            // Convert to Data URI for direct DB storage
            const dataUri = `data:${detected.mime};base64,${input.data}`;
            return { url: dataUri, key: "embedded" };
          } catch (error: any) {
            console.error("[Upload] Critical failure:", error);
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
              code: "INTERNAL_SERVER_ERROR", 
              message: `Erro no servidor: ${error.message || "Falha na comunicação com o storage"}` 
            });
          }
        }),
    }),
  }),
  
  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        await createContactMessage(input);
        
        if (resend) {
          try {
            await resend.emails.send({
              from: "noreply@diariodomundo.com.br",
              to: process.env.ADMIN_EMAIL || "admin@diariodomundo.com.br",
              reply_to: input.email,
              subject: `Nova mensagem de ${input.name}: ${input.subject}`,
              html: `
                <p><strong>De:</strong> ${input.name} (${input.email})</p>
                <p><strong>Assunto:</strong> ${input.subject}</p>
                <hr />
                <p>${input.message.replace(/\\n/g, '<br>')}</p>
              `
            });
          } catch (error) {
            console.error("[Email] Failed to send:", error);
          }
        }
        
        console.log(`[Contact] Nova mensagem de ${input.name} (${input.email}): ${input.subject}`);
        return { success: true };
      }),
    
    getAll: adminProcedure.query(async () => {
      return await getAllContactMessages();
    }),
    
    markAsRead: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markMessageAsRead(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
