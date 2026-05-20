import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import NotificationCard from "../components/cards/NotificationCard";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      setNotifications(res.data.data || []);
    } catch (error) {
      console.log(error.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    await API.patch(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAll = async () => {
    await API.patch("/notifications/read-all");
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <Loader text="Loading notifications..." />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <Button onClick={markAll} variant="secondary">
          Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications.</p>
        ) : (
          notifications.map((item) => (
            <NotificationCard
              key={item._id}
              notification={item}
              onRead={markRead}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;