import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import dayjs from 'dayjs';

type Match = {
  id: string | number;
  stage?: string;
  team_a?: string;
  team_b?: string;
  start_time?: string;
  venue?: string;
  status?: string;
};

type Props = {
  tournament: any;
};

export default function TournamentCard({ tournament }: Props) {
  const [open, setOpen] = useState(false);
  const hasMatches = Array.isArray(tournament.matches) && tournament.matches.length > 0;
  const start = dayjs(tournament.start_date);
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image source={{ uri: tournament.tournament_img_url }} style={styles.logo} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{tournament.name}</Text>
          <Text style={styles.sub}>{tournament.sport_name} • {String(tournament.level ?? '').toUpperCase()}</Text>
          <Text style={styles.meta}>{start.format('DD MMM YYYY')}</Text>
        </View>
        {hasMatches && (
          <TouchableOpacity onPress={() => setOpen(!open)}>
            <Text style={{ color: '#F2994A' }}>{open ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {hasMatches && (
        <Collapsible collapsed={!open}>
          {tournament.matches.map((m: Match) => (
            <View key={m.id} style={styles.match}>
              <Text style={styles.matchStage}>{m.stage}</Text>
              <Text style={styles.matchTeams}>{m.team_a} vs {m.team_b}</Text>
              <Text style={styles.matchMeta}>{dayjs(m.start_time).utcOffset(330).format('DD MMM YYYY, hh:mm A')} • {m.venue}</Text>
            </View>
          ))}
        </Collapsible>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  logo: { width: 48, height: 48, borderRadius: 8, marginRight: 12, backgroundColor: '#fafafa' },
  title: { fontSize: 16, fontWeight: '700' },
  sub: { color: '#6b6b6b', marginTop: 2 },
  meta: { color: '#333', marginTop: 4 },
  match: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  matchStage: { fontWeight: '600', marginBottom: 4 },
  matchTeams: { },
  matchMeta: { color: '#666', marginTop: 2 },
});


