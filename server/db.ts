import { eq, like, desc, and, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, posts, Post, InsertPost, postViews, contactMessages, InsertContactMessage, InsertPostView } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(users).where(eq(users.id, id));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "admin" | "editor" | "reader") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const query = sql`UPDATE \`users\` SET \`role\` = ${role} WHERE \`id\` = ${userId}`;
    await db.execute(query);
  } catch (error: any) {
    console.error(`[Database] Failed to update user role for ID ${userId}. Error: ${error.message}`);
    throw error;
  }
}

// Posts queries
export async function createPost(post: InsertPost): Promise<Post> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(posts).values(post);
  const [created] = await db.select().from(posts).where(eq(posts.id, result[0].insertId)).limit(1);
  if (!created) throw new Error("Failed to retrieve created post");
  return created;
}

export async function updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(posts).set(post).where(eq(posts.id, id));
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  
  return result[0];
}

export async function deletePost(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(posts).where(eq(posts.id, id));
  return true;
}

export async function getPostById(id: number): Promise<Post | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result[0];
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return result[0];
}

export async function getAllPublishedPosts(limit: number = 30, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      subtitle: posts.subtitle,
      slug: posts.slug,
      category: posts.category,
      author: posts.author,
      imageUrl: posts.imageUrl,
      imageKey: posts.imageKey,
      published: posts.published,
      views: posts.views,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getPostsByCategory(category: string, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      subtitle: posts.subtitle,
      slug: posts.slug,
      category: posts.category,
      author: posts.author,
      imageUrl: posts.imageUrl,
      imageKey: posts.imageKey,
      published: posts.published,
      views: posts.views,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(and(eq(posts.published, true), eq(posts.category, category as any)))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function searchPosts(query: string, limit: number = 50): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const searchTerm = `%${query}%`;
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      subtitle: posts.subtitle,
      slug: posts.slug,
      category: posts.category,
      author: posts.author,
      imageUrl: posts.imageUrl,
      imageKey: posts.imageKey,
      published: posts.published,
      views: posts.views,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(
      and(
        eq(posts.published, true),
        sql`(${posts.title} LIKE ${searchTerm} OR ${posts.subtitle} LIKE ${searchTerm} OR ${posts.content} LIKE ${searchTerm})`
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}

export async function getAllPostsAdmin(limit: number = 100, offset: number = 0, category?: string, search?: string, author?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let conditions = [];
  if (category) conditions.push(eq(posts.category, category as any));
  if (search) conditions.push(like(posts.title, `%${search}%`));
  if (author) conditions.push(like(posts.author, `%${author}%`));

  return await db
    .select({
      id: posts.id,
      title: posts.title,
      subtitle: posts.subtitle,
      slug: posts.slug,
      category: posts.category,
      author: posts.author,
      imageUrl: posts.imageUrl,
      imageKey: posts.imageKey,
      published: posts.published,
      views: posts.views,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getDashboardStats(startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Basic counters
    const [counts] = await db.select({
      totalPosts: sql<number>`COUNT(*)`,
      totalViews: sql<number>`COALESCE(SUM(${posts.views}), 0)`,
    }).from(posts);

    const [totalUsers] = await db.select({ 
      count: sql<number>`COUNT(*)` 
    }).from(users);

    // Views by day - Failsafe: Fetch and group in JS
    let dateFilter: any = undefined;
    if (startDate && endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = and(
        gte(postViews.viewedAt, new Date(startDate)),
        lte(postViews.viewedAt, endOfDay)
      );
    } else if (startDate) {
      dateFilter = gte(postViews.viewedAt, new Date(startDate));
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = gte(postViews.viewedAt, thirtyDaysAgo);
    }

    let viewsByDay: { day: string; count: number }[] = [];
    let rawViews: any[] = [];
    try {
      rawViews = await db.select({
        day: sql<string>`DATE_FORMAT(${postViews.viewedAt}, '%Y-%m-%d')`,
        count: sql<number>`COUNT(*)`
      })
      .from(postViews)
      .where(dateFilter)
      .groupBy(sql`DATE_FORMAT(${postViews.viewedAt}, '%Y-%m-%d')`)
      .orderBy(sql`DATE_FORMAT(${postViews.viewedAt}, '%Y-%m-%d')`);
    } catch (e) {
      console.error("[Database] Failed to fetch post_views:", e);
    }

    const viewMap = new Map(rawViews.map(v => [v.day, Number(v.count)]));
    
    // Always generate the date range to ensure LineChart has data points
    const start = startDate ? new Date(startDate) : (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
    const end = endDate ? new Date(endDate) : new Date();
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dayStr = `${year}-${month}-${day}`;
      viewsByDay.push({
        day: dayStr,
        count: viewMap.get(dayStr) || 0
      });
    }

    // Views by category - Aggregated in SQL
    const viewsByCategory = await db.select({
      category: posts.category,
      count: sql<number>`SUM(${posts.views})`,
    })
    .from(posts)
    .groupBy(posts.category);

    // Top 5 authors - Aggregated in SQL
    const topAuthors = await db.select({
      author: posts.author,
      count: sql<number>`COUNT(*)`,
    })
    .from(posts)
    .groupBy(posts.author)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(5);

    // Top 10 most viewed posts
    const topPosts = await db.select({
      id: posts.id,
      title: posts.title,
      views: posts.views,
      category: posts.category,
    })
    .from(posts)
    .orderBy(desc(posts.views))
    .limit(10);

    return {
      summary: {
        totalPosts: Number(counts?.totalPosts || 0),
        totalViews: Number(counts?.totalViews || 0),
        totalUsers: Number(totalUsers?.count || 0),
      },
      viewsByDay,
      viewsByCategory: (viewsByCategory || []).map(c => ({
        ...c,
        count: Number(c.count || 0)
      })),
      topAuthors: (topAuthors || []).map(a => ({
        ...a,
        count: Number(a.count || 0)
      })),
      topPosts: (topPosts || []).map(p => ({
        ...p,
        views: Number(p.views || 0)
      })),
    };
  } catch (error) {
    console.error("[Database] getDashboardStats error:", error);
    throw error;
  }
}

export async function createContactMessage(message: InsertContactMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(contactMessages).values(message);
}

export async function getAllContactMessages() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function markMessageAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contactMessages).set({ read: true }).where(eq(contactMessages.id, id));
}

export async function incrementPostViews(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error("[Database] incrementPostViews: DB not available");
    return;
  }
  
  // Step 1: Increment post view counter
  try {
    await db.update(posts).set({ views: sql`${posts.views} + 1` }).where(eq(posts.id, id));
  } catch (error) {
    console.error(`[Database] Failed to increment posts.views for post ${id}:`, error);
  }

  // Step 2: Insert into post_views history (for daily chart)
  try {
    await db.insert(postViews).values({ postId: id });
  } catch (error) {
    console.error(`[Database] Failed to insert into post_views for post ${id}:`, error);
  }
}
