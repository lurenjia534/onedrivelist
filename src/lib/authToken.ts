function toHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function getAuthToken(): Promise<string | null> {
    const password = process.env.password;
    if (!password) return null;
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const secret = process.env.AUTH_SECRET;
    if (secret) {
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const signature = await crypto.subtle.sign("HMAC", key, data);
        return toHex(signature);
    }
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return toHex(hashBuffer);
}
