import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await API.get("/photos/me");
      setPhotos(res.data.data || []);
    } catch (error) {
      console.log(error.response?.data?.message || "Failed to fetch photos");
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a photo");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("photo", file);

      await API.post("/photos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFile(null);
      setMessage("Photo uploaded successfully");
      fetchPhotos();
    } catch (error) {
      setMessage(error.response?.data?.message || "Upload failed");
    }
  };

  const setPrimary = async (photoId) => {
    await API.patch(`/photos/${photoId}/primary`);
    fetchPhotos();
  };

  const deletePhoto = async (photoId) => {
    await API.delete(`/photos/${photoId}`);
    fetchPhotos();
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  if (loading) return <Loader text="Loading photos..." />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-800">My Photos</h1>

      {message && (
        <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
          {message}
        </div>
      )}

      <form
        onSubmit={uploadPhoto}
        className="mb-6 rounded-3xl bg-white p-5 shadow-sm"
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 w-full rounded-xl border p-3"
        />

        <Button type="submit">Upload Photo</Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo._id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <img
              src={photo.imageUrl}
              alt="profile"
              className="h-72 w-full object-cover"
            />

            <div className="space-y-2 p-4">
              {photo.isPrimary && (
                <p className="text-sm font-semibold text-rose-500">
                  Primary Photo
                </p>
              )}

              <Button
                onClick={() => setPrimary(photo._id)}
                variant="secondary"
                className="w-full"
              >
                Set Primary
              </Button>

              <Button
                onClick={() => deletePhoto(photo._id)}
                variant="danger"
                className="w-full"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Photos;