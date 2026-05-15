"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin" | "premium";
  instrument: string | null;
  level: number;
  xp: number;
  xp_next: number;
  streak: number;
  badges: string[];
  completed_lessons: number[];
  is_premium: boolean;
  avatar_initial?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then(({ data }) => setUser(data))
      .catch(() => { Cookies.remove("access_token"); Cookies.remove("refresh_token"); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login(email, password);
    Cookies.set("access_token", data.access, { expires: 1 });
    Cookies.set("refresh_token", data.refresh, { expires: 7 });
    setUser(data.user);
    toast.success(`¡Bienvenido, ${data.user.name.split(" ")[0]}! 🎵`);
    router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
  };

  const logout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    setUser(null);
    router.push("/login");
    toast.success("Sesión cerrada");
  };

  const isAdmin = user?.role === "admin";
  const isPremium = user?.is_premium || user?.role === "premium";
  const avatarInitial = user ? user.name.charAt(0).toUpperCase() : "?";

  return { user, loading, login, logout, setUser, isAdmin, isPremium, avatarInitial };
}
