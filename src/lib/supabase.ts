import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ Supabase environment variables are missing!\n" +
    "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Lovable Project Settings > Environment Variables"
  );
}

// Validate that we have real values, not placeholders
if (!supabaseUrl || supabaseUrl.includes("placeholder") || !supabaseAnonKey || supabaseAnonKey.includes("placeholder")) {
  console.error(
    "⚠️ Invalid Supabase configuration. The app may not work correctly.\n" +
    "Please set valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Lovable Project Settings > Environment Variables"
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper function to call Edge Functions
export const callEdgeFunction = async (
  functionName: string,
  options: {
    body?: any;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    queryParams?: Record<string, string>;
  } = {}
) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("No active session");
  }

  const { body, method = "POST", queryParams } = options;

  // Build URL with query parameters for GET requests
  let url = `${supabaseUrl}/functions/v1/${functionName}`;
  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: supabaseAnonKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to call ${functionName}`);
  }

  return response.json();
};

// Helper function to upload file via Edge Function
export const uploadFile = async (file: File) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("No active session");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${supabaseUrl}/functions/v1/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabaseAnonKey,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "Failed to upload file");
  }

  return response.json();
};

// Helper function to delete a document
export const deleteDocument = async (documentId: string) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("No active session");
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/delete-document`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ documentId }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "Failed to delete document");
  }

  return response.json();
};

