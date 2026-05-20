import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Topbar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800 sm:text-lg">
            Welcome {user?.name || ""}
          </h2>

          <p className="text-xs text-gray-500">
            @{user?.username || "username"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-rose-100">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt="profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-rose-500">
                {user?.name?.[0] || "U"}
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 lg:hidden"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;