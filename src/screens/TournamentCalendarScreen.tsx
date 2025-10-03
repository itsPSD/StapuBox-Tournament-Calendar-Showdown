import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import DropDownPicker from 'react-native-dropdown-picker';
import { fetchSports, fetchTournaments } from '@/api/client';
import CalendarMonthView from '@/features/calendar/CalendarMonthView';
import TournamentCard from '@/components/TournamentCard';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tournament = any;

const months = [8,9,10];
const monthLabel = (m: number) => dayjs().month(m - 1).format('MMM YYYY');

const toTitleCase = (s?: string) => (s || '')
  .toLowerCase()
  .replace(/\b\w/g, (c) => c.toUpperCase());

export default function TournamentCalendarScreen() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [sports, setSports] = useState<any[]>([]);
  const [sport, setSport] = useState<string>('all');
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [dataByDate, setDataByDate] = useState<Record<string, Tournament[]>>({});
  const [matchDates, setMatchDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthIdx, setMonthIdx] = useState(0);

  const items = useMemo(() => {
    const rest = sports.map((s, idx) => ({
      label: toTitleCase(s.name ?? s.sport_name ?? `Sport ${idx + 1}`),
      value: String(s.id ?? s.sport_id ?? `sport-${idx}`),
    }));
    // Ensure values are unique
    const seen = new Set<string>();
    const unique = rest.map((it, idx) => {
      let v = it.value;
      while (seen.has(v)) v = `${it.value}-${idx}`;
      seen.add(v);
      return { ...it, value: v };
    });
    return [{ label: 'All Sports', value: 'all' }, ...unique];
  }, [sports]);

  const highlightedDates = useMemo(() => {
    if (sport === 'all') {
      // Only highlight start dates, not match dates
      const startDates = new Set<string>();
      for (const tournaments of Object.values(dataByDate)) {
        for (const tournament of tournaments) {
          const startDate = dayjs(tournament.start_date).format('YYYY-MM-DD');
          startDates.add(startDate);
        }
      }
      return Array.from(startDates);
    }
    
    const s = String(sport);
    const startDates = new Set<string>();
    for (const tournaments of Object.values(dataByDate)) {
      for (const tournament of tournaments) {
        if (String(tournament.sport_id ?? tournament.sports_id) === s) {
          const startDate = dayjs(tournament.start_date).format('YYYY-MM-DD');
          startDates.add(startDate);
        }
      }
    }
    return Array.from(startDates);
  }, [dataByDate, sport]);

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
    const monthData = await fetchTournaments({ sport_id: s === 'all' ? undefined : s, month: m });
    const tournamentsMap: Record<string, Tournament[]> = {};
    const matchDatesSet = new Set<string>();
    
    for (const sportBlock of monthData) {
      for (const t of sportBlock.tournaments ?? []) {
        const tournament = { ...t, sport_name: sportBlock.sport_name, sport_id: sportBlock.sport_id };
        
        // Add tournament to its start date
        const startDate = dayjs(t.start_date).format('YYYY-MM-DD');
        if (!tournamentsMap[startDate]) tournamentsMap[startDate] = [];
        tournamentsMap[startDate].push(tournament);
        
        // Add tournament to all dates where it has matches
        for (const match of t.matches ?? []) {
          const matchDate = dayjs(match.start_date || match.start_time).format('YYYY-MM-DD');
          const startDate = dayjs(t.start_date).format('YYYY-MM-DD');
          
          // Only add to match dates if it's not the start date
          if (matchDate !== startDate) {
            if (!tournamentsMap[matchDate]) tournamentsMap[matchDate] = [];
            
            // Check if tournament already exists on this date to avoid duplicates
            const exists = tournamentsMap[matchDate].some(existing => existing.id === tournament.id);
            if (!exists) {
              tournamentsMap[matchDate].push(tournament);
            }
          }
          
          // Add to match dates for bolding (all match dates, including start date matches)
          matchDatesSet.add(matchDate);
        }
      }
    }
    return { tournaments: tournamentsMap, matchDates: matchDatesSet };
  }, []);

  const loadAllMonths = useCallback(async () => {
    setLoadingData(true);
    try {
      const results = await Promise.all(months.map((m) => loadMonth(m, sport)));
      const mergedTournaments: Record<string, Tournament[]> = {};
      const allMatchDates = new Set<string>();
      
      for (const r of results) {
        // Merge tournaments
        for (const k of Object.keys(r.tournaments)) {
          mergedTournaments[k] = [...(mergedTournaments[k] ?? []), ...r.tournaments[k]];
        }
        for (const date of r.matchDates) {
          allMatchDates.add(date);
        }
      }
      
      // Dedupe tournaments
      const dedupedTournaments: Record<string, Tournament[]> = {};
      for (const dateKey of Object.keys(mergedTournaments)) {
        const seen = new Set<string | number>();
        dedupedTournaments[dateKey] = mergedTournaments[dateKey].filter((t) => {
          const id = t.id ?? `${t.name}-${t.start_date}`;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
      }
      
      setDataByDate(dedupedTournaments);
      setMatchDates(allMatchDates);
    } finally {
      setLoadingData(false);
    }
  }, [loadMonth, sport]);

  useEffect(() => { loadSports(); }, [loadSports]);
  useEffect(() => { loadAllMonths(); setSelectedDate(null); }, [sport, loadAllMonths]);

  const handleSelectDate = (iso: string) => setSelectedDate(iso);

  const list = useMemo(() => {
    if (!selectedDate) return [];
    const tournaments = dataByDate[selectedDate] ?? [];
    
    // Filter tournaments by sport
    const filteredTournaments = sport === 'all' 
      ? tournaments 
      : tournaments.filter((t: any) => String(t.sport_id ?? t.sports_id) === String(sport));
    
    // For each tournament, filter matches to only show those happening on the selected date
    const tournamentsWithFilteredMatches = filteredTournaments.map(tournament => {
      const selectedDateFormatted = dayjs(selectedDate).format('YYYY-MM-DD');
      const filteredMatches = (tournament.matches || []).filter((match: any) => {
        const matchDate = dayjs(match.start_date || match.start_time).format('YYYY-MM-DD');
        return matchDate === selectedDateFormatted;
      });
      
      return {
        ...tournament,
        matches: filteredMatches
      };
    });
    
    return tournamentsWithFilteredMatches;
  }, [dataByDate, selectedDate, sport]);

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top + 8, 8) }] }>
      {/* Title removed per design */}
      {loadingSports ? <ActivityIndicator/> : (
        <View style={styles.dropdownWrap}>
          <Ionicons name="search" size={16} color="#9B9B9B" style={styles.dropdownLeftIcon} />
          <DropDownPicker
            open={open}
            value={sport}
            setOpen={setOpen}
            setValue={setSport}
            items={items}
            placeholder="All Sports"
            listMode="SCROLLVIEW"
            dropDownDirection="BOTTOM"
            modalTitle="Select Sport"
            ArrowDownIconComponent={({style}) => (<Ionicons name="chevron-down" size={18} color="#9B9B9B" style={[style]} />)}
            ArrowUpIconComponent={({style}) => (<Ionicons name="chevron-up" size={18} color="#9B9B9B" style={[style]} />)}
            TickIconComponent={({style}) => (<Ionicons name="checkmark" size={16} color="#E17827" style={[style]} />)}
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            labelStyle={styles.dropdownLabel}
            dropDownContainerStyle={styles.dropdownMenu}
            listItemContainerStyle={styles.dropdownItem}
            listItemLabelStyle={styles.dropdownItemLabel}
            zIndex={3000}
            zIndexInverse={1000}
            maxHeight={280}
            itemSeparator
            itemSeparatorStyle={styles.dropdownSeparator}
            selectedItemContainerStyle={styles.dropdownSelectedItem}
            selectedItemLabelStyle={styles.dropdownSelectedLabel}
            closeOnBackPressed
            autoScroll
          />
        </View>
      )}

      <View style={styles.monthSwitcher}>
        <TouchableOpacity onPress={() => setMonthIdx((i) => Math.max(0, i - 1))} style={styles.arrowBox}>
          <Ionicons name="chevron-down" size={24} color="#E17827" style={styles.arrowLeft} />
        </TouchableOpacity>
        <Text style={styles.monthHeader}>{monthLabel(months[monthIdx])}</Text>
        <TouchableOpacity onPress={() => setMonthIdx((i) => Math.min(months.length - 1, i + 1))} style={styles.arrowBox}>
          <Ionicons name="chevron-down" size={24} color="#E17827" style={styles.arrowRight} />
        </TouchableOpacity>
      </View>
      <CalendarMonthView 
        year={2025} 
        month={months[monthIdx]} 
        highlightedDates={highlightedDates} 
        matchDates={Array.from(matchDates)}
        onSelectDate={handleSelectDate} 
      />

      <View style={{ height: 12 }} />
      {loadingData ? (
        <ActivityIndicator />
      ) : selectedDate ? (
        <View>
          <View style={styles.selectedDateHeader}>
            <Text style={styles.selectedDateText}>
              Tournaments on {dayjs(selectedDate).format('DD MMM YYYY')}
            </Text>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={() => setSelectedDate(null)}
            >
              <Ionicons name="close-circle" size={20} color="#E17827" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
          {list.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="calendar-outline" size={28} color="#E17827" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No tournaments</Text>
              <Text style={styles.emptySub}>on {dayjs(selectedDate).format('DD MMM')}</Text>
            </View>
          ) : (
            list.map((t, idx) => <TournamentCard key={`${t?.id ?? t?.name}-${idx}`} tournament={t} />)
          )}
        </View>
      ) : null}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 6, fontFamily: 'SourceSans3_600SemiBold' },
  dropdownWrap: { zIndex: 10, marginBottom: 8, position: 'relative' },
  dropdownLeftIcon: { position: 'absolute', left: 14, top: 16, zIndex: 20, opacity: 0.0 },
  dropdown: {
    borderColor: '#EFEFEF',
    backgroundColor: '#FFF8F2',
    borderRadius: 12,
    minHeight: 44,
    paddingLeft: 14,
  },
  dropdownPlaceholder: { color: '#9B9B9B', fontFamily: 'SourceSans3_400Regular' },
  dropdownLabel: { color: '#222', fontWeight: '500', fontFamily: 'SourceSans3_400Regular' },
  dropdownMenu: { borderColor: '#EFEFEF', backgroundColor: '#FFF8F2' },
  dropdownItem: { paddingVertical: 10 },
  dropdownItemLabel: { color: '#222', fontFamily: 'SourceSans3_400Regular' },
  dropdownSeparator: { height: 1, backgroundColor: '#F2E6DC' },
  dropdownSelectedItem: { backgroundColor: '#FFEFE2' },
  dropdownSelectedLabel: { color: '#E17827', fontWeight: '600', fontFamily: 'SourceSans3_600SemiBold' },
  monthHeader: { fontSize: 18, fontWeight: '400', color: '#828282', fontFamily: 'SourceSans3_400Regular', textAlign: 'center' },
  monthSwitcher: {
    // Figma: Month Year line
    marginTop: 0,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 20,
    width: 361,
    height: 55.8,
    alignSelf: 'center',
    flexGrow: 0,
    // Thin divider under the header
    borderBottomWidth: 1,
    borderBottomColor: '#F2E6DC',
  },
  arrowBox: { width: 28.8, height: 28.8, alignItems: 'center', justifyContent: 'center' },
  arrowLeft: { transform: [{ rotate: '90deg' }] },
  arrowRight: { transform: [{ rotate: '-90deg' }] },
  hint: { color: '#666', marginTop: 8 },
  empty: { color: '#a33', marginTop: 8 },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFF8F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F2E6DC',
    marginTop: 8,
  },
  emptyIcon: { marginBottom: 8 },
  emptyTitle: { color: '#333333', fontSize: 16, fontFamily: 'SourceSans3_600SemiBold' },
  emptySub: { color: '#828282', marginTop: 2, fontFamily: 'SourceSans3_400Regular' },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'SourceSans3_600SemiBold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF8F2',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E17827',
  },
  resetButtonText: {
    color: '#E17827',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'SourceSans3_500Medium',
  },
  card: {},
  cardTitle: {},
  cardSub: {},
  cardMeta: {},
});


