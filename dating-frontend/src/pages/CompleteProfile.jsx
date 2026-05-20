import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Heart, CheckCircle, Trash2, Star } from "lucide-react";

import API from "../api/axiosInstance";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";

const CompleteProfile = () => {
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);

  const [preference, setPreference] = useState({
    preferredGender: "any",
    minAge: 18,
    maxAge: 35,
    maxDistanceKm: 50,
    relationshipGoal: "any",
    city: "",
    country: "",
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const fetchPhotos = async () => {
    const photoRes = await API.get("/photos/me");
    setPhotos(photoRes.data.data || []);
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setMessage("");

      await fetchPhotos();

      try {
        const prefRes = await API.get("/preferences/me");

        if (prefRes.data.data) {
          setPreference({
            preferredGender: prefRes.data.data.preferredGender || "any",
            minAge: prefRes.data.data.minAge || 18,
            maxAge: prefRes.data.data.maxAge || 35,
            maxDistanceKm: prefRes.data.data.maxDistanceKm || 50,
            relationshipGoal: prefRes.data.data.relationshipGoal || "any",
            city: prefRes.data.data.city || "",
            country: prefRes.data.data.country || "",
          });
        }
      } catch {
        // Preference may not exist yet. That is okay.
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Failed to load profile setup",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (e) => {
    setPreference({
      ...preference,
      [e.target.name]: e.target.value,
    });
  };

  const uploadPhoto = async (e) => {
    e.preventDefault();

    if (!file) {
      showMessage("Please select a photo first", "error");
      return;
    }

    if (photos.length >= 6) {
      showMessage("You can upload maximum 6 photos", "error");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("photo", file);

      await API.post("/photos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFile(null);

      const fileInput = document.getElementById("profile-photo-input");
      if (fileInput) {
        fileInput.value = "";
      }

      await fetchPhotos();

      showMessage(
        "Photo uploaded successfully. You can add another photo.",
        "success"
      );
    } catch (error) {
      showMessage(error.response?.data?.message || "Photo upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId) => {
    try {
      setMessage("");

      await API.delete(`/photos/${photoId}`);
      await fetchPhotos();

      showMessage("Photo deleted successfully", "success");
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to delete photo", "error");
    }
  };

  const setPrimaryPhoto = async (photoId) => {
    try {
      setMessage("");

      await API.patch(`/photos/${photoId}/primary`);
      await fetchPhotos();

      showMessage("Primary photo updated successfully", "success");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Failed to set primary photo",
        "error"
      );
    }
  };

  const savePreference = async () => {
    try {
      setSavingPreference(true);
      setMessage("");

      if (Number(preference.minAge) < 18) {
        showMessage("Minimum age must be at least 18", "error");
        return;
      }

      if (Number(preference.minAge) > Number(preference.maxAge)) {
        showMessage("Minimum age cannot be greater than maximum age", "error");
        return;
      }

      const payload = {
        ...preference,
        minAge: Number(preference.minAge),
        maxAge: Number(preference.maxAge),
        maxDistanceKm: Number(preference.maxDistanceKm),
      };

      try {
        await API.patch("/preferences/me", payload);
      } catch (error) {
        if (error.response?.status === 404) {
          await API.post("/preferences", payload);
        } else {
          throw error;
        }
      }

      showMessage("Preferences saved successfully", "success");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Failed to save preferences",
        "error"
      );
    } finally {
      setSavingPreference(false);
    }
  };

  const finishSetup = async () => {
    if (photos.length < 3) {
      showMessage("Please upload at least 3 photos before continuing", "error");
      return;
    }

    if (Number(preference.minAge) < 18) {
      showMessage("Minimum age must be at least 18", "error");
      return;
    }

    if (Number(preference.minAge) > Number(preference.maxAge)) {
      showMessage("Minimum age cannot be greater than maximum age", "error");
      return;
    }

    try {
      const payload = {
        ...preference,
        minAge: Number(preference.minAge),
        maxAge: Number(preference.maxAge),
        maxDistanceKm: Number(preference.maxDistanceKm),
      };

      try {
        await API.patch("/preferences/me", payload);
      } catch (error) {
        if (error.response?.status === 404) {
          await API.post("/preferences", payload);
        } else {
          throw error;
        }
      }

      navigate("/discover");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Please save your preferences first",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  if (loading) {
    return <Loader text="Loading profile setup..." />;
  }

  const hasMinimumPhotos = photos.length >= 3;
  const remainingPhotos = Math.max(3 - photos.length, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          Complete Your Profile
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Upload at least 3 photos and choose your dating preferences before
          using discovery.
        </p>

        {message && (
          <div
            className={`mt-4 rounded-xl p-3 text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-600"
                : messageType === "error"
                ? "bg-red-50 text-red-600"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Photo Section */}
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-500">
              <Camera size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Upload Photos
              </h2>
              <p className="text-sm text-gray-500">
                {photos.length}/3 minimum photos uploaded
              </p>
            </div>
          </div>

          <div
            className={`mb-4 rounded-2xl p-3 text-sm ${
              hasMinimumPhotos
                ? "bg-green-50 text-green-600"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {hasMinimumPhotos ? (
              <div className="flex items-center gap-2">
                <CheckCircle size={18} />
                Minimum photo requirement completed
              </div>
            ) : (
              <span>
                Please upload {remainingPhotos} more photo
                {remainingPhotos === 1 ? "" : "s"}.
              </span>
            )}
          </div>

          <form onSubmit={uploadPhoto} className="mb-5 space-y-3">
            <input
              id="profile-photo-input"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-rose-400"
            />

            {file && (
              <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                Selected file:{" "}
                <span className="font-semibold text-gray-800">
                  {file.name}
                </span>
              </div>
            )}

            <Button
              type="submit"
              disabled={uploading || photos.length >= 6}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>

            {photos.length >= 6 && (
              <p className="text-sm text-red-500">
                You have reached the maximum limit of 6 photos.
              </p>
            )}
          </form>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo._id}
                className="overflow-hidden rounded-2xl border bg-white"
              >
                <div className="relative h-40 bg-gray-100">
                  <img
                    src={photo.imageUrl}
                    alt="profile"
                    className="h-full w-full object-cover"
                  />

                  {photo.isPrimary && (
                    <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-1 text-xs font-semibold text-white">
                      Primary
                    </span>
                  )}
                </div>

                <div className="space-y-2 p-2">
                  {!photo.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimaryPhoto(photo._id)}
                      className="flex w-full items-center justify-center gap-1 rounded-lg bg-gray-100 px-2 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                    >
                      <Star size={14} />
                      Set Primary
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deletePhoto(photo._id)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg bg-red-50 px-2 py-2 text-xs font-semibold text-red-500 hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {photos.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed p-6 text-center text-sm text-gray-500">
                No photos uploaded yet. Upload one photo at a time.
              </div>
            )}
          </div>
        </div>

        {/* Preference Section */}
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-500">
              <Heart size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Dating Preferences
              </h2>
              <p className="text-sm text-gray-500">
                Choose what type of profiles you want to see.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Preferred Gender
              </label>

              <select
                name="preferredGender"
                value={preference.preferredGender}
                onChange={handlePreferenceChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-rose-400"
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Input
              label="Min Age"
              name="minAge"
              type="number"
              value={preference.minAge}
              onChange={handlePreferenceChange}
            />

            <Input
              label="Max Age"
              name="maxAge"
              type="number"
              value={preference.maxAge}
              onChange={handlePreferenceChange}
            />

            <Input
              label="Max Distance KM"
              name="maxDistanceKm"
              type="number"
              value={preference.maxDistanceKm}
              onChange={handlePreferenceChange}
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Relationship Goal
              </label>

              <select
                name="relationshipGoal"
                value={preference.relationshipGoal}
                onChange={handlePreferenceChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-rose-400"
              >
                <option value="any">Any</option>
                <option value="long-term">Long-term</option>
                <option value="short-term">Short-term</option>
                <option value="friendship">Friendship</option>
                <option value="casual">Casual</option>
                <option value="marriage">Marriage</option>
                <option value="not-sure">Not sure</option>
              </select>
            </div>

            <Input
              label="City"
              name="city"
              value={preference.city}
              onChange={handlePreferenceChange}
              placeholder="Sydney"
            />

            <Input
              label="Country"
              name="country"
              value={preference.country}
              onChange={handlePreferenceChange}
              placeholder="Australia"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={savePreference}
              disabled={savingPreference}
              variant="secondary"
              className="flex-1"
            >
              {savingPreference ? "Saving..." : "Save Preferences"}
            </Button>

            <Button type="button" onClick={finishSetup} className="flex-1">
              Continue to Discover
            </Button>
          </div>

          {!hasMinimumPhotos && (
            <p className="mt-3 text-sm text-red-500">
              You must upload at least 3 photos before continuing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;