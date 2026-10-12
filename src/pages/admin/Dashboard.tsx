import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { store, VIP_LEVELS } from '../../lib/store';
import { formatXRP } from '../../lib/utils';
import { NFTItem } from '../../types';
import {
  Shield,
  Lock,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Gamepad2,
  Sliders,
  Search,
  Copy,
  Check,
  Filter,
  Flame,
  Award,
  Zap,
  Trash2,
  Sparkles,
  Plus,
  Pencil,
  Tag,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import novaxLogo from '../../assets/images/novax_logo_1782982838843.jpg';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState(() => {
    return sessionStorage.getItem('novax_owner_unlocked') === 'true';
  });
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');

  // Primary tabs: 'deposits' | 'withdrawals' | 'games' | 'nfts' | 'users' | 'settings'
  const [tab, setTab] = useState<'deposits' | 'withdrawals' | 'games' | 'nfts' | 'users' | 'settings'>('deposits');
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sub-filters for transactions
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [withdrawFilter, setWithdrawFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [txSearch, setTxSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Force re-render on store update
  const [, setTick] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1);
    window.addEventListener('store_updated', handleUpdate);
    return () => window.removeEventListener('store_updated', handleUpdate);
  }, []);

  const state = store.getState();
  const users = state.users || [];
  const transactions = state.transactions || [];
  const bets = state.bets || [];

  // Game Control States initialized from state
  const [gameCrashWinRate, setGameCrashWinRate] = useState(state.gameCrashWinRate ?? 48);
  const [gameRocketWinRate, setGameRocketWinRate] = useState(state.gameRocketWinRate ?? 48);
  const [gameCoinWinRate, setGameCoinWinRate] = useState(state.gameCoinWinRate ?? 48);
  const [gameDiceWinRate, setGameDiceWinRate] = useState(state.gameDiceWinRate ?? 48);
  const [gameSlotsWinRate, setGameSlotsWinRate] = useState(state.gameSlotsWinRate ?? 48);
  const [gameFishWinRate, setGameFishWinRate] = useState(state.gameFishWinRate ?? 48);

  const [gameCrashEnabled, setGameCrashEnabled] = useState(state.gameCrashEnabled !== false);
  const [gameCoinFlipEnabled, setGameCoinFlipEnabled] = useState(state.gameCoinFlipEnabled !== false);
  const [gameDiceRollEnabled, setGameDiceRollEnabled] = useState(state.gameDiceRollEnabled !== false);
  const [gameSlotsEnabled, setGameSlotsEnabled] = useState(state.gameSlotsEnabled !== false);
  const [gameWheelEnabled, setGameWheelEnabled] = useState(state.gameWheelEnabled !== false);
  const [gameMinesEnabled, setGameMinesEnabled] = useState(state.gameMinesEnabled !== false);
  const [gamePlinkoEnabled, setGamePlinkoEnabled] = useState(state.gamePlinkoEnabled !== false);
  const [gameTowerEnabled, setGameTowerEnabled] = useState(state.gameTowerEnabled !== false);
  const [gameFishEnabled, setGameFishEnabled] = useState(state.gameFishEnabled === true);
  const [isSavingGames, setIsSavingGames] = useState(false);

  // User edit modal state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editVip, setEditVip] = useState(0);

  // New notice state
  const [noticeText, setNoticeText] = useState('');

  // NFT Management States
  const allNfts: NFTItem[] = state.nfts || [];
  const [nftSearch, setNftSearch] = useState('');
  const [nftTierFilter, setNftTierFilter] = useState('all');
  const [isAddNftOpen, setIsAddNftOpen] = useState(false);
  const [editingNft, setEditingNft] = useState<NFTItem | null>(null);
  const [quickPriceNft, setQuickPriceNft] = useState<NFTItem | null>(null);
  const [quickPriceVal, setQuickPriceVal] = useState('');
  const [nftAssignTarget, setNftAssignTarget] = useState<'user' | 'marketplace'>('user');
  const [nftTargetUserId, setNftTargetUserId] = useState<string>('');

  // NFT Form states
  const [nftFormTitle, setNftFormTitle] = useState('');
  const [nftFormPrice, setNftFormPrice] = useState('0');
  const [nftFormTier, setNftFormTier] = useState('Legendary');
  const [nftFormPower, setNftFormPower] = useState('+250 GH/s');
  const [nftFormRate, setNftFormRate] = useState('2.5');
  const [nftFormImage, setNftFormImage] = useState('https://images.unsplash.com/photo-1644361566696-3d442b5b482a?auto=format&fit=crop&w=600&q=80');
  const [nftFormDesc, setNftFormDesc] = useState('High-performance cyberpunk rig generating daily passive XRP mining rewards.');
  const [isSavingNft, setIsSavingNft] = useState(false);

  const PRESET_ARTWORKS = [
    { name: 'Royal Ape', url: 'https://images.unsplash.com/photo-1644361566696-3d442b5b482a?auto=format&fit=crop&w=600&q=80' },
    { name: 'Cyber Ninja', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80' },
    { name: 'Anime Girl', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Dragon King', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80' },
    { name: 'Panda Warrior', url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=80' },
    { name: 'Pixel Boy', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Wolf Spirit', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80' },
    { name: 'Neon Supercar', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
    { name: 'Skull King', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80' },
    { name: 'Sky Castle', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
    { name: 'Samurai Cat', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80' },
    { name: 'Neon Tiger', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' },
    { name: 'Space Traveler', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
    { name: 'Shadow Lord', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80' },
    { name: 'Game Controller', url: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=600&q=80' },
    { name: 'Crypto Coin', url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=600&q=80' },
    { name: 'Ice Phoenix', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
    { name: 'Cyber Queen', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80' },
    { name: 'Ninja Rabbit', url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=80' },
    { name: 'Fire Phoenix', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80' },
    { name: 'Future City', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80' },
    { name: 'Golden Robot', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80' },
    { name: 'Alien Warrior', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80' },
    { name: 'Magic Sword', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80' },
    { name: 'Cyber Wolf', url: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?auto=format&fit=crop&w=600&q=80' },
    { name: 'Diamond Dragon', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80' },
    { name: 'Robot Panda', url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=80' },
    { name: 'Neon Samurai', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80' },
    { name: 'Galaxy Guardian', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80' },
    { name: 'Legendary Phoenix', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
  ];

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setActionMsg({ text: 'Photo size too large (max 8MB)', type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNftFormImage(result);
        if (!nftFormTitle.trim()) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setNftFormTitle(cleanName);
        }
        setActionMsg({ text: 'Photo loaded successfully from device!', type: 'success' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddNft = () => {
    setNftFormTitle('');
    setNftFormPrice('0');
    setNftFormTier('Legendary');
    setNftFormPower('+250 GH/s');
    setNftFormRate('2.5');
    setNftFormImage(PRESET_ARTWORKS[0].url);
    setNftFormDesc('High-performance cyberpunk rig generating daily passive XRP mining rewards.');
    setEditingNft(null);
    setNftAssignTarget('user');
    setNftTargetUserId(users[0]?.id || '');
    setIsAddNftOpen(true);
  };

  const handleOpenAddNftForUser = (userItem: any) => {
    setNftFormTitle(`${userItem.username}'s Rig`);
    setNftFormPrice('0');
    setNftFormTier('Legendary');
    setNftFormPower('+350 GH/s');
    setNftFormRate('3.5');
    setNftFormImage(PRESET_ARTWORKS[0].url);
    setNftFormDesc(`Direct NFT mining rig granted to ${userItem.username}.`);
    setEditingNft(null);
    setNftAssignTarget('user');
    setNftTargetUserId(userItem.id);
    setIsAddNftOpen(true);
  };

  const handleOpenEditNft = (nft: NFTItem) => {
    setNftFormTitle(nft.title);
    setNftFormPrice(nft.price.toString());
    setNftFormTier(nft.tier);
    setNftFormPower(nft.miningPower);
    setNftFormRate(nft.dailyMiningRate.toString());
    setNftFormImage(nft.imageUrl);
    setNftFormDesc(nft.description || '');
    setEditingNft(nft);
    setNftAssignTarget(nft.ownerId !== 'system' ? 'user' : 'marketplace');
    setNftTargetUserId(nft.ownerId !== 'system' ? nft.ownerId : (users[0]?.id || ''));
    setIsAddNftOpen(true);
  };

  const handleSaveNft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nftFormTitle.trim()) {
      setActionMsg({ text: 'Please enter NFT Title', type: 'error' });
      return;
    }
    const price = parseFloat(nftFormPrice) || 0;
    const rate = parseFloat(nftFormRate) || 1.0;

    setIsSavingNft(true);
    setActionMsg(null);
    try {
      if (editingNft) {
        await store.updateNFT(editingNft.id, {
          title: nftFormTitle.trim(),
          price: price,
          tier: nftFormTier,
          miningPower: nftFormPower.trim() || '+100 GH/s',
          dailyMiningRate: rate,
          imageUrl: nftFormImage.trim() || PRESET_ARTWORKS[0].url,
          description: nftFormDesc.trim(),
        });
        setActionMsg({ text: `NFT "${nftFormTitle}" updated successfully!`, type: 'success' });
      } else {
        const isDirectToUser = nftAssignTarget === 'user' && Boolean(nftTargetUserId);
        const targetUser = users.find((u) => u.id === nftTargetUserId);
        const ownerId = isDirectToUser ? nftTargetUserId : 'system';
        const status = isDirectToUser ? 'owned' : 'sale';

        await store.createNFT({
          title: nftFormTitle.trim(),
          price: price,
          tier: nftFormTier,
          miningPower: nftFormPower.trim() || '+250 GH/s',
          dailyMiningRate: rate,
          imageUrl: nftFormImage.trim() || PRESET_ARTWORKS[0].url,
          description: nftFormDesc.trim(),
          creatorId: 'system',
          ownerId: ownerId,
          status: status,
          isMining: isDirectToUser,
          totalMined: 0,
          minedAccumulated: 0,
        });

        if (isDirectToUser && targetUser) {
          setActionMsg({
            text: `🎉 Successfully granted NFT "${nftFormTitle}" with photo directly to user ${targetUser.username}! It is active and mining XRP!`,
            type: 'success',
          });
        } else {
          setActionMsg({ text: `New NFT "${nftFormTitle}" added to Marketplace successfully!`, type: 'success' });
        }
      }
      setIsAddNftOpen(false);
      setEditingNft(null);
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error saving NFT', type: 'error' });
    } finally {
      setIsSavingNft(false);
    }
  };

  const handleSaveQuickPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPriceNft) return;
    const newPrice = parseFloat(quickPriceVal);
    if (isNaN(newPrice) || newPrice < 0) {
      setActionMsg({ text: 'Invalid price value', type: 'error' });
      return;
    }

    try {
      await store.updateNFT(quickPriceNft.id, { price: newPrice });
      setActionMsg({
        text: `Price for "${quickPriceNft.title}" updated to ${formatXRP(newPrice)}!`,
        type: 'success',
      });
      setQuickPriceNft(null);
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error updating price', type: 'error' });
    }
  };

  const handleDeleteNft = async (nft: NFTItem) => {
    if (!window.confirm(`Are you sure you want to delete "${nft.title}"?`)) return;
    try {
      await store.deleteNFT(nft.id);
      setActionMsg({ text: `NFT "${nft.title}" deleted from system.`, type: 'success' });
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error deleting NFT', type: 'error' });
    }
  };

  // Wipe data states
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const handleWipeAllData = async () => {
    setIsWiping(true);
    try {
      await store.wipeAllUserData();
      setActionMsg({
        text: 'All user data (Users, Transactions, Deposits, Withdrawals, Bets, Stakes) has been completely wiped!',
        type: 'success'
      });
      setShowWipeModal(false);
    } catch (err: any) {
      setActionMsg({ text: 'Error wiping data: ' + err.message, type: 'error' });
    } finally {
      setIsWiping(false);
    }
  };

  // Segregate deposits and withdrawals
  const allDeposits = transactions.filter(t => t.type === 'deposit');
  const allWithdraws = transactions.filter(t => t.type === 'withdraw');

  const pendingDepositsCount = allDeposits.filter(t => t.status === 'pending').length;
  const pendingWithdrawsCount = allWithdraws.filter(t => t.status === 'pending').length;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === 'biplobBIPLOB12') {
      sessionStorage.setItem('novax_owner_unlocked', 'true');
      setUnlocked(true);
      setPassError('');
    } else {
      setPassError('Incorrect owner password! Please verify and try again.');
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('novax_owner_unlocked');
    setUnlocked(false);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Deposit Actions
  const handleApproveDeposit = async (tx: any) => {
    try {
      await store.updateTransaction(tx.id, { status: 'completed' });
      const targetUser = users.find(u => u.id === tx.userId);
      if (targetUser) {
        const newBal = (targetUser.balance || 0) + tx.amount;
        await store.updateUser(targetUser.id, { balance: newBal });
      }
      setActionMsg({ text: `Deposit of ${formatXRP(tx.amount)} approved! Added to user balance.`, type: 'success' });
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error approving deposit', type: 'error' });
    }
  };

  const handleRejectDeposit = async (tx: any) => {
    try {
      await store.updateTransaction(tx.id, { status: 'rejected' });
      setActionMsg({ text: `Deposit of ${formatXRP(tx.amount)} rejected.`, type: 'success' });
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error rejecting deposit', type: 'error' });
    }
  };

  // Withdraw Actions
  const handleApproveWithdraw = async (tx: any) => {
    try {
      await store.updateTransaction(tx.id, { status: 'completed' });
      setActionMsg({ text: `Withdrawal of ${formatXRP(Math.abs(tx.amount))} marked paid & completed!`, type: 'success' });
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error approving withdrawal', type: 'error' });
    }
  };

  const handleRejectWithdraw = async (tx: any) => {
    try {
      await store.updateTransaction(tx.id, { status: 'rejected' });
      const targetUser = users.find(u => u.id === tx.userId);
      if (targetUser) {
        const refundAmt = Math.abs(tx.amount);
        const newBal = (targetUser.balance || 0) + refundAmt;
        await store.updateUser(targetUser.id, { balance: newBal });
      }
      setActionMsg({ text: `Withdrawal rejected! ${formatXRP(Math.abs(tx.amount))} automatically refunded to user.`, type: 'success' });
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error rejecting withdrawal', type: 'error' });
    }
  };

  // Save Game Control
  const handleSaveGameControl = async () => {
    setIsSavingGames(true);
    try {
      await store.updateSystemSettings({
        gameCrashWinRate,
        gameRocketWinRate,
        gameCoinWinRate,
        gameDiceWinRate,
        gameSlotsWinRate,
        gameFishWinRate,
        gameCrashEnabled,
        gameCoinFlipEnabled,
        gameDiceRollEnabled,
        gameSlotsEnabled,
        gameWheelEnabled,
        gameMinesEnabled,
        gamePlinkoEnabled,
        gameTowerEnabled,
        gameFishEnabled,
      });
      setActionMsg({ text: 'Game control settings updated and saved successfully!', type: 'success' });
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error saving game settings', type: 'error' });
    } finally {
      setIsSavingGames(false);
    }
  };

  // Save User
  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      const newBal = parseFloat(editBalance);
      await store.updateUser(editingUser.id, {
        balance: isNaN(newBal) ? editingUser.balance : newBal,
        vipLevel: editVip,
      });
      setActionMsg({ text: `User ${editingUser.username} updated successfully!`, type: 'success' });
      setEditingUser(null);
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error updating user', type: 'error' });
    }
  };

  // Add Notice
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeText.trim()) return;
    try {
      await store.addNotice(noticeText.trim());
      setNoticeText('');
      setActionMsg({ text: 'Announcement broadcasted successfully!', type: 'success' });
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Error creating notice', type: 'error' });
    }
  };

  // OWNER PASSWORD GATE SCREEN
  if (!unlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--color-bg-card)] border border-brand-primary/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-primary/20 flex items-center justify-center text-brand-primary border border-brand-primary/40 shadow-lg">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Owner Security Check</h2>
            <p className="text-xs text-text-muted mt-1">
              Protected Admin Area for <b>mdbiplobiislam739@gmail.com</b>
            </p>
          </div>

          {passError && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-400">
              {passError}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password"
              required
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="Enter Owner Password"
              className="w-full bg-[var(--color-bg-base)] border border-white/20 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-primary text-center tracking-widest font-mono"
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-gold text-black font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              Verify & Unlock Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredDeposits = allDeposits.filter(t => {
    if (depositFilter !== 'all' && t.status !== depositFilter) return false;
    if (txSearch) {
      const q = txSearch.toLowerCase();
      const matchUser = t.username?.toLowerCase().includes(q);
      const matchAddr = t.address?.toLowerCase().includes(q);
      const matchTx = t.txHash?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
      return matchUser || matchAddr || matchTx;
    }
    return true;
  });

  const filteredWithdraws = allWithdraws.filter(t => {
    if (withdrawFilter !== 'all' && t.status !== withdrawFilter) return false;
    if (txSearch) {
      const q = txSearch.toLowerCase();
      const matchUser = t.username?.toLowerCase().includes(q);
      const matchAddr = t.address?.toLowerCase().includes(q);
      const matchTx = t.description?.toLowerCase().includes(q);
      return matchUser || matchAddr || matchTx;
    }
    return true;
  });

  const filteredUsers = users.filter(u => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 pb-16">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--color-bg-card)] p-4 rounded-3xl border border-[var(--color-border-card)]">
        <div className="flex items-center gap-3">
          <img
            src={novaxLogo}
            alt="NovaX"
            className="w-11 h-11 rounded-2xl object-cover border border-brand-primary/40 shadow-md"
          />
          <div>
            <h1 className="font-bold text-base text-white flex items-center gap-2">
              NovaX Owner Panel
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                Owner Access
              </span>
            </h1>
            <p className="text-[11px] text-text-muted">Master account: {user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWipeModal(true)}
            className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={14} /> {t('All Data Wipe')}
          </button>

          <button
            onClick={handleLock}
            className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Lock size={14} /> Lock Dashboard
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className={`p-3 rounded-2xl text-xs text-center border ${
          actionMsg.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-red-500/15 border-red-500/30 text-red-400'
        }`}>
          {actionMsg.text}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <div
          onClick={() => setTab('deposits')}
          className="glass-panel p-3.5 rounded-2xl border border-[var(--color-border-card)] cursor-pointer hover:border-brand-gold/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted font-bold uppercase">Pending Deposits</span>
            <ArrowDownLeft size={16} className="text-brand-gold" />
          </div>
          <div className="text-xl font-black text-brand-gold mt-1">{pendingDepositsCount}</div>
          <div className="text-[10px] text-text-muted mt-0.5">Total Deposits: {allDeposits.length}</div>
        </div>

        <div
          onClick={() => setTab('withdrawals')}
          className="glass-panel p-3.5 rounded-2xl border border-[var(--color-border-card)] cursor-pointer hover:border-rose-400/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted font-bold uppercase">Pending Withdraws</span>
            <ArrowUpRight size={16} className="text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400 mt-1">{pendingWithdrawsCount}</div>
          <div className="text-[10px] text-text-muted mt-0.5">Total Withdrawals: {allWithdraws.length}</div>
        </div>

        <div
          onClick={() => setTab('games')}
          className="glass-panel p-3.5 rounded-2xl border border-[var(--color-border-card)] cursor-pointer hover:border-[#00FFFF]/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted font-bold uppercase">Game Control</span>
            <Gamepad2 size={16} className="text-[#00FFFF]" />
          </div>
          <div className="text-sm font-bold text-white mt-1.5 flex items-center gap-1">
            <span className="text-xs text-[#00FFFF]">Win Rate:</span> {gameCrashWinRate}%
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">Crash, Dice, Slots, Mines</div>
        </div>

        <div
          onClick={() => setTab('users')}
          className="glass-panel p-3.5 rounded-2xl border border-[var(--color-border-card)] cursor-pointer hover:border-brand-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted font-bold uppercase">Total Users</span>
            <Users size={16} className="text-brand-primary" />
          </div>
          <div className="text-xl font-black text-white mt-1">{users.length}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Real Accounts (Zero Fake)</div>
        </div>
      </div>

      {/* Main Feature Navigation Tabs */}
      <div className="flex flex-wrap bg-[var(--color-bg-card)] p-1.5 rounded-2xl border border-[var(--color-border-card)] gap-1">
        <button
          onClick={() => setTab('deposits')}
          className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            tab === 'deposits'
              ? 'bg-brand-gold text-black shadow-md'
              : 'text-text-muted hover:text-white hover:bg-white/5'
          }`}
        >
          <ArrowDownLeft size={15} />
          <span>{t('Deposit')} ({allDeposits.length})</span>
          {pendingDepositsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-black">
              {pendingDepositsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab('withdrawals')}
          className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            tab === 'withdrawals'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-text-muted hover:text-white hover:bg-white/5'
          }`}
        >
          <ArrowUpRight size={15} />
          <span>{t('Withdraw')} ({allWithdraws.length})</span>
          {pendingWithdrawsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-white text-rose-600 rounded-full text-[10px] font-black">
              {pendingWithdrawsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab('games')}
          className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            tab === 'games'
              ? 'bg-[#00FFFF] text-black shadow-md font-black'
              : 'text-text-muted hover:text-white hover:bg-white/5'
          }`}
        >
          <Gamepad2 size={15} />
          <span>{t('Game Control Center')}</span>
        </button>

        <button
          onClick={() => setTab('nfts')}
          className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            tab === 'nfts'
              ? 'bg-gradient-to-r from-[#00ffff] to-cyan-400 text-black shadow-md font-black'
              : 'text-text-muted hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles size={15} />
          <span>NFT Market ({allNfts.length})</span>
        </button>

        <button
          onClick={() => setTab('users')}
          className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            tab === 'users'
              ? 'bg-brand-primary text-black shadow-md'
              : 'text-text-muted hover:text-white hover:bg-white/5'
          }`}
        >
          <Users size={15} />
          <span>{t('User Database')} ({users.length})</span>
        </button>

        <button
          onClick={() => setTab('settings')}
          className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            tab === 'settings'
              ? 'bg-white text-black shadow-md'
              : 'text-text-muted hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings size={15} />
          <span>{t('Settings & Notices')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DEPOSITS MANAGEMENT                                                 */}
      {/* ========================================================================= */}
      {tab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowDownLeft size={20} className="text-brand-gold" /> User Deposits Management
              </h2>
              <p className="text-xs text-text-muted">Verify user deposit requests, confirm blockchain TxID and approve balances</p>
            </div>

            {/* Sub Filters */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              {(['all', 'pending', 'completed', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setDepositFilter(f)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                    depositFilter === f ? 'bg-brand-gold text-black font-bold' : 'text-text-muted hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
            <input
              type="text"
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              placeholder="Search by username, TxID, or wallet address..."
              className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-gold"
            />
          </div>

          {/* Deposits List */}
          {filteredDeposits.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-xs text-text-muted border border-[var(--color-border-card)]">
              No deposit records found.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredDeposits.map((tx) => {
                const targetUser = users.find(u => u.id === tx.userId);
                const isPending = tx.status === 'pending';

                return (
                  <div
                    key={tx.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isPending
                        ? 'bg-brand-gold/5 border-brand-gold/40 shadow-lg'
                        : 'bg-[var(--color-bg-card)] border-[var(--color-border-card)]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{tx.username || targetUser?.username || 'User'}</span>
                          <span className="text-[11px] text-text-muted">({targetUser?.email || 'N/A'})</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            tx.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : tx.status === 'pending'
                              ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/40 animate-pulse'
                              : 'bg-red-500/20 text-rose-400 border border-red-500/30'
                          }`}>
                            {tx.status}
                          </span>
                        </div>

                        <div className="text-xl font-black text-brand-gold mt-1">
                          +{formatXRP(tx.amount)}
                        </div>
                      </div>

                      {/* Action buttons if Pending */}
                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveDeposit(tx)}
                            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                          >
                            <CheckCircle2 size={15} /> Approve Deposit
                          </button>
                          <button
                            onClick={() => handleRejectDeposit(tx)}
                            className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-rose-400 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-red-500/30 active:scale-95 transition-all"
                          >
                            <XCircle size={15} /> Reject
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-text-muted">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-text-muted block">Transaction Details / TxID:</span>
                        <div className="flex items-center gap-1.5 mt-0.5 font-mono text-white break-all">
                          <span>{tx.address || tx.txHash || tx.description || 'N/A'}</span>
                          <button
                            onClick={() => copyText(tx.address || tx.txHash || '', tx.id)}
                            className="text-text-muted hover:text-white shrink-0 p-1"
                          >
                            {copiedId === tx.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="md:text-right">
                        <span className="text-[10px] uppercase font-bold text-text-muted block">Date & Time:</span>
                        <span className="text-text-muted mt-0.5 block">{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WITHDRAWALS MANAGEMENT                                              */}
      {/* ========================================================================= */}
      {tab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowUpRight size={20} className="text-rose-400" /> User Withdrawals Management
              </h2>
              <p className="text-xs text-text-muted">Verify withdrawal requests, transfer crypto and mark requests as completed</p>
            </div>

            {/* Sub Filters */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              {(['all', 'pending', 'completed', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setWithdrawFilter(f)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                    withdrawFilter === f ? 'bg-rose-500 text-white font-bold' : 'text-text-muted hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
            <input
              type="text"
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              placeholder="Search by username or wallet address..."
              className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Withdrawals List */}
          {filteredWithdraws.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-xs text-text-muted border border-[var(--color-border-card)]">
              No withdrawal records found.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredWithdraws.map((tx) => {
                const targetUser = users.find(u => u.id === tx.userId);
                const isPending = tx.status === 'pending';
                const withdrawAmount = Math.abs(tx.amount);

                return (
                  <div
                    key={tx.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isPending
                        ? 'bg-rose-500/5 border-rose-500/40 shadow-lg'
                        : 'bg-[var(--color-bg-card)] border-[var(--color-border-card)]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{tx.username || targetUser?.username || 'User'}</span>
                          <span className="text-[11px] text-text-muted">({targetUser?.email || 'N/A'})</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            tx.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : tx.status === 'pending'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                              : 'bg-white/10 text-text-muted border border-white/20'
                          }`}>
                            {tx.status}
                          </span>
                        </div>

                        <div className="text-xl font-black text-rose-400 mt-1">
                          -{formatXRP(withdrawAmount)}
                        </div>
                      </div>

                      {/* Action buttons if Pending */}
                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveWithdraw(tx)}
                            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                          >
                            <CheckCircle2 size={15} /> Mark as Paid
                          </button>
                          <button
                            onClick={() => handleRejectWithdraw(tx)}
                            className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-rose-400 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-red-500/30 active:scale-95 transition-all"
                            title="Cancel withdrawal and refund user balance"
                          >
                            <XCircle size={15} /> Reject & Refund
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-text-muted">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-text-muted block">Destination Wallet Address:</span>
                        <div className="flex items-center gap-1.5 mt-0.5 font-mono text-white break-all">
                          <span>{tx.address || 'User Address'}</span>
                          <button
                            onClick={() => copyText(tx.address || '', tx.id)}
                            className="text-text-muted hover:text-white shrink-0 p-1"
                          >
                            {copiedId === tx.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="md:text-right">
                        <span className="text-[10px] uppercase font-bold text-text-muted block">Request Time:</span>
                        <span className="text-text-muted mt-0.5 block">{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GAME CONTROL (Win Rates & House Edge Settings)                       */}
      {/* ========================================================================= */}
      {tab === 'games' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Gamepad2 size={20} className="text-[#00FFFF]" /> Game Control Center (Win Rates & Settings)
              </h2>
              <p className="text-xs text-text-muted">
                Configure win rates (House Edge) and enable/disable individual casino mini-games
              </p>
            </div>

            <button
              onClick={handleSaveGameControl}
              disabled={isSavingGames}
              className="px-4 py-2.5 bg-gradient-to-r from-[#00FFFF] to-brand-primary text-black font-black text-xs rounded-xl shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 size={16} />
              {isSavingGames ? 'Saving...' : 'Save Game Settings'}
            </button>
          </div>

          {/* Quick House Edge Presets */}
          <div className="glass-panel p-4 rounded-2xl border border-[var(--color-border-card)]">
            <span className="text-[11px] font-bold text-white block mb-2">⚡ Quick Win Rate Presets (All Games):</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setGameCrashWinRate(55);
                  setGameRocketWinRate(55);
                  setGameCoinWinRate(55);
                  setGameDiceWinRate(55);
                  setGameSlotsWinRate(55);
                  setGameFishWinRate(55);
                }}
                className="py-2 px-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold text-xs hover:bg-emerald-500/25 transition-colors"
              >
                High Win (55%)
              </button>

              <button
                type="button"
                onClick={() => {
                  setGameCrashWinRate(48);
                  setGameRocketWinRate(48);
                  setGameCoinWinRate(48);
                  setGameDiceWinRate(48);
                  setGameSlotsWinRate(48);
                  setGameFishWinRate(48);
                }}
                className="py-2 px-2 bg-brand-gold/15 border border-brand-gold/30 rounded-xl text-brand-gold font-bold text-xs hover:bg-brand-gold/25 transition-colors"
              >
                Standard (48%)
              </button>

              <button
                type="button"
                onClick={() => {
                  setGameCrashWinRate(35);
                  setGameRocketWinRate(35);
                  setGameCoinWinRate(35);
                  setGameDiceWinRate(35);
                  setGameSlotsWinRate(35);
                  setGameFishWinRate(35);
                }}
                className="py-2 px-2 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 font-bold text-xs hover:bg-rose-500/25 transition-colors"
              >
                Owner Profit (35%)
              </button>
            </div>
          </div>

          {/* Win Rate Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Crash Rocket */}
            <div className="glass-panel p-4 rounded-2xl border border-[var(--color-border-card)] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  🚀 Crash Game Win Rate
                </span>
                <span className="font-mono font-black text-sm text-[#00FFFF] bg-[#00FFFF]/10 px-2 py-0.5 rounded-lg border border-[#00FFFF]/30">
                  {gameCrashWinRate}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={gameCrashWinRate}
                onChange={(e) => setGameCrashWinRate(Number(e.target.value))}
                className="w-full accent-[#00FFFF]"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Hard (5% Win)</span>
                <span>Balanced (48%)</span>
                <span>Easy (95% Win)</span>
              </div>
            </div>

            {/* Rocket */}
            <div className="glass-panel p-4 rounded-2xl border border-[var(--color-border-card)] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  🚀 Rocket Launch Win Rate
                </span>
                <span className="font-mono font-black text-sm text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-lg border border-brand-gold/30">
                  {gameRocketWinRate}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={gameRocketWinRate}
                onChange={(e) => setGameRocketWinRate(Number(e.target.value))}
                className="w-full accent-brand-gold"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Hard (5%)</span>
                <span>Standard (48%)</span>
                <span>Easy (95%)</span>
              </div>
            </div>

            {/* Coin Flip */}
            <div className="glass-panel p-4 rounded-2xl border border-[var(--color-border-card)] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  🪙 Coin Flip Win Rate
                </span>
                <span className="font-mono font-black text-sm text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-lg border border-brand-primary/30">
                  {gameCoinWinRate}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={gameCoinWinRate}
                onChange={(e) => setGameCoinWinRate(Number(e.target.value))}
                className="w-full accent-brand-primary"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Hard (5%)</span>
                <span>Standard (48%)</span>
                <span>Easy (95%)</span>
              </div>
            </div>

            {/* Dice Roll */}
            <div className="glass-panel p-4 rounded-2xl border border-[var(--color-border-card)] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  🎲 Dice Roll Win Rate
                </span>
                <span className="font-mono font-black text-sm text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/30">
                  {gameDiceWinRate}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={gameDiceWinRate}
                onChange={(e) => setGameDiceWinRate(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Hard (5%)</span>
                <span>Standard (48%)</span>
                <span>Easy (95%)</span>
              </div>
            </div>

            {/* Slots */}
            <div className="glass-panel p-4 rounded-2xl border border-[var(--color-border-card)] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  🎰 Lucky Slots Win Rate
                </span>
                <span className="font-mono font-black text-sm text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                  {gameSlotsWinRate}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={gameSlotsWinRate}
                onChange={(e) => setGameSlotsWinRate(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Hard (5%)</span>
                <span>Standard (48%)</span>
                <span>Easy (95%)</span>
              </div>
            </div>

            {/* Fish */}
            <div className="glass-panel p-4 rounded-2xl border border-[var(--color-border-card)] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  🐟 Fish Game Win Rate
                </span>
                <span className="font-mono font-black text-sm text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/30">
                  {gameFishWinRate}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={gameFishWinRate}
                onChange={(e) => setGameFishWinRate(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>Hard (5%)</span>
                <span>Standard (48%)</span>
                <span>Easy (95%)</span>
              </div>
            </div>
          </div>

          {/* Game Enable/Disable Toggles */}
          <div className="glass-panel p-5 rounded-2xl border border-[var(--color-border-card)] space-y-3">
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <Zap size={14} className="text-brand-gold" /> Game Enable / Disable Control:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {[
                { label: 'Crash Game', val: gameCrashEnabled, set: setGameCrashEnabled },
                { label: 'Coin Flip', val: gameCoinFlipEnabled, set: setGameCoinFlipEnabled },
                { label: 'Dice Roll', val: gameDiceRollEnabled, set: setGameDiceRollEnabled },
                { label: 'Lucky Slots', val: gameSlotsEnabled, set: setGameSlotsEnabled },
                { label: 'Lucky Wheel', val: gameWheelEnabled, set: setGameWheelEnabled },
                { label: 'Mines Game', val: gameMinesEnabled, set: setGameMinesEnabled },
                { label: 'Plinko', val: gamePlinkoEnabled, set: setGamePlinkoEnabled },
                { label: 'Tower Climb', val: gameTowerEnabled, set: setGameTowerEnabled },
                { label: 'Fish Hunter', val: gameFishEnabled, set: setGameFishEnabled },
              ].map((g) => (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => g.set(!g.val)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    g.val
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-text-muted opacity-60'
                  }`}
                >
                  <span>{g.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono">
                    {g.val ? 'ON' : 'OFF'}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={handleSaveGameControl}
                disabled={isSavingGames}
                className="px-6 py-2.5 bg-gradient-to-r from-[#00FFFF] to-brand-primary text-black font-black text-xs rounded-xl shadow-md hover:opacity-95"
              >
                {isSavingGames ? 'Saving...' : 'Save All Game Settings'}
              </button>
            </div>
          </div>

          {/* Recent Bets by Users */}
          <div className="glass-panel p-4 rounded-2xl border border-[var(--color-border-card)] space-y-3">
            <h3 className="font-bold text-xs text-white">Live User Bets History</h3>
            {bets.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted">No game bet records yet.</div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {bets.slice(0, 15).map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="text-white font-bold">{b.username}</span>
                      <span className="text-text-muted text-[10px] ml-2">({b.game})</span>
                    </div>
                    <div className="text-right">
                      <span className={b.status === 'win' ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                        {b.status === 'win' ? `+${formatXRP(b.winAmount)}` : `-${formatXRP(b.betAmount)}`}
                      </span>
                      <span className="text-[9px] text-text-muted ml-2">
                        {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: USERS DATABASE & DIRECT NFT ASSIGNMENT                               */}
      {/* ========================================================================= */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-brand-primary" /> User Database ({users.length})
              </h2>
              <p className="text-xs text-text-muted">
                Registered platform users. Edit balances, VIP tiers, or grant direct NFT miners with photos.
              </p>
            </div>

            <div className="w-full sm:w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search username or email..."
                className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-xl py-2 pl-9 pr-3 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    {u.username}
                    {u.role === 'admin' && (
                      <span className="text-[9px] bg-brand-gold text-black font-black px-2 py-0.5 rounded-full">
                        OWNER
                      </span>
                    )}
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-text-muted font-bold">
                      VIP {u.vipLevel || 0}
                    </span>
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">{u.email}</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-bold text-brand-gold">
                      Balance: {formatXRP(u.balance || 0)}
                    </span>
                    <span className="text-emerald-400">
                      Earned: +{formatXRP(u.totalEarnings || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleOpenAddNftForUser(u)}
                    className="px-3.5 py-2 bg-gradient-to-r from-[#00ffff] to-cyan-400 text-slate-950 rounded-xl font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#00ffff]/20 flex items-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>+ Give Direct NFT Photo</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingUser(u);
                      setEditBalance(String(u.balance || 0));
                      setEditVip(u.vipLevel || 0);
                    }}
                    className="px-3.5 py-2 bg-brand-primary text-black rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md"
                  >
                    Edit Balance / VIP
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* User Edit Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-[var(--color-bg-card)] border border-brand-primary/40 rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-white">Edit User: {editingUser.username}</h3>
                  <button onClick={() => setEditingUser(null)} className="text-text-muted hover:text-white text-xs">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] text-text-muted block mb-1">Set Balance Directly (XRP):</label>
                    <input
                      type="number"
                      step="any"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="w-full bg-[var(--color-bg-base)] border border-white/20 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>

                  {/* Quick Add Balance Buttons */}
                  <div>
                    <span className="text-[10px] text-text-muted block mb-1">Quick Add (+XRP):</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[10, 50, 100, 500].map(add => (
                        <button
                          key={add}
                          type="button"
                          onClick={() => setEditBalance(String((parseFloat(editBalance) || 0) + add))}
                          className="py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold text-brand-gold"
                        >
                          +{add}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-text-muted block mb-1">Set VIP Level (0-8):</label>
                    <select
                      value={editVip}
                      onChange={(e) => setEditVip(parseInt(e.target.value))}
                      className="w-full bg-[var(--color-bg-base)] border border-white/20 rounded-xl px-3 py-2 text-white"
                    >
                      {VIP_LEVELS.map(v => (
                        <option key={v.level} value={v.level}>{v.name} (VIP {v.level})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveUser}
                    className="flex-1 py-2.5 bg-brand-primary text-black font-bold rounded-xl text-xs hover:opacity-90"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2.5 bg-white/10 text-white rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ANNOUNCEMENTS & SETTINGS                                             */}
      {/* ========================================================================= */}
      {tab === 'settings' && (
        <div className="space-y-4">
          <form onSubmit={handleAddNotice} className="glass-panel p-5 rounded-2xl border border-[var(--color-border-card)] space-y-3">
            <h3 className="text-xs font-bold text-white">Post Live Announcement & Notification</h3>
            <textarea
              rows={2}
              required
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              placeholder="e.g. Fast deposits and instant withdrawals are active on NovaX platform."
              className="w-full bg-[var(--color-bg-base)] border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-gold text-black font-bold text-xs rounded-xl"
            >
              Broadcast Notice
            </button>
          </form>

          {/* Active Notices */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-text-muted px-1">Active Announcements ({state.notices?.length || 0})</h4>
            {(state.notices || []).map((n) => (
              <div
                key={n.id}
                className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-xl flex items-center justify-between text-xs"
              >
                <div className="text-white pr-2">{n.text}</div>
                <button
                  onClick={async () => {
                    await store.deleteNotice(n.id);
                    setActionMsg({ text: 'Notice deleted successfully', type: 'success' });
                  }}
                  className="text-rose-400 hover:text-rose-300 text-[11px] shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Danger Zone: Wipe All User Data */}
          <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Trash2 size={18} />
              <span>System Reset & Data Management (Danger Zone)</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Permanently delete all existing user accounts, balances, deposits, withdrawals, bets, and stake history to reset the platform fresh to 0.00 balance.
            </p>
            <button
              type="button"
              onClick={() => setShowWipeModal(true)}
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Trash2 size={15} /> {t('Wipe All User Data')}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 5: NFT MARKETPLACE MANAGEMENT                                          */}
      {/* ========================================================================= */}
      {tab === 'nfts' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--color-bg-card)] p-4 rounded-3xl border border-[var(--color-border-card)]">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={20} className="text-[#00ffff]" />
                <span>NFT Marketplace & Price Manager</span>
              </h2>
              <p className="text-xs text-text-muted">
                Add new NFT mining artworks with direct photo uploads and configure daily mining returns
              </p>
            </div>

            <button
              onClick={handleOpenAddNft}
              className="px-4 py-2.5 bg-gradient-to-r from-[#00ffff] to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-[#00ffff]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>+ Add New NFT</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="glass-panel p-3.5 rounded-2xl border border-white/10">
              <span className="text-[10px] text-text-muted uppercase font-bold">Total NFTs</span>
              <div className="text-xl font-black text-white mt-0.5">{allNfts.length}</div>
            </div>
            <div className="glass-panel p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
              <span className="text-[10px] text-emerald-400 uppercase font-bold">Available For Sale</span>
              <div className="text-xl font-black text-emerald-400 mt-0.5">
                {allNfts.filter((n) => n.ownerId === 'system').length}
              </div>
            </div>
            <div className="glass-panel p-3.5 rounded-2xl border border-[#00ffff]/20 bg-[#00ffff]/5">
              <span className="text-[10px] text-[#00ffff] uppercase font-bold">Owned by Users</span>
              <div className="text-xl font-black text-[#00ffff] mt-0.5">
                {allNfts.filter((n) => n.ownerId !== 'system').length}
              </div>
            </div>
            <div className="glass-panel p-3.5 rounded-2xl border border-brand-gold/20 bg-brand-gold/5">
              <span className="text-[10px] text-brand-gold uppercase font-bold">Total Power</span>
              <div className="text-xl font-black text-brand-gold mt-0.5">
                {allNfts.reduce((acc, n) => {
                  const num = parseFloat(n.miningPower.replace(/[^0-9.]/g, '')) || 0;
                  return acc + num;
                }, 0)} GH/s
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={nftSearch}
                onChange={(e) => setNftSearch(e.target.value)}
                placeholder="Search NFT by title, ID, power..."
                className="w-full bg-[var(--color-bg-base)] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-text-muted outline-none focus:border-[#00ffff]"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {['all', 'common', 'rare', 'epic', 'legendary'].map((t) => (
                <button
                  key={t}
                  onClick={() => setNftTierFilter(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all border ${
                    nftTierFilter === t
                      ? 'bg-white text-slate-950 font-black border-white shadow-md'
                      : 'bg-white/5 text-text-muted border-white/10 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* NFT Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {allNfts
              .filter((n) => {
                if (nftTierFilter !== 'all' && (n.tier || '').toLowerCase() !== nftTierFilter.toLowerCase()) return false;
                if (nftSearch) {
                  const q = nftSearch.toLowerCase();
                  return (
                    n.title.toLowerCase().includes(q) ||
                    n.id.toLowerCase().includes(q) ||
                    (n.miningPower || '').toLowerCase().includes(q)
                  );
                }
                return true;
              })
              .map((nft) => (
                <div
                  key={nft.id}
                  className="glass-panel p-3.5 rounded-2xl border border-[var(--color-border-card)] bg-[var(--color-bg-card)]/90 space-y-3 flex flex-col justify-between shadow-md"
                >
                  <div>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/60 mb-2 border border-white/10">
                      <img
                        src={nft.imageUrl}
                        alt={nft.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1644361566696-3d442b5b482a?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <span className="absolute top-2 left-2 text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black/70 text-[#00ffff] border border-[#00ffff]/40">
                        {nft.tier}
                      </span>
                      <span className="absolute bottom-2 left-2 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-black/70 text-brand-gold border border-brand-gold/40 flex items-center gap-1">
                        <Zap size={10} /> {nft.miningPower}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white truncate">{nft.title}</h4>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        +{nft.dailyMiningRate} XRP/d
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs">
                      <div>
                        <span className="text-[10px] text-text-muted block">Market Price</span>
                        <span className="font-mono font-extrabold text-brand-gold text-sm">
                          {formatXRP(nft.price)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-text-muted block">Status</span>
                        <span className={`text-[10px] font-bold uppercase ${nft.ownerId === 'system' ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {nft.ownerId === 'system' ? 'For Sale' : 'Owned'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions for this NFT */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setQuickPriceNft(nft);
                        setQuickPriceVal(nft.price.toString());
                      }}
                      className="py-1.5 px-2 bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/30 text-brand-gold rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      <Tag size={11} />
                      <span>Set Price</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditNft(nft)}
                      className="py-1.5 px-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      <Pencil size={11} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteNft(nft)}
                      className="py-1.5 px-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      <Trash2 size={11} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick Price Modal */}
      {quickPriceNft && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--color-bg-card)] border border-brand-gold/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Tag size={16} className="text-brand-gold" />
                  <span>Update NFT Price</span>
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5 truncate">{quickPriceNft.title}</p>
              </div>
              <button onClick={() => setQuickPriceNft(null)} className="text-text-muted hover:text-white">
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickPrice} className="space-y-3">
              <div>
                <label className="text-[10px] text-text-muted block mb-1">New Price in XRP *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={quickPriceVal}
                  onChange={(e) => setQuickPriceVal(e.target.value)}
                  className="w-full bg-[var(--color-bg-base)] border border-brand-gold/40 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  Save Price
                </button>
                <button
                  type="button"
                  onClick={() => setQuickPriceNft(null)}
                  className="px-4 py-2.5 bg-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/15"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit NFT Modal */}
      {isAddNftOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="w-full max-w-lg bg-[var(--color-bg-card)] border border-[#00ffff]/40 rounded-3xl p-5 space-y-4 shadow-2xl my-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Sparkles size={16} className="text-[#00ffff]" />
                <span>
                  {editingNft
                    ? 'Edit NFT Details'
                    : nftAssignTarget === 'user'
                    ? '🎁 Grant NFT Rig Directly to User'
                    : 'Add New NFT to Marketplace'}
                </span>
              </h3>
              <button onClick={() => setIsAddNftOpen(false)} className="text-text-muted hover:text-white">
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNft} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              {/* Destination Selector */}
              {!editingNft && (
                <div className="p-3 rounded-2xl bg-black/40 border border-[#00ffff]/30 space-y-2">
                  <label className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#00ffff]" />
                    <span>NFT Destination *</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNftAssignTarget('user')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                        nftAssignTarget === 'user'
                          ? 'bg-gradient-to-r from-[#00ffff] to-cyan-400 text-slate-950 font-black border-[#00ffff] shadow-md'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
                      }`}
                    >
                      <span>🎁 Direct to User</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNftAssignTarget('marketplace')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                        nftAssignTarget === 'marketplace'
                          ? 'bg-gradient-to-r from-brand-primary to-orange-400 text-white font-black border-brand-primary shadow-md'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
                      }`}
                    >
                      <span>🛒 Marketplace</span>
                    </button>
                  </div>

                  {nftAssignTarget === 'user' && (
                    <div className="pt-1.5">
                      <label className="text-[10px] text-text-muted block mb-1 font-bold">
                        Select Target User to Receive this NFT:
                      </label>
                      <select
                        value={nftTargetUserId}
                        onChange={(e) => setNftTargetUserId(e.target.value)}
                        className="w-full bg-[var(--color-bg-base)] border border-[#00ffff]/40 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00ffff] outline-none font-bold"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                            {u.username} ({u.email}) - Bal: {formatXRP(u.balance || 0)}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
                        ✓ NFT will be placed directly in this user's account and start mining daily XRP!
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-[11px] text-text-muted block mb-1 font-bold">NFT Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyber Samurai #099"
                  value={nftFormTitle}
                  onChange={(e) => setNftFormTitle(e.target.value)}
                  className="w-full bg-[var(--color-bg-base)] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00ffff] outline-none"
                />
              </div>

              {/* Direct Photo Uploader */}
              <div className="p-3 rounded-2xl bg-black/40 border border-[#00ffff]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#00ffff]" />
                    <span>Upload NFT Photo (Direct from Phone / PC)</span>
                  </label>
                  {nftFormImage && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Photo Loaded
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex-1 py-2.5 px-3 bg-gradient-to-r from-[#00ffff] to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-center">
                    <Upload size={15} />
                    <span>Choose Photo from Device / Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileUpload}
                      className="hidden"
                    />
                  </label>

                  {nftFormImage && (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/60 border border-[#00ffff]/50 shrink-0 shadow-md">
                      <img
                        src={nftFormImage}
                        alt="NFT Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <span className="text-[10px] text-text-muted block mb-1">Or paste direct Image URL:</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={nftFormImage}
                    onChange={(e) => setNftFormImage(e.target.value)}
                    className="w-full bg-[var(--color-bg-base)] border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-white font-mono focus:border-[#00ffff] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-text-muted block mb-1 font-bold">Price in XRP *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={nftFormPrice}
                    onChange={(e) => setNftFormPrice(e.target.value)}
                    className="w-full bg-[var(--color-bg-base)] border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#00ffff] outline-none font-bold text-brand-gold"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-text-muted block mb-1 font-bold">Rarity / Tier</label>
                  <select
                    value={nftFormTier}
                    onChange={(e) => setNftFormTier(e.target.value)}
                    className="w-full bg-[var(--color-bg-base)] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00ffff] outline-none"
                  >
                    <option value="Common">Common</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-text-muted block mb-1 font-bold">Mining Power</label>
                  <input
                    type="text"
                    placeholder="+250 GH/s"
                    value={nftFormPower}
                    onChange={(e) => setNftFormPower(e.target.value)}
                    className="w-full bg-[var(--color-bg-base)] border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#00ffff] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-text-muted block mb-1 font-bold">Daily Return (XRP/day) *</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    required
                    value={nftFormRate}
                    onChange={(e) => setNftFormRate(e.target.value)}
                    className="w-full bg-[var(--color-bg-base)] border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#00ffff] outline-none"
                  />
                </div>
              </div>

              {/* 1-Click Preset Artwork Selector */}
              <div>
                <label className="text-[10px] text-text-muted uppercase font-bold block mb-1.5">
                  Or Pick From Cyberpunk Art Presets
                </label>
                <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto p-1 bg-black/40 rounded-xl border border-white/10">
                  {PRESET_ARTWORKS.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => {
                        setNftFormImage(preset.url);
                        if (!nftFormTitle) setNftFormTitle(preset.name);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border transition-all ${
                        nftFormImage === preset.url ? 'border-[#00ffff] ring-2 ring-[#00ffff]' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1644361566696-3d442b5b482a?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-white truncate px-1 text-center font-bold">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-text-muted block mb-1 font-bold">Description</label>
                <textarea
                  rows={2}
                  value={nftFormDesc}
                  onChange={(e) => setNftFormDesc(e.target.value)}
                  placeholder="Brief description of the miner..."
                  className="w-full bg-[var(--color-bg-base)] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00ffff] outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSavingNft}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#00ffff] to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  {isSavingNft ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingNft ? 'Update NFT' : nftAssignTarget === 'user' ? '🎁 Grant NFT Photo to User' : 'Create & Publish NFT'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddNftOpen(false)}
                  className="px-4 py-2.5 bg-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/15"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wipe Confirmation Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--color-bg-card)] border border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 bg-rose-500/15 rounded-2xl border border-rose-500/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{t('Are you sure you want to delete all user data?')}</h3>
                <p className="text-xs text-rose-400">{t('This action cannot be undone')}</p>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              {t('Are you sure you want to delete all user data?')}
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isWiping}
                onClick={handleWipeAllData}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20"
              >
                {isWiping ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>{t('Saving...')}</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>{t('Confirm Wipe')}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isWiping}
                onClick={() => setShowWipeModal(false)}
                className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                {t('Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
