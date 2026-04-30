import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Article from "./pages/Article";
import Category from "./pages/Category";
import Search from "./pages/Search";
import AdminLayout from "./pages/admin/AdminLayout";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path={"/noticias/:slug"} component={Article} />
      <Route path={"/categoria/:category"} component={Category} />
      <Route path={"/busca"} component={Search} />
      <Route path="/sobre" component={About} />
      <Route path="/privacidade" component={Privacy} />
      <Route path="/termos" component={Terms} />
      <Route path="/contato" component={Contact} />
      <Route path="/admin/*" component={AdminLayout} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
