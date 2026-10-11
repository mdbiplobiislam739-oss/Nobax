/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TranslationProvider } from "./contexts/TranslationContext";
import { AppLayout, AdminLayout } from "./components/Layout";
import { lazy, Suspense } from "react";
import CoinRain from "./components/CoinRain";
import Intro from "./pages/Intro";

// Lazy load pages for better bundle chunking
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const Mining = lazy(() => import("./pages/Mining"));
const NFT = lazy(() => import("./pages/NFT"));
const Team = lazy(() => import("./pages/Team"));
const Profile = lazy(() => import("./pages/Profile"));
const Shop = lazy(() => import("./pages/Shop"));
const Staking = lazy(() => import("./pages/Staking"));
const Finance = lazy(() => import("./pages/Finance")); // Combine recharge/withdraw here for simplicity
const Swap = lazy(() => import("./pages/Swap"));
const Trade = lazy(() => import("./pages/Trade"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const News = lazy(() => import("./pages/News"));
const DailyCheckIn = lazy(() => import("./pages/DailyCheckIn"));
const Game = lazy(() => import("./pages/Game"));
const Sports = lazy(() => import("./pages/Sports"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)]">
    <div className="w-12 h-12 border-4 border-[var(--color-border-card)] border-t-brand-primary rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [hasCheckedIntro, setHasCheckedIntro] = useState(false);

  useEffect(() => {
    // Global catch for referral codes
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("refCode", ref);
    }

    const hasSeenIntro = localStorage.getItem('intro_seen');
    if (!hasSeenIntro) {
      setShowIntro(true);
    }
    setHasCheckedIntro(true);
  }, []);

  if (!hasCheckedIntro) return null;

  if (showIntro) {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div id="google_translate_wrapper" className="min-h-screen">
      <BrowserRouter>
        <AuthProvider>
          <TranslationProvider>
            <CoinRain />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                </Route>

                {/* User Routes */}
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Home />} />
                  <Route path="mining" element={<Mining />} />
                  <Route path="nft" element={<NFT />} />
                  <Route path="vip" element={<NFT />} />
                  <Route path="team" element={<Team />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="stake" element={<Staking />} />
                  <Route path="swap" element={<Swap />} />
                  <Route path="trade" element={<Trade />} />
                  <Route path="finance/:type" element={<Finance />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="news" element={<News />} />
                  <Route path="bonus" element={<DailyCheckIn />} />
                  <Route path="sports" element={<Sports />} />
                  <Route path="game" element={<Game />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </TranslationProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
