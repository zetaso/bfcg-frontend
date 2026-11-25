import {
    type RouteConfig,
    index,
    layout,
    route
} from "@react-router/dev/routes";

export default [
    layout("./layouts/Main.tsx", [
        index("./pages/Home.tsx"),
        route("services", "./pages/Services.tsx"),
        route("services/:slug", "./pages/ServiceDetail.tsx"),
    ]),

    // route("login", "./pages/Login.tsx"),

    // admin panel: login is outside the guarded layout
    route("admin/login", "./pages/admin/Login.tsx"),
    route("admin", "./layouts/Admin.tsx", [
        index("./pages/admin/Settings.tsx"),
        route("services", "./pages/admin/Services.tsx"),
        route("services/:id", "./pages/admin/ServiceEdit.tsx"),
        route("testimonials", "./pages/admin/Testimonials.tsx"),
    ]),

] satisfies RouteConfig;