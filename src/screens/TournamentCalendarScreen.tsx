import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import dayjs from 'dayjs';
import DropDownPicker from 'react-native-dropdown-picker';
import { fetchSports, fetchTournaments } from '@/api/client';
import CalendarMonthView from '@/features/calendar/CalendarMonthView';
import TournamentCard from '@/components/TournamentCard';

type Tournament = any;

const months = [8,9,10];

export default function TournamentCalendarScreen() {
  const [open, setOpen] = useState(false);
  const [sports, setSports] = useState<any[]>([]);
  const [sport, setSport] = useState<string>('all');
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [dataByDate, setDataByDate] = useState<Record<string, Tournament[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const items = useMemo(() => [{ label: 'All Sports', value: 'all' }, ...sports.map((s) => ({ label: s.name ?? s.sport_name, value: String(s.id ?? s.sports_id) }))], [sports]);

  const highlightedDates = useMemo(() => Object.keys(dataByDate), [dataByDate]);

  const loadSports = useCallback(async () => {
    setLoadingSports(true);
    try {
      const list = await fetchSports();
      setSports(list ?? []);
    } catch (e) {
      setSports([{ id: '7020104', name: 'Badminton' }]);
    } finally {
      setLoadingSports(false);
    }
  }, []);

  const loadMonth = useCallback(async (m: number, s: string | 'all') => {
    const monthData = await fetchTournaments({ sports_id: s === 'all' ? undefined : s, month: m });
    // normalize into date -> array of tournaments
    const map: Record<string, Tournament[]> = {};
    for (const sportBlock of monthData) {
      for (const t of sportBlock.tournaments ?? []) {
        const iso = dayjs(t.start_date).format('YYYY-MM-DD');
        if (!map[iso]) map[iso] = [];
        map[iso].push({ ...t, sport_name: sportBlock.sport_name, sports_id: sportBlock.sports_id });
      }
    }
    return map;
  }, []);

  const loadAllMonths = useCallback(async () => {
    setLoadingData(true);
    try {
      const results = await Promise.all(months.map((m) => loadMonth(m, sport)));
      const merged: Record<string, Tournament[]> = {};
      for (const r of results) {
        for (const k of Object.keys(r)) {
          merged[k] = [...(merged[k] ?? []), ...r[k]];
        }
      }
      setDataByDate(merged);
    } finally {
      setLoadingData(false);
    }
  }, [loadMonth, sport]);

  useEffect(() => { loadSports(); }, [loadSports]);
  useEffect(() => { loadAllMonths(); setSelectedDate(null); }, [sport, loadAllMonths]);

  const handleSelectDate = (iso: string) => setSelectedDate(iso);

  const list = selectedDate ? dataByDate[selectedDate] ?? [] : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Search your sport</Text>
      {loadingSports ? <ActivityIndicator/> : (
        <View style={{ zIndex: 10, marginBottom: 12 }}>
          <DropDownPicker open={open} value={sport} setOpen={setOpen} setValue={setSport} items={items} listMode="MODAL" searchable placeholder="All Sports" />
        </View>
      )}

      <Text style={styles.monthHeader}>Aug 2025</Text>
      <CalendarMonthView year={2025} month={8} highlightedDates={highlightedDates} onSelectDate={handleSelectDate} />
      <Text style={styles.monthHeader}>Sep 2025</Text>
      <CalendarMonthView year={2025} month={9} highlightedDates={highlightedDates} onSelectDate={handleSelectDate} />
      <Text style={styles.monthHeader}>Oct 2025</Text>
      <CalendarMonthView year={2025} month={10} highlightedDates={highlightedDates} onSelectDate={handleSelectDate} />

      <View style={{ height: 12 }} />
      {loadingData ? (
        <ActivityIndicator />
      ) : selectedDate ? (
        list.length === 0 ? (
          <Text style={styles.empty}>No tournaments on {dayjs(selectedDate).format('DD MMM')}</Text>
        ) : (
          list.map((t, idx) => <TournamentCard key={`${t.id}-${idx}`} tournament={t} />)
        )
      ) : (
        <Text style={styles.hint}>Tap a highlighted date to see tournaments starting that day.</Text>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  monthHeader: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  hint: { color: '#666', marginTop: 8 },
  empty: { color: '#a33', marginTop: 8 },
  card: {},
  cardTitle: {},
  cardSub: {},
  cardMeta: {},
});


