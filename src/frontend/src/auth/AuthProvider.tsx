import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetCallerUserRole } from '../hooks/useQueries';
import type { Identity } from '@dfinity/agent';

export interface AuthContextType {
  isAuthenticated: boolean;
  isInitializing: boolean;
  profile: { name: string } | null;
  identity: Identity | undefined;
  loginStatus: string;
  isAdmin: boolean;
  isEngineer: boolean;
  isSupport: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isInitializing = loginStatus === 'initializing' || (isAuthenticated && (profileLoading || roleLoading) && !isFetched);

  // Determine roles from the backend role query
  const isAdmin = userRole === 'admin';
  const isEngineer = userRole === 'user';
  const isSupport = userRole === 'guest';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitializing,
        profile: profile || null,
        identity,
        loginStatus,
        isAdmin,
        isEngineer,
        isSupport,
        login,
        logout: clear,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
