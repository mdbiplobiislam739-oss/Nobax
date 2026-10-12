import React, { createContext, useContext, useEffect, useState } from "react";
import { User as AppUser } from "../types";
import { store } from "../lib/store";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

interface AuthContextType {
  user: AppUser | null;
  fbUser: FirebaseUser | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (
    email: string,
    username: string,
    pass: string,
    phone: string,
    ref: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('novax_session_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Safety timer to prevent perpetual loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const refreshUser = async () => {
    const currentUid = fbUser?.uid || user?.id;
    if (currentUid) {
      try {
        const snap = await getDoc(doc(db, "users", currentUid));
        if (snap.exists()) {
          const freshData = snap.data() as AppUser;
          setUser(freshData);
          localStorage.setItem('novax_session_user', JSON.stringify(freshData));
        }
      } catch (err) {
        console.warn("Failed to refresh user from Firestore (offline/network):", err);
      }
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setFbUser(firebaseUser);
        if (firebaseUser) {
          // Init subscriptions for this user
          store.initFirebase(firebaseUser.uid);

          const isOwnerEmail = firebaseUser.email?.toLowerCase() === "mdbiplobiislam739@gmail.com";

          // Fetch user data
          const docRef = doc(db, "users", firebaseUser.uid);
          let snapshot = null;
          try {
            snapshot = await getDoc(docRef);
          } catch (err) {
            console.warn("Firestore getDoc offline or error in onAuthStateChanged:", err);
          }

          if (snapshot && snapshot.exists()) {
            let userData = snapshot.data() as AppUser;
            if (isOwnerEmail && userData.role !== "admin") {
              userData = { ...userData, role: "admin" };
              try {
                await setDoc(docRef, { role: "admin" }, { merge: true });
              } catch (e) {
                console.warn("Failed to update admin role in firestore:", e);
              }
            }

            // Ensure no fake balances exist
            if (
              userData.balance === 999999 ||
              userData.balance === 1000 ||
              userData.totalEarnings === 999999
            ) {
              userData.balance = 0;
              userData.totalEarnings = 0;
              try {
                await setDoc(docRef, { balance: 0, totalEarnings: 0 }, { merge: true });
              } catch {}
            }

            setUser(userData);
            localStorage.setItem('novax_session_user', JSON.stringify(userData));
          } else {
            // User not in Firestore yet
            if (isOwnerEmail) {
              const adminUser: AppUser = {
                id: firebaseUser.uid,
                email: "mdbiplobiislam739@gmail.com",
                username: "Biplob (Owner)",
                phone: "+8801700000000",
                role: "admin",
                balance: 0,
                totalEarnings: 0,
                vipLevel: 1,
                trc20Address: "",
                referrerId: null,
                createdAt: Date.now(),
                lastMiningDate: null,
              };
              try {
                await setDoc(docRef, adminUser);
              } catch (e) {
                console.warn("Owner firestore save offline:", e);
              }
              setUser(adminUser);
              localStorage.setItem('novax_session_user', JSON.stringify(adminUser));
              sessionStorage.setItem('novax_owner_unlocked', 'true');
            } else {
              // Regular user: check store or session
              const localUser = store.getState().users.find((u) => u.id === firebaseUser.uid || u.email?.toLowerCase() === firebaseUser.email?.toLowerCase());
              if (localUser) {
                setUser(localUser);
                localStorage.setItem('novax_session_user', JSON.stringify(localUser));
              } else {
                const fallbackUser: AppUser = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email || "",
                  username: (firebaseUser.email || "user").split('@')[0],
                  role: "user",
                  balance: 0,
                  totalEarnings: 0,
                  vipLevel: 0,
                  createdAt: Date.now(),
                };
                try {
                  await setDoc(docRef, fallbackUser);
                } catch {}
                setUser(fallbackUser);
                localStorage.setItem('novax_session_user', JSON.stringify(fallbackUser));
              }
            }
          }
        } else {
          // If Firebase has no user, but we have an owner unlock or cached session, keep it intact unless logged out
          const cachedSession = localStorage.getItem('novax_session_user');
          if (!cachedSession) {
            setUser(null);
            store.clearUserSubscriptions();
          }
        }
      } finally {
        setLoading(false);
      }
    });

    const handleStoreUpdate = () => {
      const currentId = user?.id;
      if (currentId) {
        const currentUserData = store
          .getState()
          .users.find((u) => u.id === currentId);
        if (currentUserData) {
          setUser(currentUserData);
          localStorage.setItem('novax_session_user', JSON.stringify(currentUserData));
        }
      }
    };

    window.addEventListener("store_updated", handleStoreUpdate);

    return () => {
      unsub();
      window.removeEventListener("store_updated", handleStoreUpdate);
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    const isOwnerEmail = cleanEmail.toLowerCase() === "mdbiplobiislam739@gmail.com";

    // Enforce owner password specifically to biplobBIPLOB12
    if (isOwnerEmail && pass !== "biplobBIPLOB12") {
      throw new Error("Invalid password! Owner account requires designated password: biplobBIPLOB12");
    }

    if (isOwnerEmail) {
      // Guaranteed Owner Login Handler
      let ownerUser: AppUser = {
        id: fbUser?.uid || 'owner_biplob_main',
        email: 'mdbiplobiislam739@gmail.com',
        username: "Biplob (Owner)",
        phone: "+8801700000000",
        role: "admin",
        balance: 0,
        totalEarnings: 0,
        vipLevel: 1,
        trc20Address: "",
        referrerId: null,
        createdAt: Date.now(),
        lastMiningDate: null,
      };

      try {
        let cred = null;
        try {
          cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        } catch (signInErr: any) {
          if (
            signInErr.code === "auth/user-not-found" ||
            signInErr.code === "auth/invalid-credential"
          ) {
            try {
              cred = await createUserWithEmailAndPassword(auth, cleanEmail, "biplobBIPLOB12");
            } catch (createErr) {
              console.warn("Owner auto-create notice:", createErr);
            }
          }
        }

        if (cred?.user) {
          ownerUser.id = cred.user.uid;
          try {
            const snap = await getDoc(doc(db, "users", cred.user.uid));
            if (snap.exists()) {
              ownerUser = { ...ownerUser, ...(snap.data() as AppUser), role: 'admin' };
              if (ownerUser.balance === 999999 || ownerUser.totalEarnings === 999999) {
                ownerUser.balance = 0;
                ownerUser.totalEarnings = 0;
              }
            } else {
              await setDoc(doc(db, "users", cred.user.uid), ownerUser);
            }
          } catch (fsErr) {
            console.warn("Owner Firestore sync offline:", fsErr);
          }
        }
      } catch (authErr) {
        console.warn("Firebase Auth network unavailable, proceeding with local owner login:", authErr);
      }

      setUser(ownerUser);
      localStorage.setItem('novax_session_user', JSON.stringify(ownerUser));
      sessionStorage.setItem('novax_owner_unlocked', 'true');
      await store.addUser(ownerUser);
      return true;
    }

    // Normal User Login Handler
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      let userData: AppUser | null = null;
      try {
        const snap = await getDoc(doc(db, "users", cred.user.uid));
        if (snap.exists()) {
          userData = snap.data() as AppUser;
        }
      } catch (fsErr) {
        console.warn("User Firestore read offline, using local store:", fsErr);
      }

      if (!userData) {
        userData = store.getState().users.find((u) => u.id === cred.user.uid || u.email?.toLowerCase() === cleanEmail.toLowerCase()) || null;
      }

      if (!userData) {
        userData = {
          id: cred.user.uid,
          email: cleanEmail,
          username: cleanEmail.split('@')[0],
          role: 'user',
          balance: 0,
          totalEarnings: 0,
          vipLevel: 0,
          createdAt: Date.now(),
        };
        try {
          await setDoc(doc(db, "users", cred.user.uid), userData, { merge: true });
        } catch {}
      }

      setUser(userData);
      localStorage.setItem('novax_session_user', JSON.stringify(userData));
      await store.addUser(userData);
      return true;
    } catch (err: any) {
      console.error("Login attempt error:", err);

      // Network or offline fallback: check if user is registered locally
      if (err.code === 'auth/network-request-failed' || !navigator.onLine) {
        const localMatch = store.getState().users.find((u) => u.email?.toLowerCase() === cleanEmail.toLowerCase());
        if (localMatch) {
          setUser(localMatch);
          localStorage.setItem('novax_session_user', JSON.stringify(localMatch));
          return true;
        }
        throw new Error("Network connection error! Please check your internet connection and retry.");
      }

      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password'
      ) {
        throw new Error("Invalid email or password! Please check your credentials.");
      }

      if (err.code === 'auth/too-many-requests') {
        throw new Error("Too many failed attempts. Account temporarily locked, please try again shortly.");
      }

      throw new Error(err.message || "Failed to log in. Please retry.");
    }
  };

  const register = async (
    email: string,
    username: string,
    pass: string,
    phone: string,
    ref: string,
  ) => {
    const cleanEmail = email.trim();
    const cleanUsername = username.trim();
    const isOwnerEmail = cleanEmail.toLowerCase() === "mdbiplobiislam739@gmail.com";

    // If owner is registering, enforce biplobBIPLOB12
    if (isOwnerEmail && pass !== "biplobBIPLOB12") {
      throw new Error("Owner account requires designated password: biplobBIPLOB12");
    }

    if (pass.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const cleanRef = (ref || "").trim();
    let finalReferrer = "Admin";
    if (cleanRef.toLowerCase() !== "admin" && cleanRef !== "") {
      const foundRef = store.getState().users.find(
        (u) => u.username?.trim().toLowerCase() === cleanRef.toLowerCase()
      );
      if (foundRef) {
        finalReferrer = foundRef.username;
      } else {
        finalReferrer = cleanRef;
      }
    }

    try {
      let uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          pass,
        );
        uid = userCredential.user.uid;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          throw new Error("An account with this email already exists. Please log in.");
        }
        if (authErr.code !== 'auth/network-request-failed') {
          throw authErr;
        }
        console.warn("Registration network error, saving user locally:", authErr);
      }

      const newUser: AppUser = {
        id: uid,
        email: cleanEmail,
        username: cleanUsername,
        phone: phone || '',
        role: isOwnerEmail ? "admin" : "user",
        balance: 0,
        totalEarnings: 0,
        vipLevel: isOwnerEmail ? 1 : 0,
        trc20Address: "",
        referrerId: finalReferrer,
        createdAt: Date.now(),
        lastMiningDate: null,
      };

      try {
        await setDoc(doc(db, "users", uid), newUser);
      } catch (fsErr) {
        console.warn("Firestore save offline during registration:", fsErr);
      }

      await store.addUser(newUser);
      setUser(newUser);
      localStorage.setItem('novax_session_user', JSON.stringify(newUser));
      if (isOwnerEmail) {
        sessionStorage.setItem('novax_owner_unlocked', 'true');
      }
      return true;
    } catch (e: any) {
      console.error("Registration error:", e);
      throw e;
    }
  };

  const logout = async () => {
    localStorage.removeItem('novax_session_user');
    localStorage.removeItem('novax_guest_user');
    sessionStorage.removeItem('novax_owner_unlocked');
    try {
      await fbSignOut(auth);
    } catch {}
    setUser(null);
    store.clearUserSubscriptions();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-base)] text-white">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--color-border-card)] border-t-brand-primary animate-spin mb-4"></div>
        <p className="text-xs text-text-muted font-medium">Loading NovaX Platform...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, fbUser, login, register, logout, refreshUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
