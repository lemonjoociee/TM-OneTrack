import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserStatus, Invitation } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  users: User[];
  invitations: Invitation[];
  addUser: (name: string, email: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  sendInvitation: (name: string, email: string, role: UserRole) => Promise<{ success: boolean; message?: string; token?: string }>;
  resendInvitation: (invitationId: string) => Promise<{ success: boolean; message?: string }>;
  cancelInvitation: (invitationId: string) => Promise<{ success: boolean; message?: string }>;
  changeUserRole: (userId: string, newRole: UserRole) => Promise<{ success: boolean; message?: string }>;
  toggleUserStatus: (userId: string) => Promise<{ success: boolean; message?: string }>;
  resetUserPassword: (userId: string) => Promise<{ success: boolean; tempPassword?: string; message?: string }>;
}

const AUTH_USER_KEY = 'noc_ops_auth_user_session';
const USERS_STORAGE_KEY = 'noc_ops_registered_users_list_v2';
const INVITATIONS_STORAGE_KEY = 'noc_ops_invitations_list_v2';

// Clearly documented test/demo accounts
export const DEMO_CREDENTIALS = [
  {
    name: 'Syed Admin',
    email: 'admin@scicom-tm.portal',
    username: 'admin',
    password: 'AdminPass2026!',
    role: 'Admin' as UserRole,
    department: 'Enterprise Operations'
  },
  {
    name: 'Mohamed Fayiz',
    email: 'noc@scicom-tm.portal',
    username: 'noc_agent',
    password: 'NocPass2026!',
    role: 'NOC' as UserRole,
    department: 'Network Operations Center'
  },
  {
    name: 'Sivanendran Ramachandran',
    email: 'ops@scicom-tm.portal',
    username: 'ops_lead',
    password: 'OpsPass2026!',
    role: 'OPS' as UserRole,
    department: 'Operations Leadership'
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Syed Admin',
    email: 'admin@scicom-tm.portal',
    username: 'admin',
    role: 'Admin',
    status: 'Active',
    invitationStatus: 'Accepted',
    createdDate: '2026-01-10 09:00',
    lastLogin: '2026-10-14 18:45',
    department: 'Enterprise IT & Security'
  },
  {
    id: 'usr-noc-1',
    name: 'Mohamed Fayiz Mokhtahir',
    email: 'noc@scicom-tm.portal',
    username: 'noc_agent',
    role: 'NOC',
    status: 'Active',
    invitationStatus: 'Accepted',
    createdDate: '2026-03-01 08:30',
    lastLogin: '2026-10-14 20:12',
    department: 'Network Operations Center'
  },
  {
    id: 'usr-noc-2',
    name: 'Nathaniel Anak Ulah',
    email: 'nathaniel.ulah@scicom.com.my',
    username: 'nathaniel.u',
    role: 'NOC',
    status: 'Active',
    invitationStatus: 'Accepted',
    createdDate: '2026-03-05 08:30',
    lastLogin: '2026-10-13 16:20',
    department: 'Network Operations Center'
  },
  {
    id: 'usr-noc-3',
    name: 'Harveet Singh Sandhu',
    email: 'harveet.singh@scicom.com.my',
    username: 'harveet.s',
    role: 'NOC',
    status: 'Active',
    invitationStatus: 'Accepted',
    createdDate: '2026-02-15 08:30',
    lastLogin: '2026-10-14 19:30',
    department: 'Network Operations Center'
  },
  {
    id: 'usr-ops-1',
    name: 'Sivanendran Ramachandran',
    email: 'ops@scicom-tm.portal',
    username: 'ops_lead',
    role: 'OPS',
    status: 'Active',
    invitationStatus: 'Accepted',
    createdDate: '2026-01-15 08:00',
    lastLogin: '2026-10-14 17:15',
    department: 'Vice President - Operations'
  },
  {
    id: 'usr-ops-2',
    name: 'Dheivandran Jakanadan',
    email: 'dheivandran.j@scicom.com.my',
    username: 'dheivandran',
    role: 'OPS',
    status: 'Active',
    invitationStatus: 'Accepted',
    createdDate: '2026-02-01 08:00',
    lastLogin: '2026-10-14 11:20',
    department: 'Senior Operations Manager'
  }
];

const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: 'inv-101',
    email: 'khalida.plin@tm.com.my',
    name: 'Khalida Binti Plin',
    role: 'NOC',
    token: 'tok_khalida_2026_noc',
    status: 'Pending',
    invitedBy: 'Syed Admin',
    invitedDate: '2026-10-10 14:00',
    expiresDate: '2026-10-17 14:00'
  },
  {
    id: 'inv-102',
    email: 'manikandan.s@scicom.com.my',
    name: 'Manikandan Sundararaj',
    role: 'OPS',
    token: 'tok_mani_2026_ops',
    status: 'Pending',
    invitedBy: 'Syed Admin',
    invitedDate: '2026-10-12 11:30',
    expiresDate: '2026-10-19 11:30'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return INITIAL_USERS;
  });

  const [invitations, setInvitations] = useState<Invitation[]>(() => {
    try {
      const stored = localStorage.getItem(INVITATIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return INITIAL_INVITATIONS;
  });

  // Restore authenticated session
  useEffect(() => {
    try {
      const sessionUser = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
      if (sessionUser) {
        const parsed = JSON.parse(sessionUser) as User;
        // Verify user still exists in current user registry and is active
        const found = users.find(u => u.id === parsed.id);
        if (found && found.status === 'Active') {
          setCurrentUser(found);
        } else if (found && found.status === 'Deactivated') {
          // Deactivated user session cleared
          localStorage.removeItem(AUTH_USER_KEY);
          sessionStorage.removeItem(AUTH_USER_KEY);
          setCurrentUser(null);
        } else {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed restoring auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, [users]);

  // Persist users and invitations
  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch (e) {
      console.warn('Failed saving users to localStorage', e);
    }
  };

  const saveInvitations = (updatedInvs: Invitation[]) => {
    setInvitations(updatedInvs);
    try {
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(updatedInvs));
    } catch (e) {
      console.warn('Failed saving invitations to localStorage', e);
    }
  };

  const login = async (
    emailOrUsername: string,
    passwordAttempt: string,
    rememberMe = false
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    // Simulate authentication processing
    await new Promise(r => setTimeout(r, 600));

    const query = emailOrUsername.trim().toLowerCase();

    // 1. Check Demo Accounts
    const demoMatch = DEMO_CREDENTIALS.find(
      d => (d.email.toLowerCase() === query || d.username.toLowerCase() === query)
    );

    if (demoMatch) {
      if (passwordAttempt !== demoMatch.password) {
        setIsLoading(false);
        return { success: false, message: 'Invalid password. Please check your credentials.' };
      }

      // Find or create in users list
      let userObj = users.find(u => u.email.toLowerCase() === demoMatch.email.toLowerCase());
      if (!userObj) {
        userObj = {
          id: `usr-${demoMatch.role.toLowerCase()}-${Date.now()}`,
          name: demoMatch.name,
          email: demoMatch.email,
          username: demoMatch.username,
          role: demoMatch.role,
          status: 'Active',
          invitationStatus: 'Accepted',
          createdDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
          department: demoMatch.department
        };
        saveUsers([...users, userObj]);
      }

      if (userObj.status === 'Deactivated') {
        setIsLoading(false);
        return { success: false, message: 'This account has been deactivated. Please contact your system administrator.' };
      }

      // Update last login
      const updatedUser: User = {
        ...userObj,
        lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      setCurrentUser(updatedUser);

      const storageTarget = rememberMe ? localStorage : sessionStorage;
      storageTarget.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));

      setIsLoading(false);
      return { success: true };
    }

    // 2. Check Standard Registered Users (fallback test passwords for newly added users: 'Portal2026!')
    const registeredMatch = users.find(
      u => u.email.toLowerCase() === query || u.username.toLowerCase() === query
    );

    if (registeredMatch) {
      if (registeredMatch.status === 'Deactivated') {
        setIsLoading(false);
        return { success: false, message: 'Your account has been deactivated. Please contact an Administrator.' };
      }

      // Accept Portal2026! or AdminPass2026!
      if (passwordAttempt !== 'Portal2026!' && passwordAttempt !== 'AdminPass2026!' && passwordAttempt !== 'NocPass2026!') {
        setIsLoading(false);
        return { success: false, message: 'Incorrect password. Please verify your credentials or request a password reset.' };
      }

      const updatedUser: User = {
        ...registeredMatch,
        lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      setCurrentUser(updatedUser);
      const storageTarget = rememberMe ? localStorage : sessionStorage;
      storageTarget.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));

      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, message: 'Account not found. Verify your email or username.' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
  };

  const hasRole = (allowedRoles: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;
    // Admins have access to all dashboards
    if (currentUser.role === 'Admin') return true;

    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(currentUser.role);
    }
    return currentUser.role === allowedRoles;
  };

  const addUser = async (name: string, email: string, role: UserRole): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'A user with this email address already exists.' };
    }

    const usernameBase = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '');
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      username: usernameBase,
      role,
      status: 'Active',
      invitationStatus: 'Accepted',
      createdDate: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    saveUsers([...users, newUser]);
    return { success: true, message: `User ${name} successfully created with role ${role}.` };
  };

  const sendInvitation = async (
    name: string,
    email: string,
    role: UserRole
  ): Promise<{ success: boolean; message?: string; token?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An active user account already exists for this email.' };
    }

    if (invitations.some(i => i.email.toLowerCase() === cleanEmail && i.status === 'Pending')) {
      return { success: false, message: 'A pending invitation already exists for this email address.' };
    }

    const token = `inv_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
    const now = new Date();
    const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const newInv: Invitation = {
      id: `inv-${Date.now()}`,
      email: cleanEmail,
      name: name.trim(),
      role,
      token,
      status: 'Pending',
      invitedBy: currentUser?.name || 'Admin',
      invitedDate: now.toISOString().slice(0, 16).replace('T', ' '),
      expiresDate: expiry.toISOString().slice(0, 16).replace('T', ' ')
    };

    saveInvitations([newInv, ...invitations]);

    return {
      success: true,
      message: `Invitation generated successfully for ${cleanEmail}. In development mode, activation token is ready.`,
      token
    };
  };

  const resendInvitation = async (invitationId: string): Promise<{ success: boolean; message?: string }> => {
    const found = invitations.find(i => i.id === invitationId);
    if (!found) return { success: false, message: 'Invitation not found.' };

    const updated = invitations.map(i => {
      if (i.id === invitationId) {
        return {
          ...i,
          token: `inv_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`,
          status: 'Pending' as const,
          invitedDate: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
      }
      return i;
    });

    saveInvitations(updated);
    return { success: true, message: `New invitation token re-issued for ${found.email}.` };
  };

  const cancelInvitation = async (invitationId: string): Promise<{ success: boolean; message?: string }> => {
    const updated = invitations.map(i => {
      if (i.id === invitationId) {
        return { ...i, status: 'Cancelled' as const };
      }
      return i;
    });
    saveInvitations(updated);
    return { success: true, message: 'Invitation has been cancelled.' };
  };

  const changeUserRole = async (userId: string, newRole: UserRole): Promise<{ success: boolean; message?: string }> => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return { success: false, message: 'User not found.' };

    // Prevent changing the last active Admin account to a non-admin role
    if (targetUser.role === 'Admin' && newRole !== 'Admin') {
      const activeAdmins = users.filter(u => u.role === 'Admin' && u.status === 'Active');
      if (activeAdmins.length <= 1) {
        return {
          success: false,
          message: 'Action blocked: Cannot change the role of the final active Admin account. Assign another Admin first.'
        };
      }
    }

    const updated = users.map(u => (u.id === userId ? { ...u, role: newRole } : u));
    saveUsers(updated);

    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, role: newRole });
    }

    return { success: true, message: `User role successfully changed to ${newRole}.` };
  };

  const toggleUserStatus = async (userId: string): Promise<{ success: boolean; message?: string }> => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return { success: false, message: 'User not found.' };

    const nextStatus: UserStatus = targetUser.status === 'Active' ? 'Deactivated' : 'Active';

    // Guard: Prevent deactivating the last active Admin
    if (targetUser.role === 'Admin' && nextStatus === 'Deactivated') {
      const activeAdmins = users.filter(u => u.role === 'Admin' && u.status === 'Active');
      if (activeAdmins.length <= 1) {
        return {
          success: false,
          message: 'Action blocked: You cannot deactivate the final active Administrator account.'
        };
      }
    }

    const updated = users.map(u => (u.id === userId ? { ...u, status: nextStatus } : u));
    saveUsers(updated);

    // If current user deactivated themselves
    if (currentUser?.id === userId && nextStatus === 'Deactivated') {
      logout();
    }

    return {
      success: true,
      message: `User account has been ${nextStatus === 'Active' ? 'activated' : 'deactivated'}.`
    };
  };

  const resetUserPassword = async (userId: string): Promise<{ success: boolean; tempPassword?: string; message?: string }> => {
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, message: 'User not found.' };

    const tempPassword = `Pass#${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      tempPassword,
      message: `Password reset initiated for ${target.name}. Temporary credential: ${tempPassword}`
    };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        hasRole,
        users,
        invitations,
        addUser,
        sendInvitation,
        resendInvitation,
        cancelInvitation,
        changeUserRole,
        toggleUserStatus,
        resetUserPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
