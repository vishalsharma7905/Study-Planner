import React, { createContext, useContext, useEffect, useState } from 'react';
interface User {
  id: number;
  email: string;
}

interface Session {
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setSession({ access_token: token } as any);
        } else {
          localStorage.removeItem('auth_token');
        }
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
