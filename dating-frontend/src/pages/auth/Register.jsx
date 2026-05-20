import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axiosInstance";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    age: "",
    gender: "male",
    bio: "",
    city: "",
    country: "",
    relationshipGoal: "long-term",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        ...form,
        age: Number(form.age),
      };

      const res = await API.post("/users/register", payload);

      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));

      navigate("/complete-profile");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-rose-50 px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-rose-500">
          Create Account
        </h1>
        <p className="mb-6 mt-2 text-center text-sm text-gray-500">
          Start your dating journey
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Age"
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            required
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Relationship Goal
            </label>
            <select
              name="relationshipGoal"
              value={form.relationshipGoal}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
            >
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
            value={form.city}
            onChange={handleChange}
          />

          <Input
            label="Country"
            name="country"
            value={form.country}
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
              rows="3"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Register"}
            </Button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-rose-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
