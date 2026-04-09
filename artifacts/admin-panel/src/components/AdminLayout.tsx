import { useState } from "react";
import { clearToken } from "../lib/auth";

interface Props {
  page: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: <HomeIcon /> },
  { id: "designs", label: "Designs", icon: <DiamondIcon /> },
  { id: "content", label: "Content", icon: <EditIcon /> },
];

export default function AdminLayout({ page, onNavigate, onLogout, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearToken();
    onLogout();
  };

  const activePage = page.split("/")[0];

  const handleNav = (id: string) => {
    onNavigate(id);
    setSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="Logo" />
          <div>
            <span className="sidebar-brand">Amirul CAD</span>
            <span className="sidebar-sub">Admin Panel</span>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a
            href="https://amirul-jewelery-cad-studio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="view-site-btn"
          >
            <ExternalIcon />
            View Website
          </a>
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutIcon />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-body">
        {/* Mobile top bar */}
        <header className="mobile-topbar">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>
          <div className="mobile-brand">
            <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="Logo" className="mobile-logo" />
            <span>Amirul CAD Admin</span>
          </div>
          <button className="mobile-logout-btn" onClick={handleLogout}>
            <LogoutIcon />
          </button>
        </header>

        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}

function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
function DiamondIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M2 9h20" /></svg>;
}
function EditIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
}
function ExternalIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
}
function LogoutIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
}
function HamburgerIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
}
function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
