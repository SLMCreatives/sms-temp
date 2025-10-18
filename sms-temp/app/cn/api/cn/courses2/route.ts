/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server";

export interface CNUser {
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

const consumerKeyCN = process.env.CN_CLIENT_ID;
const consumerSecretCN = process.env.CN_CLIENT_SECRET;
const clientNameCN = process.env.CLIENT_NAME;
const oauthBaseURL = process.env.NEXT_PUBLIC_CN_OATH_BASE;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    // Fetch institution users (which represent course participants)

    /* const getAccessToken = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_CN_OATH_BASE}`, {
        cache: "no-store"
      });
      if (!res.ok) {
        console.log("Error", res);
      }
      return res.json() as Promise<{ access_token: string }>;
    }; */

    async function getAccessToken() {
      const consumerKey = consumerKeyCN;
      const consumerSecret = consumerSecretCN;
      const clientName = clientNameCN;

      // Encode credentials
      const credentials = `${consumerKey}:${consumerSecret}`;
      const encodedCredentials = Buffer.from(credentials).toString("base64");

      // Make the request
      const response = await fetch(`${oauthBaseURL}`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: "grant_type=client_credentials",
        cache: "no-store"
      });

      const data = await response.json();

      return {
        accessToken: data.access_token
      };
    }

    const { accessToken } = await getAccessToken();
    const access_token = accessToken;

    const res = await fetch(
      `${CN_API_BASE}/sis_institution_user/?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json"
        }
      }
    );
    const data = await res.json();

    return NextResponse.json({
      data: data,
      meta: {
        limit,
        offset,
        total: data.length || data.errs
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
