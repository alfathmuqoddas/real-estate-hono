export type Bindings = {
  PROD: boolean;
  TURSO_URL: string;
  TURSO_AUTH_TOKEN: string;
  FIREBASE_PROJECT_ID: string;
};

export type UserContext = {
  user: {
    uid: string;
    email?: string;
    role: "user" | "admin" | "agent";
  };
};
