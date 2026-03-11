import React from "react";
import { Switch, Route, Router as WouterRouter, BaseLocationHook, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-context";
import NotFound from "@/pages/not-found";
import MainLayout from "@/pages/main-layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainLayout} />
      <Route path="/tool/:toolId" component={MainLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Determine if we should use hashbang routing (for GitHub Pages) or clean URLs (for local dev)
  const isProduction = window.location.hostname.includes('github.io') || window.location.hostname.includes('shivasaxena.com');

  // Use our custom hook that handles both environments
  const locationHook = useLocationHook;

  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <WouterRouter hook={locationHook}>
          <Router />
        </WouterRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}

// Custom hook to handle both hashbang and clean URLs based on environment
const useLocationHook: BaseLocationHook = () => {
  const isProduction = window.location.hostname.includes('github.io') || window.location.hostname.includes('shivasaxena.com');
  const basePath = '/handy-dev-tools';

  const getPathname = () => {
    const pathname = window.location.pathname;
    return pathname.startsWith(basePath) ? pathname.substring(basePath.length) || '/' : pathname;
  };

  const [location, setLocation] = React.useState(() => {
    if (isProduction) {
      const hash = window.location.hash;
      if (hash.startsWith('#!')) {
        return hash.substring(2);
      }
      return getPathname();
    }
    return getPathname();
  });

  React.useEffect(() => {
    if (isProduction) {
      // Handle initial load with hashbang URL
      const hash = window.location.hash;
      if (hash.startsWith('#!')) {
        setLocation(hash.substring(2));
      }

      const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash.startsWith('#!')) {
          setLocation(hash.substring(2));
        }
      };

      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    } else {
      // For local development, handle popstate events
      const handlePopState = () => {
        setLocation(getPathname());
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isProduction]);

  const navigate = React.useCallback((to: string) => {
    if (isProduction) {
      // For GitHub Pages, use hashbang URLs
      window.location.hash = '#!' + to;
    } else {
      // For local development, use clean URLs with base path
      window.history.pushState(null, '', basePath + to);
    }
    setLocation(to);
  }, [isProduction]);

  return [location, navigate] as [string, (path: string, ...args: any[]) => any];
};

export default App;
