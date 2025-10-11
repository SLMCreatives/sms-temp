/**
 * CN API Client for OAuth 2.0 Client Credentials flow
 */

const CN_API_BASE_URL = "https://api.thecn.com/v1";
const CN_TOKEN_URL = "https://www.thecn.com/oauth2/token"; // Adjust if different

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

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
  user_id: string;
  course_id: string;
  role: string;
}

interface CNAPIResponse<T> {
  data: T;
  errs?: string[] | object[];
  meta?: Record<string, unknown>;
  code?: number;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth 2.0 access token using client credentials
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const clientId = process.env.CN_CLIENT_ID;
  const clientSecret = process.env.CN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("CN_CLIENT_ID and CN_CLIENT_SECRET must be set");
  }
  const basic = Buffer.from(
    encodeURIComponent(clientId) + ":" + encodeURIComponent(clientSecret)
  ).toString("base64");

  console.log("Getting access token", basic);

  const response = await fetch(CN_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    body: "grant_type=client_credentials",
    // token request should never be cached
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data: TokenResponse = await response.json();

  // Cache the token (subtract 60 seconds for safety margin)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000
  };

  return data.access_token;
}

/**
 * Make authenticated request to CN API
 */
async function cnApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<CNAPIResponse<T>> {
  const token = await getAccessToken();

  const response = await fetch(`${CN_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`CN API request failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get list of institution users (courses are accessed through enrollments)
 */
export async function getInstitutionUsers(params: {
  limit?: number;
  offset?: number;
  user_id?: string;
  email?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.set("limit", params.limit.toString());
  if (params.offset) queryParams.set("offset", params.offset.toString());
  if (params.user_id) queryParams.set("user_id", params.user_id);
  if (params.email) queryParams.set("email", params.email);

  const endpoint = `/sis_institution_user/?${queryParams.toString()}`;
  return cnApiRequest<CNUser[]>(endpoint);
}

/**
 * Get course enrollments for users
 */
export async function getCourseEnrollments(params: {
  user_id?: string;
  course_id?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.user_id) queryParams.set("user_id", params.user_id);
  if (params.course_id) queryParams.set("course_id", params.course_id);

  const endpoint = `/sis_institution_user_course_enrollment/?${queryParams.toString()}`;
  return cnApiRequest<CNEnrollment[]>(endpoint);
}
