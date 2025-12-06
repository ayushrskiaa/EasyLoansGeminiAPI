import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import Dashboard from "@/components/dashboard";

export default async function Home() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/auth/signin");
  }

  return <Dashboard />;
}

