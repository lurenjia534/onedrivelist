import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TokenUI from "./TokenView";

export default async function TokenPage() {
    if (process.env.ONEDRIVE_REFRESH_TOKEN) {
        redirect("/");
    }

    const session = await auth();
    const token = session?.refreshToken;

    return <TokenUI token={token} />;
}
