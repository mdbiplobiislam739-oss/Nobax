import { AppState, Notice, Transaction, User, VIPLevel, Product, Order, PaymentMethod, BetRecord, NFTItem } from '../types';
import { generateId } from './utils';
import { db, auth } from './firebase';
import { doc, getDoc, getDocs, setDoc, onSnapshot, collection, query, where, deleteDoc } from 'firebase/firestore';

const STORE_KEY = 'novax_db_v4';
let unsubscribers: (() => void)[] = [];

// Automatic one-time purge of old corrupted/test data from previous versions
try {
  if (typeof window !== 'undefined' && localStorage.getItem('novax_wiped_v4') !== 'true') {
    const OLD_KEYS = ['trx_hub_db_v2', 'trx_hub_db_v1', 'trx_hub_db', 'device_registered', 'novax_guest_user'];
    OLD_KEYS.forEach(k => localStorage.removeItem(k));
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('novax_checkin_') || k.startsWith('novax_streak_'))) {
        localStorage.removeItem(k);
      }
    }
    localStorage.setItem('novax_wiped_v4', 'true');
  }
} catch (e) {
  console.warn('Local storage purge error:', e);
}

// Fallback initial data (only used if Firebase doesn't load)
export const VIP_LEVELS: VIPLevel[] = [
  { level: 0, name: 'Free User', price: 0, dailyIncome: 0.5, validityDays: 365, maxTasks: 1 },
  { level: 1, name: 'VIP 1', price: 30, dailyIncome: 5, validityDays: 365, maxTasks: 5 },
  { level: 2, name: 'VIP 2', price: 300, dailyIncome: 18, validityDays: 365, maxTasks: 10 },
  { level: 3, name: 'VIP 3', price: 1000, dailyIncome: 65, validityDays: 365, maxTasks: 15 },
  { level: 4, name: 'VIP 4', price: 3000, dailyIncome: 210, validityDays: 365, maxTasks: 20 },
  { level: 5, name: 'VIP 5', price: 10000, dailyIncome: 800, validityDays: 365, maxTasks: 30 },
  { level: 6, name: 'VIP 6', price: 25000, dailyIncome: 2250, validityDays: 365, maxTasks: 40 },
  { level: 7, name: 'VIP 7', price: 50000, dailyIncome: 5000, validityDays: 365, maxTasks: 50 },
  { level: 8, name: 'VIP 8', price: 100000, dailyIncome: 12000, validityDays: 365, maxTasks: 60 },
];

const initialNotices: Notice[] = [
  { id: '1', text: 'Welcome to NovaX! Join our Telegram for daily signals.', isActive: true, timestamp: Date.now() },
  { id: '2', text: 'VIP 3 upgrade now gives 10% extra daily bonus until the end of the month!', isActive: true, timestamp: Date.now() },
];

const initialProducts: Product[] = [
  { id: 'prod-v3-1', name: 'Luxury Jeans #1', hash: 'Size 37', price: 92, img: 'https://loremflickr.com/300/300/jeans?lock=1' },
  { id: 'prod-v3-2', name: 'Luxury Dress #2', hash: 'Size 38', price: 27, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-3', name: 'Luxury Handbag #3', hash: 'Size 39', price: 135, img: 'https://loremflickr.com/300/300/handbag?lock=3' },
  { id: 'prod-v3-4', name: 'Luxury T-Shirt #4', hash: 'Size 40', price: 32, img: 'https://loremflickr.com/300/300/tshirt?lock=4' },
  { id: 'prod-v3-5', name: 'Luxury Jacket #5', hash: 'Size 41', price: 146, img: 'https://loremflickr.com/300/300/jacket?lock=5' },
  { id: 'prod-v3-6', name: 'Luxury Watch #6', hash: 'Size 42', price: 46, img: 'https://loremflickr.com/300/300/watch?lock=6' },
  { id: 'prod-v3-7', name: 'Luxury Heels #7', hash: 'Size 43', price: 226, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-8', name: 'Luxury Jewelry #8', hash: 'Size 36', price: 296, img: 'https://loremflickr.com/300/300/jewelry?lock=8' },
  { id: 'prod-v3-9', name: 'Luxury Sunglasses #9', hash: 'Size 37', price: 264, img: 'https://loremflickr.com/300/300/sunglasses?lock=9' },
  { id: 'prod-v3-10', name: 'Luxury Makeup #10', hash: 'Size 38', price: 244, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-11', name: 'Luxury Perfume #11', hash: 'Size 39', price: 145, img: 'https://loremflickr.com/300/300/perfume?lock=11' },
  { id: 'prod-v3-12', name: 'Luxury Sneakers #12', hash: 'Size 40', price: 38, img: 'https://loremflickr.com/300/300/sneakers?lock=12' },
  { id: 'prod-v3-13', name: 'Luxury Jeans #13', hash: 'Size 41', price: 64, img: 'https://loremflickr.com/300/300/jeans?lock=13' },
  { id: 'prod-v3-14', name: 'Luxury Dress #14', hash: 'Size 42', price: 224, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-15', name: 'Luxury Handbag #15', hash: 'Size 43', price: 42, img: 'https://loremflickr.com/300/300/handbag?lock=15' },
  { id: 'prod-v3-16', name: 'Luxury T-Shirt #16', hash: 'Size 36', price: 171, img: 'https://loremflickr.com/300/300/tshirt?lock=16' },
  { id: 'prod-v3-17', name: 'Luxury Jacket #17', hash: 'Size 37', price: 252, img: 'https://loremflickr.com/300/300/jacket?lock=17' },
  { id: 'prod-v3-18', name: 'Luxury Watch #18', hash: 'Size 38', price: 256, img: 'https://loremflickr.com/300/300/watch?lock=18' },
  { id: 'prod-v3-19', name: 'Luxury Heels #19', hash: 'Size 39', price: 165, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-20', name: 'Luxury Jewelry #20', hash: 'Size 40', price: 260, img: 'https://loremflickr.com/300/300/jewelry?lock=20' },
  { id: 'prod-v3-21', name: 'Luxury Sunglasses #21', hash: 'Size 41', price: 233, img: 'https://loremflickr.com/300/300/sunglasses?lock=21' },
  { id: 'prod-v3-22', name: 'Luxury Makeup #22', hash: 'Size 42', price: 223, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-23', name: 'Luxury Perfume #23', hash: 'Size 43', price: 140, img: 'https://loremflickr.com/300/300/perfume?lock=23' },
  { id: 'prod-v3-24', name: 'Luxury Sneakers #24', hash: 'Size 36', price: 319, img: 'https://loremflickr.com/300/300/sneakers?lock=24' },
  { id: 'prod-v3-25', name: 'Luxury Jeans #25', hash: 'Size 37', price: 82, img: 'https://loremflickr.com/300/300/jeans?lock=25' },
  { id: 'prod-v3-26', name: 'Luxury Dress #26', hash: 'Size 38', price: 267, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-27', name: 'Luxury Handbag #27', hash: 'Size 39', price: 39, img: 'https://loremflickr.com/300/300/handbag?lock=27' },
  { id: 'prod-v3-28', name: 'Luxury T-Shirt #28', hash: 'Size 40', price: 79, img: 'https://loremflickr.com/300/300/tshirt?lock=28' },
  { id: 'prod-v3-29', name: 'Luxury Jacket #29', hash: 'Size 41', price: 108, img: 'https://loremflickr.com/300/300/jacket?lock=29' },
  { id: 'prod-v3-30', name: 'Luxury Watch #30', hash: 'Size 42', price: 301, img: 'https://loremflickr.com/300/300/watch?lock=30' },
  { id: 'prod-v3-31', name: 'Luxury Heels #31', hash: 'Size 43', price: 217, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-32', name: 'Luxury Jewelry #32', hash: 'Size 36', price: 318, img: 'https://loremflickr.com/300/300/jewelry?lock=32' },
  { id: 'prod-v3-33', name: 'Luxury Sunglasses #33', hash: 'Size 37', price: 80, img: 'https://loremflickr.com/300/300/sunglasses?lock=33' },
  { id: 'prod-v3-34', name: 'Luxury Makeup #34', hash: 'Size 38', price: 197, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-35', name: 'Luxury Perfume #35', hash: 'Size 39', price: 40, img: 'https://loremflickr.com/300/300/perfume?lock=35' },
  { id: 'prod-v3-36', name: 'Luxury Sneakers #36', hash: 'Size 40', price: 164, img: 'https://loremflickr.com/300/300/sneakers?lock=36' },
  { id: 'prod-v3-37', name: 'Luxury Jeans #37', hash: 'Size 41', price: 217, img: 'https://loremflickr.com/300/300/jeans?lock=37' },
  { id: 'prod-v3-38', name: 'Luxury Dress #38', hash: 'Size 42', price: 54, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-39', name: 'Luxury Handbag #39', hash: 'Size 43', price: 228, img: 'https://loremflickr.com/300/300/handbag?lock=39' },
  { id: 'prod-v3-40', name: 'Luxury T-Shirt #40', hash: 'Size 36', price: 173, img: 'https://loremflickr.com/300/300/tshirt?lock=40' },
  { id: 'prod-v3-41', name: 'Luxury Jacket #41', hash: 'Size 37', price: 225, img: 'https://loremflickr.com/300/300/jacket?lock=41' },
  { id: 'prod-v3-42', name: 'Luxury Watch #42', hash: 'Size 38', price: 192, img: 'https://loremflickr.com/300/300/watch?lock=42' },
  { id: 'prod-v3-43', name: 'Luxury Heels #43', hash: 'Size 39', price: 227, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-44', name: 'Luxury Jewelry #44', hash: 'Size 40', price: 174, img: 'https://loremflickr.com/300/300/jewelry?lock=44' },
  { id: 'prod-v3-45', name: 'Luxury Sunglasses #45', hash: 'Size 41', price: 145, img: 'https://loremflickr.com/300/300/sunglasses?lock=45' },
  { id: 'prod-v3-46', name: 'Luxury Makeup #46', hash: 'Size 42', price: 270, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-47', name: 'Luxury Perfume #47', hash: 'Size 43', price: 288, img: 'https://loremflickr.com/300/300/perfume?lock=47' },
  { id: 'prod-v3-48', name: 'Luxury Sneakers #48', hash: 'Size 36', price: 97, img: 'https://loremflickr.com/300/300/sneakers?lock=48' },
  { id: 'prod-v3-49', name: 'Luxury Jeans #49', hash: 'Size 37', price: 206, img: 'https://loremflickr.com/300/300/jeans?lock=49' },
  { id: 'prod-v3-50', name: 'Luxury Dress #50', hash: 'Size 38', price: 48, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-51', name: 'Luxury Handbag #51', hash: 'Size 39', price: 150, img: 'https://loremflickr.com/300/300/handbag?lock=51' },
  { id: 'prod-v3-52', name: 'Luxury T-Shirt #52', hash: 'Size 40', price: 316, img: 'https://loremflickr.com/300/300/tshirt?lock=52' },
  { id: 'prod-v3-53', name: 'Luxury Jacket #53', hash: 'Size 41', price: 177, img: 'https://loremflickr.com/300/300/jacket?lock=53' },
  { id: 'prod-v3-54', name: 'Luxury Watch #54', hash: 'Size 42', price: 105, img: 'https://loremflickr.com/300/300/watch?lock=54' },
  { id: 'prod-v3-55', name: 'Luxury Heels #55', hash: 'Size 43', price: 95, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-56', name: 'Luxury Jewelry #56', hash: 'Size 36', price: 280, img: 'https://loremflickr.com/300/300/jewelry?lock=56' },
  { id: 'prod-v3-57', name: 'Luxury Sunglasses #57', hash: 'Size 37', price: 266, img: 'https://loremflickr.com/300/300/sunglasses?lock=57' },
  { id: 'prod-v3-58', name: 'Luxury Makeup #58', hash: 'Size 38', price: 303, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-59', name: 'Luxury Perfume #59', hash: 'Size 39', price: 86, img: 'https://loremflickr.com/300/300/perfume?lock=59' },
  { id: 'prod-v3-60', name: 'Luxury Sneakers #60', hash: 'Size 40', price: 69, img: 'https://loremflickr.com/300/300/sneakers?lock=60' },
  { id: 'prod-v3-61', name: 'Luxury Jeans #61', hash: 'Size 41', price: 124, img: 'https://loremflickr.com/300/300/jeans?lock=61' },
  { id: 'prod-v3-62', name: 'Luxury Dress #62', hash: 'Size 42', price: 41, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-63', name: 'Luxury Handbag #63', hash: 'Size 43', price: 161, img: 'https://loremflickr.com/300/300/handbag?lock=63' },
  { id: 'prod-v3-64', name: 'Luxury T-Shirt #64', hash: 'Size 36', price: 264, img: 'https://loremflickr.com/300/300/tshirt?lock=64' },
  { id: 'prod-v3-65', name: 'Luxury Jacket #65', hash: 'Size 37', price: 74, img: 'https://loremflickr.com/300/300/jacket?lock=65' },
  { id: 'prod-v3-66', name: 'Luxury Watch #66', hash: 'Size 38', price: 65, img: 'https://loremflickr.com/300/300/watch?lock=66' },
  { id: 'prod-v3-67', name: 'Luxury Heels #67', hash: 'Size 39', price: 249, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-68', name: 'Luxury Jewelry #68', hash: 'Size 40', price: 100, img: 'https://loremflickr.com/300/300/jewelry?lock=68' },
  { id: 'prod-v3-69', name: 'Luxury Sunglasses #69', hash: 'Size 41', price: 175, img: 'https://loremflickr.com/300/300/sunglasses?lock=69' },
  { id: 'prod-v3-70', name: 'Luxury Makeup #70', hash: 'Size 42', price: 161, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-71', name: 'Luxury Perfume #71', hash: 'Size 43', price: 20, img: 'https://loremflickr.com/300/300/perfume?lock=71' },
  { id: 'prod-v3-72', name: 'Luxury Sneakers #72', hash: 'Size 36', price: 170, img: 'https://loremflickr.com/300/300/sneakers?lock=72' },
  { id: 'prod-v3-73', name: 'Luxury Jeans #73', hash: 'Size 37', price: 95, img: 'https://loremflickr.com/300/300/jeans?lock=73' },
  { id: 'prod-v3-74', name: 'Luxury Dress #74', hash: 'Size 38', price: 99, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-75', name: 'Luxury Handbag #75', hash: 'Size 39', price: 238, img: 'https://loremflickr.com/300/300/handbag?lock=75' },
  { id: 'prod-v3-76', name: 'Luxury T-Shirt #76', hash: 'Size 40', price: 228, img: 'https://loremflickr.com/300/300/tshirt?lock=76' },
  { id: 'prod-v3-77', name: 'Luxury Jacket #77', hash: 'Size 41', price: 105, img: 'https://loremflickr.com/300/300/jacket?lock=77' },
  { id: 'prod-v3-78', name: 'Luxury Watch #78', hash: 'Size 42', price: 67, img: 'https://loremflickr.com/300/300/watch?lock=78' },
  { id: 'prod-v3-79', name: 'Luxury Heels #79', hash: 'Size 43', price: 153, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-80', name: 'Luxury Jewelry #80', hash: 'Size 36', price: 265, img: 'https://loremflickr.com/300/300/jewelry?lock=80' },
  { id: 'prod-v3-81', name: 'Luxury Sunglasses #81', hash: 'Size 37', price: 132, img: 'https://loremflickr.com/300/300/sunglasses?lock=81' },
  { id: 'prod-v3-82', name: 'Luxury Makeup #82', hash: 'Size 38', price: 224, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-83', name: 'Luxury Perfume #83', hash: 'Size 39', price: 111, img: 'https://loremflickr.com/300/300/perfume?lock=83' },
  { id: 'prod-v3-84', name: 'Luxury Sneakers #84', hash: 'Size 40', price: 30, img: 'https://loremflickr.com/300/300/sneakers?lock=84' },
  { id: 'prod-v3-85', name: 'Luxury Jeans #85', hash: 'Size 41', price: 99, img: 'https://loremflickr.com/300/300/jeans?lock=85' },
  { id: 'prod-v3-86', name: 'Luxury Dress #86', hash: 'Size 42', price: 63, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-87', name: 'Luxury Handbag #87', hash: 'Size 43', price: 261, img: 'https://loremflickr.com/300/300/handbag?lock=87' },
  { id: 'prod-v3-88', name: 'Luxury T-Shirt #88', hash: 'Size 36', price: 127, img: 'https://loremflickr.com/300/300/tshirt?lock=88' },
  { id: 'prod-v3-89', name: 'Luxury Jacket #89', hash: 'Size 37', price: 66, img: 'https://loremflickr.com/300/300/jacket?lock=89' },
  { id: 'prod-v3-90', name: 'Luxury Watch #90', hash: 'Size 38', price: 156, img: 'https://loremflickr.com/300/300/watch?lock=90' },
  { id: 'prod-v3-91', name: 'Luxury Heels #91', hash: 'Size 39', price: 68, img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-92', name: 'Luxury Jewelry #92', hash: 'Size 40', price: 70, img: 'https://loremflickr.com/300/300/jewelry?lock=92' },
  { id: 'prod-v3-93', name: 'Luxury Sunglasses #93', hash: 'Size 41', price: 277, img: 'https://loremflickr.com/300/300/sunglasses?lock=93' },
  { id: 'prod-v3-94', name: 'Luxury Makeup #94', hash: 'Size 42', price: 270, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-95', name: 'Luxury Perfume #95', hash: 'Size 43', price: 255, img: 'https://loremflickr.com/300/300/perfume?lock=95' },
  { id: 'prod-v3-96', name: 'Luxury Sneakers #96', hash: 'Size 36', price: 168, img: 'https://loremflickr.com/300/300/sneakers?lock=96' },
  { id: 'prod-v3-97', name: 'Luxury Jeans #97', hash: 'Size 37', price: 219, img: 'https://loremflickr.com/300/300/jeans?lock=97' },
  { id: 'prod-v3-98', name: 'Luxury Dress #98', hash: 'Size 38', price: 207, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'prod-v3-99', name: 'Luxury Handbag #99', hash: 'Size 39', price: 40, img: 'https://loremflickr.com/300/300/handbag?lock=99' },
  { id: 'prod-v3-100', name: 'Luxury T-Shirt #100', hash: 'Size 40', price: 162, img: 'https://loremflickr.com/300/300/tshirt?lock=100' }
];

const initialNfts: NFTItem[] = [
  {
    id: 'nft-001',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Royal Ape Yacht Club #001',
    description: 'Elite royal ape miner equipped with high-tier ASIC co-processors.',
    price: 25.0,
    tier: 'Legendary',
    miningPower: '+250 GH/s',
    dailyMiningRate: 2.6,
    imageUrl: 'https://images.unsplash.com/photo-1644361566696-3d442b5b482a?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 500000,
  },
  {
    id: 'nft-002',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Cyber Ninja #002',
    description: 'Stealth cyber warrior unit tuned for zero-latency micro-block discovery.',
    price: 15.0,
    tier: 'Epic',
    miningPower: '+150 GH/s',
    dailyMiningRate: 1.5,
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 480000,
  },
  {
    id: 'nft-003',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Anime Girl #003',
    description: 'Charming synthwave anime miner maximizing energy hash efficiency.',
    price: 8.0,
    tier: 'Rare',
    miningPower: '+80 GH/s',
    dailyMiningRate: 0.8,
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 460000,
  },
  {
    id: 'nft-004',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Dragon King #004',
    description: 'Mythical blue dragon radiating unstoppable computational power.',
    price: 28.0,
    tier: 'Legendary',
    miningPower: '+280 GH/s',
    dailyMiningRate: 2.85,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 440000,
  },
  {
    id: 'nft-005',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Panda Warrior #005',
    description: 'Disciplined cyber bamboo brawler providing steady baseline daily rewards.',
    price: 5.0,
    tier: 'Common',
    miningPower: '+50 GH/s',
    dailyMiningRate: 0.5,
    imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 420000,
  },
  {
    id: 'nft-006',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Pixel Boy #006',
    description: 'Retro 8-bit voxel adventurer overclocked for swift difficulty solving.',
    price: 4.0,
    tier: 'Common',
    miningPower: '+40 GH/s',
    dailyMiningRate: 0.4,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 400000,
  },
  {
    id: 'nft-007',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Wolf Spirit #007',
    description: 'Celestial neon wolf prowling across decentralized cryptographic chains.',
    price: 10.0,
    tier: 'Rare',
    miningPower: '+100 GH/s',
    dailyMiningRate: 1.05,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 380000,
  },
  {
    id: 'nft-008',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Neon Supercar #008',
    description: 'Neon purple futuristic supercar accelerating straight to maximum hashrate.',
    price: 32.0,
    tier: 'Legendary',
    miningPower: '+320 GH/s',
    dailyMiningRate: 3.3,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 360000,
  },
  {
    id: 'nft-009',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Skull King #009',
    description: 'Crowned neon skull phantom commanding dark-fiber decentralized pools.',
    price: 18.0,
    tier: 'Epic',
    miningPower: '+180 GH/s',
    dailyMiningRate: 1.85,
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 340000,
  },
  {
    id: 'nft-010',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Sky Castle #010',
    description: 'Floating celestial citadel channeling limitless cosmic ether for daily profit.',
    price: 9.5,
    tier: 'Rare',
    miningPower: '+95 GH/s',
    dailyMiningRate: 0.95,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 320000,
  },
  {
    id: 'nft-011',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Samurai Cat #011',
    description: 'Fierce blade-wielding feline warrior defending the validator nodes.',
    price: 11.0,
    tier: 'Rare',
    miningPower: '+110 GH/s',
    dailyMiningRate: 1.15,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 300000,
  },
  {
    id: 'nft-012',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Neon Tiger #012',
    description: 'Electric predator glowing with hyper-charge cryptographic energy.',
    price: 16.0,
    tier: 'Epic',
    miningPower: '+160 GH/s',
    dailyMiningRate: 1.65,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 280000,
  },
  {
    id: 'nft-013',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Space Traveler #013',
    description: 'Interstellar astronaut voyaging across decentralized galaxy clusters.',
    price: 19.0,
    tier: 'Epic',
    miningPower: '+190 GH/s',
    dailyMiningRate: 1.95,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 260000,
  },
  {
    id: 'nft-014',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Shadow Lord #014',
    description: 'Mysterious overlord shrouded in dark-matter encryption algorithms.',
    price: 26.0,
    tier: 'Legendary',
    miningPower: '+260 GH/s',
    dailyMiningRate: 2.7,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 240000,
  },
  {
    id: 'nft-015',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Game Controller #015',
    description: 'Cybernetic neon gamepad delivering ultra-responsive input hashrate.',
    price: 3.5,
    tier: 'Common',
    miningPower: '+35 GH/s',
    dailyMiningRate: 0.35,
    imageUrl: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 220000,
  },
  {
    id: 'nft-016',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Crypto Coin #016',
    description: 'Solid gold holographic token generating constant passive yield.',
    price: 6.0,
    tier: 'Common',
    miningPower: '+60 GH/s',
    dailyMiningRate: 0.6,
    imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 200000,
  },
  {
    id: 'nft-017',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Ice Phoenix #017',
    description: 'Sub-zero mythical avian cooling the hardest cryptographic computations.',
    price: 35.0,
    tier: 'Legendary',
    miningPower: '+350 GH/s',
    dailyMiningRate: 3.6,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 180000,
  },
  {
    id: 'nft-018',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Cyber Queen #018',
    description: 'Sovereign empress of the digital metaverse reigning over smart contracts.',
    price: 22.0,
    tier: 'Epic',
    miningPower: '+220 GH/s',
    dailyMiningRate: 2.25,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 160000,
  },
  {
    id: 'nft-019',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Ninja Rabbit #019',
    description: 'Lightning-fast shinobi hare leaping past ledger block times.',
    price: 8.5,
    tier: 'Rare',
    miningPower: '+85 GH/s',
    dailyMiningRate: 0.88,
    imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 140000,
  },
  {
    id: 'nft-020',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Fire Phoenix #020',
    description: 'Blazing firebird reborn from the ashes of solved blockchain puzzles.',
    price: 36.0,
    tier: 'Legendary',
    miningPower: '+360 GH/s',
    dailyMiningRate: 3.75,
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 120000,
  },
  {
    id: 'nft-021',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Future City #021',
    description: 'Sprawling neon metropolis networked into a mega-hash distributed web.',
    price: 12.0,
    tier: 'Rare',
    miningPower: '+120 GH/s',
    dailyMiningRate: 1.25,
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 100000,
  },
  {
    id: 'nft-022',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Golden Robot #022',
    description: 'Lustrous cybernetic automaton constructed from pure bullion circuits.',
    price: 20.0,
    tier: 'Epic',
    miningPower: '+200 GH/s',
    dailyMiningRate: 2.1,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 80000,
  },
  {
    id: 'nft-023',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Alien Warrior #023',
    description: 'Extraterrestrial combatant wielding quantum plasma mining cores.',
    price: 17.0,
    tier: 'Epic',
    miningPower: '+170 GH/s',
    dailyMiningRate: 1.75,
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 60000,
  },
  {
    id: 'nft-024',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Magic Sword #024',
    description: 'Enchanted crystalline blade slicing cleanly through target difficulty.',
    price: 9.0,
    tier: 'Rare',
    miningPower: '+90 GH/s',
    dailyMiningRate: 0.92,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 50000,
  },
  {
    id: 'nft-025',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Cyber Wolf #025',
    description: 'Augmented cyber-hound hunting rare nonces in high-difficulty epochs.',
    price: 21.0,
    tier: 'Epic',
    miningPower: '+210 GH/s',
    dailyMiningRate: 2.15,
    imageUrl: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 40000,
  },
  {
    id: 'nft-026',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Diamond Dragon #026',
    description: 'Prismatic crystal wyrm refracting pure computational brilliance.',
    price: 40.0,
    tier: 'Legendary',
    miningPower: '+400 GH/s',
    dailyMiningRate: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 30000,
  },
  {
    id: 'nft-027',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Robot Panda #027',
    description: 'Heavy mech biped programmed for tireless round-the-clock mining.',
    price: 13.0,
    tier: 'Rare',
    miningPower: '+130 GH/s',
    dailyMiningRate: 1.35,
    imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 20000,
  },
  {
    id: 'nft-028',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Neon Samurai #028',
    description: 'Honorable cyber swordsman channeling disciplined hashrate flow.',
    price: 30.0,
    tier: 'Legendary',
    miningPower: '+300 GH/s',
    dailyMiningRate: 3.1,
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 15000,
  },
  {
    id: 'nft-029',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Galaxy Guardian #029',
    description: 'Cosmic celestial warden protecting decentralized consensus globally.',
    price: 38.0,
    tier: 'Legendary',
    miningPower: '+380 GH/s',
    dailyMiningRate: 3.9,
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now() - 10000,
  },
  {
    id: 'nft-030',
    creatorId: 'system',
    ownerId: 'system',
    title: 'Legendary Phoenix #030',
    description: 'Supreme apex phoenix unleashing the highest daily XRP yield in NovaX.',
    price: 50.0,
    tier: 'Legendary',
    miningPower: '+500 GH/s',
    dailyMiningRate: 5.2,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    status: 'sale',
    isMining: false,
    totalMined: 0,
    minedAccumulated: 0,
    createdAt: Date.now(),
  },
];

const defaultState: AppState = {
  users: [],
  transactions: [],
  notices: initialNotices,
  systemBalance: 0,
  products: initialProducts,
  orders: [],
  nfts: initialNfts as any,
  nftBids: [],
  supportLink: 'https://t.me/trxhub_support',
  vipLevels: VIP_LEVELS,
  paymentMethods: [
    { id: '1', name: 'TRC20 Network', network: 'TRC20', address: 'TDepositAddressxxxxxxxxxxxxx1' },
    { id: '2', name: 'ERC20 Network', network: 'ERC20', address: '0xDepositAddressxxxxxxxxxx2' },
    { id: '3', name: 'BEP20 Network', network: 'BEP20', address: '0xDepositAddressxxxxxxxxxx3' }
  ],
  stakes: [],
  stakeSettings: { interestRate: 90, minStake: 100, maxStake: 4000 },
  banners: [
    'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=600&h=300'
  ],
  billboardText: 'Welcome to NovaX! Start your earning journey today.',
  billboardEnabled: true,
  referralBonusText: "Invite friends and earn rewards!\n\n• 50 Active Referrals = 100 XRP Bonus\n• 100 Active Referrals = 200 XRP Bonus\n• 500 Active Referrals = 1,000 XRP Bonus\n\n*Note: Active referrals mean your friends must make a deposit.",
  depositBonusText: "Top up your account to unlock additional XRP Rewards tailored for new members.\n\n• Deposit 100 XRP = 10% Bonus\n• Deposit 500 XRP = 15% Bonus\n• Deposit 1000+ XRP = 20% Bonus",
  referralSystemEnabled: true,
  referralLevel1Rate: 10,
  referralLevel2Rate: 5,
  referralLevel3Rate: 2,
  dailyRewards: [2, 5, 10, 15, 20, 30, 50],
  gameCrashWinRate: 48,
  gameRocketWinRate: 48,
  gameCoinWinRate: 48,
  gameDiceWinRate: 48,
  gameSlotsWinRate: 48,
  gameFishWinRate: 48,
  gameCoinFlipEnabled: true,
  gameDiceRollEnabled: true,
  gameCrashEnabled: true,
  gameSlotsEnabled: true,
  gameFishEnabled: false,
  gameWheelEnabled: true,
  gameMinesEnabled: true,
  gamePlinkoEnabled: true,
  gameTowerEnabled: true,
};

let inMemoryState: AppState | null = null;

function saveToLocalStorage(state: AppState) {
  try {
    localStorage.setItem(STORE_KEY, btoa(unescape(encodeURIComponent(JSON.stringify(state)))));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

function updateLocalState(updates: Partial<AppState>) {
  const current = store.getState();
  const newState = { ...current, ...updates };
  inMemoryState = newState;
  saveToLocalStorage(newState);
  window.dispatchEvent(new Event('store_updated'));
}

export const store = {
  getState: (): AppState => {
    if (inMemoryState) {
      return inMemoryState;
    }
    try {
      const storedRaw = localStorage.getItem(STORE_KEY);
      if (storedRaw) {
        const parsed: AppState = JSON.parse(decodeURIComponent(escape(atob(storedRaw))));
        // Ensure catalog of NFTs preserves admin edits, new additions, and user purchases
        const existingNfts: NFTItem[] = Array.isArray(parsed.nfts) ? parsed.nfts : [];
        const existingMap = new Map<string, NFTItem>();
        existingNfts.forEach((item) => {
          if (item && item.id) existingMap.set(item.id, item);
        });

        const deletedIds: string[] = Array.isArray(parsed.deletedNftIds) ? parsed.deletedNftIds : [];

        // Ensure all 30 base catalog NFTs exist unless deleted by admin
        initialNfts.forEach((cat) => {
          if (!existingMap.has(cat.id) && !deletedIds.includes(cat.id)) {
            existingMap.set(cat.id, cat);
          }
        });

        parsed.nfts = Array.from(existingMap.values()).map((n: any) => ({
          ...n,
          tier: n.tier || 'Common',
          title: n.title || 'NFT Miner',
          miningPower: n.miningPower || '+40 GH/s',
          price: typeof n.price === 'number' ? n.price : 10,
          dailyMiningRate: typeof n.dailyMiningRate === 'number' ? n.dailyMiningRate : 1.0,
        }));

        inMemoryState = parsed;
        saveToLocalStorage(parsed);
        return inMemoryState;
      }
    } catch (e) {
      console.error('Error reading store', e);
    }
    inMemoryState = { ...defaultState, nfts: initialNfts };
    saveToLocalStorage(inMemoryState);
    return inMemoryState;
  },

  claimDemoBalance: async (userId: string, amount: number = 50) => {
    const state = store.getState();
    const user = state.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    const newBalance = Number((user.balance + amount).toFixed(2));
    const updatedUser = { ...user, balance: newBalance };
    const tx: Transaction = {
      id: generateId(),
      userId: user.id,
      username: user.username,
      type: 'deposit',
      amount: amount,
      timestamp: Date.now(),
      status: 'completed',
      description: `Welcome Demo XRP Credit (${amount} XRP)`,
      currency: 'XRP',
    };
    updateLocalState({
      users: state.users.map(u => u.id === userId ? updatedUser : u),
      transactions: [tx, ...state.transactions],
    });
    try {
      await setDoc(doc(db, 'users', userId), { balance: newBalance }, { merge: true });
      await setDoc(doc(db, 'transactions', tx.id), tx);
    } catch (e) {
      console.warn('Demo balance firestore sync:', e);
    }
    return updatedUser;
  },

  clearUserSubscriptions: () => {
    unsubscribers.forEach(u => u());
    unsubscribers = [];
  },

  initFirebase: async (uid: string) => {
    store.clearUserSubscriptions();

    // Check user role
    let isAdmin = false;
    const user = auth.currentUser;
    if (user && user.email === 'mdbiplobiislam739@gmail.com') {
      isAdmin = true;
    } else {
      const userDocRef = doc(db, 'users', uid);
      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists() && snap.data().role === 'admin') {
          isAdmin = true;
        }
      } catch (e) {
          console.error("Checking admin failed");
      }
    }

    // 1. Users Collection
    const u1 = onSnapshot(collection(db, 'users'), snapshot => {
      updateLocalState({ users: snapshot.docs.map(d => d.data() as User) });
    }, error => {
      console.error('Users listener error:', error);
    });
    unsubscribers.push(u1);

    // 2. Transactions
    const txQuery = isAdmin ? collection(db, 'transactions') : query(collection(db, 'transactions'), where('userId', '==', uid));
    const u3 = onSnapshot(txQuery, snapshot => {
      updateLocalState({ transactions: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Transaction)).sort((a, b) => b.timestamp - a.timestamp) });
    }, error => console.error("Transactions listener error:", error));
    unsubscribers.push(u3);

    // 3. Orders
    const orderQuery = isAdmin ? collection(db, 'orders') : query(collection(db, 'orders'), where('userId', '==', uid));
    const u4 = onSnapshot(orderQuery, snapshot => {
      updateLocalState({ orders: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Order)).sort((a, b) => b.timestamp - a.timestamp) });
    }, error => console.error("Orders listener error:", error));
    unsubscribers.push(u4);

    const uNfts = onSnapshot(collection(db, 'nfts'), snapshot => {
      const firestoreDocs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as any));
      const userOwned = firestoreDocs.filter((d: any) => d.ownerId && d.ownerId !== 'system');
      const catalog = [...initialNfts];
      const merged = catalog.map((cat) => {
        const owned = userOwned.find((u: any) => u.id === cat.id);
        return owned || cat;
      });
      userOwned.forEach((u: any) => {
        if (!merged.some((m) => m.id === u.id)) merged.push(u);
      });
      updateLocalState({ nfts: merged });
    }, error => console.warn("NFTs listener error:", error));
    unsubscribers.push(uNfts);

    const uNftBids = onSnapshot(collection(db, 'nftBids'), snapshot => {
      updateLocalState({ nftBids: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as any)) });
    }, error => console.warn("NFT Bids listener error:", error));
    unsubscribers.push(uNftBids);

    // 4. Products
    const u5 = onSnapshot(collection(db, 'products'), snapshot => {
      updateLocalState({ products: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Product)) });
    }, error => console.error("Products listener error:", error));
    unsubscribers.push(u5);

    // 5. Notices
    const u6 = onSnapshot(collection(db, 'notices'), snapshot => {
      updateLocalState({ notices: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Notice)).sort((a, b) => b.timestamp - a.timestamp) });
    }, error => console.error("Notices listener error:", error));
    unsubscribers.push(u6);

    // 5B. News
    const uNews = onSnapshot(collection(db, 'news'), snapshot => {
      updateLocalState({ news: snapshot.docs.map(d => ({ ...d.data(), id: d.id })).sort((a: any, b: any) => b.timestamp - a.timestamp) });
    }, error => console.warn("News listener error:", error));
    unsubscribers.push(uNews);

    // 6. Payment Methods
    const u7 = onSnapshot(collection(db, 'paymentMethods'), snapshot => {
      updateLocalState({ paymentMethods: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as PaymentMethod)) });
    }, error => console.error("PaymentMethods listener error:", error));
    unsubscribers.push(u7);

    // 7. System Config
    const u8 = onSnapshot(doc(db, 'config', 'system'), snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        updateLocalState({
          supportLink: data.supportLink,
          systemBalance: data.systemBalance,
          vipLevels: data.vipLevels || VIP_LEVELS,
          stakeSettings: data.stakeSettings || { interestRate: 90, minStake: 100, maxStake: 4000 },
          banners: data.banners || [],
          billboardText: data.billboardText !== undefined ? data.billboardText : 'Welcome to NovaX! Start your earning journey today.',
          billboardEnabled: data.billboardEnabled !== undefined ? data.billboardEnabled : true,
          referralBonusText: data.referralBonusText !== undefined ? data.referralBonusText : "Invite friends and earn rewards!\n\n• 50 Active Referrals = 100 XRP Bonus\n• 100 Active Referrals = 200 XRP Bonus\n• 500 Active Referrals = 1,000 XRP Bonus\n\n*Note: Active referrals mean your friends must make a deposit.",
          depositBonusText: data.depositBonusText !== undefined ? data.depositBonusText : "Top up your account to unlock additional XRP Rewards tailored for new members.\n\n• Deposit 100 XRP = 10% Bonus\n• Deposit 500 XRP = 15% Bonus\n• Deposit 1000+ XRP = 20% Bonus",
          referralSystemEnabled: data.referralSystemEnabled !== undefined ? data.referralSystemEnabled : true,
          referralLevel1Rate: data.referralLevel1Rate !== undefined ? data.referralLevel1Rate : 10,
          referralLevel2Rate: data.referralLevel2Rate !== undefined ? data.referralLevel2Rate : 5,
          referralLevel3Rate: data.referralLevel3Rate !== undefined ? data.referralLevel3Rate : 2,
          dailyRewards: data.dailyRewards || [2, 5, 10, 15, 20, 30, 50],
          gameCrashWinRate: data.gameCrashWinRate !== undefined ? data.gameCrashWinRate : 48,
          gameRocketWinRate: data.gameRocketWinRate !== undefined ? data.gameRocketWinRate : 48,
          gameCoinWinRate: data.gameCoinWinRate !== undefined ? data.gameCoinWinRate : 48,
          gameDiceWinRate: data.gameDiceWinRate !== undefined ? data.gameDiceWinRate : 48,
          gameSlotsWinRate: data.gameSlotsWinRate !== undefined ? data.gameSlotsWinRate : 48,
          gameFishWinRate: data.gameFishWinRate !== undefined ? data.gameFishWinRate : 48,
          gameCoinFlipEnabled: data.gameCoinFlipEnabled !== undefined ? data.gameCoinFlipEnabled : true,
          gameDiceRollEnabled: data.gameDiceRollEnabled !== undefined ? data.gameDiceRollEnabled : true,
          gameCrashEnabled: data.gameCrashEnabled !== undefined ? data.gameCrashEnabled : true,
          gameSlotsEnabled: data.gameSlotsEnabled !== undefined ? data.gameSlotsEnabled : true,
          gameFishEnabled: data.gameFishEnabled !== undefined ? data.gameFishEnabled : false,
          gameWheelEnabled: data.gameWheelEnabled !== undefined ? data.gameWheelEnabled : true,
          gameMinesEnabled: data.gameMinesEnabled !== undefined ? data.gameMinesEnabled : true,
          gamePlinkoEnabled: data.gamePlinkoEnabled !== undefined ? data.gamePlinkoEnabled : true,
          gameTowerEnabled: data.gameTowerEnabled !== undefined ? data.gameTowerEnabled : true,
        });
      }
    }, error => console.error("Config listener error:", error));
    unsubscribers.push(u8);

    // 7. Stakes
    const stakeQuery = isAdmin ? collection(db, 'stakes') : query(collection(db, 'stakes'), where('userId', '==', uid));
    const u9 = onSnapshot(stakeQuery, snapshot => {
      // @ts-ignore
      updateLocalState({ stakes: snapshot.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => b.timestamp - a.timestamp) });
    }, error => console.error("Stakes listener error:", error));
    unsubscribers.push(u9);

    // 8. Bets
    const betQuery = isAdmin ? collection(db, 'bets') : query(collection(db, 'bets'), where('userId', '==', uid));
    const u10 = onSnapshot(betQuery, snapshot => {
      // @ts-ignore
      updateLocalState({ bets: snapshot.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => b.timestamp - a.timestamp) });
    }, error => console.warn("Bets listener error:", error));
    unsubscribers.push(u10);

    // Initial Database Seed for Admins
    if (isAdmin) {
       getDoc(doc(db, 'config', 'system')).then(async snap => {
          if (!snap.exists()) {
             console.log("Seeding Database...");
             await setDoc(doc(db, 'config', 'system'), { 
                supportLink: 'https://t.me/trxhub_support', 
                systemBalance: 0,
                vipLevels: VIP_LEVELS,
                stakeSettings: { interestRate: 2, minStake: 100, maxStake: 4000 }
             });
             for(let n of initialNotices) { await setDoc(doc(db, 'notices', n.id), n); }
             for(let p of initialProducts) { await setDoc(doc(db, 'products', p.id), p); }
             for(let nft of initialNfts) { await setDoc(doc(db, 'nfts', nft.id), nft); }
             await setDoc(doc(db, 'paymentMethods', '1'), { name: 'TRC20 Network', network: 'TRC20', address: 'TDepositAddressxxxxxxxxxxxxx1' });
             await setDoc(doc(db, 'paymentMethods', '2'), { name: 'ERC20 Network', network: 'ERC20', address: '0xDepositAddressxxxxxxxxxx2' });
             await setDoc(doc(db, 'paymentMethods', '3'), { name: 'BEP20 Network', network: 'BEP20', address: '0xDepositAddressxxxxxxxxxx3' });
          } else {
             // Sync VIP_LEVELS and Payment Methods
             const data = snap.data();
             let updated = false;
             let newVipLevels = data.vipLevels || [];
             if (newVipLevels.find((v: any) => v.level === 1 && v.price === 100)) {
               newVipLevels = newVipLevels.map((v: any) => v.level === 1 ? { ...v, price: 30 } : v);
               updated = true;
             }
             // Ensure levels 5-8 exist
             for (let level = 5; level <= 8; level++) {
               if (!newVipLevels.find((v: any) => v.level === level)) {
                 const defaultLayer = VIP_LEVELS.find(v => v.level === level);
                 if (defaultLayer) {
                   newVipLevels.push(defaultLayer);
                   updated = true;
                 }
               }
             }
             if (updated) {
               await setDoc(doc(db, 'config', 'system'), { vipLevels: newVipLevels }, { merge: true });
             }

             // Ensure initial Products exist
             try {
               const prodSnap = await getDocs(collection(db, 'products'));
               if (!prodSnap.docs.find(d => d.id === "prod-v3-100")) {
                 for(let p of initialProducts) { await setDoc(doc(db, 'products', p.id), p); }
               }
             } catch(e) { console.warn("Error seeding Products", e); }
             
             // Ensure initial NFTs exist
             try {
               const nftSnap = await getDocs(collection(db, 'nfts'));
               if (!nftSnap.docs.find(d => d.id === "nft-v3-100")) {
                 for(let nft of initialNfts) { await setDoc(doc(db, 'nfts', nft.id), nft); }
               }
             } catch(e) { console.warn("Error seeding NFTs", e); }

             // Auto migrate legacy Binance/Bybit methods
             try {
               const pmSnapshot = await getDocs(collection(db, 'paymentMethods'));
               let hasBEP20 = false;
               
               for (const d of pmSnapshot.docs) {
                 const name = d.data().name || '';
                 const lowerName = name.toLowerCase();
                 if (lowerName.includes('binance')) {
                   await setDoc(d.ref, { ...d.data(), name: 'TRC20 Network', network: 'TRC20' }, { merge: true });
                 } else if (lowerName.includes('bybit')) {
                   await setDoc(d.ref, { ...d.data(), name: 'ERC20 Network', network: 'ERC20' }, { merge: true });
                 }
                 
                 if (lowerName.includes('bep20')) {
                   hasBEP20 = true;
                 }
               }
               
               if (!hasBEP20) {
                 await setDoc(doc(db, 'paymentMethods', 'bep20-default'), { name: 'BNB Smart Chain (BEP20)', network: 'BEP20', address: '0xDepositAddressxxxxxxxxxx3' });
               }
             } catch(e) {}
          }
          
          // Price fluctuation interval for Admin (runs the global simulation)
          // (Removed to prevent UI freezing and massive Firestore write spikes)
       });
    }
  },

  // Users
  getUserByUsername: (username: string) => {
    return store.getState().users.find(u => u.username === username);
  },

  updateUser: async (id: string, updates: Partial<User>) => {
    // Optimistic Update
    const state = store.getState();
    updateLocalState({ users: state.users.map(u => u.id === id ? { ...u, ...updates } : u) });
    try {
      if (auth.currentUser && auth.currentUser.uid === id) {
         try {
           const idToken = await auth.currentUser.getIdToken();
           
           // If it's a balance update (bet/win), route it to secure game endpoints
           if (updates.balance !== undefined && Object.keys(updates).length === 1) {
             const currentUser = state.users.find(u => u.id === id);
             if (currentUser) {
               const diff = updates.balance - currentUser.balance;
               let apiRes;
               if (diff < 0) {
                 apiRes = await fetch('/api/game/bet', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ idToken, userId: id, amount: Math.abs(diff) })
                 });
               } else if (diff > 0) {
                 apiRes = await fetch('/api/game/cashout', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ idToken, userId: id, winAmount: diff })
                 });
               }
               
               if (apiRes && apiRes.ok) {
                  const data = await apiRes.json().catch(() => ({}));
                  if (data.warning) {
                     await setDoc(doc(db, 'users', id), updates, { merge: true });
                  }
               } else {
                  await setDoc(doc(db, 'users', id), updates, { merge: true });
               }
             }
             return; // Balance handled via transaction
           }

           // Normal profile update
           const res = await fetch('/api/user/secure-update', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ idToken, updates })
           });
           if (res.ok) {
             const data = await res.json().catch(() => ({}));
             if (data.warning) {
                await setDoc(doc(db, 'users', id), updates, { merge: true });
             }
           } else {
             console.error("Secure API update failed, trying direct Firestore fallback");
             await setDoc(doc(db, 'users', id), updates, { merge: true });
           }
         } catch(err) {
           console.error("Secure update failed:", err);
           await setDoc(doc(db, 'users', id), updates, { merge: true });
         }
      } else {
        await setDoc(doc(db, 'users', id), updates, { merge: true });
      }
    } catch (e) { console.error("Error updating user", e); }
  },

  addUser: async (user: any) => {
    const state = store.getState();
    const existing = state.users.find(u => u.id === user.id || u.email?.toLowerCase() === user.email?.toLowerCase());
    const newUsers = existing 
      ? state.users.map(u => (u.id === user.id || u.email?.toLowerCase() === user.email?.toLowerCase()) ? { ...u, ...user } : u)
      : [user, ...state.users];
    updateLocalState({ users: newUsers });
    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
    } catch (e) {
      console.warn("Could not sync user to firestore, saved locally", e);
    }
    return user;
  },

  deleteUser: async (id: string) => {
    const state = store.getState();
    updateLocalState({ users: state.users.filter(u => u.id !== id) });
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (e) { console.error("Error deleting user", e); }
  },

  // Transactions
  addTransaction: async (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const id = generateId();
    const newTx: Transaction = { ...tx, id, timestamp: Date.now() };
    const state = store.getState();
    updateLocalState({ transactions: [newTx, ...state.transactions] });
    try {
      await setDoc(doc(db, 'transactions', id), newTx);
      return newTx;
    } catch (e) { console.error("Error adding transaction", e); return newTx; }
  },
  
  updateTransaction: async (id: string, updates: Partial<Transaction>) => {
    const state = store.getState();
    updateLocalState({ transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t) });
    try {
      await setDoc(doc(db, 'transactions', id), updates, { merge: true });
    } catch(e) { console.error("Error updating transaction", e); }
  },

  // Products
  addProduct: async (product: Omit<Product, 'id'>) => {
    const id = generateId();
    const newProduct = { ...product, id };
    const state = store.getState();
    updateLocalState({ products: [...state.products, newProduct] });
    try {
      await setDoc(doc(db, 'products', id), newProduct);
      return newProduct;
    } catch (e) { console.error("Error adding product", e); return newProduct; }
  },

  updateProduct: async (id: string, updates: Partial<Product>) => {
    const state = store.getState();
    updateLocalState({ products: state.products.map(p => p.id === id ? { ...p, ...updates } : p) });
    try {
      await setDoc(doc(db, 'products', id), updates, { merge: true });
    } catch (e) { console.error("Error updating product", e); }
  },

  deleteProduct: async (id: string) => {
    const state = store.getState();
    updateLocalState({ products: state.products.filter(p => p.id !== id) });
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) { console.error("Error deleting product", e); }
  },

  // NFTs
  createNFTBid: async (bidData: any) => {
    const id = generateId();
    const newBid = { ...bidData, id, timestamp: Date.now() };
    try {
      await setDoc(doc(db, 'nftBids', id), newBid);
      return newBid;
    } catch (e) { console.error("Error creating NFT Bid", e); throw e; }
  },
  
  updateNFTBid: async (id: string, updates: any) => {
    try {
      await setDoc(doc(db, 'nftBids', id), updates, { merge: true });
    } catch (e) { console.error("Error updating NFT Bid", e); throw e; }
  },

  buyNFT: async (userId: string, nftId: string) => {
    const state = store.getState();
    const user = state.users.find(u => u.id === userId);
    const nft = state.nfts.find(n => n.id === nftId);

    if (!user) throw new Error("User not found");
    if (!nft) throw new Error("NFT not found");
    if (nft.ownerId === userId) throw new Error("You already own this NFT");
    if (user.balance < nft.price) throw new Error("Insufficient balance");

    const newBalance = Number((user.balance - nft.price).toFixed(2));
    const updatedUser = { ...user, balance: newBalance };

    const updatedNFT: NFTItem = {
      ...nft,
      ownerId: userId,
      status: 'owned',
      isMining: true,
      lastMinedAt: Date.now(),
      minedAccumulated: 0,
      totalMined: nft.totalMined || 0,
    };

    const newUsers = state.users.map(u => u.id === userId ? updatedUser : u);
    const newNfts = state.nfts.map(n => n.id === nftId ? updatedNFT : n);

    const tx: Transaction = {
      id: generateId(),
      userId: user.id,
      username: user.username,
      type: 'buy_nft',
      amount: -nft.price,
      timestamp: Date.now(),
      status: 'completed',
      description: `Purchased NFT Mining Rig: ${nft.title}`,
      currency: 'XRP',
    };

    updateLocalState({
      users: newUsers,
      nfts: newNfts,
      transactions: [tx, ...state.transactions],
    });

    try {
      await setDoc(doc(db, 'users', userId), { balance: newBalance }, { merge: true });
      await setDoc(doc(db, 'nfts', nftId), updatedNFT, { merge: true });
      await setDoc(doc(db, 'transactions', tx.id), tx);
    } catch (e) {
      console.warn("Firestore sync for buyNFT failed (using local state):", e);
    }

    return { user: updatedUser, nft: updatedNFT };
  },

  createNFT: async (nftData: Omit<NFTItem, 'id' | 'createdAt'>) => {
    const id = `nft-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newNFT: NFTItem = {
      ...nftData,
      id,
      creatorId: nftData.creatorId || 'system',
      ownerId: nftData.ownerId || 'system',
      status: nftData.status || 'sale',
      isMining: false,
      totalMined: 0,
      minedAccumulated: 0,
      createdAt: Date.now(),
    };
    const state = store.getState();
    const updatedNfts = [newNFT, ...(state.nfts || [])];
    updateLocalState({ nfts: updatedNfts });

    try {
      await setDoc(doc(db, 'nfts', id), newNFT);
    } catch (e) {
      console.warn("Firestore sync for createNFT failed (using local state):", e);
    }

    return newNFT;
  },

  updateNFT: async (nftId: string, updates: Partial<NFTItem>) => {
    const state = store.getState();
    const nft = state.nfts.find(n => n.id === nftId);
    if (!nft) throw new Error("NFT not found");

    const updatedNFT: NFTItem = { ...nft, ...updates };
    const updatedNfts = state.nfts.map(n => n.id === nftId ? updatedNFT : n);
    updateLocalState({ nfts: updatedNfts });

    try {
      await setDoc(doc(db, 'nfts', nftId), updates, { merge: true });
    } catch (e) {
      console.warn("Firestore sync for updateNFT failed (using local state):", e);
    }

    return updatedNFT;
  },

  deleteNFT: async (nftId: string) => {
    const state = store.getState();
    const updatedNfts = (state.nfts || []).filter(n => n.id !== nftId);
    const deletedIds = Array.isArray(state.deletedNftIds) ? [...state.deletedNftIds] : [];
    if (!deletedIds.includes(nftId)) {
      deletedIds.push(nftId);
    }
    updateLocalState({ nfts: updatedNfts, deletedNftIds: deletedIds });

    try {
      await deleteDoc(doc(db, 'nfts', nftId));
    } catch (e) {
      console.warn("Firestore sync for deleteNFT failed (using local state):", e);
    }
  },

  toggleNFTMining: async (userId: string, nftId: string) => {
    const state = store.getState();
    const nft = state.nfts.find(n => n.id === nftId);
    if (!nft || nft.ownerId !== userId) throw new Error("NFT not owned by user");

    let accumulated = nft.minedAccumulated || 0;
    if (nft.isMining && nft.lastMinedAt) {
      const elapsedSeconds = (Date.now() - nft.lastMinedAt) / 1000;
      const ratePerSec = (nft.dailyMiningRate || 1.0) / 86400;
      accumulated += elapsedSeconds * ratePerSec;
    }

    const updatedNFT: NFTItem = {
      ...nft,
      isMining: !nft.isMining,
      lastMinedAt: Date.now(),
      minedAccumulated: Number(accumulated.toFixed(6)),
    };

    const newNfts = state.nfts.map(n => n.id === nftId ? updatedNFT : n);
    updateLocalState({ nfts: newNfts });

    try {
      await setDoc(doc(db, 'nfts', nftId), updatedNFT, { merge: true });
    } catch (e) {
      console.warn("Firestore sync for toggleNFTMining failed:", e);
    }

    return updatedNFT;
  },

  claimNFTMining: async (userId: string, nftId: string) => {
    const state = store.getState();
    const user = state.users.find(u => u.id === userId);
    const nft = state.nfts.find(n => n.id === nftId);

    if (!user) throw new Error("User not found");
    if (!nft || nft.ownerId !== userId) throw new Error("NFT not owned by user");

    let reward = nft.minedAccumulated || 0;
    if (nft.isMining && nft.lastMinedAt) {
      const elapsedSeconds = (Date.now() - nft.lastMinedAt) / 1000;
      const ratePerSec = (nft.dailyMiningRate || 1.0) / 86400;
      reward += elapsedSeconds * ratePerSec;
    }

    reward = Number(reward.toFixed(4));
    if (reward <= 0.0001) {
      throw new Error("Minimum claim amount not reached yet");
    }

    const newBalance = Number((user.balance + reward).toFixed(2));
    const newTotal = Number(((user.totalEarnings || 0) + reward).toFixed(2));
    const updatedUser = { ...user, balance: newBalance, totalEarnings: newTotal };

    const updatedNFT: NFTItem = {
      ...nft,
      lastMinedAt: Date.now(),
      minedAccumulated: 0,
      totalMined: Number(((nft.totalMined || 0) + reward).toFixed(4)),
    };

    const tx: Transaction = {
      id: generateId(),
      userId: user.id,
      username: user.username,
      type: 'nft_mining',
      amount: reward,
      timestamp: Date.now(),
      status: 'completed',
      description: `NFT Rig Mining Reward: ${nft.title}`,
      currency: 'XRP',
    };

    const newUsers = state.users.map(u => u.id === userId ? updatedUser : u);
    const newNfts = state.nfts.map(n => n.id === nftId ? updatedNFT : n);

    updateLocalState({
      users: newUsers,
      nfts: newNfts,
      transactions: [tx, ...state.transactions],
    });

    try {
      await setDoc(doc(db, 'users', userId), { balance: newBalance, totalEarnings: newTotal }, { merge: true });
      await setDoc(doc(db, 'nfts', nftId), updatedNFT, { merge: true });
      await setDoc(doc(db, 'transactions', tx.id), tx);
    } catch (e) {
      console.warn("Firestore sync for claimNFTMining failed:", e);
    }

    return { user: updatedUser, nft: updatedNFT, reward };
  },

  claimAllNFTMining: async (userId: string) => {
    const state = store.getState();
    const user = state.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    const userNfts = state.nfts.filter(n => n.ownerId === userId);
    if (userNfts.length === 0) throw new Error("No NFT miners owned");

    let totalReward = 0;
    const now = Date.now();
    const updatedNfts = state.nfts.map((nft) => {
      if (nft.ownerId !== userId) return nft;
      let reward = nft.minedAccumulated || 0;
      if (nft.isMining && nft.lastMinedAt) {
        const elapsedSeconds = (now - nft.lastMinedAt) / 1000;
        const ratePerSec = (nft.dailyMiningRate || 1.0) / 86400;
        reward += elapsedSeconds * ratePerSec;
      }
      totalReward += reward;
      return {
        ...nft,
        lastMinedAt: now,
        minedAccumulated: 0,
        totalMined: Number(((nft.totalMined || 0) + reward).toFixed(4)),
      };
    });

    totalReward = Number(totalReward.toFixed(4));
    if (totalReward <= 0.0001) {
      throw new Error("Minimum claim amount not reached yet");
    }

    const newBalance = Number((user.balance + totalReward).toFixed(2));
    const newTotal = Number(((user.totalEarnings || 0) + totalReward).toFixed(2));
    const updatedUser = { ...user, balance: newBalance, totalEarnings: newTotal };

    const tx: Transaction = {
      id: generateId(),
      userId: user.id,
      username: user.username,
      type: 'nft_mining',
      amount: totalReward,
      timestamp: now,
      status: 'completed',
      description: `Claimed all NFT Mining Yield (${userNfts.length} rigs)`,
      currency: 'XRP',
    };

    const newUsers = state.users.map(u => u.id === userId ? updatedUser : u);
    updateLocalState({
      users: newUsers,
      nfts: updatedNfts,
      transactions: [tx, ...state.transactions],
    });

    try {
      await setDoc(doc(db, 'users', userId), { balance: newBalance, totalEarnings: newTotal }, { merge: true });
      await setDoc(doc(db, 'transactions', tx.id), tx);
      for (const nft of updatedNfts.filter(n => n.ownerId === userId)) {
        await setDoc(doc(db, 'nfts', nft.id), nft, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore sync for claimAllNFTMining failed:", e);
    }

    return { user: updatedUser, totalReward };
  },

  toggleAllNFTMining: async (userId: string, start: boolean) => {
    const state = store.getState();
    const now = Date.now();
    const updatedNfts = state.nfts.map((nft) => {
      if (nft.ownerId !== userId) return nft;
      let accumulated = nft.minedAccumulated || 0;
      if (nft.isMining && nft.lastMinedAt) {
        const elapsedSeconds = (now - nft.lastMinedAt) / 1000;
        const ratePerSec = (nft.dailyMiningRate || 1.0) / 86400;
        accumulated += elapsedSeconds * ratePerSec;
      }
      return {
        ...nft,
        isMining: start,
        lastMinedAt: now,
        minedAccumulated: Number(accumulated.toFixed(6)),
      };
    });

    updateLocalState({ nfts: updatedNfts });

    try {
      for (const nft of updatedNfts.filter(n => n.ownerId === userId)) {
        await setDoc(doc(db, 'nfts', nft.id), nft, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore sync for toggleAllNFTMining failed:", e);
    }

    return updatedNfts.filter(n => n.ownerId === userId);
  },

  // Orders
  addOrder: async (order: Omit<Order, 'id' | 'timestamp'>) => {
    const id = generateId();
    const newOrder: Order = { ...order, id, timestamp: Date.now() };
    const state = store.getState();
    updateLocalState({ orders: [newOrder, ...state.orders] });
    try {
      await setDoc(doc(db, 'orders', id), newOrder);
      return newOrder;
    } catch (e) { console.error("Error adding order", e); return newOrder; }
  },

  // Bets
  addBet: async (bet: Omit<BetRecord, 'id' | 'timestamp'>) => {
    const id = generateId();
    const newBet = { ...bet, id, timestamp: Date.now() } as BetRecord;
    const state = store.getState();
    updateLocalState({ bets: [newBet, ...(state.bets || [])] });
    try {
      await setDoc(doc(db, 'bets', id), newBet);
      return newBet;
    } catch(e) { console.error("Error adding bet", e); return newBet; }
  },

  updateBet: async (id: string, updates: Partial<BetRecord>) => {
    const state = store.getState();
    updateLocalState({ bets: (state.bets || []).map((b: any) => b.id === id ? { ...b, ...updates } as BetRecord : b) });
    try {
      await setDoc(doc(db, 'bets', id), updates, { merge: true });
    } catch (e) { console.error("Error updating bet", e); }
  },

  // Stakes
  addStake: async (stake: any) => {
    const id = generateId();
    const newStake = { ...stake, id };
    const state = store.getState();
    updateLocalState({ stakes: [newStake, ...(state.stakes || [])] });
    try {
      await setDoc(doc(db, 'stakes', id), newStake);
      return newStake;
    } catch(e) { console.error("Error adding stake", e); return newStake; }
  },

  updateStake: async (id: string, updates: any) => {
    const state = store.getState();
    updateLocalState({ stakes: (state.stakes || []).map(s => s.id === id ? { ...s, ...updates } : s) });
    try {
      await setDoc(doc(db, 'stakes', id), updates, { merge: true });
    } catch (e) { console.error("Error updating stake", e); }
  },

  deleteStake: async (id: string) => {
    const state = store.getState();
    updateLocalState({ stakes: (state.stakes || []).filter(s => s.id !== id) });
    try {
      await deleteDoc(doc(db, 'stakes', id));
    } catch (e) { console.error("Error deleting stake", e); }
  },

  // System
  updateSystemSettings: async (settings: Partial<AppState>) => {
    const state = store.getState();
    updateLocalState({ ...state, ...settings });
    try {
      const { supportLink, systemBalance, stakeSettings, banners, billboardText, billboardEnabled, referralBonusText, depositBonusText, referralSystemEnabled, referralLevel1Rate, referralLevel2Rate, referralLevel3Rate, dailyRewards, gameCrashWinRate, gameRocketWinRate, gameCoinWinRate, gameDiceWinRate, gameSlotsWinRate, gameFishWinRate, gameCoinFlipEnabled, gameDiceRollEnabled, gameCrashEnabled, gameSlotsEnabled, gameFishEnabled, gameWheelEnabled, gameMinesEnabled, gamePlinkoEnabled, gameTowerEnabled } = settings;
      const updates: any = {};
      if (supportLink !== undefined) updates.supportLink = supportLink;
      if (systemBalance !== undefined) updates.systemBalance = systemBalance;
      if (stakeSettings !== undefined) updates.stakeSettings = stakeSettings;
      if (banners !== undefined) updates.banners = banners;
      if (billboardText !== undefined) updates.billboardText = billboardText;
      if (billboardEnabled !== undefined) updates.billboardEnabled = billboardEnabled;
      if (referralBonusText !== undefined) updates.referralBonusText = referralBonusText;
      if (depositBonusText !== undefined) updates.depositBonusText = depositBonusText;
      if (referralSystemEnabled !== undefined) updates.referralSystemEnabled = referralSystemEnabled;
      if (referralLevel1Rate !== undefined) updates.referralLevel1Rate = referralLevel1Rate;
      if (referralLevel2Rate !== undefined) updates.referralLevel2Rate = referralLevel2Rate;
      if (referralLevel3Rate !== undefined) updates.referralLevel3Rate = referralLevel3Rate;
      if (dailyRewards !== undefined) updates.dailyRewards = dailyRewards;
      if (gameCrashWinRate !== undefined) updates.gameCrashWinRate = gameCrashWinRate;
      if (gameRocketWinRate !== undefined) updates.gameRocketWinRate = gameRocketWinRate;
      if (gameCoinWinRate !== undefined) updates.gameCoinWinRate = gameCoinWinRate;
      if (gameDiceWinRate !== undefined) updates.gameDiceWinRate = gameDiceWinRate;
      if (gameSlotsWinRate !== undefined) updates.gameSlotsWinRate = gameSlotsWinRate;
      if (gameFishWinRate !== undefined) updates.gameFishWinRate = gameFishWinRate;
      if (gameCoinFlipEnabled !== undefined) updates.gameCoinFlipEnabled = gameCoinFlipEnabled;
      if (gameDiceRollEnabled !== undefined) updates.gameDiceRollEnabled = gameDiceRollEnabled;
      if (gameCrashEnabled !== undefined) updates.gameCrashEnabled = gameCrashEnabled;
      if (gameSlotsEnabled !== undefined) updates.gameSlotsEnabled = gameSlotsEnabled;
      if (gameFishEnabled !== undefined) updates.gameFishEnabled = gameFishEnabled;
      if (gameWheelEnabled !== undefined) updates.gameWheelEnabled = gameWheelEnabled;
      if (gameMinesEnabled !== undefined) updates.gameMinesEnabled = gameMinesEnabled;
      if (gamePlinkoEnabled !== undefined) updates.gamePlinkoEnabled = gamePlinkoEnabled;
      if (gameTowerEnabled !== undefined) updates.gameTowerEnabled = gameTowerEnabled;
      await setDoc(doc(db, 'config', 'system'), updates, { merge: true });
    } catch (e) { console.error("Error updating config", e); }
  },

  updateVipLevel: async (level: number, updates: Partial<VIPLevel>) => {
    const state = store.getState();
    const vipLevels = state.vipLevels?.map(v => v.level === level ? { ...v, ...updates } : v) || VIP_LEVELS;
    updateLocalState({ vipLevels });
    try {
      await setDoc(doc(db, 'config', 'system'), { vipLevels }, { merge: true });
    } catch (e) { console.error("Error updating VIP", e); }
  },

  // Notices
  addNotice: async (text: string) => {
    const id = generateId();
    const newNotice = { id, text, isActive: true, timestamp: Date.now() };
    const state = store.getState();
    updateLocalState({ notices: [newNotice, ...state.notices] });
    try {
      await setDoc(doc(db, 'notices', id), newNotice);
    } catch (e) { console.error("Error adding notice", e); }
  },

  updateNotice: async (id: string, updates: Partial<Notice>) => {
    const state = store.getState();
    updateLocalState({ notices: state.notices.map(n => n.id === id ? { ...n, ...updates } : n) });
    try {
      await setDoc(doc(db, 'notices', id), updates, { merge: true });
    } catch (e) { console.error("Error updating notice", e); }
  },

  deleteNotice: async (id: string) => {
    const state = store.getState();
    updateLocalState({ notices: state.notices.filter(n => n.id !== id) });
    try {
      await deleteDoc(doc(db, 'notices', id));
    } catch (e) { console.error("Error deleting notice", e); }
  },

  // News
  addNews: async (newsItem: any) => {
    const id = generateId();
    const newNews = { ...newsItem, id, timestamp: Date.now() };
    const state = store.getState();
    updateLocalState({ news: [newNews, ...(state.news || [])] });
    try {
      await setDoc(doc(db, 'news', id), newNews);
    } catch (e) { console.error("Error adding news", e); }
  },

  updateNews: async (id: string, updates: any) => {
    const state = store.getState();
    updateLocalState({ news: (state.news || []).map((n: any) => n.id === id ? { ...n, ...updates } : n) });
    try {
      await setDoc(doc(db, 'news', id), updates, { merge: true });
    } catch (e) { console.error("Error updating news", e); }
  },

  deleteNews: async (id: string) => {
    const state = store.getState();
    updateLocalState({ news: (state.news || []).filter((n: any) => n.id !== id) });
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (e) { console.error("Error deleting news", e); }
  },

  // Payment Methods
  addPaymentMethod: async (method: Omit<PaymentMethod, 'id'>) => {
    const id = generateId();
    const newMethod = { ...method, id };
    const state = store.getState();
    updateLocalState({ paymentMethods: [...(state.paymentMethods || []), newMethod] });
    try {
      await setDoc(doc(db, 'paymentMethods', id), newMethod);
      return newMethod;
    } catch (e) { console.error("Error adding payment method", e); return newMethod; }
  },

  updatePaymentMethod: async (id: string, updates: Partial<PaymentMethod>) => {
    const state = store.getState();
    updateLocalState({ paymentMethods: (state.paymentMethods || []).map(m => m.id === id ? { ...m, ...updates } : m) });
    try {
      await setDoc(doc(db, 'paymentMethods', id), updates, { merge: true });
    } catch (e) { console.error("Error updating payment method", e); }
  },

  deletePaymentMethod: async (id: string) => {
    const state = store.getState();
    updateLocalState({ paymentMethods: (state.paymentMethods || []).filter(m => m.id !== id) });
    try {
      await deleteDoc(doc(db, 'paymentMethods', id));
    } catch (e) { console.error("Error deleting payment method", e); }
  },

  updateSystemConfig: async (updates: Partial<AppState>) => {
    try {
      await setDoc(doc(db, 'config', 'system'), updates, { merge: true });
    } catch (e) { console.error("Error updating system config", e); }
  },

  wipeAllUserData: async () => {
    // 1. Immediately wipe local state collections
    updateLocalState({
      users: [],
      transactions: [],
      orders: [],
      stakes: [],
      bets: []
    });

    // 2. Clear all local storage legacy keys and user identifiers
    try {
      const keysToRemove = [
        'trx_hub_db_v2', 'trx_hub_db_v1', 'trx_hub_db',
        'device_registered', 'novax_guest_user', 'novax_session_user',
        'novax_owner_unlocked'
      ];
      keysToRemove.forEach(k => localStorage.removeItem(k));
      sessionStorage.removeItem('novax_owner_unlocked');

      // Remove checkin streaks
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('novax_checkin_') || k.startsWith('novax_streak_'))) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {
      console.warn("Storage wipe error:", e);
    }

    // 3. Attempt Firestore purge for user data collections
    try {
      const collectionsToWipe = ['users', 'transactions', 'orders', 'stakes', 'bets', 'tradePositions', 'tradeOrders'];
      for (const col of collectionsToWipe) {
        try {
          const snap = await getDocs(collection(db, col));
          for (const d of snap.docs) {
            await deleteDoc(d.ref).catch(() => {});
          }
        } catch (colErr) {
          console.warn(`Firestore wipe for collection ${col} offline or skipped:`, colErr);
        }
      }
    } catch (fsErr) {
      console.warn("Firestore wipe error:", fsErr);
    }

    window.dispatchEvent(new Event('store_updated'));
    return true;
  }
};
