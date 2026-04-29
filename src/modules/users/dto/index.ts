export type CreateUserInput = {
  uid: string;
  email: string;
  name: string;
  photoUrl: string;
  role: "admin" | "agent" | "user";
};
