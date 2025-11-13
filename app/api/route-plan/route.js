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
  const from = (searchParams.get("from") || "").trim();
  const to = (searchParams.get("to") || "").trim();

  if (!from || !to) return NextResponse.json({ legs: [] });

  const client = await pool.connect();
  try {
    // Single route (same bus)
    const singleQuery = `
      WITH route_stops AS (
        SELECT
          route_id,
          ARRAY[fromstation] ||
          COALESCE((SELECT array_agg(x) FROM jsonb_array_elements_text(intermediate_stops) AS x), ARRAY[]::text[]) ||
          ARRAY[tostation] AS stops
        FROM bus_routes
      )
      SELECT route_id, stops,
        array_position(stops, $1) AS pos_from,
        array_position(stops, $2) AS pos_to
      FROM route_stops
      WHERE array_position(stops, $1) IS NOT NULL
        AND array_position(stops, $2) IS NOT NULL
      LIMIT 1;
    `;

    const singleRes = await client.query(singleQuery, [from, to]);
    if (singleRes.rows.length > 0) {
      const row = singleRes.rows[0];
      const stopCount = Math.abs(row.pos_to - row.pos_from);
      return NextResponse.json({
        legs: [
          {
            route_id: row.route_id,
            from,
            to,
            stopCount,
          },
        ],
      });
    }

    // One-transfer route (A → transfer → B)
    const transferQuery = `
      WITH route_stops AS (
        SELECT
          route_id,
          ARRAY[fromstation] ||
          COALESCE((SELECT array_agg(x) FROM jsonb_array_elements_text(intermediate_stops) AS x), ARRAY[]::text[]) ||
          ARRAY[tostation] AS stops
        FROM bus_routes
      ),
      from_routes AS (
        SELECT route_id, stops FROM route_stops WHERE $1 = ANY(stops)
      ),
      to_routes AS (
        SELECT route_id, stops FROM route_stops WHERE $2 = ANY(stops)
      ),
      possible_transfers AS (
        SELECT f.route_id AS routeA, t.route_id AS routeB,
               unnest(f.stops) AS transfer_stop
        FROM from_routes f
        CROSS JOIN to_routes t
        WHERE unnest(f.stops) = ANY(t.stops)
      )
      SELECT routeA, routeB, transfer_stop FROM possible_transfers LIMIT 1;
    `;
    const transferRes = await client.query(transferQuery, [from, to]);

    if (transferRes.rows.length > 0) {
      const t = transferRes.rows[0];
      return NextResponse.json({
        legs: [
          { route_id: t.routea, from, to: t.transfer_stop, stopCount: 4 },
          { route_id: t.routeb, from: t.transfer_stop, to, stopCount: 5 },
        ],
      });
    }

    return NextResponse.json({ legs: [] });
  } catch (err) {
    console.error("route-plan error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}
