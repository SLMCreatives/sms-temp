import { NextResponse } from "next/server";

async function getToken() {
  const res = await fetch("/api/cn/token", {
    cache: "no-store"
  });
  if (!res.ok) {
    console.log("Error", res);
  }
  return res.json() as Promise<{ access_token: string }>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") ?? "10";
  const offset = searchParams.get("offset") ?? "0";

  const { access_token } = await getToken();

  const res = await fetch(
    `${process.env.CN_BASE_URL}/sis_institution_course/?limit=${limit}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${access_token}` },

      // server-to-server calls; opt-in revalidate if you want caching
      cache: "no-store"
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
