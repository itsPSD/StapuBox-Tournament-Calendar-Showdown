import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Ionicons } from '@expo/vector-icons';

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
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const [open, setOpen] = useState(false);
  
  const hasMatches = Array.isArray(tournament.matches) && tournament.matches.length > 0;
  const start = dayjs(tournament.start_date);
  const end = dayjs(tournament.end_date ?? tournament.start_date);
  const logoUrl = typeof tournament.tournament_img_url === 'string' ? tournament.tournament_img_url : '';
  const toPngIfSvg = (url: string, px: number) => {
    if (!url) return '';
    if (!url.toLowerCase().endsWith('.svg')) return url;
    try {
      const idx = url.indexOf('/commons/');
      if (idx > -1) {
        const base = url.substring(0, idx);
        const rest = url.substring(idx + '/commons/'.length);
        const lastSlash = rest.lastIndexOf('/');
        const folder = rest.substring(0, lastSlash);
        const filename = rest.substring(lastSlash + 1);
        return `${base}/commons/thumb/${folder}/${filename}/${px}px-${filename}.png`;
      }
    } catch {}
    return url;
  };
  const toProxyPng = (url: string, w: number) => {
    if (!url) return '';
    const cleaned = url.replace(/^https?:\/\//, '');
    return `https://images.weserv.nl/?url=${encodeURIComponent(cleaned)}&w=${w}&output=png`;
  };
  const rasterUrl = toPngIfSvg(logoUrl, 96);
  const rasterSource = rasterUrl ? { uri: rasterUrl } : require('../../assets/stapubox_logo.png');
  const [imgSource, setImgSource] = useState<any>(rasterSource);
  const [imgErrorCount, setImgErrorCount] = useState(0);

  const handleImgError = () => {
    if (imgErrorCount === 0 && logoUrl) {
      // First error: try proxy
      const proxy = toProxyPng(logoUrl, 96);
      setImgSource({ uri: proxy });
      setImgErrorCount(1);
    } else {
      // Second error or no URL: use tournament icon fallback
      setImgSource(null); // This will trigger the icon fallback
    }
  };

  // Team logo fallback logic
  const getTeamLogoSource = (teamName?: string) => {
    // Use sport-specific icons as fallback
    const sport = tournament.sport_name?.toLowerCase() || '';
    let fallbackIcon: any = 'football';
    
    if (sport.includes('basketball')) fallbackIcon = 'basketball';
    else if (sport.includes('tennis')) fallbackIcon = 'tennisball';
    else if (sport.includes('badminton')) fallbackIcon = 'tennisball';
    else if (sport.includes('cricket')) fallbackIcon = 'baseball';
    else if (sport.includes('hockey')) fallbackIcon = 'football';
    else if (sport.includes('volleyball')) fallbackIcon = 'football';
    
    return fallbackIcon;
  };
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          {imgSource ? (
            <Image source={imgSource} onError={handleImgError} style={styles.logo} resizeMode="contain" />
          ) : (
            <View style={styles.tournamentIconFallback}>
              <Ionicons name="trophy" size={32} color="#E17827" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{tournament.name}</Text>
            <Text style={styles.sportText}>{String(tournament.sport_name || '').replace(/\b\w/g, (c: string) => c.toUpperCase())}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="calendar-outline" size={14} color="#6b6b6b" />
              <Text style={styles.meta}>{`${start.format('DD MMM YYYY')} - ${end.format('DD MMM YYYY')}`}</Text>
            </View>
          </View>
        </View>
        <View style={styles.rightCol}>
          <Ionicons name="heart-outline" size={18} color="#C7C7C7" />
          <Text style={styles.levelText}>{String(tournament.level ?? '')}</Text>
        </View>
      </View>
      {hasMatches && (
        <TouchableOpacity onPress={() => setOpen(!open)} style={styles.chevronWrap}>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#E17827" />
        </TouchableOpacity>
      )}
      {hasMatches && (
        <Collapsible collapsed={!open}>
          {tournament.matches.map((m: Match, i: number) => {
            const startLocal = dayjs((m as any).start_time ?? (m as any).start_date).tz('Asia/Kolkata');
            return (
              <View key={`${tournament?.id ?? tournament?.name ?? 't'}-match-${m?.id ?? i}`} style={styles.innerMatchCard}>
                <View style={styles.innerMatchHeader}> 
                  <View style={styles.matchHeaderLeft}>
                    <Text style={styles.matchTitle} numberOfLines={1}>{m.team_a} vs {m.team_b}</Text>
                    <Text style={styles.matchSub}>Team Men</Text>
                  </View>
                  <View style={styles.stageChip}><Text style={styles.stageChipText}>{m.stage}</Text></View>
                </View>

                <View style={styles.versusRow}>
                  <View style={styles.teamLogoContainer}>
                    <Ionicons name={getTeamLogoSource(m.team_a)} size={32} color="#E17827" />
                  </View>
                  <Text style={styles.vsText}>VS</Text>
                  <View style={styles.teamLogoContainer}>
                    <Ionicons name={getTeamLogoSource(m.team_b)} size={32} color="#E17827" />
                  </View>
                </View>

                <View style={styles.infoBar}>
                  <View style={styles.infoRowBetween}>
                    <View style={styles.infoItem}>
                      <Ionicons name="calendar-outline" size={16} color="#000" />
                      <Text style={styles.infoTextDate}>{startLocal.format('DD MMM YYYY')}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Ionicons name="time-outline" size={16} color="#000" />
                      <Text style={styles.infoTextTime}>{startLocal.format('hh:mm A')}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRowLeft}>
                    <Ionicons name="location-outline" size={16} color="#000" />
                    <Text style={styles.infoTextVenue}>{m.venue}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </Collapsible>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#eee', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 54, height: 54, borderRadius: 8, marginRight: 12, backgroundColor: '#fff' },
  tournamentIconFallback: {
    width: 54,
    height: 54,
    backgroundColor: '#FFF8F2',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E17827',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: { fontSize: 16, fontWeight: '700', fontFamily: 'SourceSans3_700Bold' },
  sportText: { color: '#E17827', marginTop: 2, fontFamily: 'SourceSans3_500Medium' },
  levelText: { color: '#00B0F0', fontFamily: 'SourceSans3_400Regular', fontSize: 12 },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  chevronWrap: { alignSelf: 'center', paddingVertical: 8, marginTop: 6 },
  meta: { color: '#333', marginTop: 4, fontFamily: 'SourceSans3_400Regular' },
  innerMatchCard: { paddingVertical: 10, gap: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 10, marginTop: 10, paddingHorizontal: 10 },
  innerMatchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  matchHeaderLeft: { maxWidth: 200 },
  matchTitle: { fontFamily: 'SourceSans3_400Regular', fontSize: 12, lineHeight: 17, color: '#000' },
  matchSub: { fontFamily: 'SourceSans3_400Regular', fontSize: 10, lineHeight: 14, color: '#E17827' },
  stageChip: { borderWidth: 1, borderColor: '#E17827', borderRadius: 6, paddingVertical: 2, paddingHorizontal: 10 },
  stageChipText: { color: '#E17827', fontFamily: 'SourceSans3_400Regular', fontSize: 12, lineHeight: 17 },
  versusRow: { flexDirection: 'row', alignItems: 'center', gap: 35, alignSelf: 'center', height: 66.68 },
  vsLogo: { width: 59.84, height: 66.68 },
  teamLogoContainer: { 
    width: 59.84, 
    height: 66.68, 
    backgroundColor: '#F8F8F8', 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E17827'
  },
  vsText: { fontFamily: 'SourceSans3_700Bold', fontSize: 12, lineHeight: 17, color: '#000' },
  infoBar: { borderWidth: 1, borderColor: '#E17827', borderRadius: 10, padding: 10, gap: 10 },
  infoRowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  infoTextDate: { fontFamily: 'SourceSans3_700Bold', fontSize: 14, lineHeight: 20, color: '#000' },
  infoTextTime: { fontFamily: 'SourceSans3_500Medium', fontSize: 12, lineHeight: 17, color: '#000' },
  infoTextVenue: { fontFamily: 'SourceSans3_500Medium', fontSize: 12, lineHeight: 17, color: '#000' },
  
  // Match card styles
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2E6DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchTournamentName: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  matchStageChip: {
    backgroundColor: '#E17827',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchStageText: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  matchVsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  matchTeam: {
    flex: 1,
    alignItems: 'center',
  },
  matchTeamName: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  matchVsText: {
    fontFamily: 'SourceSans3_700Bold',
    fontSize: 12,
    color: '#E17827',
    marginHorizontal: 16,
  },
  matchInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchInfoText: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 12,
    color: '#666666',
  },
});


