import { type NextRequest, NextResponse } from "next/server";
import { cnApiClient } from "@/lib/cn-api-client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get("user_id");
    const course_id = searchParams.get("course_id") || undefined;

    if (!user_id) {
      return NextResponse.json(
        { errs: ["user_id is required"] },
        { status: 400 }
      );
    }

    const response = await cnApiClient.listEnrollments({
      user_id,
      course_id
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[v0] Error fetching enrollments:", error);
    return NextResponse.json(
      { errs: ["Failed to fetch enrollments"] },
      { status: 500 }
    );
  }
}
