function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashWithOptionalSecret(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const secret = process.env.AUTH_SECRET;
  if (secret) {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign("HMAC", key, data);
    return toHex(signature);
  }
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return toHex(hashBuffer);
}

export async function getUserToken(): Promise<string | null> {
  const password = process.env.password;
  if (!password) return null;
  return hashWithOptionalSecret(password);
}

export async function getAdminToken(): Promise<string | null> {
  const adminPassword = process.env.ADMIN_PASSWORD ?? process.env.admin_password;
  if (!adminPassword) return null;
  return hashWithOptionalSecret(adminPassword);
}

export async function getAuthTokens(): Promise<{ user: string | null; admin: string | null }> {
  const [user, admin] = await Promise.all([getUserToken(), getAdminToken()]);
  return { user, admin };
}

// Backwards compatibility: previous single-token accessor (user token)
export async function getAuthToken(): Promise<string | null> {
  return getUserToken();
}
