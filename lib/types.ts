export type Role = "pastor" | "staff" | "member" | "guest";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type Tokens = {
  accessToken: string;
  refreshToken?: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  role: Role;
};

export type Member = {
  id: string;
  name: string;
  email?: string;
  role?: Role;
};

export type AttendanceAction = "check_in" | "check_out";
