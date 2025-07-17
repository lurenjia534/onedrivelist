# OneList - A Next.js OneDrive File Browser

![Login Page Screenshot](https://i.imgur.com/your-screenshot-url.png) <!-- Placeholder: Replace with an actual screenshot -->

OneList is a modern, open-source web application built with Next.js that allows you to browse and display files from a Microsoft OneDrive account. It features a clean, responsive interface, secure authentication, and shareable, persistent links to files and folders.

This project was bootstrapped with `create-next-app` 

## Features

- **Secure Authentication**: Uses Auth.js (NextAuth.js) with the Microsoft Entra ID provider for robust and secure user login.
- **Dynamic File Browsing**: Navigate through your OneDrive folders using a clean and intuitive interface.
- **Persistent, Shareable Links**: Each folder has a unique URL (`/files/...`) that can be shared directly.
- **Modern Tech Stack**: Built with the latest features of Next.js 15 (App Router), React 19, and TypeScript.
- **Beautiful UI**: Styled with Tailwind CSS for a responsive and modern design.
- **Smooth Animations**: Utilizes Framer Motion for fluid and engaging user interface animations.
- **Iconography**: Crisp and clear icons provided by Lucide React.
- **Vercel Ready**: Optimized for easy deployment on the Vercel platform.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 15
- **Authentication**: [Auth.js (NextAuth.js)](https://authjs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later recommended)
- [Git](https://git-scm.com/)
- A Microsoft Account with OneDrive storage.
- An Azure Account to register the application for OAuth.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/onedrivelist.git
cd onedrivelist
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Microsoft Entra ID App

To allow the application to authenticate with Microsoft, you need to register an application in the Microsoft Entra admin center (Azure AD).

1.  Go to the [Microsoft Entra admin center](https://entra.microsoft.com/).
2.  Navigate to **Identity > Applications > App registrations** and click **New registration**.
3.  Give your application a name (e.g., `OneList App`).
4.  Under **Supported account types**, select **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)**.
5.  Under **Redirect URI**, select **Web** and enter `http://localhost:3000/api/auth/callback/microsoft-entra-id`.
6.  Click **Register**.

### 4. Configure Environment Variables

1.  Once the app is registered, find and copy the **Application (client) ID**.
2.  Go to the **Certificates & secrets** tab, create a **New client secret**, and copy its **Value** immediately (it will be hidden later).
3.  Create a `.env.local` file in the root of your project by copying the example file:

    ```bash
    cp .env.example .env.local
    ```

4.  Open `.env.local` and fill in the required values:

    - `AUTH_MICROSOFT_ENTRA_ID_ID`: Your Application (client) ID.
    - `AUTH_MICROSOFT_ENTRA_ID_SECRET`: Your client secret value.
    - `AUTH_SECRET`: A new, strong secret you generate by running `openssl rand -base64 32` in your terminal.
    - `AUTH_URL`: For local development, this is `http://localhost:3000`.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Vercel

This application is optimized for deployment on [Vercel](https://vercel.com/).

1.  Push your code to a Git repository (e.g., on GitHub).
2.  Import the repository into Vercel.
3.  **Configure Environment Variables**: In your Vercel project settings (under **Settings > Environment Variables**), add all the variables from your `.env.local` file. **Crucially, you must update `AUTH_URL` to your production URL** (e.g., `https://your-project-name.vercel.app`).
4.  Deploy! Vercel will automatically build and deploy your Next.js application.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.