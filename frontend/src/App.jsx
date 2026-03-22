import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import {
  PrivateRoute,
  PublicRoute,
  PermissionRoute,
} from "./components/common/Guards";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";
import { NotFoundPage } from "./pages/ErrorPages";
import ParentMenusPage from "./pages/ParentMenusPage";
import MenusPage from "./pages/MenusPage";
import ScreensPage from "./pages/ScreensPage";
import SuppliersPage from "./GrocerysupplierManagment/SuppliersPage";
import SupplierFormPage from "./GrocerysupplierManagment/SupplierFormPage";
import MyGroceryItemsPage from "./InventoryManagment/Mygroceryitemspage";
import MySubmissionsPage from "./InventoryManagment/Mysubmissionspage";
import AdminSubmissionsPage from "./InventoryManagment/Adminsubmissionspage";
import InventoryPage from "./InventoryManagment/Inventorypage";
import TransactionsPage from "./InventoryManagment/TransactionsPage";
import AccountingPage from "./InventoryManagment/AccountingPage";
import { SocketProvider } from "./context/SocketContext";
import DriverRegisterPage from "./pages/DriverRegisterPage";
import DriverDashboardPage from "./pages/DriverDashboardPage";
import DeliveryTrackingPage from "./pages/DeliveryTrackingPage";
import AdminAssignmentPage from "./pages/AdminAssignmentPage";
import DriverProfilePage from "./pages/DriverProfilePage";
import OrdersPage from "./OrderManagement/OrdersPage";
import OrderDetailPage from "./OrderManagement/OrderDetailPage";

export default function App() {
  const driverId = localStorage.getItem("fc_driver_id") || "";
  return (
    <AuthProvider>
      <SocketProvider driverId={driverId}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <PermissionRoute screenCode="SCREEN_USERS">
                  <UsersPage />
                </PermissionRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <PrivateRoute>
                <PermissionRoute screenCode="SCREEN_ROLES">
                  <RolesPage />
                </PermissionRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/parent-menus"
            element={
              <PrivateRoute>
                <PermissionRoute screenCode="SCREEN_PARENT_MENUS">
                  <ParentMenusPage />
                </PermissionRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/menus"
            element={
              <PrivateRoute>
                <PermissionRoute screenCode="SCREEN_MENUS">
                  <MenusPage />
                </PermissionRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/screens"
            element={
              <PrivateRoute>
                <PermissionRoute screenCode="SCREEN_SCREENS">
                  <ScreensPage />
                </PermissionRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/suppliers"
            element={
              <PrivateRoute>
                <PermissionRoute screenCode="SCREEN_SUPPLIERS">
                  <SuppliersPage />
                </PermissionRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/suppliers/add"
            element={
              <PrivateRoute>
                <PermissionRoute screenCode="SCREEN_SUPPLIERS_ADD">
                  <SupplierFormPage />
                </PermissionRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/suppliers/edit/:id"
            element={
              <PrivateRoute>
                <PermissionRoute screenCode="SCREEN_SUPPLIERS_ADD">
                  <SupplierFormPage />
                </PermissionRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/my-grocery-items"
            element={
              <PrivateRoute>
                <MyGroceryItemsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-submissions"
            element={
              <PrivateRoute>
                <MySubmissionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/grocery-submissions"
            element={
              <PrivateRoute>
                <AdminSubmissionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <PrivateRoute>
                <InventoryPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <TransactionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-transactions"
            element={
              <PrivateRoute>
                <TransactionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/accounting"
            element={
              <PrivateRoute>
                <AccountingPage />
              </PrivateRoute>
            }
          />

          <Route path="/driver/register" element={<DriverRegisterPage />} />
          <Route
            path="/driver/dashboard"
            element={<DriverDashboardPage driverId={driverId} />}
          />
          <Route path="/delivery/track" element={<DeliveryTrackingPage />} />
          <Route
            path="/delivery/track/:deliveryId"
            element={<DeliveryTrackingPage />}
          />
          <Route
            path="/admin/delivery-assignment"
            element={<AdminAssignmentPage />}
          />
          <Route
            path="/driver/profile"
            element={
              <DriverProfilePage />
             
            }
          />

          {/* Order Management */}
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrdersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <PrivateRoute>
                <OrderDetailPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}
