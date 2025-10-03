import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';

type Props = {
  month: number;
  year: number;
  highlightedDates: string[];
  matchDates: string[];
  onSelectDate: (isoDate: string) => void;
};

const weekDays = ['m','t','w','t','f','s','s'];

export default function CalendarMonthView({ month, year, highlightedDates, matchDates, onSelectDate }: Props) {
  const firstDay = dayjs().year(year).month(month - 1).date(1);
  const daysInMonth = firstDay.daysInMonth();
  const startWeekday = (firstDay.day() + 6) % 7;
  const matrix = useMemo(() => {
    const rows: Array<Array<{ d: number | null; iso?: string; marked?: boolean; hasMatch?: boolean }>> = [];
    let dayCounter = 1;
    for (let r = 0; r < 6; r++) {
      const row: any[] = [];
      for (let c = 0; c < 7; c++) {
        const index = r * 7 + c;
        if (index < startWeekday || dayCounter > daysInMonth) {
          row.push({ d: null });
        } else {
          const iso = firstDay.date(dayCounter).format('YYYY-MM-DD');
          row.push({ 
            d: dayCounter, 
            iso, 
            marked: highlightedDates.includes(iso),
            hasMatch: matchDates.includes(iso)
          });
          dayCounter++;
        }
      }
      rows.push(row);
    }
    return rows;
  }, [firstDay, startWeekday, daysInMonth, highlightedDates, matchDates]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        {weekDays.map((w, i) => (
          <Text key={`${w}-${i}`} style={styles.weekHeader}>{w}</Text>
        ))}
      </View>
      {matrix.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((cell, ci) => {
            if (cell.d == null) return <View key={ci} style={styles.cell} />;
            const content = (
              <View style={[styles.dayCircle, cell.marked ? styles.dayCircleMarked : null]}> 
                <Text style={[
                  styles.dayText, 
                  cell.marked && styles.dayTextMarked,
                  cell.hasMatch && !cell.marked && styles.dayTextBold
                ]}>{cell.d}</Text>
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
  wrapper: { width: '100%', alignSelf: 'stretch', paddingHorizontal: 0, paddingVertical: 10, backgroundColor: '#FFFFFF' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 0, opacity: 0.7 },
  weekHeader: { width: `${100/7}%`, textAlign: 'center', color: '#333333', fontFamily: 'SourceSans3_400Regular', textTransform: 'lowercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6, paddingHorizontal: 0 },
  cell: { width: `${100/7}%`, alignItems: 'center' },
  dayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayCircleMarked: { backgroundColor: '#E17827', borderRadius: 15 },
  dayText: { color: '#333333', fontFamily: 'SourceSans3_400Regular', fontSize: 14, lineHeight: 20 },
  dayTextMarked: { color: '#FFFFFF', fontWeight: '700', fontFamily: 'SourceSans3_700Bold', fontSize: 14, lineHeight: 20 },
  dayTextBold: { color: '#1F1F1F', fontWeight: '900', fontFamily: 'SourceSans3_700Bold', fontSize: 14, lineHeight: 20 },
});


