import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Flag, MapPin, Heart, Briefcase, GraduationCap } from "lucide-react";
import API from "../api/axiosInstance";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";

const ViewProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const userRes = await API.get(`/users/${userId}`);
      const photoRes = await API.get(`/photos/user/${userId}`);

      setUser(userRes.data.data);
      setPhotos(photoRes.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const goToReport = () => {
    navigate(`/reports?userId=${userId}`);
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  if (loading) return <Loader text="Loading profile..." />;

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 text-center shadow-sm">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 text-center shadow-sm">
        <p className="text-gray-500">Profile not found.</p>
      </div>
    );
  }

  const mainPhoto =
    photos.find((photo) => photo.isPrimary)?.imageUrl ||
    user.profilePhoto ||
    photos[0]?.imageUrl;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="h-[520px] bg-gray-200">
            {mainPhoto ? (
              <img
                src={mainPhoto}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No photo available
              </div>
            )}
          </div>

          {photos.length > 1 && (
            <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">
              {photos.map((photo) => (
                <div
                  key={photo._id}
                  className="h-24 overflow-hidden rounded-2xl bg-gray-100"
                >
                  <img
                    src={photo.imageUrl}
                    alt="profile"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {user.name}, {user.age}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={16} />
                {user.city || "Unknown city"}, {user.country || "Unknown country"}
              </p>
            </div>

            <Button
              onClick={goToReport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Flag size={18} />
              Report
            </Button>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-800">Bio</h2>
            <p className="leading-relaxed text-gray-600">
              {user.bio || "No bio added yet."}
            </p>
          </div>

          <div className="space-y-3">
            <InfoRow
              icon={<Heart size={18} />}
              label="Relationship Goal"
              value={user.relationshipGoal || "Not specified"}
            />

            <InfoRow
              icon={<Briefcase size={18} />}
              label="Job"
              value={user.jobTitle || "Not specified"}
            />

            <InfoRow
              icon={<GraduationCap size={18} />}
              label="Education"
              value={user.education || "Not specified"}
            />
          </div>

          {user.interests?.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-800">
                Interests
              </h2>

              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-500"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
      <div className="text-rose-500">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default ViewProfile;