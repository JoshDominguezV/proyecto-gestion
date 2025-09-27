// src/components/ProtectedRoute.js
"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-400">No tienes permisos para acceder a esta página</div>
      </div>
    );
  }

  return <>{children}</>;
}