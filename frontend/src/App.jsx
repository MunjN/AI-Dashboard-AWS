import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { DataProvider } from "./context/DataContext.jsx";
import { FiltersProvider } from "./context/FiltersContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Details from "./pages/Details.jsx";
import Overview from "./pages/Overview.jsx";
import ToolDetails from "./pages/ToolDetails.jsx";
import AuthPage from "./pages/Auth.jsx";
import AdminStats from "./pages/AdminStats.jsx"; // ✅ NEW

function RedirectToDetails() {
  const location = useLocation();
  // preserve query string (HashRouter keeps it in hash)
  return <Navigate to={`/details${location.search || ""}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <FiltersProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RedirectToDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/details"
              element={
                <ProtectedRoute>
                  <Details />
                </ProtectedRoute>
              }
            />
            <Route
              path="/overview"
              element={
                <ProtectedRoute>
                  <Overview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tool/:infraId"
              element={
                <ProtectedRoute>
                  <ToolDetails />
                </ProtectedRoute>
              }
            />

            {/* ✅ NEW: internal stats page */}
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <AdminStats />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/details" replace />} />
          </Routes>
        </FiltersProvider>
      </DataProvider>
    </AuthProvider>
  );
}
