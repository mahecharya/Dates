import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axiosInstance";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

const Reports = () => {
  const [searchParams] = useSearchParams();
  const reportedUserIdFromUrl = searchParams.get("userId");

  const [reports, setReports] = useState([]);
  const [reportedUser, setReportedUser] = useState(null);

  const [form, setForm] = useState({
    reportedUserId: reportedUserIdFromUrl || "",
    reason: "fake_profile",
    description: "",
  });

  const [message, setMessage] = useState("");

  const fetchReportedUser = async () => {
    if (!reportedUserIdFromUrl) return;

    try {
      const res = await API.get(`/users/${reportedUserIdFromUrl}`);
      setReportedUser(res.data.data);
    } catch (error) {
      console.log(error.response?.data?.message || "Failed to fetch user");
    }
  };

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports/my");
      setReports(res.data.data || []);
    } catch {
      console.log("Failed to fetch reports");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitReport = async (e) => {
    e.preventDefault();

    try {
      await API.post("/reports", form);

      setMessage("Report submitted successfully");

      setForm({
        reportedUserId: reportedUserIdFromUrl || "",
        reason: "fake_profile",
        description: "",
      });

      fetchReports();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to submit report");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (reportedUserIdFromUrl) {
      setForm((prev) => ({
        ...prev,
        reportedUserId: reportedUserIdFromUrl,
      }));

      fetchReportedUser();
    }
  }, [reportedUserIdFromUrl]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">Report User</h1>

        {reportedUser && (
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-rose-50 p-3">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-rose-100">
              {reportedUser.profilePhoto ? (
                <img
                  src={reportedUser.profilePhoto}
                  alt={reportedUser.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold text-rose-500">
                  {reportedUser.name?.[0] || "U"}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500">You are reporting</p>
              <p className="font-semibold text-gray-800">
                {reportedUser.name}
              </p>
            </div>
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
            {message}
          </div>
        )}

        <form onSubmit={submitReport} className="space-y-4">
          {/* Hidden field: backend still needs user ID */}
          <input
            type="hidden"
            name="reportedUserId"
            value={form.reportedUserId}
          />

          {!reportedUserIdFromUrl && (
            <Input
              label="Reported User ID"
              name="reportedUserId"
              value={form.reportedUserId}
              onChange={handleChange}
              required
            />
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reason
            </label>

            <select
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 outline-none"
            >
              <option value="fake_profile">Fake Profile</option>
              <option value="harassment">Harassment</option>
              <option value="spam">Spam</option>
              <option value="scam">Scam</option>
              <option value="inappropriate_photo">Inappropriate Photo</option>
              <option value="abusive_language">Abusive Language</option>
              <option value="underage">Underage</option>
              <option value="other">Other</option>
            </select>
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue..."
            rows="4"
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-400"
          />

          <Button type="submit">Submit Report</Button>
        </form>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-800">My Reports</h2>

        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-gray-500">No reports submitted yet.</p>
          ) : (
            reports.map((report) => (
              <div key={report._id} className="rounded-2xl border p-4">
                <p className="font-semibold text-gray-800">{report.reason}</p>
                <p className="text-sm text-gray-500">
                  Status: {report.status}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  {report.description || "No description"}
                </p>

                {report.reportedUser && (
                  <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm">
                    <p className="text-gray-500">Reported user</p>
                    <p className="font-semibold text-gray-800">
                      {report.reportedUser.name || report.reportedUser.email}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;