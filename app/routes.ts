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

    route(".well-known/*", "./routes/well-known.ts"),
] satisfies RouteConfig;