import { useState } from "react";
import { Link, useLocation } from "wouter";
import { getCategoryLink } from "@/lib/categoryUtils";
import { Search } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const CATEGORIES = ["Política", "Economia", "Investimentos", "Ciência e Tecnologia", "Curiosidade"];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated } = useAuth();
  const loginUrl = getLoginUrl();

  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/busca?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header - Black background */}
      <div className="bg-black text-white py-4 border-b-2 border-red-600">
        <div className="container mx-auto px-4 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="no-underline flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold whitespace-nowrap">
              DIÁRIO DO <span className="text-red-600">MUNDO</span>
            </h1>
          </Link>

          {/* Desktop Navigation - Categories */}
          <nav className="hidden lg:flex items-center gap-8 flex-1">
            {CATEGORIES.map((category) => {
              return (
                <Link
                  key={category}
                  href={getCategoryLink(category)}
                  className="no-underline text-white font-semibold text-sm hover:text-red-600 transition-colors whitespace-nowrap"
                >
                  {category}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 flex-shrink-0">
            <input
              type="text"
              placeholder="Buscar notícias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 text-white placeholder-gray-400 focus:outline-none text-sm w-48"
            />
            <button
              type="submit"
              className="text-blue-400 hover:text-blue-300 transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-white">{user?.name}</span>
                {user?.role === "admin" && (
                  <Link href="/admin" className="no-underline">
                    <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-semibold">
                      Admin
                    </button>
                  </Link>
                )}
              </>
            ) : loginUrl ? (
              <a href={loginUrl} className="no-underline">
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-semibold">
                  Entrar
                </button>
              </a>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-gray-600 text-white rounded text-sm font-semibold cursor-not-allowed"
                title="Login indisponível: configuração ausente"
              >
                Entrar
              </button>
            )}
          </div>

          {/* Mobile Search Icon */}
          <button
            onClick={() => {
              const searchInput = document.querySelector('.mobile-search-input') as HTMLInputElement;
              if (searchInput) {
                searchInput.focus();
              }
            }}
            className="md:hidden text-blue-400 hover:text-blue-300 transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden mt-3 px-4">
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2">
            <input
              type="text"
              placeholder="Buscar notícias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-search-input bg-gray-800 text-white placeholder-gray-400 focus:outline-none text-sm flex-1"
            />
            <button
              type="submit"
              className="text-blue-400 hover:text-blue-300 transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Mobile Categories */}
        <nav className="lg:hidden mt-3 px-4 overflow-x-auto">
          <div className="flex gap-4 pb-2">
            {CATEGORIES.map((category) => {
              return (
                <Link
                  key={category}
                  href={getCategoryLink(category)}
                  className="no-underline text-white font-semibold text-xs hover:text-red-600 transition-colors whitespace-nowrap"
                >
                  {category}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Mobile Auth */}
        <div className="md:hidden px-4 pt-3 border-t border-gray-700 flex gap-2">
          {isAuthenticated ? (
            <>
              <span className="text-xs text-white flex-1">{user?.name}</span>
              {user?.role === "admin" && (
                <Link href="/admin" className="no-underline">
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors">
                    Admin
                  </button>
                </Link>
              )}
            </>
          ) : loginUrl ? (
            <a href={loginUrl} className="no-underline">
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-semibold">
                Entrar
              </button>
            </a>
          ) : (
            <button
              disabled
              className="px-4 py-2 bg-gray-600 text-white rounded text-sm font-semibold cursor-not-allowed"
              title="Login indisponível: configuração ausente"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
