import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";

const Profile = () => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    username: "",
    gender: "",
    bio: "",
    jobTitle: "",
    education: "",
    city: "",
    country: "",
    relationshipGoal: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users/me");
      const user = res.data.data;

      setForm({
        name: user.name || "",
        age: user.age || "",
        username: user.username || "",
        gender: user.gender || "",
        bio: user.bio || "",
        jobTitle: user.jobTitle || "",
        education: user.education || "",
        city: user.city || "",
        country: user.country || "",
        relationshipGoal: user.relationshipGoal || "",
      });
    } catch (error) {
      console.log(error.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        age: Number(form.age),
      };

      const res = await API.put("/users/me", payload);
      localStorage.setItem("user", JSON.stringify(res.data.data));

      setMessage("Profile updated successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <Loader text="Loading profile..." />;

  return (
    <div className="mx-auto max-w-3xl rounded-3xl bg-white p-5 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">My Profile</h1>

      {message && (
        <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
          {message}
        </div>
      )}

      <form onSubmit={updateProfile} className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          label="Age"
          name="age"
          type="number"
          value={form.age}
          onChange={handleChange}
        />
        <Input
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="example: omkar_123"
        />
        <Input
          label="Gender"
          name="gender"
          value={form.gender}
          onChange={handleChange}
        />
        <Input
          label="Job Title"
          name="jobTitle"
          value={form.jobTitle}
          onChange={handleChange}
        />
        <Input
          label="Education"
          name="education"
          value={form.education}
          onChange={handleChange}
        />
        <Input
          label="City"
          name="city"
          value={form.city}
          onChange={handleChange}
        />
        <Input
          label="Country"
          name="country"
          value={form.country}
          onChange={handleChange}
        />
        <Input
          label="Relationship Goal"
          name="relationshipGoal"
          value={form.relationshipGoal}
          onChange={handleChange}
        />

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows="4"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <Button type="submit">Save Profile</Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
