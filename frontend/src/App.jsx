import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute, PublicRoute, PermissionRoute } from './components/common/Guards'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import RolesPage from './pages/RolesPage'
import { NotFoundPage } from './pages/ErrorPages'
import ParentMenusPage from './pages/ParentMenusPage'
import MenusPage from './pages/MenusPage'
import ScreensPage from './pages/ScreensPage'
import SuppliersPage from './GrocerysupplierManagment/SuppliersPage'
import SupplierFormPage from './GrocerysupplierManagment/SupplierFormPage'
import MyGroceryItemsPage from './InventoryManagment/MyGroceryItemsPage'
import MySubmissionsPage from './InventoryManagment/MySubmissionsPage'
import AdminSubmissionsPage from './InventoryManagment/AdminSubmissionsPage'
import InventoryPage from './InventoryManagment/InventoryPage'
import PaymentPage from './pages/Payment/PaymentPage'
import SuccessPage from './pages/Payment/SuccessPage'
import React from 'react'
import CancelPage from './pages/Payment/CancelPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />

        <Route path="/payment" element={
          <PublicRoute>
            <PaymentPage />
          </PublicRoute>
        } />

        <Route path="/payment/success" element={<SuccessPage />} />
        <Route path="/payment/cancel" element={<CancelPage />} />

        <Route path="/dashboard" element={
          <PrivateRoute><DashboardPage /></PrivateRoute>
        } />

        <Route path="/admin/users" element={
          <PrivateRoute>
            <PermissionRoute screenCode="SCREEN_USERS">
              <UsersPage />
            </PermissionRoute>
          </PrivateRoute>
        } />

        <Route path="/admin/roles" element={
          <PrivateRoute>
            <PermissionRoute screenCode="SCREEN_ROLES">
              <RolesPage />
            </PermissionRoute>
          </PrivateRoute>
        } />
        <Route path="/admin/parent-menus" element={
          <PrivateRoute>
            <PermissionRoute screenCode="SCREEN_PARENT_MENUS">
              <ParentMenusPage />
            </PermissionRoute>
          </PrivateRoute>
        } />
        <Route path="/admin/menus" element={
          <PrivateRoute>
            <PermissionRoute screenCode="SCREEN_MENUS">
              <MenusPage />
            </PermissionRoute>
          </PrivateRoute>
        } />
        <Route path="/admin/screens" element={
          <PrivateRoute>
            <PermissionRoute screenCode="SCREEN_SCREENS">
              <ScreensPage />
            </PermissionRoute>
          </PrivateRoute>
        } />

        <Route path="/suppliers" element={
          <PrivateRoute>
            <PermissionRoute screenCode="SCREEN_SUPPLIERS">
              <SuppliersPage />
            </PermissionRoute>
          </PrivateRoute>
        } />

        <Route path="/suppliers/add" element={
          <PrivateRoute><PermissionRoute screenCode="SCREEN_SUPPLIERS_ADD"><SupplierFormPage /></PermissionRoute></PrivateRoute>
        } />
        <Route path="/suppliers/edit/:id" element={
          <PrivateRoute><PermissionRoute screenCode="SCREEN_SUPPLIERS_ADD"><SupplierFormPage /></PermissionRoute></PrivateRoute>
        } />

         <Route path="/my-grocery-items"   element={<PrivateRoute><MyGroceryItemsPage /></PrivateRoute>} />
        <Route path="/my-submissions"     element={<PrivateRoute><MySubmissionsPage /></PrivateRoute>} />
        <Route path="/grocery-submissions" element={<PrivateRoute><AdminSubmissionsPage /></PrivateRoute>} />
        <Route path="/inventory"          element={<PrivateRoute><InventoryPage /></PrivateRoute>} />

        <Route path="*" element={<NotFoundPage />} />

        
      </Routes>
    </AuthProvider>
  )
}