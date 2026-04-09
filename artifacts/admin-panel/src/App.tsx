import { useState } from "react";
import { isLoggedIn } from "./lib/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DesignManager from "./pages/DesignManager";
import DesignForm from "./pages/DesignForm";
import ContentEditor from "./pages/ContentEditor";
import AdminLayout from "./components/AdminLayout";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);
  const [page, setPage] = useState("dashboard");

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  const navigate = (p: string) => setPage(p);

  const renderPage = () => {
    if (page === "dashboard") return <Dashboard onNavigate={navigate} />;
    if (page === "designs") return <DesignManager onNavigate={navigate} />;
    if (page === "designs/new") return <DesignForm onNavigate={navigate} />;
    if (page.startsWith("designs/edit/")) {
      const id = page.replace("designs/edit/", "");
      return <DesignForm editId={id} onNavigate={navigate} />;
    }
    if (page === "content") return <ContentEditor onNavigate={navigate} />;
    return <Dashboard onNavigate={navigate} />;
  };

  return (
    <AdminLayout page={page} onNavigate={navigate} onLogout={() => setLoggedIn(false)}>
      {renderPage()}
    </AdminLayout>
  );
}
