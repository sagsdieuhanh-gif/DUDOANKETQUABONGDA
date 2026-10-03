import { NextRequest, NextResponse } from "next/server";
import { listFixtures } from "@/lib/aggregate";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const data = await listFixtures(date);
  return NextResponse.json(data);
}
