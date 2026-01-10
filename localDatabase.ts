// Local Database Service using localStorage
// This replaces Firebase with a client-side solution

export interface User {
  id: string;
  email: string;
  password: string; // In production, this should be hashed
  createdAt: string;
}

export interface SavedProcess {
  id: string;
  userId: string;
  description: string;
  quantification?: string;
  environment?: string;
  strategies: any[];
  selectedStrategyId?: string;
  createdAt: string;
  updatedAt: string;
}

// Storage keys
const STORAGE_KEYS = {
  USERS: 'process_jinn_users',
  CURRENT_USER: 'process_jinn_current_user',
  PROCESSES: 'process_jinn_processes'
};

// Utility functions
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Authentication functions
export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  console.log('Attempting to sign up:', email);
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  
  // Check if user already exists
  if (users.find(user => user.email === email)) {
    throw new Error('User already exists with this email');
  }

  const newUser: User = {
    id: generateId(),
    email,
    password, // In production, hash this password
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveToStorage(STORAGE_KEYS.USERS, users);
  console.log('User created successfully:', newUser);
  
  // Auto-login after signup
  setCurrentUser(newUser);
  
  return newUser;
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  console.log('Attempting to sign in:', email);
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    console.log('Sign in failed: User not found or incorrect password');
    throw new Error('Invalid email or password');
  }

  console.log('Sign in successful:', user);
  setCurrentUser(user);
  return user;
};

export const logoutUser = async (): Promise<void> => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: User): void => {
  try {
    console.log('Setting current user:', user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

// Process management functions
export const saveProcess = async (userId: string, process: Omit<SavedProcess, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const processes = getFromStorage<SavedProcess>(STORAGE_KEYS.PROCESSES);
  
  const newProcess: SavedProcess = {
    id: generateId(),
    userId,
    ...process,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  processes.push(newProcess);
  saveToStorage(STORAGE_KEYS.PROCESSES, processes);
  
  return newProcess.id;
};

export const getUserProcesses = async (userId: string, maxProcesses: number = 20): Promise<SavedProcess[]> => {
  const processes = getFromStorage<SavedProcess>(STORAGE_KEYS.PROCESSES);
  
  return processes
    .filter(process => process.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, maxProcesses);
};

export const getProcess = async (userId: string, processId: string): Promise<SavedProcess | null> => {
  const processes = getFromStorage<SavedProcess>(STORAGE_KEYS.PROCESSES);
  
  return processes.find(process => process.id === processId && process.userId === userId) || null;
};

export const deleteProcess = async (userId: string, processId: string): Promise<void> => {
  const processes = getFromStorage<SavedProcess>(STORAGE_KEYS.PROCESSES);
  const filteredProcesses = processes.filter(process => !(process.id === processId && process.userId === userId));
  saveToStorage(STORAGE_KEYS.PROCESSES, filteredProcesses);
};

export const updateProcess = async (userId: string, processId: string, updates: Partial<SavedProcess>): Promise<void> => {
  const processes = getFromStorage<SavedProcess>(STORAGE_KEYS.PROCESSES);
  const processIndex = processes.findIndex(process => process.id === processId && process.userId === userId);
  
  if (processIndex !== -1) {
    processes[processIndex] = {
      ...processes[processIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.PROCESSES, processes);
  }
};

// Utility functions for data management
export const clearAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

export const exportData = (): string => {
  const data = {
    users: getFromStorage<User>(STORAGE_KEYS.USERS),
    processes: getFromStorage<SavedProcess>(STORAGE_KEYS.PROCESSES),
    currentUser: getCurrentUser()
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.users) saveToStorage(STORAGE_KEYS.USERS, data.users);
    if (data.processes) saveToStorage(STORAGE_KEYS.PROCESSES, data.processes);
    if (data.currentUser) setCurrentUser(data.currentUser);
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
