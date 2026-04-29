import { z } from "zod";

export const agencySchema = z.object({
  agencyName: z.string().trim().min(1, "Agency name is required"),
  logoUrl: z.url("Invalid logo url").min(1, "Logo url is required"),
  websiteUrl: z.url("Invalid website url").optional(),
  phoneNumber: z.string().min(5, "Phone number is too short").optional(),
  email: z.email("Invalid email address").min(1, "Email is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  establishedAt: z.coerce.date({
    message: "Please enter a valid date",
  }),
});

export type AgencyInput = z.infer<typeof agencySchema>;
