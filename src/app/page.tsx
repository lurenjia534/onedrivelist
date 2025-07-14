// src/app/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Index() {
  const session = await auth();
  redirect(session ? "/dashboard" : "/login");
}
