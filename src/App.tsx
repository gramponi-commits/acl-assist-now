import { useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
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

/**
 * Main layout component with gesture support for sidebar
 */
function AppLayout() {
  const { open, setOpen, isMobile } = useSidebar();

  // Swipe gesture handlers - only active on mobile
  const swipeHandlers = useSwipeable({
    onSwipedRight: (eventData) => {
      // Only open sidebar if swipe starts from left edge (first 50px)
      if (isMobile && !open && eventData.initial[0] < 50) {
        setOpen(true);
      }
    },
    onSwipedLeft: () => {
      // Close sidebar on left swipe if it's open
      if (isMobile && open) {
        setOpen(false);
      }
    },
    trackMouse: false, // Touch only, not mouse
    preventScrollOnSwipe: false, // Allow scrolling
    delta: 50, // Minimum distance for swipe
  });

  return (
    <div {...swipeHandlers} className="min-h-screen flex w-full">
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
  );
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
            <AppLayout />
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
