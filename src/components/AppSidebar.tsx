
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { views, ViewKey } from '@/config/views';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AppSidebarProps {
  activeView: ViewKey;
  setActiveView: (view: ViewKey) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ activeView, setActiveView }) => {
  const { signOut } = useAuth();
  const { setOpenMobile } = useSidebar();

  const handleMenuItemClick = (viewKey: ViewKey) => {
    setActiveView(viewKey);
    setOpenMobile(false);
  };

  const handleSignOut = () => {
    signOut();
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-semibold p-2 group-data-[collapsible=icon]:hidden">
          ShopMate
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.keys(views).map((key) => {
                const viewKey = key as ViewKey;
                const { title, icon: Icon } = views[viewKey];
                return (
                  <SidebarMenuItem key={viewKey}>
                    <SidebarMenuButton
                      onClick={() => handleMenuItemClick(viewKey)}
                      isActive={activeView === viewKey}
                      tooltip={{ children: title, side: 'right' }}
                    >
                      <Icon className="size-4" />
                      <span>{title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip={{children: 'Log Out', side: 'right'}}>
              <LogOut className="size-4" />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
