import { NextResponse } from "next/server";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || "";

  if (!search) return NextResponse.json([]);

  const client = await pool.connect();
  try {
    const query = `
      SELECT stop FROM (
        SELECT fromstation AS stop FROM bus_routes
        UNION
        SELECT tostation AS stop FROM bus_routes
        UNION
        SELECT jsonb_array_elements_text(intermediate_stops) AS stop FROM bus_routes
      ) AS all_stops
      WHERE stop ILIKE $1
      LIMIT 15;
    `;

    const result = await client.query(query, [`%${search}%`]);

    // remove duplicates, just in case
    const stops = [...new Set(result.rows.map((r) => r.stop))];

    return NextResponse.json(stops);
  } catch (err) {
    console.error("Error fetching stops:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}
