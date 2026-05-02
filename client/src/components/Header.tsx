import { useState } from "react";
import { Link, useLocation } from "wouter";
import { getCategoryLink } from "@/lib/categoryUtils";
import { Search, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { CATEGORIES } from "@shared/const";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const loginUrl = "/login";
  const handleLogin = () => {
    setLocation(loginUrl);
  };
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

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
            <span className="text-2xl md:text-3xl font-bold whitespace-nowrap block">
              DIÁRIO DO <span className="text-red-600">MUNDO</span>
            </span>
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
              <div 
                className="relative" 
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button className="flex items-center gap-2 text-sm text-white font-semibold hover:text-red-400 transition-colors">
                  Minha Conta <ChevronDown size={16} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full pt-2 w-56 z-50">
                    <div className="bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-700">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-xs text-gray-400">Logado como:</p>
                        <p className="text-sm text-white font-semibold truncate">{user?.name}</p>
                      </div>
                      
                      {user?.role === "admin" && (
                        <Link href="/admin" className="no-underline block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">
                          Acessar Painel Admin
                        </Link>
                      )}
                      
                      <button 
                        onClick={() => logout()}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut size={16} /> Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : loginUrl ? (
              <button 
                onClick={handleLogin}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-semibold"
              >
                Entrar
              </button>
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
            <div className="flex-1">
              <button 
                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                className="flex items-center justify-between w-full text-sm text-white font-semibold bg-gray-800 px-4 py-2 rounded"
              >
                Minha Conta <ChevronDown size={16} className={`transition-transform ${isMobileDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isMobileDropdownOpen && (
                <div className="mt-2 bg-gray-900 rounded-lg py-2 border border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-800">
                    <p className="text-xs text-gray-400">Logado como:</p>
                    <p className="text-sm text-white font-semibold truncate">{user?.name}</p>
                  </div>
                  
                  {user?.role === "admin" && (
                    <Link href="/admin" className="no-underline block px-4 py-3 text-sm text-white hover:bg-gray-800 transition-colors">
                      Acessar Painel Admin
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              )}
            </div>
          ) : loginUrl ? (
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              Entrar
            </button>
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
