import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import UserCard from "../components/cards/UserCard";
import Loader from "../components/common/Loader";

const Discovery = () => {
  const [users, setUsers] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchMessage, setMatchMessage] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/discovery");
      setUsers(res.data.data || []);
    } catch (error) {
      console.log(error.response?.data?.message || "Discovery failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    const currentUser = users[index];
    if (!currentUser) return;

    try {
      const res = await API.post("/swipes", {
        targetUserId: currentUser._id,
        action,
      });

      if (res.data.data?.isMatch) {
        setMatchMessage("It's a match!");
        setTimeout(() => setMatchMessage(""), 2500);
      }
    } catch (error) {
      console.log(error.response?.data?.message || "Swipe failed");
    } finally {
      setIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <Loader text="Loading profiles..." />;

  const currentUser = users[index];

  if (!currentUser) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            No more profiles
          </h2>
          <p className="mt-2 text-gray-500">
            Try updating your preferences later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md lg:max-w-lg">
      {matchMessage && (
        <div className="mb-4 rounded-2xl bg-rose-500 p-4 text-center font-bold text-white">
          {matchMessage}
        </div>
      )}

      <UserCard
        user={currentUser}
        onLike={() => handleSwipe("like")}
        onDislike={() => handleSwipe("dislike")}
      />
    </div>
  );
};

export default Discovery;