This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
It demonstrates using **NextAuth.js** with Microsoft Entra ID for authentication.

## Setup

Install the dependencies first:

```bash
npm install
```

Create a `.env.local` file at the project root and provide your Microsoft OAuth credentials:

```env
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/{tenant-id}/v2.0
```

`MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` can be obtained from Azure Portal. `AUTH_MICROSOFT_ENTRA_ID_ISSUER` should match the issuer URL for your tenant.

### Register a Microsoft Entra ID application

1. Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com/).
2. Navigate to **Identity → Applications → App registrations** and choose **New registration**.
3. Give the app a descriptive name such as *NextJS OneDrive Manager* and select **Accounts in any organizational directory and personal Microsoft accounts** for the supported account types.
4. After creating the app, open the **Authentication** tab. Click **Add a platform**, choose **Web**, and add the exact redirect URIs:
    - Development: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
    - Production: `https://<your-vercel-domain>/api/auth/callback/microsoft-entra-id`
5. Under **Certificates & secrets**, create a **New client secret**. Copy the secret **Value** immediately because it is hidden after you leave the page.
6. Open **API permissions** and add the delegated Microsoft Graph permissions `User.Read`, `Files.ReadWrite.All`, and `offline_access`. Then click **Grant admin consent**.
7. From the **Overview** page copy the **Application (client) ID**. Determine your issuer URL for `AUTH_MICROSOFT_ENTRA_ID_ISSUER`:
    - Multi-tenant + personal: `https://login.microsoftonline.com/common/v2.0`
    - Single tenant: `https://login.microsoftonline.com/<your-tenant-id>/v2.0`
    - Multi-tenant only: `https://login.microsoftonline.com/organizations/v2.0`
    - Personal only: `https://login.microsoftonline.com/consumers/v2.0`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
