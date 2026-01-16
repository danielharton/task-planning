/**
 * Navigation Menus for Airport Task Planner
 * Role-based menu configuration
 */

import DashboardIcon from '@mui/icons-material/Dashboard';
import TaskIcon from '@mui/icons-material/Task';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import HistoryIcon from '@mui/icons-material/History';
import CloudIcon from '@mui/icons-material/Cloud';

import { ROLES } from './utilConstants';

export const menus = [
    {
        id: 1,
        name: "Dashboard",
        to: "/dashboard/index",
        icon: DashboardIcon,
        isCategory: false,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EXECUTOR],
        order: 10
    },
    {
        id: 2,
        name: "Tasks",
        to: "/dashboard/tasks",
        icon: TaskIcon,
        isCategory: false,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EXECUTOR],
        order: 20
    },
    {
        id: 3,
        name: "My Team",
        to: "/dashboard/team",
        icon: GroupIcon,
        isCategory: false,
        roles: [ROLES.MANAGER],
        order: 30
    },
    {
        id: 4,
        name: "My History",
        to: "/dashboard/history",
        icon: HistoryIcon,
        isCategory: false,
        roles: [ROLES.EXECUTOR],
        order: 40
    },
    {
        id: 5,
        name: "Users",
        to: "/dashboard/users",
        icon: PeopleIcon,
        isCategory: false,
        roles: [ROLES.ADMIN],
        order: 50
    },
    {
        id: 6,
        name: "Airport Weather",
        to: "/dashboard/weather",
        icon: CloudIcon,
        isCategory: false,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EXECUTOR],
        order: 60
    }
];
