export const APP_NAME = "ClubConnect";

export const Routes = {
  HOME: "/",
  LOGIN: "/login",
  STUDENT_DASHBOARD: "/student/dashboard",
  STUDENT_SIGNUP: (clubId: string) => `/student/signup/${clubId}`,
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_CLUBS: "/admin/clubs",
  ADMIN_CLUBS_NEW: "/admin/clubs/new",
  ADMIN_CLUBS_EDIT: (clubId: string) => `/admin/clubs/edit/${clubId}`,
  ADMIN_ENROLLMENTS: "/admin/enrollments",
};

export const DAYS_OF_WEEK: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export type DayOfWeek = typeof DAYS_OF_WEEK[number];
