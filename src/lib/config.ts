import { z } from "zod";

type RawEnv = {
  AUTH_MICROSOFT_ENTRA_ID_ID: string | undefined;
  AUTH_MICROSOFT_ENTRA_ID_SECRET: string | undefined;
  ONEDRIVE_REFRESH_TOKEN: string | undefined;
  DOWNLOAD_TOKEN_SECRET: string | undefined;
  DOWNLOAD_ALLOWED_ORIGINS: string | undefined;
};

const rawEnv: RawEnv = {
  AUTH_MICROSOFT_ENTRA_ID_ID: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
  AUTH_MICROSOFT_ENTRA_ID_SECRET: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
  ONEDRIVE_REFRESH_TOKEN: process.env.ONEDRIVE_REFRESH_TOKEN,
  DOWNLOAD_TOKEN_SECRET: process.env.DOWNLOAD_TOKEN_SECRET,
  DOWNLOAD_ALLOWED_ORIGINS: process.env.DOWNLOAD_ALLOWED_ORIGINS,
};

const envSchema = z.object({
  AUTH_MICROSOFT_ENTRA_ID_ID: z.string().min(1, "AUTH_MICROSOFT_ENTRA_ID_ID is required"),
  AUTH_MICROSOFT_ENTRA_ID_SECRET: z
    .string()
    .min(1, "AUTH_MICROSOFT_ENTRA_ID_SECRET is required"),
  ONEDRIVE_REFRESH_TOKEN: z.string().optional(),
  DOWNLOAD_TOKEN_SECRET: z.string().optional(),
  DOWNLOAD_ALLOWED_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const flat = parsed.error.flatten().fieldErrors;
  const message = Object.values(flat)
    .flat()
    .join(", ");
  throw new Error(`Invalid environment variables: ${message}`);
}

const { DOWNLOAD_ALLOWED_ORIGINS, ...rest } = parsed.data;

const allowedOrigins = DOWNLOAD_ALLOWED_ORIGINS
  ? DOWNLOAD_ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

export const appConfig = {
  AUTH_MICROSOFT_ENTRA_ID_ID: rest.AUTH_MICROSOFT_ENTRA_ID_ID,
  AUTH_MICROSOFT_ENTRA_ID_SECRET: rest.AUTH_MICROSOFT_ENTRA_ID_SECRET,
  ONEDRIVE_REFRESH_TOKEN: rest.ONEDRIVE_REFRESH_TOKEN ?? null,
  DOWNLOAD_TOKEN_SECRET: rest.DOWNLOAD_TOKEN_SECRET ?? null,
  downloadAllowedOrigins: allowedOrigins,
};

export type AppConfig = typeof appConfig;
