import React from "react";
import { Switch, Route, Router as WouterRouter, BaseLocationHook } from "wouter";
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

const basePath = '/handy-dev-tools';

// Custom location hook that strips the base path for wouter routing
const useLocationHook: BaseLocationHook = () => {
  const getPath = () => {
    // Support legacy #! URLs - convert them to clean URLs
    const hash = window.location.hash;
    if (hash.startsWith('#!')) {
      const cleanPath = hash.substring(2);
      window.history.replaceState(null, '', basePath + cleanPath);
      return cleanPath;
    }

    const pathname = window.location.pathname;
    return pathname.startsWith(basePath)
      ? pathname.substring(basePath.length) || '/'
      : pathname;
  };

  const [location, setLocation] = React.useState(getPath);

  React.useEffect(() => {
    const handlePopState = () => setLocation(getPath());
    const handleHashChange = () => {
      // Handle legacy #! links that might still be out there
      const hash = window.location.hash;
      if (hash.startsWith('#!')) {
        const cleanPath = hash.substring(2);
        window.history.replaceState(null, '', basePath + cleanPath);
        setLocation(cleanPath);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = React.useCallback((to: string) => {
    window.history.pushState(null, '', basePath + to);
    setLocation(to);
  }, []);

  return [location, navigate] as [string, (path: string, ...args: any[]) => any];
};

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <WouterRouter hook={useLocationHook}>
          <Router />
        </WouterRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
