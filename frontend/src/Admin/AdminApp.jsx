import React from 'react';
import Login from '../Pages/Login.jsx';
import { AdminLayout } from './components/AdminLayout.jsx';
import { useAdminController } from './hooks/useAdminController.jsx';

export default function AdminApp() {
  const {
    currentTab,
    sidebarCollapsed,
    isAdminLoggedIn,
    notifications,
    showNotifDrawer,
    toast,
    user,
    setCurrentTab,
    setSidebarCollapsed,
    setIsAdminLoggedIn,
    setShowNotifDrawer,
    handleSimulateSale,
    handleLogout,
    renderViewContent,
    markNotificationsRead
  } = useAdminController();

  if (!isAdminLoggedIn) {
    return <Login onLogin={() => setIsAdminLoggedIn(true)} />;
  }

  return (
    <AdminLayout
      currentTab={currentTab}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      onSelectTab={setCurrentTab}
      onSimulateSale={handleSimulateSale}
      notifications={notifications}
      showNotifDrawer={showNotifDrawer}
      onToggleNotifications={() => setShowNotifDrawer((prev) => !prev)}
      onMarkNotificationsRead={markNotificationsRead}
      viewContent={renderViewContent()}
      toast={toast}
      user={user}
      onLogout={handleLogout}
      onSelectProfile={() => setCurrentTab('profile')}
    />
  );
}
