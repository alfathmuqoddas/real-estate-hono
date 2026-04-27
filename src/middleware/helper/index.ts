import { jwtVerify, createRemoteJWKSet } from "jose";

export const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export const verifyToken = async (
  authHeader: string | undefined,
  projectId: string,
  JWKS: any,
) => {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const idToken = authHeader.split(" ")[1];

  try {
    const result = await jwtVerify(idToken, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    return result.payload;
  } catch {
    return null;
  }
};
