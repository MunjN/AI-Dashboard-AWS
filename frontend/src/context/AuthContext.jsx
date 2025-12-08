// import { createContext, useContext, useEffect, useMemo, useState } from "react";
// import Cookies from "js-cookie";
// import {
//   userPool,
//   signupUser,
//   confirmUser,
//   loginUser
// } from "../lib/cognito.js";

// const AuthContext = createContext(null);
// export const useAuth = () => useContext(AuthContext);

// const allowedGroups = (import.meta.env.VITE_ALLOWED_GROUPS || "")
//   .split(",")
//   .map(s => s.trim())
//   .filter(Boolean);

// const API_BASE = import.meta.env.VITE_API_BASE;
// const APP_ID = "ai-dashboard-react";
// const LOGIN_QUEUE_KEY = "loginQueue_v1";

// // 1 hour session like your old project
// const SESSION_HOURS = 1;
// const COOKIE_EXPIRES_DAYS = SESSION_HOURS / 24;

// // --- queue helpers ---
// function getQueue() {
//   try {
//     return JSON.parse(localStorage.getItem(LOGIN_QUEUE_KEY) || "[]");
//   } catch {
//     return [];
//   }
// }

// function setQueue(q) {
//   localStorage.setItem(LOGIN_QUEUE_KEY, JSON.stringify(q));
// }

// function queueLoginEvent(evt) {
//   const q = getQueue();
//   q.push(evt);
//   setQueue(q);
// }

// async function flushLoginQueue(jwt, maxAttempts = 3) {
//   let q = getQueue();
//   if (!q.length) return;

//   let attempts = 0;
//   while (q.length && attempts < maxAttempts) {
//     try {
//       const evt = q[0];

//       await fetch(`${API_BASE}/api/track-login`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${jwt}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(evt)
//       });

//       q.shift();
//       setQueue(q);
//     } catch {
//       attempts += 1;
//       await new Promise(r => setTimeout(r, 800 * attempts));
//     }
//   }
// }

// // check JWT expiry (exp is in seconds)
// function isJwtExpired(jwt) {
//   try {
//     const payload = JSON.parse(atob(jwt.split(".")[1]));
//     if (!payload?.exp) return false;
//     return Date.now() >= payload.exp * 1000;
//   } catch {
//     return false;
//   }
// }

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [status, setStatus] = useState("");
//   const [loading, setLoading] = useState(true);

//   // restore session on refresh / reopen
//   useEffect(() => {
//     const currentUser = userPool.getCurrentUser();
//     if (!currentUser) {
//       setLoading(false);
//       return;
//     }

//     currentUser.getSession(async (err, session) => {
//       if (err || !session?.isValid()) {
//         setLoading(false);
//         return;
//       }

//       const jwt = session.getIdToken().getJwtToken();
//       const payload = session.getIdToken().decodePayload();

//       // ✅ if token expired, force signout
//       if (isJwtExpired(jwt)) {
//         Cookies.remove("idToken");
//         currentUser.signOut();
//         setUser(null);
//         setLoading(false);
//         return;
//       }

//       // ✅ set cookie with 1h expiry
//       Cookies.set("idToken", jwt, {
//         sameSite: "Strict",
//         secure: true,
//         expires: COOKIE_EXPIRES_DAYS
//       });

//       setUser(payload);

//       // ✅ COUNT restore as a login too
//       queueLoginEvent({
//         appId: APP_ID,
//         queuedAt: new Date().toISOString(),
//         reason: "restore"
//       });

//       try {
//         await flushLoginQueue(jwt);
//       } catch {
//         // silent
//       }

//       setLoading(false);
//     });
//   }, []);

//   const signUp = async ({ fullName, email, password }) => {
//     setStatus("");
//     const pendingUser = await signupUser({ fullName, email, password });
//     return pendingUser;
//   };

//   const verify = async ({ email, code }) => {
//     setStatus("");
//     await confirmUser({ email, code });
//   };

//   const signIn = async ({ email, password }) => {
//     setStatus("");
//     const result = await loginUser({ email, password });
//     const idToken = result.getIdToken();
//     const jwt = idToken.getJwtToken();
//     const payload = idToken.decodePayload();
//     const groups = payload["cognito:groups"] || [];

//     const ok =
//       allowedGroups.length === 0 ||
//       groups.some(g => allowedGroups.includes(g));

//     if (!ok) {
//       setStatus("Awaiting Admin Approval. You cannot access the dashboard yet.");
//       Cookies.remove("idToken");
//       userPool.getCurrentUser()?.signOut();
//       return false;
//     }

//     // ✅ set cookie with 1h expiry
//     Cookies.set("idToken", jwt, {
//       sameSite: "Strict",
//       secure: true,
//       expires: COOKIE_EXPIRES_DAYS
//     });

//     setUser(payload);

//     // ✅ queue first so first login never lost
//     queueLoginEvent({
//       appId: APP_ID,
//       queuedAt: new Date().toISOString(),
//       reason: "signIn"
//     });

//     try {
//       await flushLoginQueue(jwt);
//     } catch {
//       // silent
//     }

//     return true;
//   };

//   const signOut = () => {
//     Cookies.remove("idToken");
//     userPool.getCurrentUser()?.signOut();
//     setUser(null);
//   };

//   const value = useMemo(
//     () => ({ user, loading, status, setStatus, signUp, verify, signIn, signOut }),
//     [user, loading, status]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }


import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import {
  userPool,
  signupUser,
  confirmUser,
  loginUser
} from "../lib/cognito.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const allowedGroups = (import.meta.env.VITE_ALLOWED_GROUPS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const API_BASE = import.meta.env.VITE_API_BASE;
const APP_ID = "ai-dashboard-react";
const LOGIN_QUEUE_KEY = "loginQueue_v1";

// 1 hour session like your old project
const SESSION_HOURS = 1;
const COOKIE_EXPIRES_DAYS = SESSION_HOURS / 24;

// --- queue helpers ---
function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(LOGIN_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setQueue(q) {
  localStorage.setItem(LOGIN_QUEUE_KEY, JSON.stringify(q));
}

function queueLoginEvent(evt) {
  const q = getQueue();
  q.push(evt);
  setQueue(q);
}

async function flushLoginQueue(jwt, maxAttempts = 3) {
  let q = getQueue();
  if (!q.length) return;

  let attempts = 0;
  while (q.length && attempts < maxAttempts) {
    try {
      const evt = q[0];

      // ✅ NEW: guarantee an origin is always sent
      const withOrigin = {
        ...evt,
        origin: evt.origin || window.location.origin
      };

      await fetch(`${API_BASE}/api/track-login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(withOrigin)
      });

      q.shift();
      setQueue(q);
    } catch {
      attempts += 1;
      await new Promise(r => setTimeout(r, 800 * attempts));
    }
  }
}

// check JWT expiry (exp is in seconds)
function isJwtExpired(jwt) {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    if (!payload?.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // restore session on refresh / reopen
  useEffect(() => {
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      setLoading(false);
      return;
    }

    currentUser.getSession(async (err, session) => {
      if (err || !session?.isValid()) {
        setLoading(false);
        return;
      }

      const jwt = session.getIdToken().getJwtToken();
      const payload = session.getIdToken().decodePayload();

      // ✅ if token expired, force signout
      if (isJwtExpired(jwt)) {
        Cookies.remove("idToken");
        currentUser.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      // ✅ set cookie with 1h expiry
      Cookies.set("idToken", jwt, {
        sameSite: "Strict",
        secure: true,
        expires: COOKIE_EXPIRES_DAYS
      });

      setUser(payload);

      // ✅ COUNT restore as a login too
      queueLoginEvent({
        appId: APP_ID,
        queuedAt: new Date().toISOString(),
        reason: "restore",
        origin: window.location.origin // ✅ NEW
      });

      try {
        await flushLoginQueue(jwt);
      } catch {
        // silent
      }

      setLoading(false);
    });
  }, []);

  const signUp = async ({ fullName, email, password }) => {
    setStatus("");
    const pendingUser = await signupUser({ fullName, email, password });
    return pendingUser;
  };

  const verify = async ({ email, code }) => {
    setStatus("");
    await confirmUser({ email, code });
  };

  const signIn = async ({ email, password }) => {
    setStatus("");
    const result = await loginUser({ email, password });
    const idToken = result.getIdToken();
    const jwt = idToken.getJwtToken();
    const payload = idToken.decodePayload();
    const groups = payload["cognito:groups"] || [];

    const ok =
      allowedGroups.length === 0 ||
      groups.some(g => allowedGroups.includes(g));

    if (!ok) {
      setStatus("Awaiting Admin Approval. You cannot access the dashboard yet.");
      Cookies.remove("idToken");
      userPool.getCurrentUser()?.signOut();
      return false;
    }

    // ✅ set cookie with 1h expiry
    Cookies.set("idToken", jwt, {
      sameSite: "Strict",
      secure: true,
      expires: COOKIE_EXPIRES_DAYS
    });

    setUser(payload);

    // ✅ queue first so first login never lost
    queueLoginEvent({
      appId: APP_ID,
      queuedAt: new Date().toISOString(),
      reason: "signIn",
      origin: window.location.origin // ✅ NEW
    });

    try {
      await flushLoginQueue(jwt);
    } catch {
      // silent
    }

    return true;
  };

  const signOut = () => {
    Cookies.remove("idToken");
    userPool.getCurrentUser()?.signOut();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, status, setStatus, signUp, verify, signIn, signOut }),
    [user, loading, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
