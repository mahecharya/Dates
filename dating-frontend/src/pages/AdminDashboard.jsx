import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import Loader from "../components/common/Loader";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportedUsers, setReportedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, usersRes, reportsRes, reportedUsersRes] =
        await Promise.all([
          API.get("/admin/stats"),
          API.get("/admin/users"),
          API.get("/admin/reports"),
          API.get("/admin/reported-users"),
        ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setReports(reportsRes.data.data || []);
      setReportedUsers(reportedUsersRes.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Admin fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId) => {
    try {
      await API.patch(`/admin/users/${userId}/ban`, {
        reason: "Violation of community rules",
      });
      fetchAdminData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to ban user");
    }
  };

  const unbanUser = async (userId) => {
    try {
      await API.patch(`/admin/users/${userId}/unban`);
      fetchAdminData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to unban user");
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) return <Loader text="Loading admin dashboard..." />;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-800">
        Admin Dashboard
      </h1>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat title="Total Users" value={stats.users?.totalUsers} />
          <Stat title="Active Users" value={stats.users?.activeUsers} />
          <Stat title="Matches" value={stats.matches?.totalMatches} />
          <Stat title="Reports" value={stats.reports?.totalReports} />
        </div>
      )}

      <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          Reported Accounts
        </h2>

        {reportedUsers.length === 0 ? (
          <p className="text-gray-500">No reported accounts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3">User</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Total Reports</th>
                  <th className="py-3">Pending</th>
                  <th className="py-3">Resolved</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {reportedUsers.map((item) => {
                  const user = item.user;

                  if (!user) return null;

                  return (
                    <tr key={user._id} className="border-b">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-rose-100">
                            {user.profilePhoto ? (
                              <img
                                src={user.profilePhoto}
                                alt={user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold text-rose-500">
                                {user.name?.[0] || "U"}
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {user.gender}, {user.age}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-gray-600">{user.email}</td>

                      <td className="py-3">
                        <span className="rounded-full bg-red-50 px-3 py-1 font-bold text-red-600">
                          {item.reportCount}
                        </span>
                      </td>

                      <td className="py-3">{item.pendingCount}</td>

                      <td className="py-3">{item.resolvedCount}</td>

                      <td className="py-3">
                        {user.isBanned ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                            Banned
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-600">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3">
                        {user.isBanned ? (
                          <button
                            onClick={() => unbanUser(user._id)}
                            className="rounded-xl bg-green-500 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => banUser(user._id)}
                            className="rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Users</h2>

          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between rounded-2xl border p-3"
                >
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      {user.role} | {user.isBanned ? "Banned" : "Active"}
                    </p>
                  </div>

                  {user.isBanned ? (
                    <button
                      onClick={() => unbanUser(user._id)}
                      className="rounded-xl bg-green-500 px-3 py-2 text-sm text-white"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => banUser(user._id)}
                      className="rounded-xl bg-red-500 px-3 py-2 text-sm text-white"
                    >
                      Ban
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Recent Reports</h2>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-gray-500">No reports found.</p>
            ) : (
              reports.map((report) => (
                <div key={report._id} className="rounded-2xl border p-3">
                  <p className="font-semibold">{report.reason}</p>

                  <p className="text-sm text-gray-500">
                    Status: {report.status}
                  </p>

                  {report.reportedUser && (
                    <p className="text-sm text-gray-500">
                      Reported account:{" "}
                      <span className="font-semibold text-gray-800">
                        {report.reportedUser.name}
                      </span>
                    </p>
                  )}

                  <p className="mt-2 text-sm">{report.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ title, value }) => {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-rose-500">{value || 0}</h3>
    </div>
  );
};

export default AdminDashboard;