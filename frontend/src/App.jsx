import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { SidebarProvider } from "./context/SidebarContext";
import { AuthProvider } from "./context/AuthContext";

import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

//import các page
import SchoolYears from "./pages/SchoolYears";
import Classes from "./pages/Classes";
import Criteria from "./pages/Criteria";
import Weeks from "./pages/Weeks";
import Scoring from "./pages/Scoring";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import UserGuide from "./pages/UserGuide";

function App() {
  return (
    <AuthProvider>
      {" "}
      <SidebarProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<PrivateRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="scoring" element={<Scoring />} />
                <Route path="profile" element={<Profile />} />
                <Route path="guide" element={<UserGuide />} />

                <Route element={<AdminRoute />}>
                  <Route path="school-years" element={<SchoolYears />} />
                  <Route path="classes" element={<Classes />} />
                  <Route path="criteria" element={<Criteria />} />
                  <Route path="weeks" element={<Weeks />} />
                  <Route path="users" element={<Users />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
