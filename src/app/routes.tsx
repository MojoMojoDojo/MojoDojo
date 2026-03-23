import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import {
  RedirectAuthenticatedAdminEntry,
  RequireAuth,
  RequireAdmin,
} from './components/admin/AdminRouteGuards';

// Public Pages
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import Reviews from "./pages/Reviews";
import { ContactPage } from "./pages/ContactPage";
import { OrderPage } from "./pages/OrderPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { FAQPage } from "./pages/FAQPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Admin Pages
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { OrdersManagement } from "./pages/admin/OrdersManagement";
import { ProductsManagement } from "./pages/admin/ProductsManagement";
import { InventoryManagement } from "./pages/admin/InventoryManagement";
import { FinancialOverview } from "./pages/admin/FinancialOverview";
import { WorkerView } from "./pages/admin/WorkerView";
import { UserManagement } from "./pages/admin/UserManagement";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "about", Component: AboutPage },
      { path: "reviews", Component: Reviews },
      { path: "contact", Component: ContactPage },
      { path: "order", Component: OrderPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "faq", Component: FAQPage },
      { path: "privacy", Component: PrivacyPage },
      { path: "terms", Component: TermsPage },
    ],
  },
  {
    path: "/admin",
    Component: RedirectAuthenticatedAdminEntry,
    children: [
      { index: true, Component: AdminLoginPage },
      {
        Component: RequireAuth,
        children: [
          {
            path: "dashboard",
            Component: AdminLayout,
            children: [
              { index: true, Component: AdminDashboard },
              { path: "worker", Component: WorkerView },
              {
                Component: RequireAdmin,
                children: [
                  { path: "orders", Component: OrdersManagement },
                  { path: "products", Component: ProductsManagement },
                  { path: "inventory", Component: InventoryManagement },
                  { path: "financial", Component: FinancialOverview },
                  { path: "users", Component: UserManagement },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", Component: NotFoundPage },
]);