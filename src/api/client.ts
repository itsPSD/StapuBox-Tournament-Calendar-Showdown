import axios from 'axios';

export const http = axios.create({
  timeout: 15000,
});

export async function fetchSports() {
  const res = await http.get('https://stapubox.com/sportslist');
  return Array.isArray(res.data?.data) ? res.data.data : res.data;
}

export async function fetchTournaments(params: { sports_id?: string | number; month?: number }) {
  const { sports_id, month } = params;
  const base = 'https://stapubox.com/tournament/demo';
  const url = sports_id && month ? `${base}?sports_id=${sports_id}&month=${month}` : base;
  const res = await http.get(url);
  return res.data?.data ?? [];
}


