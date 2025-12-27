import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import Index from "./pages/Index";
import SessionHistory from "./pages/SessionHistory";
import Settings from "./pages/Settings";
import InstallHelp from "./pages/InstallHelp";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import "@/i18n";

const queryClient = new QueryClient();

// Initialize theme from localStorage
function useInitialTheme() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('acls-settings');
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Default to dark
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  }, []);
}

const App = () => {
  useInitialTheme();
  
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <MobileHeader />
            <main className="flex-1 overflow-auto pt-14 md:pt-0">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/history" element={<SessionHistory />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/install" element={<InstallHelp />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
