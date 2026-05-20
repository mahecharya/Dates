import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axiosInstance";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";

const Chat = () => {
  const { matchId } = useParams();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/chats/${matchId}/messages`);
      setMessages(res.data.data || []);
    } catch (error) {
      console.log(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    try {
      const res = await API.post(`/chats/${matchId}/messages`, {
        message: text,
      });

      setMessages((prev) => [...prev, res.data.data]);
      setText("");
    } catch (error) {
      console.log(error.response?.data?.message || "Failed to send message");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return <Loader text="Loading chat..." />;

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="mx-auto flex h-[75vh] max-w-3xl flex-col rounded-3xl bg-white shadow-sm">
      <div className="border-b p-4">
        <h1 className="text-lg font-bold text-gray-800">Chat</h1>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => {
          const isMine =
            msg.sender?._id === currentUser.id || msg.sender === currentUser.id;

          return (
            <div
              key={msg._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMine
                    ? "bg-rose-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 rounded-xl border px-4 py-3 outline-none focus:border-rose-400"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
};

export default Chat;