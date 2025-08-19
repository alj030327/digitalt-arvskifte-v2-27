import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import EstateProcess from "./pages/EstateProcess";
import NotFound from "./pages/NotFound";
import { SignDocument } from "./pages/SignDocument";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Support from "./pages/Support";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { CaseAccess } from "./pages/CaseAccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/arvsskifte" element={<EstateProcess />} />
          <Route path="/sign/:token" element={<SignDocument />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/case/:access_token" element={<CaseAccess />} />
          <Route path="/villkor" element={<Terms />} />
          <Route path="/integritet" element={<Privacy />} />
          <Route path="/support" element={<Support />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
