const api_endpoint = import.meta.env.VITE_API_ENDPOINT;

export async function loginAPI(payload: {
  username: string;
  password: string;
}) {
  const resp = await fetch(api_endpoint + "/auth/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.message || "Failed to login");
  }
  return data;
}

export async function signupAPI(payload: {
  username: string;
  password: string;
}) {
  const resp = await fetch(api_endpoint + "/auth/signup", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.message || "Failed to sign up");
  }
  return data;
}

export async function logoutAPI(payload: { id: number }) {
  const resp = await fetch(api_endpoint + "/auth/logout", {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.message || "Logout failed");
  }
  return data;
}

export async function getTokenAPI() {
  const resp = await fetch(api_endpoint + "/auth/check-token", {
    method: "GET",
    credentials: "include",
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.message || "Invalid token");
  }
  return data;
}

async function fetchWithAuth(url: string, options: RequestInit) {
  let resp = await fetch(url, options);
  let data;

  try {
    data = await resp.json();
  } catch (err) {
    throw new Error("Invalid response from server");
  }

  if (!resp.ok && resp.status === 403) {
    try {
      // Attempt to refresh token by calling getTokenAPI
      await getTokenAPI();

      // Retry the original request
      // Note: we need to recreate the RequestInit body if it was a stream or FormData that was consumed,
      // but fetch does not consume the actual passed FormData object in options, so it's safe to reuse it.
      resp = await fetch(url, options);
      data = await resp.json();
    } catch (refreshErr) {
      // If refresh fails, they need to log in again
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!resp.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function getFilesAPI() {
  const data = await fetchWithAuth(api_endpoint + "/file", {
    method: "GET",
    credentials: "include",
  });
  return data;
}

export async function uploadFileAPI(payload: FormData) {
  const data = await fetchWithAuth(api_endpoint + "/file", {
    method: "POST",
    body: payload,
    credentials: "include",
  });
  return data;
}

export async function deleteFileAPI(payload: { id: number }) {
  const data = await fetchWithAuth(api_endpoint + "/file/" + payload.id, {
    method: "DELETE",
    credentials: "include",
  });
  return data;
}

export async function searchAPI(payload: { query: string; history?: any[] }) {
  const data = await fetchWithAuth(api_endpoint + "/search", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return data;
}
