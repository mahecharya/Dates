import { Heart, X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";

const UserCard = ({ user, onLike, onDislike }) => {
  const navigate = useNavigate();

  const mainPhoto =
    user?.photos?.find((p) => p.isPrimary)?.imageUrl ||
    user?.profilePhoto ||
    user?.photos?.[0]?.imageUrl;

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
      <div className="h-[460px] bg-gray-200 sm:h-[520px]">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={user.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No photo
          </div>
        )}
      </div>

      <div className="p-5">
        <h2 className="text-2xl font-bold text-gray-800">
          {user.name}, {user.age}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {user.city}, {user.country}
        </p>

        <p className="mt-3 line-clamp-3 text-gray-700">{user.bio}</p>

        <Button
          onClick={() => navigate(`/profile/${user._id}`)}
          variant="outline"
          className="mt-4 flex w-full items-center justify-center gap-2"
        >
          <Eye size={18} />
          View Profile
        </Button>

        <div className="mt-5 flex items-center justify-center gap-5">
          <Button
            onClick={onDislike}
            variant="secondary"
            className="flex h-16 w-16 items-center justify-center rounded-full p-0"
          >
            <X size={28} />
          </Button>

          <Button
            onClick={onLike}
            className="flex h-16 w-16 items-center justify-center rounded-full p-0"
          >
            <Heart size={28} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;