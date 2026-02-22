/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server";

const CN_API_BASE = "https://api.thecn.com/v1";

const consumerKeyCN = "64db1c79e35314ba4507ac76";
const consumerSecretCN = "3cd-0MFyQiHAtaa9cqi4iPgRgpMX23Jp";
const oauthBaseURL = "https://www.thecn.com/oauth2/token";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("user_id");

    // 1. Get OAuth Access Token
    async function getAccessToken() {
      const consumerKey = consumerKeyCN;
      const consumerSecret = consumerSecretCN;

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

    // 2. Fetch User from CN API using the ID
    const res = await fetch(
      `${CN_API_BASE}/sis_institution_user_course_enrollment/?user_id=${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json"
        }
      }
    );
    const json = await res.json();
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    return NextResponse.json(json); // Returns the object containing user data
  } catch (error) {
    console.error("Error fetching CN Course:", error);
    return NextResponse.json(
      { errs: ["Failed to fetch course"] },
      { status: 500 }
    );
  }
}
