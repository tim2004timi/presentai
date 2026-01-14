import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, usersApi, setToken, removeToken, User } from "@/lib/api";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (login: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await usersApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      setToken(response.access_token);
      setUser(response.user);
      toast.success("Вход выполнен успешно");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка входа";
      toast.error(message);
      throw error;
    }
  };

  const register = async (login: string, password: string) => {
    try {
      const response = await authApi.register(login, password);
      setToken(response.access_token);
      setUser(response.user);
      toast.success("Регистрация успешна!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка регистрации";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    toast.success("Выход выполнен");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

