/* interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
 */
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

//let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth 2.0 access token using client credentials
 */
async function getAccessToken() {
  const consumerKey = process.env.NEXT_PUBLIC_CONSUMER_KEY;
  const consumerSecret = process.env.NEXT_PUBLIC_CONSUMER_SECRET;

  // Encode credentials
  const credentials = `${consumerKey}:${consumerSecret}`;
  const encodedCredentials = Buffer.from(credentials).toString("base64");

  // Make the request
  const response = await fetch("https://www.thecn.com/oauth2/token", {
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

/**
 * Make authenticated request to CN API
 */
async function cnApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<CNAPIResponse<T>> {
  const token = await getAccessToken();
  console.log(token);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CN_API_BASE}${endpoint}`,
    {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
  console.log(response);

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
