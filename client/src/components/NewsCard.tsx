import { memo } from "react";
import { Link } from "wouter";
import { getCategoryLink } from "@/lib/categoryUtils";
import type { Post } from "@shared/types";

interface NewsCardProps {
  post: Omit<Post, "content"> & { content?: string };
  imageHeight?: string;
  titleSize?: string;
  showCategory?: boolean;
}

function NewsCard({
  post,
  imageHeight = "h-48",
  titleSize = "text-base",
  showCategory = false,
}: NewsCardProps) {
  return (
    <div className="group cursor-pointer h-full relative">
      <Link href={`/noticias/${post.slug}`} className="no-underline block">
        {post.imageUrl && (
          <div className={`relative ${imageHeight} overflow-hidden rounded-lg mb-3`}>
            <img
              src={post.imageUrl}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070";
              }}
            />
          </div>
        )}
        {!showCategory && (
          <div className="mb-2 h-6" />
        )}
        <h3 className={`font-bold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors ${titleSize}`}>
          {post.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{post.author}</span>
          <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </Link>
      {showCategory && (
        <Link 
          href={getCategoryLink(post.category)} 
          className="no-underline absolute top-3 left-3 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="inline-block bg-accent text-white px-2 py-1 text-xs font-bold uppercase tracking-wider rounded hover:bg-red-700 transition-colors">
            {post.category}
          </span>
        </Link>
      )}
    </div>
  );
}

export default memo(NewsCard);
