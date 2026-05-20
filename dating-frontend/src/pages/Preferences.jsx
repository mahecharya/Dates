import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

const Preferences = () => {
  const [form, setForm] = useState({
    preferredGender: "any",
    minAge: 18,
    maxAge: 35,
    maxDistanceKm: 50,
    relationshipGoal: "any",
    city: "",
    country: "",
  });

  const [message, setMessage] = useState("");

  const fetchPreference = async () => {
    try {
      const res = await API.get("/preferences/me");
      setForm({
        preferredGender: res.data.data.preferredGender || "any",
        minAge: res.data.data.minAge || 18,
        maxAge: res.data.data.maxAge || 35,
        maxDistanceKm: res.data.data.maxDistanceKm || 50,
        relationshipGoal: res.data.data.relationshipGoal || "any",
        city: res.data.data.city || "",
        country: res.data.data.country || "",
      });
    } catch {
      console.log("No preference yet");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const savePreference = async (e) => {
    e.preventDefault();

    try {
      await API.patch("/preferences/me", {
        ...form,
        minAge: Number(form.minAge),
        maxAge: Number(form.maxAge),
        maxDistanceKm: Number(form.maxDistanceKm),
      });

      setMessage("Preferences saved successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save");
    }
  };

  useEffect(() => {
    fetchPreference();
  }, []);

  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-white p-5 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Preferences</h1>

      {message && (
        <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
          {message}
        </div>
      )}

      <form onSubmit={savePreference} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Preferred Gender
          </label>
          <select
            name="preferredGender"
            value={form.preferredGender}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3 outline-none"
          >
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Input label="Min Age" name="minAge" type="number" value={form.minAge} onChange={handleChange} />
        <Input label="Max Age" name="maxAge" type="number" value={form.maxAge} onChange={handleChange} />
        <Input label="Max Distance KM" name="maxDistanceKm" type="number" value={form.maxDistanceKm} onChange={handleChange} />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Relationship Goal
          </label>
          <select
            name="relationshipGoal"
            value={form.relationshipGoal}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3 outline-none"
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

        <Input label="City" name="city" value={form.city} onChange={handleChange} />
        <Input label="Country" name="country" value={form.country} onChange={handleChange} />

        <div className="sm:col-span-2">
          <Button type="submit">Save Preferences</Button>
        </div>
      </form>
    </div>
  );
};

export default Preferences;