import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Heart, History, Settings, Menu, GraduationCap } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const items = [
    { title: t('nav.code'), url: '/', icon: Heart },
    { title: t('nav.training'), url: '/training', icon: GraduationCap },
    { title: t('nav.history'), url: '/history', icon: History },
    { title: t('nav.settings'), url: '/settings', icon: Settings },
  ];

  return (
    <Sidebar
      className={cn(
        'bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-14' : 'w-56'
      )}
      collapsible="icon"
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!collapsed && (
          <span className="font-bold text-lg text-acls-shockable">ACLS</span>
        )}
        <SidebarTrigger className="h-8 w-8">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </div>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
