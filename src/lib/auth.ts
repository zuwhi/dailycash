import { account } from "./appwrite";

export interface SessionData {
  $id: string;
  userId: string;
  expire: string;
  provider: string;
  providerUid: string;
  providerAccessToken: string;
  providerAccessTokenExpiry: string;
  providerRefreshToken: string;
  ip: string;
  osCode: string;
  osName: string;
  osVersion: string;
  clientType: string;
  clientCode: string;
  clientName: string;
  clientVersion: string;
  clientEngine: string;
  clientEngineVersion: string;
  deviceName: string;
  deviceBrand: string;
  deviceModel: string;
  countryCode: string;
  countryName: string;
  current: boolean;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await account.getSession("current");
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get current session data
 */
export async function getCurrentSession(): Promise<SessionData | null> {
  try {
    const session = await account.getSession("current");
    return session as SessionData;
  } catch (error) {
    return null;
  }
}

/**
 * Get current user data
 */
export async function getCurrentUser() {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.error("Logout error:", error);
  }
}

/**
 * Create email/password session
 */
export async function createEmailSession(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw error;
  }
}

/**
 * Refresh session
 */
export async function refreshSession(): Promise<boolean> {
  try {
    await account.updateSession("current");
    return true;
  } catch (error) {
    return false;
  }
}
