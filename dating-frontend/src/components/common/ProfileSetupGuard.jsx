import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../../api/axiosInstance";
import Loader from "./Loader";

const ProfileSetupGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const checkProfileSetup = async () => {
    try {
      const [photoRes, prefRes] = await Promise.all([
        API.get("/photos/me"),
        API.get("/preferences/me"),
      ]);

      const photos = photoRes.data.data || [];
      const preference = prefRes.data.data;

      if (photos.length >= 3 && preference) {
        setIsComplete(true);
      } else {
        setIsComplete(false);
      }
    } catch {
      setIsComplete(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkProfileSetup();
  }, []);

  if (loading) return <Loader text="Checking profile setup..." />;

  if (!isComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};

export default ProfileSetupGuard;