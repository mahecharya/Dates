import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axiosInstance";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
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

      const res = await API.post("/users/login", form);

      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));

      navigate("/discover");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-rose-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-rose-500">
          Welcome Back
        </h1>
        <p className="mb-6 mt-2 text-center text-sm text-gray-500">
          Login to continue
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Do not have an account?{" "}
          <Link to="/register" className="font-semibold text-rose-500">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;