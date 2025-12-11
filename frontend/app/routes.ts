import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  // Public routes
  index("routes/login.tsx"), // Root redirects to login
  route("signup", "routes/signup.tsx"),
  //   route("forgot-password", "routes/forgot-password.tsx"),
  //   route("reset-password", "routes/reset-password.tsx"),

  // Protected dashboard routes
  layout("routes/_dashboard.tsx", [
    route("dashboard", "routes/_dashboard.dashboard.tsx"),
    route("admin", "routes/_dashboard.admin.tsx"),
    route("admin/approvals", "routes/_dashboard.admin.approvals.tsx"),
    // Placeholder routes for future implementation
    route("releases", "routes/_dashboard.releases.tsx"),
    route("analytics", "routes/_dashboard.analytics.tsx"),
    route("admin/users", "routes/_dashboard.admin.users.tsx"),
    route("settings", "routes/_dashboard.settings.tsx"),
  ]),
] satisfies RouteConfig;
