// src/contexts/AuthContext.ts
import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface AuthContextData {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined);