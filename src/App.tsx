import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { ThemeProvider } from "@/contexts/theme-context";
import { Home } from "@/pages/home";
import { Login } from "@/pages/login";
import { Register } from "@/pages/register";
import { Dashboard } from "@/pages/dashboard";
import { CreateBlog } from "@/pages/create-blog";
import { EditBlog } from "@/pages/edit-blog";
import { BlogDetail } from "@/pages/blog-detail";
import { AdminDashboard } from "@/pages/admin/admin-dashboard";
import { Categories } from "@/pages/admin/categories";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/blog/:id" element={<BlogDetail />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create-blog"
                element={
                  <ProtectedRoute>
                    <CreateBlog />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit-blog/:id"
                element={
                  <ProtectedRoute>
                    <EditBlog />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute adminOnly>
                    <Categories />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
