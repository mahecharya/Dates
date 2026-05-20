import { NavLink } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  User,
  Bell,
  Settings,
  Shield,
} from "lucide-react";

const normalLinks = [
  { name: "Discover", path: "/discover", icon: Heart },
  { name: "Matches", path: "/matches", icon: MessageCircle },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Alerts", path: "/notifications", icon: Bell },
  { name: "Prefs", path: "/preferences", icon: Settings },
];

const adminLinks = [
  { name: "Discover", path: "/discover", icon: Heart },
  { name: "Matches", path: "/matches", icon: MessageCircle },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Alerts", path: "/notifications", icon: Bell },
  { name: "Admin", path: "/admin", icon: Shield },
];

const BottomNav = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const links = user?.role === "admin" ? adminLinks : normalLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white">
      <div className="grid grid-cols-5">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2 text-xs ${
                  isActive ? "text-rose-500" : "text-gray-500"
                }`
              }
            >
              <Icon size={21} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;