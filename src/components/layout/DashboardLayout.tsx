import { useState } from 'react';
import { Outlet } from 'react-router';
import { HeaderBar } from './HeaderBar';
import { SidebarNav } from './SidebarNav';

export const DashboardLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarNav mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
      <div className="lg:pl-64">
        <HeaderBar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
