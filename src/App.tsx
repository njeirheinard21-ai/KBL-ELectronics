/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootLayout } from "./components/layout/RootLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { authService } from "./services/authService";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { RouteGuard } from "./components/RouteGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const Home = lazy(() => import("./pages/Home").then(module => ({ default: module.Home })));
const Auth = lazy(() => import("./pages/Auth").then(module => ({ default: module.Auth })));
const Checkout = lazy(() => import("./pages/Checkout").then(module => ({ default: module.Checkout })));
const Confirmation = lazy(() => import("./pages/order/Confirmation").then(module => ({ default: module.Confirmation })));
const ProductDetails = lazy(() => import("./pages/ProductDetails").then(module => ({ default: module.ProductDetails })));
const Category = lazy(() => import("./pages/Category").then(module => ({ default: module.Category })));
const NotFound = lazy(() => import("./pages/NotFound").then(module => ({ default: module.NotFound })));
const GuestTracking = lazy(() => import("./pages/GuestTracking").then(module => ({ default: module.GuestTracking })));
const AccountLayout = lazy(() => import("./components/account/AccountLayout").then(module => ({ default: module.AccountLayout })));
const AccountDashboard = lazy(() => import("./pages/account/Dashboard").then(module => ({ default: module.AccountDashboard })));
const AccountOrders = lazy(() => import("./pages/account/Orders").then(module => ({ default: module.AccountOrders })));
const AccountOrderDetails = lazy(() => import("./pages/account/OrderDetails").then(module => ({ default: module.AccountOrderDetails })));
const AccountAddresses = lazy(() => import("./pages/account/Addresses").then(module => ({ default: module.AccountAddresses })));
const AccountWishlist = lazy(() => import("./pages/account/Wishlist").then(module => ({ default: module.AccountWishlist })));
const AccountRequests = lazy(() => import("./pages/account/Requests").then(module => ({ default: module.AccountRequests })));
const AccountProfile = lazy(() => import("./pages/account/Profile").then(module => ({ default: module.AccountProfile })));


const Cart = lazy(() => import("./pages/Cart").then(module => ({ default: module.Cart })));
const Search = lazy(() => import("./pages/Search").then(module => ({ default: module.Search })));
const Brands = lazy(() => import("./pages/Brands").then(module => ({ default: module.Brands })));
const Warranty = lazy(() => import("./pages/Warranty").then(module => ({ default: module.Warranty })));
const Repair = lazy(() => import("./pages/Repair").then(module => ({ default: module.Repair })));
const TradeIn = lazy(() => import("./pages/TradeIn").then(module => ({ default: module.TradeIn })));
const FAQ = lazy(() => import("./pages/FAQ").then(module => ({ default: module.FAQ })));
const Support = lazy(() => import("./pages/Support").then(module => ({ default: module.Support })));
const Products = lazy(() => import("./pages/Products").then(module => ({ default: module.Products })));

// Admin Pages
const UsersAdmin = lazy(() => import("./pages/admin/Users").then(module => ({ default: module.UsersAdmin })));
const Dashboard = lazy(() => import("./pages/admin/Dashboard").then(module => ({ default: module.Dashboard })));
const ProductsAdmin = lazy(() => import("./pages/admin/Products").then(module => ({ default: module.ProductsAdmin })));
const OrdersAdmin = lazy(() => import("./pages/admin/Orders").then(module => ({ default: module.OrdersAdmin })));
const CustomersAdmin = lazy(() => import("./pages/admin/Customers").then(module => ({ default: module.CustomersAdmin })));
const InventoryAdmin = lazy(() => import("./pages/admin/Inventory").then(module => ({ default: module.Inventory })));
const StaffAdmin = lazy(() => import("./pages/admin/Staff").then(module => ({ default: module.Staff })));
const MarketingAdmin = lazy(() => import("./pages/admin/Marketing").then(module => ({ default: module.Marketing })));
const CMSAdmin = lazy(() => import("./pages/admin/CMS").then(module => ({ default: module.CMS })));
const ReportingAdmin = lazy(() => import("./pages/admin/Reporting").then(module => ({ default: module.Reporting })));
const SettingsAdmin = lazy(() => import("./pages/admin/Settings").then(module => ({ default: module.Settings })));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/admin",
    element: <RouteGuard requireAdmin><AdminLayout /></RouteGuard>,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path: "products",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductsAdmin />
          </Suspense>
        )
      },
      {
        path: "orders",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OrdersAdmin />
          </Suspense>
        )
      },
      {
        path: "users",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <UsersAdmin />
          </Suspense>
        )
      },
      {
        path: "customers",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CustomersAdmin />
          </Suspense>
        )
      },
            {
        path: "inventory",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <InventoryAdmin />
          </Suspense>
        )
      },
      {
        path: "staff",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StaffAdmin />
          </Suspense>
        )
      },
      {
        path: "marketing",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <MarketingAdmin />
          </Suspense>
        )
      },
      {
        path: "cms",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CMSAdmin />
          </Suspense>
        )
      },
      {
        path: "reporting",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ReportingAdmin />
          </Suspense>
        )
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SettingsAdmin />
          </Suspense>
        )
      },
      {
        path: "*",
        element: (
          <Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>
        )
      }
    ]
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        )
      },
      {
        path: "auth",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Auth />
          </Suspense>
        )
      },
      {
        path: "checkout",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Checkout />
          </Suspense>
        )
      },
      {
        path: "order/confirmation/:orderNumber",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Confirmation />
          </Suspense>
        )
      },
      {
        path: "product/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductDetails />
          </Suspense>
        )
      },
      {
        path: "categories/:categoryId",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Category />
          </Suspense>
        )
      },
      {
        path: "deals",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Category />
          </Suspense>
        )
      },
      {
        path: "account",
        element: (
          <RouteGuard>
            <Suspense fallback={<LoadingSpinner />}>
              <AccountLayout />
            </Suspense>
          </RouteGuard>
        ),
        children: [
          { index: true, element: <AccountDashboard /> },
          { path: "orders", element: <AccountOrders /> },
          { path: "orders/:orderNumber", element: <AccountOrderDetails /> },
          { path: "addresses", element: <AccountAddresses /> },
          { path: "wishlist", element: <AccountWishlist /> },
          { path: "requests", element: <AccountRequests /> },
          { path: "profile", element: <AccountProfile /> },
        ]
      },
      {
        path: "track",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <GuestTracking />
          </Suspense>
        )
      },
      
      {
        path: "products",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Products />
          </Suspense>
        )
      },
      {
        path: "search",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Search />
          </Suspense>
        )
      },
      {
        path: "cart",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Cart />
          </Suspense>
        )
      },
      {
        path: "brands",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Brands />
          </Suspense>
        )
      },
      {
        path: "warranty",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Warranty />
          </Suspense>
        )
      },
      {
        path: "repair",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Repair />
          </Suspense>
        )
      },
      {
        path: "trade-in",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TradeIn />
          </Suspense>
        )
      },
      {
        path: "faq",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <FAQ />
          </Suspense>
        )
      },
      {
        path: "support",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Support />
          </Suspense>
        )
      },

      // Placeholders for future pages
      {
        path: "*",
        element: (
          <Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>
        )
      }
    ]
  }
]);

export default function App() {
  useEffect(() => {
    const unsubscribe = authService.init();
    return () => unsubscribe();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <RouterProvider router={router} />
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}


