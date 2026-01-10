import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Mock hardcoded admin user for now
  const [user] = useState({
    id: 'admin-1',
    username: 'GateAdmin',
    role: 'admin'
  });

  return (
    <AuthContext.Provider value={{ user, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
