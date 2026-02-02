import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showElementInfo, setShowElementInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Country data with flags and colors
  const countries = {
    USA: { flag: '🇺🇸', name: 'United States', color: '3C3B6E', bgColor: '#3C3B6E' },
    JPN: { flag: '🇯🇵', name: 'Japan', color: 'BC002D', bgColor: '#BC002D' },
    CAN: { flag: '🇨🇦', name: 'Canada', color: 'FF0000', bgColor: '#FF0000' },
    FRA: { flag: '🇫🇷', name: 'France', color: '002395', bgColor: '#002395' },
    ITA: { flag: '🇮🇹', name: 'Italy', color: '009246', bgColor: '#009246' },
    GER: { flag: '🇩🇪', name: 'Germany', color: '000000', bgColor: '#DD0000' },
    GBR: { flag: '🇬🇧', name: 'Great Britain', color: '012169', bgColor: '#012169' },
    KOR: { flag: '🇰🇷', name: 'South Korea', color: '003478', bgColor: '#003478' },
    CHN: { flag: '🇨🇳', name: 'China', color: 'DE2910', bgColor: '#DE2910' },
    GEO: { flag: '🇬🇪', name: 'Georgia', color: 'FF0000', bgColor: '#FF0000' },
    BEL: { flag: '🇧🇪', name: 'Belgium', color: 'ED2939', bgColor: '#ED2939' },
    SUI: { flag: '🇨🇭', name: 'Switzerland', color: 'FF0000', bgColor: '#FF0000' },
    EST: { flag: '🇪🇪', name: 'Estonia', color: '0072CE', bgColor: '#0072CE' },
    KAZ: { flag: '🇰🇿', name: 'Kazakhstan', color: '00AFCA', bgColor: '#00AFCA' },
    ESP: { flag: '🇪🇸', name: 'Spain', color: 'AA151B', bgColor: '#AA151B' },
    HUN: { flag: '🇭🇺', name: 'Hungary', color: '477050', bgColor: '#477050' },
    POL: { flag: '🇵🇱', name: 'Poland', color: 'DC143C', bgColor: '#DC143C' },
    CZE: { flag: '🇨🇿', name: 'Czech Republic', color: '11457E', bgColor: '#11457E' },
    LTU: { flag: '🇱🇹', name: 'Lithuania', color: '006A44', bgColor: '#006A44' },
    LAT: { flag: '🇱🇻', name: 'Latvia', color: '9E3039', bgColor: '#9E3039' },
    FIN: { flag: '🇫🇮', name: 'Finland', color: '003580', bgColor: '#003580' },
    AUT: { flag: '🇦🇹', name: 'Austria', color: 'ED2939', bgColor: '#ED2939' },
    SWE: { flag: '🇸🇪', name: 'Sweden', color: '006AA7', bgColor: '#006AA7' },
    NED: { flag: '🇳🇱', name: 'Netherlands', color: 'AE1C28', bgColor: '#AE1C28' },
    AUS: { flag: '🇦🇺', name: 'Australia', color: '00008B', bgColor: '#00008B' },
    MEX: { flag: '🇲🇽', name: 'Mexico', color: '006847', bgColor: '#006847' },
    UKR: { flag: '🇺🇦', name: 'Ukraine', color: '005BBB', bgColor: '#005BBB' },
    ISR: { flag: '🇮🇱', name: 'Israel', color: '0038B8', bgColor: '#0038B8' },
    AZE: { flag: '🇦🇿', name: 'Azerbaijan', color: '0092BC', bgColor: '#0092BC' },
    ARM: { flag: '🇦🇲', name: 'Armenia', color: 'D90012', bgColor: '#D90012' },
    SVK: { flag: '🇸🇰', name: 'Slovakia', color: '0B4EA2', bgColor: '#0B4EA2' },
    ROU: { flag: '🇷🇴', name: 'Romania', color: '002B7F', bgColor: '#002B7F' },
    BUL: { flag: '🇧🇬', name: 'Bulgaria', color: '00966E', bgColor: '#00966E' },
    TPE: { flag: '🇹🇼', name: 'Chinese Taipei', color: 'FE0000', bgColor: '#FE0000' },
    AIN: { flag: '🏳️', name: 'Neutral Athlete', color: '666666', bgColor: '#666666' },
  };

  // Convert name to thumbnail filename (lowercase, underscores, ASCII only)
  const nameToFilename = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/-/g, '_') // Replace hyphens with underscores
      .replace(/'/g, '') // Remove apostrophes
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^a-z0-9_]/g, ''); // Remove any other non-ASCII
  };

  // Get thumbnail URL for a single person
  const getThumbnailUrl = (name) => {
    return `thumbnails/${nameToFilename(name)}.jpg`;
  };

  // Generate avatar URL as fallback
  const getAvatarUrl = (name, country, size = 128) => {
    const countryData = countries[country] || { color: '666666' };
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=${countryData.color}&color=fff&bold=true&format=svg`;
  };

  // Check if athlete is pairs/ice dance (has "&" in name)
  const isPairOrDance = (name) => name.includes(' & ');

  // Split pair/dance names
  const splitPairNames = (name) => {
    const parts = name.split(' & ');
    return parts.map(part => part.trim());
  };

  // Athlete Photo Component with fallback
  const AthletePhoto = ({ athlete, size = 48, style = {} }) => {
    const [imageErrors, setImageErrors] = useState({});

    if (isPairOrDance(athlete.name)) {
      const names = splitPairNames(athlete.name);
      const halfSize = size / 2;
      
      return (
        <div style={{ 
          display: 'flex', 
          width: size, 
          height: size, 
          borderRadius: size * 0.25, 
          overflow: 'hidden',
          flexShrink: 0,
          ...style 
        }}>
          {names.map((name, i) => (
            <img
              key={i}
              src={imageErrors[name] ? getAvatarUrl(name, athlete.country, size) : getThumbnailUrl(name)}
              alt={name}
              onError={() => setImageErrors(prev => ({ ...prev, [name]: true }))}
              style={{ 
                width: halfSize, 
                height: size, 
                objectFit: 'cover',
                objectPosition: 'center top'
              }}
            />
          ))}
        </div>
      );
    }

    // Single athlete
    return (
      <img
        src={imageErrors[athlete.name] ? getAvatarUrl(athlete.name, athlete.country, size) : getThumbnailUrl(athlete.name)}
        alt={athlete.name}
        onError={() => setImageErrors(prev => ({ ...prev, [athlete.name]: true }))}
        style={{ 
          width: size, 
          height: size, 
          borderRadius: size * 0.25, 
          objectFit: 'cover',
          objectPosition: 'center top',
          flexShrink: 0,
          ...style 
        }}
      />
    );
  };

  // Large Photo for detail page
  const AthletePhotoLarge = ({ athlete, size = 80 }) => {
    const [imageErrors, setImageErrors] = useState({});

    if (isPairOrDance(athlete.name)) {
      const names = splitPairNames(athlete.name);
      
      return (
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          flexShrink: 0
        }}>
          {names.map((name, i) => (
            <img
              key={i}
              src={imageErrors[name] ? getAvatarUrl(name, athlete.country, size) : getThumbnailUrl(name)}
              alt={name}
              onError={() => setImageErrors(prev => ({ ...prev, [name]: true }))}
              style={{ 
                width: size * 0.6, 
                height: size, 
                borderRadius: 16, 
                objectFit: 'cover',
                objectPosition: 'center top'
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <img
        src={imageErrors[athlete.name] ? getAvatarUrl(athlete.name, athlete.country, size) : getThumbnailUrl(athlete.name)}
        alt={athlete.name}
        onError={() => setImageErrors(prev => ({ ...prev, [athlete.name]: true }))}
        style={{ 
          width: size, 
          height: size, 
          borderRadius: 20, 
          objectFit: 'cover',
          objectPosition: 'center top',
          flexShrink: 0
        }}
      />
    );
  };

  // Element notation explanations
  const elementExplanations = {
    '4A': 'Quadruple Axel - 4.5 rotations, the most difficult jump',
    '4Lz': 'Quadruple Lutz - 4 rotations from back outside edge',
    '4F': 'Quadruple Flip - 4 rotations from back inside edge',
    '4S': 'Quadruple Salchow - 4 rotations edge jump',
    '4T': 'Quadruple Toe Loop - 4 rotations toe pick jump',
    '4Lo': 'Quadruple Loop - 4 rotations edge jump',
    '3A': 'Triple Axel - 3.5 rotations, most difficult triple',
    '3Lz': 'Triple Lutz - 3 rotations from back outside edge',
    '3F': 'Triple Flip - 3 rotations from back inside edge',
    '3Lo': 'Triple Loop - 3 rotations edge jump',
    '3S': 'Triple Salchow - 3 rotations edge jump',
    '3T': 'Triple Toe Loop - 3 rotations toe pick jump',
    '3Tw': 'Triple Twist Lift - Throw with 3 rotations',
    '3FTh': 'Triple Flip Throw',
    '3LoTh': 'Triple Loop Throw',
    '3STh': 'Triple Salchow Throw',
  };

  // Events data
  const events = [
    { id: 'team', name: 'Team Event', icon: '🏆', dates: 'Feb 6-8', description: 'Nations compete across all disciplines', color: '#6366f1',
      segments: [
        { name: 'Ice Dance Rhythm Dance', date: 'Feb 6', time: '09:55', isMedal: false },
        { name: 'Pairs Short Program', date: 'Feb 6', time: '11:35', isMedal: false },
        { name: 'Women Short Program', date: 'Feb 6', time: '13:35', isMedal: false },
        { name: 'Men Short Program', date: 'Feb 7', time: '19:45', isMedal: false },
        { name: 'Ice Dance Free Dance', date: 'Feb 7', time: '22:05', isMedal: false },
        { name: 'Pairs Free Skating', date: 'Feb 8', time: '19:30', isMedal: false },
        { name: 'Women Free Skating', date: 'Feb 8', time: '20:45', isMedal: false },
        { name: 'Men Free Skating', date: 'Feb 8', time: '21:55', isMedal: true },
      ] },
    { id: 'ice-dance', name: 'Ice Dance', icon: '💃', dates: 'Feb 9 & 11', description: 'Rhythm, interpretation & precise footwork', color: '#ec4899',
      segments: [
        { name: 'Rhythm Dance', date: 'Feb 9', time: '19:20', isMedal: false },
        { name: 'Free Dance', date: 'Feb 11', time: '19:30', isMedal: true },
      ] },
    { id: 'mens', name: "Men's Singles", icon: '⭐', dates: 'Feb 10 & 13', description: 'Technical jumps & artistic expression', color: '#3b82f6',
      segments: [
        { name: 'Short Program', date: 'Feb 10', time: '18:30', isMedal: false },
        { name: 'Free Skating', date: 'Feb 13', time: '19:00', isMedal: true },
      ] },
    { id: 'pairs', name: 'Pairs', icon: '❤️', dates: 'Feb 15-16', description: 'Lifts, throws & synchronized skating', color: '#f43f5e',
      segments: [
        { name: 'Short Program', date: 'Feb 15', time: '19:45', isMedal: false },
        { name: 'Free Skating', date: 'Feb 16', time: '20:00', isMedal: true },
      ] },
    { id: 'womens', name: "Women's Singles", icon: '✨', dates: 'Feb 17 & 19', description: 'Grace, power & technical brilliance', color: '#a855f7',
      segments: [
        { name: 'Short Program', date: 'Feb 17', time: '18:45', isMedal: false },
        { name: 'Free Skating', date: 'Feb 19', time: '19:00', isMedal: true },
      ] }
  ];

  // ALL ATHLETES
  const athletes = [
    // === UNITED STATES ===
    { id: 'malinin', name: 'Ilia Malinin', country: 'USA', event: 'mens', eventName: "Men's Singles",
      nickname: 'The Quad God', topContender: true, worldRanking: 1,
      bio: 'Two-time World Champion and the only skater to land a quadruple Axel in competition. Son of two Olympians from Uzbekistan.',
      seasonBest: { sp: 115.10, fs: 228.55, total: 327.11, competition: '2025-26 Grand Prix Final' },
      plannedElements: { sp: ['4F', '3A', '4Lz+3T'], fs: ['4A', '4Lz+1Eu+3F', '4F', '4T', '4S', '3A', '3A'] },
      programs: { sp: { title: 'The Lost Crown', music: 'Prince of Persia OST' }, fs: { title: 'A Voice', music: 'Original composition' } },
      achievements: ['🥇 First & Only Quad Axel (4A)', '🏆 2x World Champion (2024-25)', '🇺🇸 4x U.S. Champion'] },
    { id: 'naumov', name: 'Maxim Naumov', country: 'USA', event: 'mens', eventName: "Men's Singles",
      bio: 'Olympic debutant whose parents were among the victims of the January 2025 DC plane crash. Competing in their honor.',
      seasonBest: { sp: 89.23, fs: 173.45, total: 262.68, competition: '2026 U.S. Championships' },
      plannedElements: { sp: ['4T', '3A', '4S+3T'], fs: ['4T', '4S', '3A', '3Lz+3T', '3F', '3Lo'] },
      achievements: ['🇺🇸 2026 U.S. Silver Medalist', '💪 Skating for family'] },
    { id: 'torgashev', name: 'Andrew Torgashev', country: 'USA', event: 'mens', eventName: "Men's Singles",
      bio: 'Former junior standout making his Olympic debut. Known for powerful jumps.',
      seasonBest: { sp: 87.50, fs: 170.25, total: 257.75, competition: '2026 U.S. Championships' },
      plannedElements: { sp: ['4T', '3A', '3Lz+3T'], fs: ['4T', '4S', '3A', '3Lz+2T+2Lo', '3F'] } },
    { id: 'glenn', name: 'Amber Glenn', country: 'USA', event: 'womens', eventName: "Women's Singles",
      topContender: true, worldRanking: 3,
      bio: 'Three-time consecutive U.S. champion with a triple Axel. LGBTQ+ advocate making her Olympic debut at 25.',
      seasonBest: { sp: 83.05, fs: 150.50, total: 233.55, competition: '2026 U.S. Championships' },
      plannedElements: { sp: ['3A', '3F+3T', '3Lz'], fs: ['3A', '3F+3T', '3Lz+2T', '3Lo', '3S', '2A+3T'] },
      programs: { sp: { title: 'This Is What It Feels Like', music: 'Banks' }, fs: { title: 'I Will Find You', music: 'Audiomachine' } },
      achievements: ['🇺🇸 3x U.S. Champion (2024-26)', '⭐ First 3-peat since Kwan', '🏳️‍🌈 LGBTQ+ Icon'] },
    { id: 'levito', name: 'Isabeau Levito', country: 'USA', event: 'womens', eventName: "Women's Singles",
      topContender: true,
      bio: '2024 World silver medalist. Mother is from Milan, making this a homecoming Olympics.',
      seasonBest: { sp: 76.89, fs: 145.23, total: 222.12, competition: '2026 U.S. Championships' },
      plannedElements: { sp: ['3Lz+3T', '3F', '2A'], fs: ['3Lz+3T', '3F+2T', '3Lo', '3S', '2A+3T', '3Lz'] },
      achievements: ['🥈 2024 World Silver Medalist', '🇺🇸 2023 U.S. Champion'] },
    { id: 'liu', name: 'Alysa Liu', country: 'USA', event: 'womens', eventName: "Women's Singles",
      topContender: true, worldRanking: 2,
      bio: '2025 World Champion. Retired in 2022, returned from UCLA to stage one of skating\'s greatest comebacks.',
      seasonBest: { sp: 81.11, fs: 150.80, total: 231.91, competition: '2025 World Championships' },
      plannedElements: { sp: ['3A', '3Lz+3T', '3F'], fs: ['3A', '3Lz+3T', '3F+2T', '3Lo', '3S', '2A+3T'] },
      programs: { sp: { title: 'MacArthur Park', music: 'Donna Summer' }, fs: { title: 'Lady Gaga Medley', music: 'Paparazzi / Bad Romance' } },
      achievements: ['🏆 2025 World Champion', '🇺🇸 2x U.S. Champion (youngest ever)', '⭐ Historic Comeback'] },
    { id: 'chock-bates', name: 'Madison Chock & Evan Bates', country: 'USA', event: 'ice-dance', eventName: 'Ice Dance',
      topContender: true, worldRanking: 1,
      bio: 'Married couple and 3x World Champions. Record 7 U.S. titles in their 15th season together.',
      seasonBest: { rd: 91.70, fd: 137.17, total: 228.87, competition: '2026 U.S. Championships' },
      programs: { sp: { title: 'Lenny Kravitz Medley', music: 'Always on the Run / Fly Away' }, fs: { title: 'Paint It Black', music: 'Westworld Soundtrack' } },
      achievements: ['🏆 3x World Champions (2023-25)', '🥇 2022 Olympic Team Gold', '🇺🇸 7x U.S. Champions (Record)'] },
    { id: 'carreira-ponomarenko', name: 'Christina Carreira & Anthony Ponomarenko', country: 'USA', event: 'ice-dance', eventName: 'Ice Dance',
      bio: 'Partners since 2014. Ponomarenko\'s parents were Soviet skating champions.',
      seasonBest: { rd: 79.56, fd: 119.88, total: 199.44, competition: '2026 U.S. Championships' },
      achievements: ['🇺🇸 Multiple U.S. National Medalists'] },
    { id: 'zingas-kolesnik', name: 'Emilea Zingas & Vadym Kolesnik', country: 'USA', event: 'ice-dance', eventName: 'Ice Dance',
      bio: 'Rapid rise since 2022. Kolesnik from Kharkiv, Ukraine; received U.S. citizenship in 2025.',
      seasonBest: { rd: 82.34, fd: 124.55, total: 206.89, competition: '2026 U.S. Championships' },
      achievements: ['🥈 2026 U.S. Silver Medalists'] },
    { id: 'kam-oshea', name: 'Ellie Kam & Danny O\'Shea', country: 'USA', event: 'pairs', eventName: 'Pairs',
      bio: 'Experienced pair making their Olympic debut together.',
      seasonBest: { sp: 68.45, fs: 128.90, total: 197.35, competition: '2026 U.S. Championships' },
      plannedElements: { sp: ['3Tw3', '3T', '3LoTh'], fs: ['3Tw3', '3S', '3T', '3FTh', '3LoTh'] },
      achievements: ['🇺🇸 2026 U.S. Pairs Champions'] },
    { id: 'chan-howe', name: 'Emily Chan & Spencer Akira Howe', country: 'USA', event: 'pairs', eventName: 'Pairs',
      bio: 'Newer partnership showing strong international potential.',
      seasonBest: { sp: 65.23, fs: 124.56, total: 189.79, competition: '2026 U.S. Championships' },
      plannedElements: { sp: ['3Tw2', '3S', '3LoTh'], fs: ['3Tw3', '3T', '3S', '3FTh', '3LoTh'] } },

    // === JAPAN ===
    { id: 'kagiyama', name: 'Yuma Kagiyama', country: 'JPN', event: 'mens', eventName: "Men's Singles",
      topContender: true, worldRanking: 2,
      bio: '2022 Olympic silver medalist. Son of 1994 Olympian Masakazu Kagiyama. Known for elegant skating.',
      seasonBest: { sp: 108.77, fs: 201.93, total: 310.05, competition: '2025-26 Grand Prix Final' },
      plannedElements: { sp: ['4S', '3A', '4T+3T'], fs: ['4S', '4T', '4T+1Eu+3S', '3A', '3A+3T', '3Lo', '3Lz'] },
      programs: { sp: { title: 'Rite of Spring', music: 'Igor Stravinsky' }, fs: { title: 'Gladiator', music: 'Hans Zimmer' } },
      achievements: ['🥈 2022 Olympic Silver Medalist', '🏆 2024 Four Continents Champion', '🇯🇵 2x Japanese Champion'] },
    { id: 'kao-miura', name: 'Kao Miura', country: 'JPN', event: 'mens', eventName: "Men's Singles",
      topContender: true,
      bio: '2023 World Champion at age 18. Exceptional quad jumps and artistry.',
      seasonBest: { sp: 95.65, fs: 185.45, total: 281.10, competition: '2026 Japanese Nationals' },
      plannedElements: { sp: ['4S', '3A', '4T+3T'], fs: ['4Lo', '4S', '4T+2T', '3A', '3A+3T', '3Lz'] },
      achievements: ['🏆 2023 World Champion', '🇯🇵 Japanese National Medalist'] },
    { id: 'sato', name: 'Shun Sato', country: 'JPN', event: 'mens', eventName: "Men's Singles",
      bio: 'Olympic debutant with powerful quad jumps.',
      seasonBest: { sp: 88.50, fs: 175.80, total: 264.30, competition: '2026 Japanese Nationals' },
      plannedElements: { sp: ['4Lz', '3A', '4T+3T'], fs: ['4Lz', '4T', '4S', '3A', '3A+2T', '3Lo'] } },
    { id: 'sakamoto', name: 'Kaori Sakamoto', country: 'JPN', event: 'womens', eventName: "Women's Singles",
      topContender: true, worldRanking: 1,
      bio: 'Three-time World Champion in her final season. First Japanese woman at three Winter Olympics.',
      seasonBest: { sp: 79.43, fs: 154.93, total: 234.36, competition: '2026 Japanese Nationals' },
      plannedElements: { sp: ['3F+3T', '3Lz', '2A'], fs: ['3F+3T', '3Lz+2T', '3Lo', '3S', '2A+3T', '3Lz', '2A'] },
      programs: { sp: { title: 'Time to Say Goodbye', music: 'Sarah Brightman & Andrea Bocelli' }, fs: { title: 'Edith Piaf Medley', music: "L'Hymne à l'amour" } },
      achievements: ['🏆 3x World Champion (2022-24)', '🥉 2022 Olympic Bronze', '🇯🇵 6x Japanese Champion'] },
    { id: 'chiba', name: 'Mone Chiba', country: 'JPN', event: 'womens', eventName: "Women's Singles",
      bio: '2025 World bronze medalist. Rising star of Japanese women\'s skating.',
      seasonBest: { sp: 74.56, fs: 141.68, total: 216.24, competition: '2026 Japanese Nationals' },
      plannedElements: { sp: ['3Lz+3T', '3F', '2A'], fs: ['3Lz+3T', '3F+2T', '3Lo', '3S', '2A+3T'] },
      achievements: ['🥉 2025 World Bronze', '🇯🇵 Japanese National Medalist'] },
    { id: 'nakai', name: 'Ami Nakai', country: 'JPN', event: 'womens', eventName: "Women's Singles",
      bio: '17-year-old sensation in her senior debut season. Grand Prix Final silver.',
      seasonBest: { sp: 73.89, fs: 139.67, total: 213.56, competition: '2025-26 Grand Prix Final' },
      plannedElements: { sp: ['3A', '3Lz+3T', '3F'], fs: ['3A', '3Lz+3T', '3F+2T', '3Lo', '3S'] },
      achievements: ['🥈 2025-26 Grand Prix Final Silver', '⭐ Breakout Star'] },
    { id: 'miura-kihara', name: 'Riku Miura & Ryuichi Kihara', country: 'JPN', event: 'pairs', eventName: 'Pairs',
      topContender: true, worldRanking: 3,
      bio: '2023 & 2025 World Champions. First Japanese pairs team to win a world title.',
      seasonBest: { sp: 78.08, fs: 145.67, total: 223.75, competition: '2025 World Championships' },
      plannedElements: { sp: ['3Tw4', '3T', '3FTh'], fs: ['3Tw4', '3S', '3T', '3FTh', '3STh'] },
      programs: { sp: { title: 'The Phantom of the Opera', music: 'Andrew Lloyd Webber' }, fs: { title: 'Nocturne', music: 'Secret Garden' } },
      achievements: ['🏆 2x World Champions (2023, 2025)', '🇯🇵 Historic Achievement'] },
    { id: 'nagaoka-moriguchi', name: 'Yuna Nagaoka & Sumitada Moriguchi', country: 'JPN', event: 'pairs', eventName: 'Pairs',
      bio: 'Japan\'s second pairs team, helping build the program.',
      seasonBest: { sp: 58.45, fs: 108.90, total: 167.35, competition: '2026 Japanese Nationals' },
      plannedElements: { sp: ['3Tw2', '2A', '3STh'], fs: ['3Tw2', '3T', '2A', '3STh', '3LoTh'] } },
    { id: 'yoshida-morita', name: 'Utana Yoshida & Masaya Morita', country: 'JPN', event: 'ice-dance', eventName: 'Ice Dance',
      bio: 'Japan\'s top ice dance team. Team event only (no individual quota).',
      seasonBest: { rd: 68.45, fd: 103.84, total: 172.29, competition: '2026 Japanese Nationals' },
      achievements: ['🇯🇵 Japanese Ice Dance Champions'] },

    // === CANADA ===
    { id: 'gogolev', name: 'Stephen Gogolev', country: 'CAN', event: 'mens', eventName: "Men's Singles",
      bio: 'Canada\'s sole men\'s entry. 2026 Canadian Champion, Olympic debut.',
      seasonBest: { sp: 85.67, fs: 168.90, total: 254.57, competition: '2026 Canadian Championships' },
      plannedElements: { sp: ['4Lz', '3A', '4T+3T'], fs: ['4Lz', '4T', '4S', '3A', '3A+2T', '3Lo'] },
      achievements: ['🇨🇦 2026 Canadian Champion', '🥉 Grand Prix Medalist'] },
    { id: 'schizas', name: 'Madeline Schizas', country: 'CAN', event: 'womens', eventName: "Women's Singles",
      bio: 'Four-time Canadian champion. Beijing 2022 Team Event participant.',
      seasonBest: { sp: 68.90, fs: 130.45, total: 199.35, competition: '2026 Canadian Championships' },
      plannedElements: { sp: ['3Lz+3T', '3F', '2A'], fs: ['3Lz+3T', '3F+2T', '3Lo', '3S', '2A+3T'] },
      achievements: ['🇨🇦 4x Canadian Champion', '🥇 2022 Olympic Team Event'] },
    { id: 'stellato-deschamps', name: 'Deanna Stellato-Dudek & Maxime Deschamps', country: 'CAN', event: 'pairs', eventName: 'Pairs',
      topContender: true, worldRanking: 2,
      bio: 'At 42, Deanna becomes the oldest female Olympic figure skater since 1928. Returned after 16-year retirement.',
      seasonBest: { sp: 77.35, fs: 140.37, total: 217.72, competition: '2025 Skate Canada' },
      plannedElements: { sp: ['3Tw3', '3T', '3LoTh'], fs: ['3Tw3', '3S', '3T', '3FTh', '3LoTh'] },
      programs: { sp: { title: 'Carmina Burana', music: 'Carl Orff' }, fs: { title: 'Vicente Amigo Medley', music: 'Poeta en el Mar' } },
      achievements: ['🏆 2024 World Champions', '⭐ Oldest Woman to Win Worlds', '🇨🇦 3x Canadian Champions'] },
    { id: 'pereira-michaud', name: 'Lia Pereira & Trennt Michaud', country: 'CAN', event: 'pairs', eventName: 'Pairs',
      bio: '2026 Canadian Champions, edging out Stellato/Deschamps at nationals.',
      seasonBest: { sp: 69.11, fs: 135.03, total: 204.14, competition: '2026 Canadian Championships' },
      plannedElements: { sp: ['3Tw3', '3S', '3LoTh'], fs: ['3Tw3', '3T', '3S', '3FTh', '3LoTh'] },
      achievements: ['🇨🇦 2026 Canadian Champions'] },
    { id: 'gilles-poirier', name: 'Piper Gilles & Paul Poirier', country: 'CAN', event: 'ice-dance', eventName: 'Ice Dance',
      topContender: true, worldRanking: 2,
      bio: 'Four-time World medalists, third Olympics together. Gilles overcame ovarian cancer in 2022-23.',
      seasonBest: { rd: 87.45, fd: 132.67, total: 220.12, competition: '2026 Canadian Championships' },
      programs: { sp: { title: 'Eagles Medley', music: 'Hotel California' }, fs: { title: 'Schindler\'s List', music: 'John Williams' } },
      achievements: ['🥈 2x World Silver Medalists', '🇨🇦 5x Canadian Champions', '💪 Cancer Survivor'] },
    { id: 'lajoie-lagha', name: 'Marjorie Lajoie & Zachary Lagha', country: 'CAN', event: 'ice-dance', eventName: 'Ice Dance',
      bio: 'Second Canadian team, Olympic debut at Beijing 2022.',
      seasonBest: { rd: 78.90, fd: 118.45, total: 197.35, competition: '2026 Canadian Championships' },
      achievements: ['🇨🇦 Canadian National Medalists'] },
    { id: 'lauriault-legac', name: 'Marie-Jade Lauriault & Romain Le Gac', country: 'CAN', event: 'ice-dance', eventName: 'Ice Dance',
      bio: 'Previously competed for France at PyeongChang 2018.',
      seasonBest: { rd: 75.34, fd: 112.89, total: 188.23, competition: '2026 Canadian Championships' } },

    // === FRANCE ===
    { id: 'siao-him-fa', name: 'Adam Siao Him Fa', country: 'FRA', event: 'mens', eventName: "Men's Singles",
      topContender: true, worldRanking: 4,
      bio: 'Two-time European Champion. Skipped 2026 Europeans to prepare for Olympics after hip injury.',
      seasonBest: { sp: 96.78, fs: 188.45, total: 285.23, competition: '2025-26 Grand Prix Final' },
      plannedElements: { sp: ['4Lz', '3A', '4T+3T'], fs: ['4Lz', '4Lo', '4T', '4S', '3A', '3A+2T'] },
      achievements: ['🏆 2x European Champion (2023-24)', '🥉 2024 World Bronze'] },
    { id: 'aymoz', name: 'Kevin Aymoz', country: 'FRA', event: 'mens', eventName: "Men's Singles",
      bio: 'Artistic skater known for emotional programs. Multiple French champion.',
      seasonBest: { sp: 84.56, fs: 164.78, total: 249.34, competition: '2026 French Championships' },
      plannedElements: { sp: ['4T', '3A', '3Lz+3T'], fs: ['4T', '3A', '3A+2T', '3Lz+3T', '3Lo'] },
      achievements: ['🇫🇷 Multiple French Champion'] },
    { id: 'pitot', name: 'François Pitot', country: 'FRA', event: 'mens', eventName: "Men's Singles",
      bio: 'France\'s third men\'s entry.',
      seasonBest: { sp: 78.90, fs: 152.34, total: 231.24, competition: '2026 French Championships' },
      plannedElements: { sp: ['4T', '3A', '3Lz+3T'], fs: ['4T', '3A', '3Lz+3T', '3F', '3Lo'] } },
    { id: 'fournier-cizeron', name: 'Laurence Fournier Beaudry & Guillaume Cizeron', country: 'FRA', event: 'ice-dance', eventName: 'Ice Dance',
      topContender: true, worldRanking: 3,
      bio: 'Cizeron is 2022 Olympic Champion (with Papadakis). New partnership with Fournier Beaudry.',
      seasonBest: { rd: 89.56, fd: 134.89, total: 224.45, competition: '2026 European Championships' },
      programs: { sp: { title: 'Symphonie Espagnole', music: 'Lalo' }, fs: { title: 'The Rite of Spring', music: 'Stravinsky' } },
      achievements: ['🥇 Cizeron: 2022 Olympic Champion', '🏆 2026 European Champions'] },
    { id: 'lopareva-brissaud', name: 'Evgeniia Lopareva & Geoffrey Brissaud', country: 'FRA', event: 'ice-dance', eventName: 'Ice Dance',
      bio: 'Three-time consecutive European silver medalists.',
      seasonBest: { rd: 80.45, fd: 121.78, total: 202.23, competition: '2026 European Championships' },
      achievements: ['🥈 3x European Silver Medalists'] },
    { id: 'kovalev-kovalev', name: 'Camille Kovalev & Pavel Kovalev', country: 'FRA', event: 'pairs', eventName: 'Pairs',
      bio: 'France\'s pairs team at first Olympics.',
      seasonBest: { sp: 62.34, fs: 118.90, total: 181.24, competition: '2026 French Championships' },
      plannedElements: { sp: ['3Tw2', '3T', '3STh'], fs: ['3Tw3', '3S', '3T', '3STh', '3LoTh'] } },

    // === ITALY (Host) ===
    { id: 'grassl', name: 'Daniel Grassl', country: 'ITA', event: 'mens', eventName: "Men's Singles",
      topContender: true,
      bio: 'Home crowd favorite from Merano. 2022 European silver medalist.',
      seasonBest: { sp: 93.67, fs: 182.45, total: 276.12, competition: '2025-26 Grand Prix Final' },
      plannedElements: { sp: ['4Lz', '3A', '4Lo+3T'], fs: ['4Lz', '4Lo', '4F', '4T', '3A', '3A+2T'] },
      achievements: ['🥈 2022 European Silver', '🇮🇹 Italian Champion', '🏠 Home Favorite'] },
    { id: 'rizzo', name: 'Matteo Rizzo', country: 'ITA', event: 'mens', eventName: "Men's Singles",
      bio: 'Three-time European medalist.',
      seasonBest: { sp: 88.00, fs: 170.34, total: 258.34, competition: '2026 European Championships' },
      plannedElements: { sp: ['4T', '3A', '3Lz+3T'], fs: ['4T', '3A', '3A+2T', '3Lz+3T', '3F'] },
      achievements: ['🥉 3x European Medalist'] },
    { id: 'gutmann', name: 'Lara Naki Gutmann', country: 'ITA', event: 'womens', eventName: "Women's Singles",
      bio: 'Italian women\'s champion, second Olympics.',
      seasonBest: { sp: 63.75, fs: 125.45, total: 189.20, competition: '2026 Italian Championships' },
      plannedElements: { sp: ['3Lz+3T', '3F', '2A'], fs: ['3Lz+3T', '3F+2T', '3Lo', '3S', '2A+3T'] },
      achievements: ['🇮🇹 Italian Champion'] },
    { id: 'conti-macii', name: 'Sara Conti & Niccolò Macii', country: 'ITA', event: 'pairs', eventName: 'Pairs',
      topContender: true,
      bio: 'Two-time World medalists carrying home nation hopes.',
      seasonBest: { sp: 74.56, fs: 138.90, total: 213.46, competition: '2025-26 Grand Prix de France' },
      plannedElements: { sp: ['3Tw3', '3T', '3LoTh'], fs: ['3Tw3', '3S', '3T', '3FTh', '3LoTh'] },
      achievements: ['🥉 2x World Medalists', '🏠 Home Team'] },
    { id: 'ghilardi-ambrosini', name: 'Rebecca Ghilardi & Filippo Ambrosini', country: 'ITA', event: 'pairs', eventName: 'Pairs',
      bio: 'Italy\'s second pairs team.',
      seasonBest: { sp: 64.78, fs: 122.45, total: 187.23, competition: '2026 Italian Championships' },
      plannedElements: { sp: ['3Tw2', '3S', '3STh'], fs: ['3Tw3', '3T', '3S', '3STh', '3LoTh'] } },
    { id: 'guignard-fabbri', name: 'Charlène Guignard & Marco Fabbri', country: 'ITA', event: 'ice-dance', eventName: 'Ice Dance',
      topContender: true,
      bio: 'Four-time World medalists, three-time European champions at home.',
      seasonBest: { rd: 84.67, fd: 126.89, total: 211.56, competition: '2025-26 Skate Canada' },
      programs: { sp: { title: 'Che Gelida Manina', music: 'La Bohème' }, fs: { title: 'Requiem', music: 'Mozart' } },
      achievements: ['🏆 3x European Champions', '🇮🇹 Host Nation Stars'] },

    // === GREAT BRITAIN ===
    { id: 'fear-gibson', name: 'Lilah Fear & Lewis Gibson', country: 'GBR', event: 'ice-dance', eventName: 'Ice Dance',
      topContender: true, worldRanking: 5,
      bio: '2025 World bronze medalists - first British world medal in 41 years. 8-time national champions.',
      seasonBest: { rd: 85.67, fd: 128.45, total: 214.12, competition: '2026 European Championships' },
      programs: { sp: { title: 'Spice Girls Medley', music: 'Wannabe / Spice Up Your Life' }, fs: { title: 'Scottish Highland Dances', music: 'Traditional' } },
      achievements: ['🥉 2025 World Bronze (First GBR in 41 years)', '🇬🇧 8x British Champions', '✨ "The Disco Brits"'] },
    { id: 'vaipan-digby', name: 'Anastasia Vaipan-Law & Luke Digby', country: 'GBR', event: 'pairs', eventName: 'Pairs',
      bio: 'Britain\'s pairs team, fifth at 2026 Europeans.',
      seasonBest: { sp: 63.98, fs: 118.45, total: 182.43, competition: '2026 European Championships' },
      plannedElements: { sp: ['3Tw2', '3T', '3STh'], fs: ['3Tw2', '3S', '3T', '3STh', '3LoTh'] } },

    // === GERMANY ===
    { id: 'hase-volodin', name: 'Minerva Fabienne Hase & Nikita Volodin', country: 'GER', event: 'pairs', eventName: 'Pairs',
      topContender: true, worldRanking: 4,
      bio: '2025 World silver medalists and 2025 European Champions.',
      seasonBest: { sp: 74.81, fs: 138.45, total: 213.26, competition: '2025-26 Grand Prix Final' },
      plannedElements: { sp: ['3Tw3', '3T', '3LoTh'], fs: ['3Tw4', '3S', '3T', '3FTh', '3LoTh'] },
      achievements: ['🥈 2025 World Silver', '🏆 2025 European Champions'] },
    { id: 'hocke-kunkel', name: 'Annika Hocke & Robert Kunkel', country: 'GER', event: 'pairs', eventName: 'Pairs',
      bio: 'Germany\'s second pairs team.',
      seasonBest: { sp: 65.47, fs: 122.80, total: 188.27, competition: '2026 European Championships' },
      plannedElements: { sp: ['3Tw2', '3S', '3STh'], fs: ['3Tw3', '3T', '3S', '3STh', '3LoTh'] } },

    // === GEORGIA ===
    { id: 'egadze', name: 'Nika Egadze', country: 'GEO', event: 'mens', eventName: "Men's Singles",
      bio: '2026 European Champion with spectacular rise.',
      seasonBest: { sp: 91.28, fs: 176.45, total: 267.73, competition: '2026 European Championships' },
      plannedElements: { sp: ['4T', '3A', '4S+3T'], fs: ['4T', '4S', '3A', '3A+2T', '3Lz+3T'] },
      achievements: ['🏆 2026 European Champion', '🇬🇪 Breakthrough Star'] },
    { id: 'gubanova', name: 'Anastasiia Gubanova', country: 'GEO', event: 'womens', eventName: "Women's Singles",
      bio: '2023 European Champion. Representing Georgia since 2019.',
      seasonBest: { sp: 68.90, fs: 132.45, total: 201.35, competition: '2026 European Championships' },
      plannedElements: { sp: ['3Lz+3T', '3F', '2A'], fs: ['3Lz+3T', '3F+2T', '3Lo', '3S', '2A+3T'] },
      achievements: ['🏆 2023 European Champion'] },
    { id: 'metelkina-berulava', name: 'Anastasiia Metelkina & Luka Berulava', country: 'GEO', event: 'pairs', eventName: 'Pairs',
      topContender: true, worldRanking: 5,
      bio: '2026 European Champions - Georgia\'s first pairs Euro title. 2x World Junior Champions.',
      seasonBest: { sp: 75.96, fs: 139.80, total: 215.76, competition: '2026 European Championships' },
      plannedElements: { sp: ['3Tw3', '3T', '3FTh'], fs: ['3Tw4', '3S', '3T', '3FTh', '3LoTh'] },
      achievements: ['🏆 2026 European Champions', '🥇 2x World Junior Champions'] },

    // === CHINA ===
    { id: 'jin', name: 'Boyang Jin', country: 'CHN', event: 'mens', eventName: "Men's Singles",
      bio: 'Former world bronze medalist, quad Lutz pioneer. Third Olympics.',
      seasonBest: { sp: 88.45, fs: 172.34, total: 260.79, competition: '2026 Chinese Championships' },
      plannedElements: { sp: ['4Lz', '3A', '4T+3T'], fs: ['4Lz', '4T', '4S', '3A', '3A+2T'] },
      achievements: ['🥉 2x World Bronze', '⭐ Quad Lutz Pioneer', '🇨🇳 3x Olympian'] },
    { id: 'sui-han', name: 'Sui Wenjing & Han Cong', country: 'CHN', event: 'pairs', eventName: 'Pairs',
      topContender: true,
      bio: '2022 Olympic Champions returning. Two-time World Champions seeking second Olympic gold.',
      seasonBest: { sp: 79.45, fs: 148.90, total: 228.35, competition: '2025-26 Cup of China' },
      plannedElements: { sp: ['3Tw4', '3T', '3FTh'], fs: ['3Tw4', '3S', '3T', '3FTh', '3LoTh'] },
      achievements: ['🥇 2022 Olympic Champions', '🏆 2x World Champions'] },

    // === BELGIUM ===
    { id: 'hendrickx', name: 'Loena Hendrickx', country: 'BEL', event: 'womens', eventName: "Women's Singles",
      topContender: true,
      bio: '2024 European Champion returning from injury. Two-time World medalist.',
      seasonBest: { sp: 72.45, fs: 138.90, total: 211.35, competition: '2025-26 NHK Trophy' },
      plannedElements: { sp: ['3Lz+3T', '3F', '2A'], fs: ['3Lz+3T', '3F+2T', '3Lo', '3S', '2A+3T'] },
      achievements: ['🏆 2024 European Champion', '🥈 2x World Medalist', '💪 Comeback'] },
    { id: 'pinzarrone', name: 'Nina Pinzarrone', country: 'BEL', event: 'womens', eventName: "Women's Singles",
      bio: 'Belgium\'s second women\'s entry.',
      seasonBest: { sp: 64.97, fs: 124.56, total: 189.53, competition: '2026 European Championships' },
      plannedElements: { sp: ['3Lz+3T', '3F', '2A'], fs: ['3Lz+3T', '3F+2T', '3Lo', '3S', '2A'] } },

    // === SWITZERLAND ===
    { id: 'britschgi', name: 'Lukas Britschgi', country: 'SUI', event: 'mens', eventName: "Men's Singles",
      bio: '2025 European Champion. Known for delivering at big events.',
      seasonBest: { sp: 87.45, fs: 170.23, total: 257.68, competition: '2026 European Championships' },
      plannedElements: { sp: ['4T', '3A', '3Lz+3T'], fs: ['4T', '3A', '3A+2T', '3Lz+3T', '3F'] },
      achievements: ['🏆 2025 European Champion', '🇨🇭 Swiss Champion'] },

    // === ESTONIA ===
    { id: 'petrokina', name: 'Niina Petrokina', country: 'EST', event: 'womens', eventName: "Women's Singles",
      topContender: true,
      bio: '2026 European Champion. Breakout star of the season.',
      seasonBest: { sp: 70.61, fs: 140.23, total: 210.84, competition: '2026 European Championships' },
      plannedElements: { sp: ['3Lz+3T', '3F', '2A'], fs: ['3Lz+3T', '3F+2T', '3Lo', '3S', '2A+3T'] },
      achievements: ['🏆 2026 European Champion'] },
    { id: 'selevko', name: 'Aleksandr Selevko', country: 'EST', event: 'mens', eventName: "Men's Singles",
      bio: '2024 European silver medalist.',
      seasonBest: { sp: 88.71, fs: 168.45, total: 257.16, competition: '2026 European Championships' },
      plannedElements: { sp: ['4T', '3A', '3Lz+3T'], fs: ['4T', '3A', '3A+2T', '3Lz+3T', '3F'] },
      achievements: ['🥈 2024 European Silver'] },

    // === KAZAKHSTAN ===
    { id: 'shaidorov', name: 'Mikhail Shaidorov', country: 'KAZ', event: 'mens', eventName: "Men's Singles",
      topContender: true,
      bio: '2025 World silver medalist. Rising star challenging for Olympic medal.',
      seasonBest: { sp: 95.67, fs: 188.45, total: 284.12, competition: '2025 World Championships' },
      plannedElements: { sp: ['4Lz', '3A', '4T+3T'], fs: ['4Lz', '4T', '4S', '3A', '3A+2T', '3Lo'] },
      achievements: ['🥈 2025 World Silver Medalist'] },

    // === SOUTH KOREA ===
    { id: 'cha', name: 'Junhwan Cha', country: 'KOR', event: 'mens', eventName: "Men's Singles",
      bio: 'Korea\'s top men\'s skater. Beijing 2022 Olympian.',
      seasonBest: { sp: 92.45, fs: 178.90, total: 271.35, competition: '2025-26 Grand Prix' },
      plannedElements: { sp: ['4S', '3A', '4T+3T'], fs: ['4T', '4S', '3A', '3A+3T', '3Lz+2T'] },
      achievements: ['🇰🇷 Korean Champion'] },
    { id: 'shin-jia', name: 'Jia Shin', country: 'KOR', event: 'womens', eventName: "Women's Singles",
      bio: 'Rising Korean star making senior Olympic debut.',
      seasonBest: { sp: 71.45, fs: 138.90, total: 210.35, competition: '2026 Korean Championships' },
      plannedElements: { sp: ['3Lz+3T', '3F', '2A'], fs: ['3Lz+3T', '3F+2T', '3Lo', '3S', '2A+3T'] },
      achievements: ['🥈 World Junior Medalist'] },
    { id: 'lee-haein', name: 'Haein Lee', country: 'KOR', event: 'womens', eventName: "Women's Singles",
      bio: '2024 World silver medalist and Korean champion.',
      seasonBest: { sp: 73.67, fs: 141.23, total: 214.90, competition: '2026 Korean Championships' },
      plannedElements: { sp: ['3Lz+3T', '3F', '2A'], fs: ['3Lz+3T', '3F+2T', '3Lo', '3S', '2A+3T'] },
      achievements: ['🥈 2024 World Silver'] },

    // === HUNGARY ===
    { id: 'pavlova-sviatchenko', name: 'Maria Pavlova & Alexei Sviatchenko', country: 'HUN', event: 'pairs', eventName: 'Pairs',
      bio: 'Hungary\'s first European pairs medal in 69 years.',
      seasonBest: { sp: 73.32, fs: 129.24, total: 202.56, competition: '2026 European Championships' },
      plannedElements: { sp: ['3Tw3', '3T', '3STh'], fs: ['3Tw3', '3S', '3T', '3FTh', '3LoTh'] },
      achievements: ['🥉 2026 European Bronze'] },

    // === MEXICO ===
    { id: 'carrillo', name: 'Donovan Carrillo', country: 'MEX', event: 'mens', eventName: "Men's Singles",
      bio: 'Mexico\'s lone figure skater. First Mexican at Olympics in 30 years at Beijing 2022.',
      seasonBest: { sp: 78.90, fs: 152.34, total: 231.24, competition: '2025 Olympic Qualifier' },
      plannedElements: { sp: ['3Lz', '3A', '3F+3T'], fs: ['3A', '3Lz+3T', '3F+2T', '3Lo', '3S'] },
      achievements: ['🇲🇽 First Mexican Olympian in 30 years', '⭐ National Hero'] },

    // === AIN ===
    { id: 'petrosian', name: 'Adeliia Petrosian', country: 'AIN', event: 'womens', eventName: "Women's Singles",
      topContender: true,
      bio: 'Neutral athlete with quad jumps and triple Axel. International senior debut at Olympics.',
      seasonBest: { sp: 82.45, fs: 165.90, total: 248.35, competition: '2025 Olympic Qualifier' },
      plannedElements: { sp: ['3A', '3Lz+3T', '3F'], fs: ['4T', '3A', '3Lz+3T', '3F+2T', '3Lo'] },
      achievements: ['⭐ Quad Jump Specialist'] },
  ];

  const toggleFavorite = (athleteId) => {
    setFavorites(prev => 
      prev.includes(athleteId) 
        ? prev.filter(id => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  // Filtered athletes for search
  const filteredAthletes = useMemo(() => {
    if (!searchQuery) return athletes;
    const query = searchQuery.toLowerCase();
    return athletes.filter(a => 
      a.name.toLowerCase().includes(query) ||
      a.country.toLowerCase().includes(query) ||
      countries[a.country]?.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Responsive container style
  const containerStyle = {
    width: '100%',
    maxWidth: '768px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    minHeight: '100vh',
    background: '#f8fafc'
  };

  // Header Component
  const Header = ({ showBack, onBack, title }) => (
    <div style={{
      background: 'linear-gradient(135deg, #0c1929 0%, #1a365d 100%)',
      padding: '12px 16px',
      paddingTop: '48px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {showBack && (
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          fontSize: '18px'
        }}>←</button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}>⛸️</div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', letterSpacing: '0.5px' }}>IcePath</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>MILANO 2026</div>
        </div>
      </div>
      {title && <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{title}</div>}
    </div>
  );

  // Navigation Bar
  const NavBar = () => (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '768px',
      background: 'white',
      padding: '8px 0 24px',
      display: 'flex',
      justifyContent: 'space-around',
      borderTop: '1px solid #e5e7eb',
      zIndex: 100
    }}>
      {[
        { id: 'home', icon: '🏠', label: 'Home' },
        { id: 'events', icon: '📅', label: 'Schedule' },
        { id: 'athletes', icon: '⛸️', label: 'Athletes' },
        { id: 'favorites', icon: '⭐', label: 'Saved' }
      ].map(item => (
        <button
          key={item.id}
          onClick={() => { setCurrentView(item.id); setSelectedEvent(null); setSelectedAthlete(null); }}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            color: currentView === item.id ? '#3b82f6' : '#6b7280',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span style={{ fontSize: '22px' }}>{item.icon}</span>
          <span style={{ fontWeight: currentView === item.id ? '600' : '400' }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  // Element Info Modal
  const ElementInfoModal = ({ element, onClose }) => {
    if (!element) return null;
    const explanation = elementExplanations[element] || `${element} - Technical skating element`;
    
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px'
      }} onClick={onClose}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '320px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '8px' }}>{element}</div>
          <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>{explanation}</div>
          <button onClick={onClose} style={{
            marginTop: '16px',
            width: '100%',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>Got it</button>
        </div>
      </div>
    );
  };

  // Home Screen
  const HomeScreen = () => (
    <div style={{ paddingBottom: '100px' }}>
      <Header />
      
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        padding: '24px 20px',
        color: 'white'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '500', opacity: 0.8, marginBottom: '4px' }}>
          OLYMPIC WINTER GAMES
        </div>
        <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
          Figure Skating
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          February 6-19, 2026 • Milano Ice Skating Arena
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px' }}>
          {[
            { val: '5', label: 'Events' },
            { val: '142', label: 'Athletes' },
            { val: '35', label: 'Nations' }
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '12px 8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>{s.val}</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Top Contenders</h2>
          <button onClick={() => setCurrentView('athletes')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            View all →
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
          {athletes.filter(a => a.topContender).slice(0, 8).map(athlete => (
            <button
              key={athlete.id}
              onClick={() => { setSelectedAthlete(athlete); setCurrentView('athlete-detail'); }}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '12px 8px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}
            >
              <AthletePhoto athlete={athlete} size={56} style={{ margin: '0 auto', borderRadius: '14px' }} />
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', marginTop: '8px', lineHeight: 1.2 }}>
                {athlete.name.includes(' & ') ? athlete.name.split(' & ')[0].split(' ').slice(-1)[0] : athlete.name.split(' ').slice(-1)[0]}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                {countries[athlete.country]?.flag}
              </div>
            </button>
          ))}
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '24px 0 12px' }}>Schedule</h2>
        {events.map(event => (
          <button
            key={event.id}
            onClick={() => { setSelectedEvent(event); setCurrentView('event-detail'); }}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '10px',
              width: '100%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: `linear-gradient(135deg, ${event.color}22, ${event.color}11)`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              {event.icon}
            </div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{event.name}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{event.dates}</div>
            </div>
            <div style={{ color: '#9ca3af', fontSize: '18px' }}>›</div>
          </button>
        ))}
      </div>
    </div>
  );

  // Events Screen
  const EventsScreen = () => (
    <div style={{ paddingBottom: '100px' }}>
      <Header />
      <div style={{ padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px' }}>Schedule</h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px' }}>All times local (CET/UTC+1)</p>
        
        {events.map(event => (
          <button
            key={event.id}
            onClick={() => { setSelectedEvent(event); setCurrentView('event-detail'); }}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '12px',
              width: '100%',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: `linear-gradient(135deg, ${event.color}, ${event.color}cc)`,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                flexShrink: 0
              }}>
                {event.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '17px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>{event.name}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>{event.dates}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{event.description}</div>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '20px' }}>›</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Event Detail Screen
  const EventDetailScreen = () => {
    if (!selectedEvent) return null;
    const eventAthletes = athletes.filter(a => a.event === selectedEvent.id);
    
    return (
      <div style={{ paddingBottom: '100px' }}>
        <Header showBack onBack={() => { setSelectedEvent(null); setCurrentView('events'); }} />
        
        <div style={{
          background: `linear-gradient(135deg, ${selectedEvent.color}, ${selectedEvent.color}cc)`,
          padding: '24px 20px',
          color: 'white'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>{selectedEvent.icon}</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px' }}>{selectedEvent.name}</h1>
          <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>{selectedEvent.dates}</p>
        </div>

        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>Schedule</h2>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px'
          }}>
            {selectedEvent.segments.map((seg, i) => (
              <div key={i} style={{
                padding: '16px 20px',
                borderBottom: i < selectedEvent.segments.length - 1 ? '1px solid #f1f5f9' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: seg.isMedal ? 'linear-gradient(90deg, #fef3c7, #fffbeb)' : 'white'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {seg.isMedal && <span>🏅</span>}
                    {seg.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{seg.date}</div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: seg.isMedal ? '#d97706' : '#3b82f6' }}>
                  {seg.time}
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>
            Athletes ({eventAthletes.length})
          </h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {eventAthletes.slice(0, 10).map(athlete => (
              <button
                key={athlete.id}
                onClick={() => { setSelectedAthlete(athlete); setCurrentView('athlete-detail'); }}
                style={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  width: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <AthletePhoto athlete={athlete} size={48} />
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{athlete.name}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{countries[athlete.country]?.name}</div>
                </div>
                {athlete.topContender && (
                  <div style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>TOP</div>
                )}
                <div style={{ color: '#9ca3af' }}>›</div>
              </button>
            ))}
          </div>
          {eventAthletes.length > 10 && (
            <button
              onClick={() => setCurrentView('athletes')}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '14px', width: '100%', cursor: 'pointer', color: '#3b82f6', fontWeight: '600', fontSize: '14px', marginTop: '10px' }}
            >
              View all {eventAthletes.length} athletes
            </button>
          )}
        </div>
      </div>
    );
  };

  // Athletes Screen
  const AthletesScreen = () => {
    const [filter, setFilter] = useState('all');
    const filtered = useMemo(() => {
      let result = searchQuery ? filteredAthletes : athletes;
      if (filter !== 'all') result = result.filter(a => a.event === filter);
      return result;
    }, [filter, searchQuery, filteredAthletes]);

    return (
      <div style={{ paddingBottom: '100px' }}>
        <Header />
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>
            Athletes <span style={{ fontSize: '16px', fontWeight: '400', color: '#64748b' }}>({filtered.length})</span>
          </h1>
          
          <input
            type="text"
            placeholder="Search athletes or countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '15px',
              marginBottom: '12px',
              boxSizing: 'border-box'
            }}
          />
          
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'mens', label: "Men" },
              { id: 'womens', label: "Women" },
              { id: 'pairs', label: 'Pairs' },
              { id: 'ice-dance', label: 'Ice Dance' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  background: filter === f.id ? '#3b82f6' : 'white',
                  color: filter === f.id ? 'white' : '#64748b',
                  border: filter === f.id ? 'none' : '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            {filtered.map(athlete => (
              <button
                key={athlete.id}
                onClick={() => { setSelectedAthlete(athlete); setCurrentView('athlete-detail'); }}
                style={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  width: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <AthletePhoto athlete={athlete} size={48} />
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{athlete.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {countries[athlete.country]?.flag} {countries[athlete.country]?.name}
                  </div>
                </div>
                {athlete.topContender && (
                  <div style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: 'white', padding: '3px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: '700', flexShrink: 0 }}>TOP</div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(athlete.id); }}
                  style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                >
                  {favorites.includes(athlete.id) ? '⭐' : '☆'}
                </button>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Athlete Detail Screen
  const AthleteDetailScreen = () => {
    if (!selectedAthlete) return null;
    const athlete = selectedAthlete;
    const countryData = countries[athlete.country] || { flag: '🏳️', name: 'Unknown', bgColor: '#666' };
    const isIceDance = athlete.event === 'ice-dance';

    return (
      <div style={{ paddingBottom: '100px' }}>
        <Header showBack onBack={() => { setSelectedAthlete(null); setCurrentView('athletes'); }} />
        
        {/* Hero */}
        <div style={{
          background: `linear-gradient(135deg, ${countryData.bgColor}dd, ${countryData.bgColor}88)`,
          padding: '32px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <AthletePhotoLarge athlete={athlete} size={80} />
          <div style={{ flex: 1, minWidth: '150px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: '0 0 4px' }}>
              {athlete.name}
            </h1>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
              {countryData.flag} {countryData.name}
            </div>
            {athlete.nickname && (
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginTop: '4px' }}>
                "{athlete.nickname}"
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => toggleFavorite(athlete.id)}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '22px', cursor: 'pointer' }}
            >
              {favorites.includes(athlete.id) ? '⭐' : '☆'}
            </button>
            {athlete.topContender && (
              <div style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: 'white', padding: '6px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '700', textAlign: 'center' }}>
                ⭐ TOP<br/>CONTENDER
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Season Best Scores */}
          {athlete.seasonBest && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', letterSpacing: '0.5px', marginBottom: '12px' }}>
                SEASON BEST SCORES
              </div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>
                {athlete.seasonBest.total.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', marginBottom: '16px' }}>
                {athlete.seasonBest.competition}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    {isIceDance ? 'RHYTHM DANCE' : 'SHORT PROGRAM'}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
                    {(athlete.seasonBest.sp || athlete.seasonBest.rd || 0).toFixed(2)}
                  </div>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    {isIceDance ? 'FREE DANCE' : 'FREE SKATE'}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
                    {(athlete.seasonBest.fs || athlete.seasonBest.fd || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Planned Technical Elements - NOT for ice dance */}
          {athlete.plannedElements && !isIceDance && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', letterSpacing: '0.5px', marginBottom: '12px' }}>
                PLANNED TECHNICAL HIGHLIGHTS
              </div>
              {athlete.plannedElements.sp && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Short Program</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {athlete.plannedElements.sp.map((el, i) => (
                      <button
                        key={i}
                        onClick={() => setShowElementInfo(el.replace(/\+.*/g, ''))}
                        style={{ background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        {el} ⓘ
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {athlete.plannedElements.fs && (
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Free Skate</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {athlete.plannedElements.fs.slice(0, 5).map((el, i) => (
                      <button
                        key={i}
                        onClick={() => setShowElementInfo(el.replace(/\+.*/g, ''))}
                        style={{ background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        {el} ⓘ
                      </button>
                    ))}
                    {athlete.plannedElements.fs.length > 5 && (
                      <span style={{ fontSize: '11px', color: '#64748b', alignSelf: 'center' }}>+{athlete.plannedElements.fs.length - 5}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Achievements */}
          {athlete.achievements && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', letterSpacing: '0.5px', marginBottom: '12px' }}>
                ACHIEVEMENTS
              </div>
              {athlete.achievements.map((ach, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: i < athlete.achievements.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: '14px', color: '#374151' }}>
                  {ach}
                </div>
              ))}
            </div>
          )}

          {/* Programs */}
          {athlete.programs && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', letterSpacing: '0.5px', marginBottom: '12px' }}>
                PROGRAMS
              </div>
              <div style={{ background: 'linear-gradient(135deg, #ede9fe, #f5f3ff)', borderRadius: '12px', padding: '14px', marginBottom: '10px' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', color: '#7c3aed', marginBottom: '2px' }}>
                  {isIceDance ? 'RHYTHM DANCE' : 'SHORT PROGRAM'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{athlete.programs.sp.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{athlete.programs.sp.music}</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #dbeafe, #eff6ff)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: '600', color: '#2563eb', marginBottom: '2px' }}>
                  {isIceDance ? 'FREE DANCE' : 'FREE SKATE'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{athlete.programs.fs.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{athlete.programs.fs.music}</div>
              </div>
            </div>
          )}

          {/* Bio */}
          {athlete.bio && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', letterSpacing: '0.5px', marginBottom: '8px' }}>
                BIOGRAPHY
              </div>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                {athlete.bio}
              </p>
            </div>
          )}
        </div>

        <ElementInfoModal element={showElementInfo} onClose={() => setShowElementInfo(null)} />
      </div>
    );
  };

  // Favorites Screen
  const FavoritesScreen = () => {
    const favoriteAthletes = athletes.filter(a => favorites.includes(a.id));

    return (
      <div style={{ paddingBottom: '100px' }}>
        <Header />
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px' }}>
            Saved Athletes ({favoriteAthletes.length})
          </h1>

          {favoriteAthletes.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '48px 24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>No saved athletes yet</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Tap the star on any athlete to add them here</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {favoriteAthletes.map(athlete => (
                <button
                  key={athlete.id}
                  onClick={() => { setSelectedAthlete(athlete); setCurrentView('athlete-detail'); }}
                  style={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    width: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <AthletePhoto athlete={athlete} size={48} />
                  <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{athlete.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{countries[athlete.country]?.flag} {countries[athlete.country]?.name}</div>
                  </div>
                  <span style={{ fontSize: '20px' }}>⭐</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'events' && <EventsScreen />}
      {currentView === 'event-detail' && <EventDetailScreen />}
      {currentView === 'athletes' && <AthletesScreen />}
      {currentView === 'athlete-detail' && <AthleteDetailScreen />}
      {currentView === 'favorites' && <FavoritesScreen />}
      <NavBar />
    </div>
  );
};

export default App;

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
