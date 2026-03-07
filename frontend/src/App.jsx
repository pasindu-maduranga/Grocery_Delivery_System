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
import React from 'react'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />

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
          <PrivateRoute><PermissionRoute screenCode="SCREEN_SUPPLIERS"><SuppliersPage /></PermissionRoute></PrivateRoute>
        } />
        <Route path="/suppliers/add" element={
          <PrivateRoute><PermissionRoute screenCode="SCREEN_SUPPLIERS_ADD"><SupplierFormPage /></PermissionRoute></PrivateRoute>
        } />
        <Route path="/suppliers/edit/:id" element={
          <PrivateRoute><PermissionRoute screenCode="SCREEN_SUPPLIERS_ADD"><SupplierFormPage /></PermissionRoute></PrivateRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}