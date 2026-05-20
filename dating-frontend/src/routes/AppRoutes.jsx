import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/common/ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Discovery from "../pages/Discovery";
import Matches from "../pages/Matches";
import Chat from "../pages/Chat";
import Profile from "../pages/Profile";
import ViewProfile from "../pages/ViewProfile";
import Preferences from "../pages/Preferences";
import Photos from "../pages/Photos";
import Notifications from "../pages/Notifications";
import Reports from "../pages/Reports";
import AdminDashboard from "../pages/AdminDashboard";
import ProfileSetupGuard from "../components/common/ProfileSetupGuard";
import CompleteProfile from "../pages/CompleteProfile";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/discover" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

       <Route
  element={
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  }
>
  <Route path="/complete-profile" element={<CompleteProfile />} />
 <Route
  path="/discover"
  element={
    <ProfileSetupGuard>
      <Discovery />
    </ProfileSetupGuard>
  }
/>
  <Route path="/matches" element={<Matches />} />
  <Route path="/chat/:matchId" element={<Chat />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/profile/:username" element={<ViewProfile />} />
  <Route path="/preferences" element={<Preferences />} />
  <Route path="/photos" element={<Photos />} />
  <Route path="/notifications" element={<Notifications />} />
  <Route path="/reports" element={<Reports />} />
  <Route path="/admin" element={<AdminDashboard />} />
</Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;