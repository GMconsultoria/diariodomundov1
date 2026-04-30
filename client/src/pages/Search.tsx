import { useSearch, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { getCategoryLink } from "@/lib/categoryUtils";
import { Loader2 } from "lucide-react";

export default function Search() {
  const search = useSearch();
  const query = new URLSearchParams(search).get("q") || "";
  const searchPerformed = !!query;

  const { data: results, isLoading } = trpc.posts.search.useQuery(
    { query },
    { enabled: !!query && searchPerformed }
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-muted py-8 border-b border-border">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold">Resultados de Busca</h1>
            <p className="text-muted-foreground mt-2">
              {query && `Buscando por: "${query}"`}
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            {!searchPerformed ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Use a barra de busca no topo para procurar notícias.
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-accent" size={40} />
              </div>
            ) : !results || results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-6">
                  Nenhuma notícia encontrada para "{query}".
                </p>
                <Link href="/" className="no-underline">
                  <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-red-700 transition-colors font-semibold">
                    Voltar para Home
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground mb-6">
                  {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
                </p>
                <div className="space-y-6">
                  {results.map((post) => (
                    <Link key={post.id} href={`/noticias/${post.slug}`} className="no-underline">
                      <div className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                        <div className="flex gap-6">
                          {post.imageUrl && (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-32 h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <Link href={getCategoryLink(post.category)} className="no-underline" onClick={(e) => e.stopPropagation()}>
                                <span className="inline-block bg-accent text-white px-2 py-1 text-xs font-bold uppercase tracking-wider rounded hover:bg-red-700 transition-colors">
                                  {post.category}
                                </span>
                              </Link>
                              <span className="text-xs text-muted-foreground">
                                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-2 mb-3">
                              {post.subtitle}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Por {post.author}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
