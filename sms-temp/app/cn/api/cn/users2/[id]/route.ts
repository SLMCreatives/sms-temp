import { type NextRequest, NextResponse } from "next/server";
import { cnApiClient } from "@/lib/cn-api-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await cnApiClient.getUser(id);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[v0] Error fetching user:", error);
    return NextResponse.json(
      { errs: ["Failed to fetch user"] },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await cnApiClient.deleteUser(id);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[v0] Error deleting user:", error);
    return NextResponse.json(
      { errs: ["Failed to delete user"] },
      { status: 500 }
    );
  }
}
