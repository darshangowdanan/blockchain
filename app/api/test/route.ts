import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export async function GET() {
  const session = await getServerSession(authConfig);
  console.log("API SESSION:", session);

  return Response.json({ session });
}
