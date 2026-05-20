import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  User,
  Bell,
  Settings,
  Shield,
  Images,
  Flag,
  LogOut,
} from "lucide-react";
import API from "../../api/axiosInstance";

const normalLinks = [
  { name: "Discover", path: "/discover", icon: Heart },
  { name: "Matches", path: "/matches", icon: MessageCircle },
  { name: "Photos", path: "/photos", icon: Images },
  { name: "Preferences", path: "/preferences", icon: Settings },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Reports", path: "/reports", icon: Flag },
];

const adminLink = {
  name: "Admin",
  path: "/admin",
  icon: Shield,
};

const Sidebar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [unreadCount, setUnreadCount] = useState(0);

  const links =
    user?.role === "admin" ? [...normalLinks, adminLink] : normalLinks;

  const fetchUnreadNotifications = async () => {
    try {
      const res = await API.get("/notifications/unread-count");
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (error) {
      console.log(error.response?.data?.message || "Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();

    const interval = setInterval(() => {
      fetchUnreadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r bg-white px-4 py-6">
      <h1 className="mb-8 text-2xl font-bold text-rose-500">DatingApp</h1>

      <nav className="flex-1 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          const isNotificationLink = item.name === "Notifications";

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-rose-500 text-white"
                    : "text-gray-600 hover:bg-rose-50 hover:text-rose-500"
                }`
              }
            >
              <div className="relative">
                <Icon size={20} />

                {isNotificationLink && unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </div>

              <span>{item.name}</span>

              {isNotificationLink && unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;