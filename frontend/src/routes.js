/**
 * Application Routes for Airport Task Planner
 */

import Login from "./views/Login.js";
import DashboardIndex from "./views/dashboard/Index.js";
import Tasks from "./views/dashboard/Tasks.js";
import Users from "./views/dashboard/Users.js";
import Team from "./views/dashboard/Team.js";
import History from "./views/dashboard/History.js";
import Weather from "./views/dashboard/Weather.js";

const routes = [
    {
        path: "/login",
        name: "Login",
        component: <Login />,
        layout: "/auth",
    },
    {
        path: "/index",
        name: "Dashboard",
        component: DashboardIndex,
        layout: "/dashboard",
    },
    {
        path: "/tasks",
        name: "Tasks",
        component: Tasks,
        layout: "/dashboard",
    },
    {
        path: "/users",
        name: "Users",
        component: Users,
        layout: "/dashboard",
    },
    {
        path: "/team",
        name: "Team",
        component: Team,
        layout: "/dashboard",
    },
    {
        path: "/history",
        name: "History",
        component: History,
        layout: "/dashboard",
    },
    {
        path: "/weather",
        name: "Weather",
        component: Weather,
        layout: "/dashboard",
    },
];

export default routes;
