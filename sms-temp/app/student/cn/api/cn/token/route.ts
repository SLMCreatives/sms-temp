import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.CN_CONSUMER_KEY!;
  const secret = process.env.CN_SECRET_KEY!;
  const basic = Buffer.from(
    encodeURIComponent(key) + ":" + encodeURIComponent(secret)
  ).toString("base64");

  const res = await fetch(`${process.env.CN_OAUTH_BASE}/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    body: "grant_type=client_credentials",
    // token request should never be cached
    cache: "no-store"
  });

  if (!res.ok) {
    const err = await res.text();
    console.log("Error", err);
    return NextResponse.json({ error: err }, { status: res.status });
  }
  const json = await res.json();
  console.log("Got Token");
  return NextResponse.json(json); // { access_token, expires_in, token_type }
}
