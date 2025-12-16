import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  // Public routes
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  //   route("forgot-password", "routes/forgot-password.tsx"),
  //   route("reset-password", "routes/reset-password.tsx"),

  // Protected dashboard routes
  route("dashboard", "routes/_dashboard.tsx", [
    index("routes/_dashboard.dashboard.tsx"),
    
    // Admin routes
    route("admin", "routes/_dashboard.admin.tsx"),
    route("admin/approvals", "routes/_dashboard.admin.approvals.tsx"),
    route("admin/users", "routes/_dashboard.admin.users.tsx"),
    
    // Release management routes (nested layout)
    route("releases", "routes/_dashboard.releases.tsx", [
      index("routes/_dashboard.releases._index.tsx"),
      route("new", "routes/_dashboard.releases.new.tsx"),
      route(":id", "routes/_dashboard.releases.$id.tsx"),
    ]),
    
    // Additional dashboard routes
    route("analytics", "routes/_dashboard.analytics.tsx"),
    route("settings", "routes/_dashboard.settings.tsx"),
  ]),
] satisfies RouteConfig;
