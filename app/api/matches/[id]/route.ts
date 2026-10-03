import { NextResponse } from "next/server";
import { getAnalysis } from "@/lib/aggregate";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await getAnalysis(id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "UNKNOWN_ERROR" }, { status: 500 });
  }
}
