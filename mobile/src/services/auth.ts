export type MobileSession = {
  accessToken: string;
};

let currentSession: MobileSession | null = null;

export function setSession(session: MobileSession | null) {
  currentSession = session;
}

export function getSession() {
  return currentSession;
}
