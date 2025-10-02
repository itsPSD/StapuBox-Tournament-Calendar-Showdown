import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';

type Props = {
  month: number; // 1-12
  year: number;
  highlightedDates: string[]; // ISO yyyy-MM-dd
  onSelectDate: (isoDate: string) => void;
};

const weekDays = ['m','t','w','t','f','s','s'];

export default function CalendarMonthView({ month, year, highlightedDates, onSelectDate }: Props) {
  const firstDay = dayjs().year(year).month(month - 1).date(1);
  const daysInMonth = firstDay.daysInMonth();
  const startWeekday = (firstDay.day() + 6) % 7; // make Monday=0
  const matrix = useMemo(() => {
    const rows: Array<Array<{ d: number | null; iso?: string; marked?: boolean }>> = [];
    let dayCounter = 1;
    for (let r = 0; r < 6; r++) {
      const row: any[] = [];
      for (let c = 0; c < 7; c++) {
        const index = r * 7 + c;
        if (index < startWeekday || dayCounter > daysInMonth) {
          row.push({ d: null });
        } else {
          const iso = firstDay.date(dayCounter).format('YYYY-MM-DD');
          row.push({ d: dayCounter, iso, marked: highlightedDates.includes(iso) });
          dayCounter++;
        }
      }
      rows.push(row);
    }
    return rows;
  }, [firstDay, startWeekday, daysInMonth, highlightedDates]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        {weekDays.map((w) => (
          <Text key={w} style={styles.weekHeader}>{w}</Text>
        ))}
      </View>
      {matrix.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((cell, ci) => {
            if (cell.d == null) return <View key={ci} style={styles.cell} />;
            const content = (
              <View style={[styles.dayCircle, cell.marked && styles.marked]}> 
                <Text style={[styles.dayText, cell.marked && styles.dayTextMarked]}>{cell.d}</Text>
              </View>
            );
            return (
              <TouchableOpacity key={ci} style={styles.cell} onPress={() => cell.iso && onSelectDate(cell.iso)}>
                {content}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', paddingHorizontal: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  weekHeader: { width: `${100/7}%`, textAlign: 'center', color: '#7a7a7a' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  cell: { width: `${100/7}%`, alignItems: 'center' },
  dayCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  marked: { backgroundColor: '#F2A55C' },
  dayText: { color: '#222' },
  dayTextMarked: { color: '#fff', fontWeight: '700' },
});


