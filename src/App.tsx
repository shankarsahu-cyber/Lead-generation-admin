import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AllMerchants from "./pages/AllMerchants";
import Subscriptions from "./pages/Subscriptions";
import CreatePlan from "./pages/CreatePlan";
import MerchantDetailsPage from "./pages/MerchantDetailsPage";
import EditMerchantPage from "./pages/EditMerchantPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


// Always clear user on app start so login is required every time
localStorage.removeItem('user');

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="create-plan" element={<CreatePlan />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
