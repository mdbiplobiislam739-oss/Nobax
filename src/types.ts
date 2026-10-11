export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  role: 'user' | 'admin';
  balance: number;
  totalEarnings: number;
  vipLevel: number;
  trc20Address?: string;
  referrerId?: string | null;
  createdAt: number;
  lastMiningDate?: number | null;
  ipAddress?: string;
  balances?: Record<string, number>;
  status?: 'active' | 'banned';
  miningEndTime?: number | null;
  vipExpiry?: number | null;
  withdrawPassword?: string;
  faceIdData?: string;
  faceIdEnabled?: boolean;
  twoFactorEnabled?: boolean;
  withdrawPin?: string;
  kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  kycData?: {
    fullName: string;
    idType: string;
    idNumber: string;
    frontPhoto?: string;
    backPhoto?: string;
    selfiePhoto?: string;
    submittedAt?: number;
  };
  nftMultiplier?: number;
}

export interface VIPLevel {
  level: number;
  name: string;
  price: number;
  dailyIncome: number;
  validityDays: number;
  maxTasks: number;
  color?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  username?: string;
  type: 'deposit' | 'withdraw' | 'mining' | 'commission' | 'vip_purchase' | 'stake' | 'unstake' | 'bonus' | 'game_win' | 'game_loss' | 'swap' | string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'rejected';
  description?: string;
  address?: string;
  txHash?: string;
  network?: string;
  currency?: string;
}

export interface Notice {
  id: string;
  text: string;
  isActive: boolean;
  timestamp: number;
}

export interface Product {
  id: string;
  name: string;
  hash: string;
  price: number;
  img: string;
  commission?: number;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  price: number;
  commission: number;
  status: 'completed' | 'pending';
  timestamp: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  network: string;
  address: string;
  qrCode?: string;
}

export interface BetRecord {
  id: string;
  userId: string;
  username: string;
  game: string;
  betAmount: number;
  winAmount: number;
  multiplier?: number;
  timestamp: number;
  status: 'win' | 'loss';
}

export interface Stake {
  id: string;
  userId: string;
  amount: number;
  durationDays: number;
  interestRate: number;
  startDate: number;
  endDate: number;
  status: 'active' | 'completed';
  reward: number;
}

export interface StakeSettings {
  interestRate: number;
  minStake: number;
  maxStake: number;
}

export interface NFTItem {
  id: string;
  creatorId: string;
  ownerId: string; // 'system' or user.id
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  tier: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Starter' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Cosmic' | string;
  miningPower: string;
  dailyMiningRate: number; // Daily XRP yield
  status: 'sale' | 'owned';
  isMining: boolean;
  lastMinedAt?: number;
  minedAccumulated?: number;
  totalMined?: number;
  createdAt: number;
}

export interface AppState {
  users: User[];
  transactions: Transaction[];
  notices: Notice[];
  systemBalance: number;
  products: Product[];
  orders: Order[];
  nfts: NFTItem[];
  nftBids: any[];
  supportLink: string;
  vipLevels: VIPLevel[];
  paymentMethods: PaymentMethod[];
  stakes: Stake[];
  stakeSettings: StakeSettings;
  banners: string[];
  billboardText: string;
  billboardEnabled: boolean;
  referralBonusText: string;
  depositBonusText: string;
  referralSystemEnabled: boolean;
  referralLevel1Rate: number;
  referralLevel2Rate: number;
  referralLevel3Rate: number;
  dailyRewards: number[];
  gameCrashWinRate: number;
  gameRocketWinRate: number;
  gameCoinWinRate: number;
  gameDiceWinRate: number;
  gameSlotsWinRate: number;
  gameFishWinRate: number;
  gameCoinFlipEnabled: boolean;
  gameDiceRollEnabled: boolean;
  gameCrashEnabled: boolean;
  gameSlotsEnabled: boolean;
  gameFishEnabled: boolean;
  gameWheelEnabled: boolean;
  gameMinesEnabled: boolean;
  gamePlinkoEnabled: boolean;
  gameTowerEnabled: boolean;
  bets?: BetRecord[];
  news?: any[];
  deletedNftIds?: string[];
}
