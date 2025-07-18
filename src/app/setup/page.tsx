import { redirect } from "next/navigation";
import SetupUI from "./setup-ui";

export default function SetupPage() {
    if (process.env.ONEDRIVE_REFRESH_TOKEN) {
        redirect("/");
    }

    return <SetupUI />;
}