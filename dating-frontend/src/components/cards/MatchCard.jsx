import { Link } from "react-router-dom";
import { MessageCircle, Eye } from "lucide-react";

const MatchCard = ({ match }) => {
  const user = match.otherUser;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-rose-100">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-bold text-rose-500">
              {user?.name?.[0] || "U"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-800">
            {user?.name}, {user?.age}
          </h3>
          <p className="truncate text-sm text-gray-500">
            {user?.city}, {user?.country}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          to={`/profile/${user?._id}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-rose-500 px-3 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50"
        >
          <Eye size={16} />
          Profile
        </Link>

        <Link
          to={`/chat/${match.matchId}`}
          className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600"
        >
          <MessageCircle size={16} />
          Chat
        </Link>
      </div>
    </div>
  );
};

export default MatchCard;