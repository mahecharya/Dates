import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import Topbar from "./Topbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="min-h-screen lg:ml-64">
        <Topbar />

        <main className="px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default MainLayout;