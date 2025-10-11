import { type NextRequest, NextResponse } from "next/server";
import { getInstitutionUsers, getCourseEnrollments } from "@/lib/cn-api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    // Fetch institution users (which represent course participants)
    const usersResponse = await getInstitutionUsers({
      limit,
      offset
    });

    // For demonstration, also fetch enrollments for the first user if available
    let enrollments = null;
    if (usersResponse.data && usersResponse.data.length > 0) {
      const firstUser = usersResponse.data[0];
      const enrollmentsResponse = await getCourseEnrollments({
        user_id: firstUser.user_id
      });
      enrollments = enrollmentsResponse.data;
    }

    return NextResponse.json({
      users: usersResponse.data,
      enrollments,
      meta: {
        limit,
        offset,
        count: usersResponse.data?.length || 0
      }
    });
  } catch (error) {
    console.error("[v0] CN API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch CN data"
      },
      { status: 500 }
    );
  }
}
