import { NextRequest, NextResponse } from "next/server";
import { clubs, ClubId } from "@/app/lib/clubAuth";

export async function POST(req: NextRequest) {
  const { club, password } = await req.json();

  if (!(club in clubs)) {
    return NextResponse.json({ error: "Invalid club" }, { status: 400 });
  }

  const clubConfig = clubs[club as ClubId];
  const correctPassword = process.env[clubConfig.passwordEnvKey];

  if (password !== correctPassword) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_club", club, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  return res;
}