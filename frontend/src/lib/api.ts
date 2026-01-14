const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  if (import.meta.env.VITE_API_HOST) {
    const port = import.meta.env.VITE_API_PORT || '8000';
    return `http://${import.meta.env.VITE_API_HOST}:${port}/api`;
  }
  
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  const host = window.location.hostname;
  const port = import.meta.env.VITE_API_PORT || '8000';
  return `http://${host}:${port}/api`;
};

const BASE_URL = getBaseUrl();

export interface User {
  id: number;
  login: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface InputForm {
  id: number;
  title: string;
  text: string;
  slides: number;
  files: string[];
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id?: number;
  card_list_id?: number;
  index: number;
  title: string;
  text: string;
}

export interface CardList {
  id: number;
  inputform_id: number;
  title: string;
  created_at: string;
  cards?: Card[];
  presentation?: Presentation;
}

export interface Presentation {
  id: number;
  filename: string;
  title: string;
  user_id: number;
  card_list_id: number;
  created_at: string;
}

export interface CreateInputFormRequest {
  title: string;
  text: string;
  slides: number;
  files: string[];
}

export interface CreateInputFormResponse {
  form: InputForm;
  generated_slides: {
    cards: Card[];
  };
}

export interface CreateCardListRequest {
  inputform_id: number;
  title: string;
  cards: Card[];
}

const getToken = (): string | null => {
  return localStorage.getItem("access_token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("access_token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("access_token");
};

const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token && !endpoint.includes("/auth/token") && !endpoint.includes("/auth/register")) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      window.location.href = "/";
    }
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error.detail || error.message || errorMessage;
    } catch {
      try {
        const text = await response.text();
        errorMessage = text || errorMessage;
      } catch {
      }
    }
    throw new Error(errorMessage);
  }

  return response;
};

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await apiFetch("/auth/token", {
      method: "POST",
      body: formData,
    });

    return response.json();
  },

  register: async (login: string, password: string): Promise<AuthResponse> => {
    const response = await apiFetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    });

    return response.json();
  },

  getMe: async (): Promise<User> => {
    const response = await apiFetch("/auth/me");
    return response.json();
  },
};

export const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await apiFetch("/users/me");
    return response.json();
  },

  updateMe: async (login?: string): Promise<User> => {
    const response = await apiFetch("/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login }),
    });

    return response.json();
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await apiFetch(`/users/${userId}`);
    return response.json();
  },

  getUsers: async (skip = 0, limit = 100): Promise<User[]> => {
    const response = await apiFetch(`/users?skip=${skip}&limit=${limit}`);
    return response.json();
  },
};

export const inputFormsApi = {
  uploadFile: async (file: File): Promise<{ filename: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiFetch("/inputforms/upload", {
      method: "POST",
      body: formData,
    });

    return response.json();
  },

  create: async (
    data: CreateInputFormRequest
  ): Promise<CreateInputFormResponse> => {
    const response = await apiFetch("/inputforms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  getAll: async (skip = 0, limit = 100): Promise<InputForm[]> => {
    const response = await apiFetch(`/inputforms?skip=${skip}&limit=${limit}`);
    return response.json();
  },

  getById: async (formId: number): Promise<InputForm> => {
    const response = await apiFetch(`/inputforms/${formId}`);
    return response.json();
  },

  update: async (
    formId: number,
    data: Partial<CreateInputFormRequest>
  ): Promise<InputForm> => {
    const response = await apiFetch(`/inputforms/${formId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  delete: async (formId: number): Promise<void> => {
    await apiFetch(`/inputforms/${formId}`, {
      method: "DELETE",
    });
  },
};

export const cardListsApi = {
  create: async (data: CreateCardListRequest): Promise<CardList> => {
    const response = await apiFetch("/cardlists/create_card_list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  getById: async (cardListId: number): Promise<CardList> => {
    const response = await apiFetch(`/cardlists/${cardListId}`);
    return response.json();
  },

  getByInputFormId: async (inputFormId: number): Promise<CardList[]> => {
    const response = await apiFetch(`/cardlists/inputform/${inputFormId}`);
    return response.json();
  },
};

export const presentationsApi = {
  getAll: async (skip = 0, limit = 100): Promise<Presentation[]> => {
    const response = await apiFetch(`/presentations?skip=${skip}&limit=${limit}`);
    return response.json();
  },

  getById: async (presentationId: number): Promise<Presentation> => {
    const response = await apiFetch(`/presentations/${presentationId}`);
    return response.json();
  },

  getFile: async (filename: string): Promise<Blob> => {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/presentations/file/${filename}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    return response.blob();
  },

  getFileUrl: (filename: string): string => {
    const token = getToken();
    return `${BASE_URL}/presentations/file/${filename}?token=${token}`;
  },

  downloadFile: async (filename: string, format: "pptx" | "pdf"): Promise<void> => {
    const baseFilename = filename.replace(/\.(pptx|pdf)$/, "");
    const fullFilename = `${baseFilename}.${format}`;
    
    const blob = await presentationsApi.getFile(fullFilename);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fullFilename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

