import { useRoute } from "wouter";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { trpc } from "@/lib/trpc";
import { getCategoryLink, categoryToSlug } from "@/lib/categoryUtils";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const CATEGORIES = ["Política", "Economia", "Investimentos", "Ciência e Tecnologia", "Curiosidade"];

// Create reverse mapping from slug to category name
const SLUG_TO_CATEGORY: Record<string, string> = {};
CATEGORIES.forEach(cat => {
  SLUG_TO_CATEGORY[categoryToSlug(cat)] = cat;
});

export default function Category() {
  const [match, params] = useRoute("/categoria/:category");
  const categoryParam = params?.category as string;
  const category = categoryParam ? SLUG_TO_CATEGORY[categoryParam.toLowerCase()] || "" : "";

  const { data: posts, isLoading } = trpc.posts.getByCategory.useQuery(
    { category: category as any, limit: 50 },
    { enabled: !!category }
  );

  if (!match) return null;

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Categoria não encontrada</h1>
            <p className="text-muted-foreground mb-6">
              A categoria que você está procurando não existe.
            </p>
            <Link href="/" className="no-underline">
              <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-semibold">
                Voltar para Home
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

      <main className="flex-1">
        <section className="bg-muted py-8 border-b border-border">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold">{category}</h1>
            <p className="text-muted-foreground mt-2">
              {posts?.length || 0} notícias publicadas
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            {!posts || posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-6">
                  Nenhuma notícia encontrada nesta categoria.
                </p>
                <Link href="/" className="no-underline">
                  <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-semibold">
                    Voltar para Home
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <NewsCard key={post.id} post={post} showCategory={true} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
