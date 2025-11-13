// scripts/insertRoutes.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Build path correctly
const filePath = path.join(__dirname, "../db/bus_route.json");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "holoticket",
  password: process.env.DB_PASSWORD || "Darshan", // Add fallback
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

async function insertRoutes() {
  try {
    const routes = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`📦 Inserting ${routes.length} routes...`);

    for (const r of routes) {
      await pool.query(
        `INSERT INTO bus_routes (route_id, route_no, route_name, fromstation, tostation, intermediate_stops)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (route_id) DO NOTHING;`,
        [
          r.route_id,
          r.route_no,
          r.route_name,
          r.fromstation,
          r.tostation,
          JSON.stringify(r.intermediate_stops),
        ]
      );
    }

    console.log("✅ All routes inserted successfully!");
  } catch (err) {
    console.error("❌ Error inserting routes:", err);
  } finally {
    await pool.end();
  }
}

insertRoutes();
