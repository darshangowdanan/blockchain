import { pool } from "@/lib/db";

export async function GET() {
  try {
    const res = await pool.query("SELECT NOW()");
    return new Response(JSON.stringify(res.rows[0]), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Database connection failed", { status: 500 });
  }
}
