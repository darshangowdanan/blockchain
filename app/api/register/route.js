import pool from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { full_name, email, password } = await request.json();

    if (!full_name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user (use correct column name)
    const result = await pool.query(
      "INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email",
      [full_name, email, hashedPassword]
    );

    return NextResponse.json(
      { message: "User registered successfully", user: result.rows[0] },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration Error:", err);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
