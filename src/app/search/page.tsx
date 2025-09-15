import SearchUI from "./SearchUI";
import { cookies } from "next/headers";

export const revalidate = 0;

export default async function SearchPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("pwd-role")?.value === "admin";
  return <SearchUI isAdmin={isAdmin} />;
}
