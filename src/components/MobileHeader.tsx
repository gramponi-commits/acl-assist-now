import { Menu, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function MobileHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
  const { isInstallable, promptInstall } = usePWAInstall();

  if (!isMobile) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-2 bg-card border-b border-border">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-10 w-10"
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      <span className="font-bold text-lg text-acls-shockable">ACLS</span>
      
      {isInstallable ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={promptInstall}
          className="h-10 w-10"
        >
          <Download className="h-5 w-5" />
        </Button>
      ) : (
        <div className="w-10" />
      )}
    </header>
  );
}
