export type Bindings = {
  PROD: boolean;
  TURSO_CONNECTION_URL: string;
  TURSO_AUTH_TOKEN: string;
  FIREBASE_PROJECT_ID: string;
};

export type UserContext = {
  userFirebase: {
    uid: string;
    email: string;
    name: string;
    photoUrl: string;
  };
  userRole: {
    role: "user" | "admin" | "agent";
  };
};
