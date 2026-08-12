import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_club", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
  });
  return res;
}
