const CN_API_BASE_URL = "https://api.thecn.com/v1";
const CN_OAUTH_BASE_URL = "https://oauth.thecn.com/token";
const CN_CONSUMER_KEY = "64db1c79e35314ba4507ac76";
const CN_CONSUMER_SECRET = "3cd-0MFyQiHAtaa9cqi4iPgRgpMX23Jp";
const CN_CLIENT_NAME = "UNITAR";

export interface CNUser {
  id: string;
  cn_number: string;
  first_name: string;
  last_name: string;
  email: string;
  status: "active" | "alumni" | "parent" | "external" | "drop_out" | "inactive";
  labels: string[];
  user_id: string;
  login_id?: string;
}

export interface CNEnrollment {
  user_id: string;
  course_id: string;
  role: string;
}

export interface CNAPIResponse<T> {
  data?: T;
  errs?: string[] | object[];
  meta?: Record<string, unknown>;
  code?: number;
}

class CNAPIClient {
  private baseURL: string;
  private oauthBaseURL: string;
  private consumerKey: string;
  private consumerSecret: string;
  private clientName: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(
    baseURL: string = CN_API_BASE_URL,
    oauthBaseURL: string = CN_OAUTH_BASE_URL,
    consumerKey: string = CN_CONSUMER_KEY || "",
    consumerSecret: string = CN_CONSUMER_SECRET || "",
    clientName: string = CN_CLIENT_NAME || ""
  ) {
    this.baseURL = baseURL;
    this.oauthBaseURL = oauthBaseURL;
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.clientName = clientName;
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Encode credentials
    const credentials = `${this.consumerKey}:${this.consumerSecret}`;
    const encodedCredentials = Buffer.from(credentials).toString("base64");

    // Make the OAuth request
    const response = await fetch(this.oauthBaseURL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: "grant_type=client_credentials",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`OAuth authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;

    // Set token expiry (assuming 1 hour if not provided)
    const expiresIn = data.expires_in || 3600;
    this.tokenExpiry = Date.now() + expiresIn * 1000;

    if (!this.accessToken) {
      throw new Error("Failed to obtain access token");
    }

    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CNAPIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const accessToken = await this.getAccessToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("[v0] CN API request failed:", error);
      throw error;
    }
  }

  // Institution User endpoints
  async listUsers(params?: {
    user_id?: string;
    email?: string;
    limit?: number;
    offset?: number;
  }): Promise<CNAPIResponse<CNUser[]>> {
    const queryParams = new URLSearchParams();
    if (params?.user_id) queryParams.append("user_id", params.user_id);
    if (params?.email) queryParams.append("email", params.email);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const query = queryParams.toString();
    return this.request<CNUser[]>(
      `/sis_institution_user/${query ? `?${query}` : ""}`
    );
  }

  async getUser(id: string): Promise<CNAPIResponse<CNUser>> {
    return this.request<CNUser>(`/sis_institution_user/${id}`);
  }

  async createUser(userData: {
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    labels?: string[];
    user_id: string;
    login_id?: string;
  }): Promise<CNAPIResponse<{ id: string }>> {
    return this.request<{ id: string }>("/sis_institution_user/", {
      method: "POST",
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id: string): Promise<CNAPIResponse<null>> {
    return this.request<null>(`/sis_institution_user/${id}`, {
      method: "DELETE"
    });
  }

  async deleteUserByUserId(user_id: string): Promise<CNAPIResponse<null>> {
    return this.request<null>("/sis_institution_user/", {
      method: "DELETE",
      body: JSON.stringify({ user_id })
    });
  }

  // Course Enrollment endpoints
  async listEnrollments(params: {
    user_id: string;
    course_id?: string;
  }): Promise<CNAPIResponse<CNEnrollment[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append("user_id", params.user_id);
    if (params.course_id) queryParams.append("course_id", params.course_id);

    return this.request<CNEnrollment[]>(
      `/sis_institution_user_course_enrollment/?${queryParams.toString()}`
    );
  }
}

export const cnApiClient = new CNAPIClient();
