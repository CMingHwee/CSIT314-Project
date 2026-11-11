/*
 * Session — who is logged in on this browser tab.
 * Stored in sessionStorage, so closing the tab logs the user out.
 * A session expires after 30 minutes without opening a page (logout alternate flow "Session expired.").
 */
const Session = (() => {
  const KEY = 'idp.session';
  const TIMEOUT_MS = 30 * 60 * 1000;

  function read() {
    try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; }
  }
  function save(session) {
    try { sessionStorage.setItem(KEY, JSON.stringify(session)); return true; } catch { return false; }
  }

  function start(account) {
    return save({
      accountId: account.getId(),
      username: account.getUsername(),
      role: account.getRole(),
      lastActive: Date.now()
    });
  }

  // { status: 'none' }  |  { status: 'expired' }  |  { status: 'active', session }
  // An active session's timer is refreshed every time it is checked.
  function check() {
    const s = read();
    if (!s) return { status: 'none' };
    if (Date.now() - Number(s.lastActive) > TIMEOUT_MS) {
      end();
      return { status: 'expired' };
    }
    s.lastActive = Date.now();
    save(s);
    return { status: 'active', session: s };
  }

  function current() {
    return read();
  }

  // Returns false if the session could not be cleared ("Logout failed. Please try again.").
  function end() {
    try {
      sessionStorage.removeItem(KEY);
      return sessionStorage.getItem(KEY) === null;
    } catch {
      return false;
    }
  }

  return { TIMEOUT_MS, start, check, current, end };
})();
