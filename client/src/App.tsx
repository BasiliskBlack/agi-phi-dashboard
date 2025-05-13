import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { WindowProvider } from "@/contexts/WindowContext";
import { SystemProvider } from "@/contexts/SystemContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { ThemeProvider } from "./lib/themeEngine.tsx";

import { SidebarProvider } from "@/components/ui/sidebar";

function App() {
  return (
    <ThemeProvider>
      <SystemProvider>
        <WindowProvider>
          <SidebarProvider>
            <QueryClientProvider client={queryClient}>
              <Router />
              <Toaster />
            </QueryClientProvider>
          </SidebarProvider>
        </WindowProvider>
      </SystemProvider>
    </ThemeProvider>
  );
}

export default App;
