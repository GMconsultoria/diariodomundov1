import { useMemo } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { trpc } from "@/lib/trpc";
import { getCategoryLink } from "@/lib/categoryUtils";
import { Loader2 } from "lucide-react";
import type { Post } from "@shared/types";
import { CATEGORIES as ALL_CATEGORIES } from "@shared/const";

const FEATURED_CATEGORIES = ["Economia", "Investimentos", "Ciência e Tecnologia"];

export default function Home() {
  const { data: posts, isLoading } = trpc.posts.getPublished.useQuery({ limit: 30, offset: 0 });
  const featuredPost = useMemo(() => posts?.[0] ?? null, [posts]);

  const categoryPosts = useMemo(() => {
    const grouped: Record<string, Omit<Post, 'content'>[]> = {};
    ALL_CATEGORIES.forEach(cat => { grouped[cat] = []; });
    posts?.forEach(post => {
      if (grouped[post.category]) grouped[post.category].push(post);
    });
    return grouped;
  }, [posts]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-accent" size={40} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background">
        {/* Main Content Area with Side Ads - Featured Posts */}
        <div className="flex justify-center">
          {/* Left Ad Space */}
          <div className="hidden xl:flex w-64 bg-muted items-center justify-center text-muted-foreground text-sm font-semibold sticky top-20 h-96">
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest mb-2">Publicidade</div>
              <div className="text-lg">Espaço 1</div>
            </div>
          </div>

          {/* Center Content */}
          <div className="w-full max-w-6xl px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured Post - Left Column (Large) */}
              {featuredPost && (
                <div className="lg:col-span-2 relative group cursor-pointer h-96 rounded-lg overflow-hidden">
                  <Link href={`/noticias/${featuredPost.slug}`} className="no-underline block h-full">
                    {/* Background Image */}
                    {featuredPost.imageUrl && (
                      <img
                        src={featuredPost.imageUrl}
                        alt={featuredPost.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070";
                        }}
                      />
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-gray-200 transition-colors">
                        {featuredPost.title}
                      </h1>
                      {featuredPost.subtitle && (
                        <p className="text-base text-gray-200 mb-3">
                          {featuredPost.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span>{featuredPost.author}</span>
                        <span>•</span>
                        <span>{new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </Link>
                  <Link href={getCategoryLink(featuredPost.category)} className="no-underline absolute top-6 left-6 z-10" onClick={(e) => e.stopPropagation()}>
                    <span className="inline-block bg-accent text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded hover:bg-red-700 transition-colors shadow-md">
                      {featuredPost.category}
                    </span>
                  </Link>
                </div>
              )}

              {/* Sidebar - Right Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Category Cards */}
                {FEATURED_CATEGORIES.map((category) => {
                  const categoryPostsList = categoryPosts[category] || [];
                  const firstPost = categoryPostsList[0];
                  
                  return (
                    <div key={category} className="border-l-4 border-accent pl-4">
                      <Link href={getCategoryLink(category)} className="no-underline">
                        <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-3 hover:text-red-700 transition-colors cursor-pointer">
                          {category}
                        </h3>
                      </Link>
                      
                      {firstPost ? (
                        <NewsCard post={firstPost} imageHeight="h-32" titleSize="text-sm" />
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma notícia disponível</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Ad Space */}
          <div className="hidden xl:flex w-64 bg-muted items-center justify-center text-muted-foreground text-sm font-semibold sticky top-20 h-96">
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest mb-2">Publicidade</div>
              <div className="text-lg">Espaço 2</div>
            </div>
          </div>
        </div>

        {/* Ad Space Between Sections */}
        <section className="flex justify-center py-8 bg-muted border-y border-border">
          <div className="w-full max-w-6xl px-4 flex justify-center">
            <div className="w-full h-32 bg-white rounded-lg flex items-center justify-center text-muted-foreground font-semibold border border-border">
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest mb-2">Publicidade</div>
                <div className="text-lg">Espaço Central</div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent News by Topic */}
        <section className="bg-white py-12">
          <div className="flex justify-center">
            <div className="w-full max-w-6xl px-4">
              {ALL_CATEGORIES.map((category) => {
                const categoryPostsList = categoryPosts[category] || [];
                
                return (
                  categoryPostsList.length > 0 && (
                    <div key={category} className="mb-16">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-accent">
                        <h2 className="text-2xl font-bold text-foreground">{category}</h2>
                        <Link href={getCategoryLink(category)} className="no-underline">
                          <button className="text-accent font-semibold hover:text-red-700 transition-colors">
                            Ver Tudo →
                          </button>
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryPostsList.slice(0, 3).map((post) => (
                          <NewsCard key={post.id} post={post} showCategory={false} />
                        ))}
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
