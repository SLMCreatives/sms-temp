import { type NextRequest, NextResponse } from "next/server";
import { cnApiClient } from "@/lib/cn-api-client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get("user_id") || undefined;
    const email = searchParams.get("email") || undefined;
    const limit = searchParams.get("limit")
      ? Number.parseInt(searchParams.get("limit")!)
      : undefined;
    const offset = searchParams.get("offset")
      ? Number.parseInt(searchParams.get("offset")!)
      : undefined;

    const response = await cnApiClient.listUsers({
      user_id,
      email,
      limit,
      offset
    });

    return NextResponse.json(response);
  } catch (error) {
    console.log("[v0] Error fetching users:", error);
    return NextResponse.json(
      { errs: ["Failed to fetch users"] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await cnApiClient.createUser(body);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[v0] Error creating user:", error);
    return NextResponse.json(
      { errs: ["Failed to create user"] },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.user_id) {
      return NextResponse.json(
        { errs: ["user_id is required"] },
        { status: 400 }
      );
    }

    const response = await cnApiClient.deleteUserByUserId(body.user_id);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[v0] Error deleting user:", error);
    return NextResponse.json(
      { errs: ["Failed to delete user"] },
      { status: 500 }
    );
  }
}
