import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// 1. Exportamos o contexto (o hook useAuth vai importar daqui)
export const AuthContext = createContext<AuthContextData>({} as AuthContextData); //eslint-disable-line 

// 2. O Provider é o único componente exportado, o que agrada o ESLint
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};