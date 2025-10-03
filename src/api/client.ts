import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const http = axios.create({
  timeout: 15000,
});

const putCache = async (key: string, value: any, ttlMs: number) => {
  const item = { v: value, e: Date.now() + ttlMs };
  await AsyncStorage.setItem(key, JSON.stringify(item));
};

const getCache = async (key: string) => {
  const s = await AsyncStorage.getItem(key);
  if (!s) return null;
  try {
    const { v, e } = JSON.parse(s);
    if (Date.now() > e) return null;
    return v;
  } catch { return null; }
};

export async function fetchSports() {
  const ckey = 'cache:sportslist';
  const cached = await getCache(ckey);
  if (cached) return cached;
  const res = await http.get('https://stapubox.com/sportslist');
  const data = Array.isArray(res.data?.data) ? res.data.data : res.data;
  await putCache(ckey, data, 12 * 60 * 60 * 1000);
  return data;
}

export async function fetchTournaments(params: { sport_id?: string | number; month?: number }) {
  const { sport_id, month } = params;
  const base = 'https://stapubox.com/tournament/demo';
  let url = base;
  if (sport_id && month) {
    url = `${base}?sport_id=${sport_id}&sports_id=${sport_id}&month=${month}`;
  } else if (sport_id) {
    url = `${base}?sport_id=${sport_id}&sports_id=${sport_id}`;
  } else if (month) {
    url = `${base}?month=${month}`;
  }
  const ckey = `cache:tournaments:${sport_id ?? 'all'}:${month ?? 'all'}`;
  const cached = await getCache(ckey);
  if (cached) return cached;
  const res = await http.get(url);
  const data = res.data?.data ?? [];
  await putCache(ckey, data, 60 * 60 * 1000);
  return data;
}


