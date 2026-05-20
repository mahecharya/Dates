const NotificationCard = ({ notification, onRead }) => {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        notification.isRead ? "bg-white" : "bg-rose-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">
            {notification.title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {notification.message}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>

        {!notification.isRead && (
          <button
            onClick={() => onRead(notification._id)}
            className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white"
          >
            Read
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;