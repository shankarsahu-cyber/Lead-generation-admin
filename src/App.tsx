import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AllMerchants from "./pages/AllMerchants";
import CreatePlan from "./pages/CreatePlan";
import MerchantDetailsPage from "./pages/MerchantDetailsPage";
import EditMerchantPage from "./pages/EditMerchantPage";
import NotFound from "./pages/NotFound";

const TemplateBuilder = React.lazy(() => import("./features/template-builder"));

const queryClient = new QueryClient();


// Always clear user on app start so login is required every time
// localStorage.removeItem('user');

const AppContent = () => {
  const { user } = useAuth();

  const handleSaveTemplate = async (template: any) => {
    console.log("Saving template:", template);
    // Implement actual API call to save the template
    // const response = await api.post("/templates", template);
    // return response.data;
  };

  const auth = user ? { token: user.token, user: { id: String(user.merchantId) } } : undefined;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="merchants" element={<AllMerchants />} />
              <Route path="merchants/:merchantId" element={<MerchantDetailsPage />} />
              <Route path="merchants/:merchantId/edit" element={<EditMerchantPage />} />
              <Route path="create-plan" element={<CreatePlan />} />
              <Route
                path="template-builder/*"
                element={<React.Suspense fallback={<div>Loading Template Builder...</div>}><TemplateBuilder auth={auth} onSave={handleSaveTemplate} /></React.Suspense>}
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
