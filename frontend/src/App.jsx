import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { SidebarProvider } from "./context/SidebarContext";
import { AuthProvider } from "./context/AuthContext";

import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";

//import các page
import SchoolYears from "./pages/SchoolYears";
import Classes from "./pages/Classes";
import Criteria from "./pages/Criteria";
import Weeks from "./pages/Weeks";
import Scoring from "./pages/Scoring";

const Dashboard = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Bảng điều khiển</h1>
    <p className="text-gray-500">Chào mừng bạn đến với hệ thống.</p>
  </div>
);

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
                <Route path="school-years" element={<SchoolYears />} />
                <Route path="classes" element={<Classes />} />
                <Route path="criteria" element={<Criteria />} />
                <Route path="weeks" element={<Weeks />} />
                <Route path="scoring" element={<Scoring />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
