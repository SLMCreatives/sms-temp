import { type NextRequest, NextResponse } from "next/server";

interface CNUser {
  id: string;
  cn_number: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  labels: string[];
  user_id: string;
  login_id?: string;
}

interface CNEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  progress: number;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

const CN_API_BASE = process.env.NEXT_PUBLIC_CN_API_BASE;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    // Get access token
    const getAccessToken = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_CN_OATH_BASE}`, {
        cache: "no-store"
      });
      if (!res.ok) {
        console.log("Error", res);
      }
      return res.json() as Promise<{ access_token: string }>;
    };

    const { access_token } = await getAccessToken();
    console.log(access_token);

    // Fetch enrollments
    const getEnrollments = async (token: string) => {
      const response = await fetch(
        `${CN_API_BASE}/sis_course_enrollment/?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) throw new Error("Failed to fetch enrollments");
      const data = await response.json();
      return data as CNEnrollment[];
    };

    // Fetch user details for enrolled students
    const getUserDetails = async (userId: string, token: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CN_API_BASE}/sis_institution_user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) throw new Error(`Failed to fetch user ${userId}`);
      const data = await response.json();
      return data as CNUser;
    };

    // Get all enrollments
    const enrollments = await getEnrollments(access_token);

    // Get user details for each enrollment
    const enrolledStudents = await Promise.all(
      enrollments.map(async (enrollment) => {
        const userDetails = await getUserDetails(
          enrollment.user_id,
          access_token
        );
        return {
          ...enrollment,
          user: userDetails
        };
      })
    );

    return NextResponse.json({
      data: enrolledStudents,
      meta: {
        limit,
        offset,
        total: enrolledStudents.length
      }
    });
  } catch (error) {
    console.error("[v0] CN API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch enrollment data"
      },
      { status: 500 }
    );
  }
}
