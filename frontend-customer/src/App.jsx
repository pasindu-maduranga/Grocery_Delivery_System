import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CustomerShopPage from "./pages/CustomerShopPage";
import Cart from "./pages/Cart";
import UserProfile from "./pages/UserProfile";
import Orders from "./pages/Orders";
import PaymentSuccess from "./pages/Payment/SuccessPage";
import PaymentCancel from "./pages/Payment/CancelPage";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* App */}
        <Route path="/dashboard" element={<CustomerShopPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/orders" element={<Orders />} />

        {/* Payment callbacks */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Default */}
        <Route path="/" element={<CustomerShopPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
