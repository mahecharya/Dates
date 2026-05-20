import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import MatchCard from "../components/cards/MatchCard";
import Loader from "../components/common/Loader";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await API.get("/matches");
      setMatches(res.data.data || []);
    } catch (error) {
      console.log(error.response?.data?.message || "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (loading) return <Loader text="Loading matches..." />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Your Matches</h1>

      {matches.length === 0 ? (
        <p className="text-gray-500">No matches yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.matchId} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;