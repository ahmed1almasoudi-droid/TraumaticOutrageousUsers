import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { usePesWheel, WHEEL_OUTCOMES, type Mission, type Reward } from '@/context/PesWheelContext';

type Tab = 'wheel' | 'prizes' | 'missions' | 'account';

const tabItems: Array<{ id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: 'wheel', label: 'العجلة', icon: 'disc-outline' },
  { id: 'prizes', label: 'جوائزي', icon: 'gift-outline' },
  { id: 'missions', label: 'المهام', icon: 'flag-outline' },
  { id: 'account', label: 'حسابي', icon: 'person-outline' },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

function CoinBadge({ size = 26 }: { size?: number }) {
  const colors = useColors();
  return (
    <View style={[styles.coinBadge, { width: size, height: size, borderRadius: size / 2, borderColor: colors.gold }]}>
      <View style={[styles.coinInner, { width: size * 0.48, height: size * 0.48, borderRadius: size / 2, backgroundColor: colors.gold }]} />
      <View style={[styles.coinLine, { top: size * 0.48, backgroundColor: colors.orange }]} />
    </View>
  );
}

function Welcome({ onEnter }: { onEnter: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const markScale = useRef(new Animated.Value(0.78)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(markScale, { toValue: 1, useNativeDriver: true, damping: 12 }),
      Animated.timing(markOpacity, { toValue: 1, duration: 650, useNativeDriver: true }),
    ]).start();
  }, [markOpacity, markScale]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 18 }]} accessible accessibilityLabel="شاشة الترحيب">
      <View pointerEvents="none" style={[styles.glow, styles.glowLeft, { backgroundColor: colors.violet }]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowBottom, { backgroundColor: colors.orange }]} />
      <View pointerEvents="none" style={styles.stadiumLines} />
      <View style={styles.welcomeTop}>
        <View style={[styles.previewPill, { borderColor: colors.gold + '66', backgroundColor: colors.muted }]}>
          <Text style={[styles.previewPillText, { color: colors.goldSoft }]}>وضع المعاينة</Text>
        </View>
        <View style={styles.todayGift}>
          <Ionicons name="sparkles-outline" size={14} color={colors.gold} />
          <Text style={[styles.todayGiftText, { color: colors.mutedForeground }]}>هدية اليوم</Text>
        </View>
      </View>

      <View style={styles.welcomeCenter}>
        <Animated.View style={[styles.appMark, { backgroundColor: colors.plum, borderColor: colors.gold + '88', opacity: markOpacity, transform: [{ scale: markScale }] }]}>
          <Image source={require('../../assets/images/icon_2.png')} style={styles.appMarkImage} />
        </Animated.View>
        <Text style={[styles.brandKicker, { color: colors.gold }]}>PES MOBILE</Text>
        <Text style={[styles.welcomeTitle, { color: colors.goldSoft }]}>عجلة الحظ</Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.foreground }]}>
          كل يوم فرصة جديدة{'\n'}
          <Text style={{ color: colors.gold, fontWeight: '800' }}>اجمع عملاتك وابدأ الهجمة</Text>
        </Text>
      </View>

      <View style={styles.welcomeBottom}>
        <Pressable
          onPress={onEnter}
          accessibilityRole="button"
          accessibilityLabel="ابدأ اللعب"
          testID="welcome-start-button"
          style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.86 : 1 }]}
        >
          <LinearGradient colors={[colors.gold, colors.goldSoft, colors.orange]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.primaryButtonGradient}>
            <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>ابدأ اللعب</Text>
            <Ionicons name="arrow-back" size={20} color={colors.primaryForeground} />
          </LinearGradient>
        </Pressable>
        <Text style={[styles.footnote, { color: colors.mutedForeground }]}>لفّة مجانية كل 24 ساعة</Text>
      </View>
    </View>
  );
}

function polarToCartesian(center: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return { x: center + radius * Math.cos(angleInRadians), y: center + radius * Math.sin(angleInRadians) };
}

function describeSegment(center: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(center, radius, endAngle);
  const end = polarToCartesian(center, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function WheelGraphic({ rotation, spinning }: { rotation: Animated.Value; spinning: boolean }) {
  const colors = useColors();
  const segmentColors = [colors.gold, colors.green, colors.orange, colors.violet, colors.blue, colors.gold, colors.pink, colors.blue, colors.violet, colors.orange];
  const rotate = rotation.interpolate({ inputRange: [0, 3600], outputRange: ['0deg', '3600deg'] });
  const size = 320;
  const center = size / 2;
  const radius = 146;
  const segment = 360 / WHEEL_OUTCOMES.length;

  return (
    <View style={styles.wheelShell}>
      <View style={[styles.wheelOuter, { borderColor: colors.gold + '66', backgroundColor: colors.plum, shadowColor: colors.violetBright }]} />
      <Animated.View style={[styles.wheelRotate, { transform: [{ rotate }] }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle cx={center} cy={center} r={radius + 2} fill={colors.panel} stroke={colors.gold} strokeWidth={4} />
          <G>
            {WHEEL_OUTCOMES.map((outcome, index) => {
              const start = index * segment;
              const labelPoint = polarToCartesian(center, 104, start + segment / 2);
              return (
                <G key={outcome.id}>
                  <Path d={describeSegment(center, radius, start, start + segment - 1)} fill={index === 0 ? colors.destructive : segmentColors[index % segmentColors.length]} stroke={colors.goldSoft + 'aa'} strokeWidth={1} />
                  <SvgText x={labelPoint.x} y={index === 0 ? labelPoint.y - 7 : labelPoint.y - 2} fill={index === 0 ? colors.goldSoft : colors.primaryForeground} fontSize={index === 0 ? '13' : '15'} fontWeight="900" textAnchor="middle">
                    {outcome.label}
                  </SvgText>
                  {index === 0 ? (
                    <G>
                      <Circle cx={labelPoint.x} cy={labelPoint.y + 12} r={15} fill={colors.goldSoft} stroke={colors.orange} strokeWidth={2} />
                      <SvgText x={labelPoint.x} y={labelPoint.y + 18} fill={colors.destructive} fontSize="17" fontWeight="900" textAnchor="middle">↻</SvgText>
                    </G>
                  ) : (
                    <G>
                      <Circle cx={labelPoint.x - 6} cy={labelPoint.y + 12} r={6} fill={colors.goldSoft} stroke={colors.orange} strokeWidth={2} />
                      <Circle cx={labelPoint.x + 4} cy={labelPoint.y + 15} r={6} fill={colors.gold} stroke={colors.orange} strokeWidth={2} />
                    </G>
                  )}
                </G>
              );
            })}
          </G>
          <Circle cx={center} cy={center} r={46} fill={colors.panel} stroke={colors.gold} strokeWidth={6} />
          <Circle cx={center} cy={center} r={33} fill={colors.violet} stroke={colors.goldSoft} strokeWidth={1} />
          <SvgText x={center} y={center + 7} fill={colors.goldSoft} fontSize="19" fontWeight="900" textAnchor="middle">SPIN</SvgText>
        </Svg>
      </Animated.View>
      <View style={[styles.pointer, { backgroundColor: colors.violet, borderColor: colors.goldSoft }]}>
        <View style={[styles.pointerDot, { backgroundColor: colors.gold }]} />
      </View>
      {spinning && <View style={[styles.spinAura, { borderColor: colors.gold + '99' }]} />}
    </View>
  );
}

function Header({ balance, onMenu }: { balance: number; onMenu: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      <Pressable onPress={onMenu} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.muted, borderColor: colors.border + '77', opacity: pressed ? 0.7 : 1 }]} accessibilityRole="button" accessibilityLabel="فتح القائمة" testID="menu-button">
        <Ionicons name="menu" size={22} color={colors.gold} />
      </Pressable>
      <View style={styles.wordmark}>
        <Text style={[styles.wordmarkTop, { color: colors.gold }]}>PES</Text>
        <Text style={[styles.wordmarkBottom, { color: colors.goldSoft }]}>FOOTBALL</Text>
      </View>
      <View style={[styles.balancePill, { backgroundColor: colors.muted, borderColor: colors.border + '77' }]}>
        <CoinBadge size={24} />
        <View>
          <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>رصيدك</Text>
          <Text style={[styles.balanceValue, { color: colors.goldSoft }]}>{formatNumber(balance)}</Text>
        </View>
      </View>
    </View>
  );
}

function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const colors = useColors();
  return (
    <View style={[styles.bottomNav, { backgroundColor: colors.panel + 'F2', borderColor: colors.border + '44' }]}>
      {tabItems.map((item) => {
        const selected = active === item.id;
        return (
          <Pressable key={item.id} onPress={() => onChange(item.id)} style={({ pressed }) => [styles.bottomItem, selected && { backgroundColor: colors.secondary }, { opacity: pressed ? 0.7 : 1 }]} accessibilityRole="button" accessibilityLabel={item.label} testID={`tab-${item.id}`}>
            <Ionicons name={item.icon} size={21} color={selected ? colors.gold : colors.mutedForeground} />
            <Text style={[styles.bottomLabel, { color: selected ? colors.goldSoft : colors.mutedForeground }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ResultCard({ reward, onClose }: { reward: Reward; onClose: () => void }) {
  const colors = useColors();
  return (
    <View
      style={[styles.resultCard, { backgroundColor: colors.panelRaised, borderColor: colors.gold + '88' }]}
      accessibilityLabel={reward.amount > 0 ? `${reward.label} كوينز` : 'حظ أوفر، بدون كوينز أو خصم'}
      accessibilityLiveRegion="polite"
      testID="spin-result"
    >
      <View style={[styles.resultIcon, { backgroundColor: colors.gold + '1F' }]}><Ionicons name="trophy-outline" size={25} color={colors.gold} /></View>
      <View style={styles.resultCopy}>
        <Text style={[styles.resultCaption, { color: colors.mutedForeground }]}>{reward.amount > 0 ? 'مبروك! ربحت' : 'هذه المرة'}</Text>
        <View style={styles.resultAmount}>{reward.amount > 0 && <CoinBadge size={22} />}<Text style={[styles.resultText, { color: colors.goldSoft }]}>{reward.label}</Text></View>
      </View>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="إغلاق النتيجة" hitSlop={12}><Ionicons name="close" size={18} color={colors.mutedForeground} /></Pressable>
    </View>
  );
}

function EmptyState({ icon, title, body, colors }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border + '55' }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Ionicons name={icon} size={28} color={colors.gold} /></View>
      <Text style={[styles.emptyTitle, { color: colors.goldSoft }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>{body}</Text>
    </View>
  );
}

function RewardsView({ history }: { history: Reward[] }) {
  const colors = useColors();
  return (
    <ScrollView contentContainerStyle={styles.utilityContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.utilityKicker, { color: colors.gold }]}>مساحتك اليومية</Text>
      <Text style={[styles.utilityTitle, { color: colors.goldSoft }]}>سجل الجوائز</Text>
      <Text style={[styles.utilitySubtitle, { color: colors.mutedForeground }]}>كل ما جمعته من العجلة</Text>
      {history.length === 0 ? <EmptyState icon="gift-outline" title="ما عندك جوائز بعد" body="لفّ العجلة اليوم حتى تظهر أول جائزة هنا." colors={colors} /> : history.map((reward) => (
        <View key={reward.id} style={[styles.historyRow, { backgroundColor: colors.card, borderColor: colors.border + '55' }]}>
          <View style={[styles.historyIcon, { backgroundColor: reward.amount > 0 ? colors.gold + '1C' : colors.destructive + '1C' }]}>{reward.amount > 0 ? <CoinBadge size={24} /> : <Ionicons name="refresh-outline" size={24} color={colors.destructive} />}</View>
          <View style={styles.historyCopy}><Text style={[styles.historyTitle, { color: colors.goldSoft }]}>{reward.label}</Text><Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{reward.amount > 0 ? 'جائزة اللفة اليومية' : 'حظ أوفر — بدون كوينز أو خصم'}</Text></View>
          <Ionicons name="checkmark-circle" size={20} color={colors.green} />
        </View>
      ))}
    </ScrollView>
  );
}

function MissionsView({ missions }: { missions: Mission[] }) {
  const colors = useColors();
  return (
    <ScrollView contentContainerStyle={styles.utilityContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.utilityKicker, { color: colors.gold }]}>تحديات اللاعب</Text>
      <Text style={[styles.utilityTitle, { color: colors.goldSoft }]}>المهام اليومية</Text>
      <Text style={[styles.utilitySubtitle, { color: colors.mutedForeground }]}>خطوات بسيطة، مكافآت أكبر</Text>
      {missions.map((mission) => (
        <View key={mission.id} style={[styles.missionCard, { backgroundColor: colors.card, borderColor: mission.completed ? colors.green + '99' : colors.border + '55' }]}>
          <View style={[styles.missionIcon, { backgroundColor: mission.completed ? colors.green + '22' : colors.secondary }]}><Ionicons name={mission.completed ? 'checkmark' : 'flag-outline'} size={22} color={mission.completed ? colors.green : colors.gold} /></View>
          <View style={styles.missionCopy}><Text style={[styles.missionTitle, { color: colors.goldSoft }]}>{mission.title}</Text><Text style={[styles.missionCaption, { color: colors.mutedForeground }]}>{mission.caption}</Text><View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}><View style={[styles.progressFill, { backgroundColor: mission.completed ? colors.green : colors.gold, width: `${Math.min(100, (mission.progress / mission.goal) * 100)}%` }]} /></View><Text style={[styles.progressText, { color: colors.mutedForeground }]}>{mission.progress} من {mission.goal} · مكافأة {formatNumber(mission.reward)}</Text></View>
        </View>
      ))}
    </ScrollView>
  );
}

function AccountView({ balance }: { balance: number }) {
  const colors = useColors();
  return (
    <ScrollView contentContainerStyle={styles.utilityContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.utilityKicker, { color: colors.gold }]}>ملف اللاعب</Text>
      <Text style={[styles.utilityTitle, { color: colors.goldSoft }]}>حسابي</Text>
      <Text style={[styles.utilitySubtitle, { color: colors.mutedForeground }]}>مساحتك في PES Mobile</Text>
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border + '55' }]}>
        <LinearGradient colors={[colors.violet, colors.plum]} style={styles.profileAvatar}><Ionicons name="person" size={29} color={colors.goldSoft} /></LinearGradient>
        <Text style={[styles.profileName, { color: colors.goldSoft }]}>لاعب PES</Text>
        <Text style={[styles.profileMode, { color: colors.mutedForeground }]}>وضع المعاينة المحلي</Text>
        <View style={[styles.profileDivider, { backgroundColor: colors.border + '44' }]} />
        <View style={styles.profileBalance}><CoinBadge size={25} /><Text style={[styles.profileBalanceText, { color: colors.foreground }]}>رصيدك {formatNumber(balance)} كوينز</Text></View>
      </View>
      <View style={[styles.noticeCard, { backgroundColor: colors.secondary, borderColor: colors.border + '55' }]}><Ionicons name="shield-checkmark-outline" size={20} color={colors.gold} /><Text style={[styles.noticeText, { color: colors.mutedForeground }]}>إعدادات الجوائز والنسب والوقت ليست ظاهرة للاعب، وتبقى في جهة الإدارة.</Text></View>
    </ScrollView>
  );
}

function Drawer({ onClose, onSelect }: { onClose: () => void; onSelect: (tab: Tab) => void }) {
  const colors = useColors();
  const items: Array<{ label: string; caption: string; icon: keyof typeof Ionicons.glyphMap; tab: Tab }> = [
    { label: 'سجل الجوائز', caption: 'تابع كل ربح', icon: 'time-outline', tab: 'prizes' },
    { label: 'المهام اليومية', caption: 'مكافآت مع كل إنجاز', icon: 'flag-outline', tab: 'missions' },
    { label: 'تنبيهات اللفة', caption: 'لن تفوّت فرصتك', icon: 'notifications-outline', tab: 'wheel' },
    { label: 'حسابك', caption: 'ملف اللاعب والرصيد', icon: 'person-outline', tab: 'account' },
  ];
  return (
    <View style={styles.drawerOverlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="إغلاق القائمة" />
      <View style={[styles.drawer, { backgroundColor: colors.panelRaised, borderLeftColor: colors.border + '77' }]}>
        <View style={styles.drawerHeader}><View><Text style={[styles.drawerKicker, { color: colors.mutedForeground }]}>مساحة التطوير القادمة</Text><Text style={[styles.drawerTitle, { color: colors.goldSoft }]}>المزيد من اللعب</Text></View><Pressable onPress={onClose} hitSlop={12}><Ionicons name="close" size={22} color={colors.mutedForeground} /></Pressable></View>
        {items.map((item) => <Pressable key={item.label} onPress={() => { onSelect(item.tab); onClose(); }} style={({ pressed }) => [styles.drawerItem, { backgroundColor: pressed ? colors.secondary : colors.card, borderColor: colors.border + '44' }]}><View style={[styles.drawerIcon, { backgroundColor: colors.gold + '1A' }]}><Ionicons name={item.icon} size={20} color={colors.gold} /></View><View style={styles.drawerCopy}><Text style={[styles.drawerItemTitle, { color: colors.foreground }]}>{item.label}</Text><Text style={[styles.drawerItemCaption, { color: colors.mutedForeground }]}>{item.caption}</Text></View><Ionicons name="chevron-back" size={16} color={colors.mutedForeground} /></Pressable>)}
        <View style={[styles.tipCard, { backgroundColor: colors.secondary, borderColor: colors.border + '44' }]}><Ionicons name="bulb-outline" size={19} color={colors.gold} /><Text style={[styles.tipTitle, { color: colors.goldSoft }]}>نصيحة اليوم</Text><Text style={[styles.tipBody, { color: colors.mutedForeground }]}>كل لاعب يحصل على لفّة مجانية واحدة يومياً.</Text></View>
      </View>
    </View>
  );
}

function PlayersHero() {
  const colors = useColors();

  return (
    <View style={[styles.playersHero, { borderColor: colors.violetBright + '88', shadowColor: colors.violetBright }]}>
      <ImageBackground
        source={require('../../assets/images/reference-home.png')}
        resizeMode="cover"
        style={styles.playersHeroImage}
        accessible={false}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', colors.background + 'F5']}
        style={styles.playersHeroFade}
      />
      <View pointerEvents="none" style={styles.playersHeroCopy}>
        <View style={[styles.heroBadge, { backgroundColor: colors.violet + 'DD', borderColor: colors.gold + 'BB' }]}>
          <Ionicons name="flash" size={12} color={colors.goldSoft} />
          <Text style={[styles.heroBadgeText, { color: colors.goldSoft }]}>تحدّي اليوم</Text>
        </View>
        <Text style={[styles.heroPrompt, { color: colors.foreground }]}>هل أنت مستعد للفة؟</Text>
        <Text style={[styles.heroSubline, { color: colors.goldSoft }]}>جائزة مجانية كل 24 ساعة</Text>
      </View>
    </View>
  );
}

export default function TabOneScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [welcome, setWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('wheel');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [result, setResult] = useState<Reward | null>(null);
  const wheelRotation = useRef(new Animated.Value(0)).current;
  const { balance, rewardHistory, missions, isReady, isSpinning, spin, secondsUntilNextSpin } = usePesWheel();

  useEffect(() => {
    const timer = setTimeout(() => setWelcome(false), 3200);
    return () => clearTimeout(timer);
  }, []);

  const countdownText = useMemo(() => formatCountdown(secondsUntilNextSpin), [secondsUntilNextSpin]);

  async function handleSpin() {
    if (!isReady || isSpinning || secondsUntilNextSpin > 0) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    wheelRotation.setValue(0);
    Animated.timing(wheelRotation, { toValue: 360 * 5 + Math.floor(Math.random() * 360), duration: 3200, useNativeDriver: true }).start();
    const reward = await spin();
    if (reward) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResult(reward);
    }
  }

  if (welcome) return <Welcome onEnter={() => setWelcome(false)} />;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: 0 }]}>
      <View pointerEvents="none" style={[styles.glow, styles.glowLeft, { backgroundColor: colors.violet }]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowBottom, { backgroundColor: colors.orange }]} />
      <View pointerEvents="none" style={styles.stadiumLines} />
      <Header balance={balance} onMenu={() => setDrawerOpen(true)} />
      {activeTab === 'wheel' ? (
        <ScrollView contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
          <PlayersHero />
          <View style={styles.homeHeading}>
            <Text style={[styles.homeKicker, { color: colors.gold }]}>مكافأة اليوم</Text>
            <Text style={[styles.homeTitle, { color: colors.goldSoft }]}>عجلة الحظ</Text>
            <Text style={[styles.homeSubtitle, { color: colors.mutedForeground }]}>لفّ واربح عملاتك المجانية</Text>
          </View>
          <WheelGraphic rotation={wheelRotation} spinning={isSpinning} />
          <Pressable onPress={handleSpin} disabled={isSpinning || secondsUntilNextSpin > 0} accessibilityRole="button" accessibilityLabel={isSpinning ? 'العجلة تدور' : secondsUntilNextSpin > 0 ? 'اللف غير متاح الآن' : 'لف العجلة'} testID="spin-button" style={({ pressed }) => [styles.primaryButton, { opacity: pressed ? 0.86 : 1 }, (isSpinning || secondsUntilNextSpin > 0) && styles.disabledButton]}>
            <LinearGradient colors={isSpinning || secondsUntilNextSpin > 0 ? [colors.secondary, colors.muted] : [colors.gold, colors.goldSoft, colors.orange]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.primaryButtonGradient}>
              <Ionicons name={isSpinning ? 'sync-outline' : 'gift-outline'} size={20} color={isSpinning || secondsUntilNextSpin > 0 ? colors.mutedForeground : colors.primaryForeground} />
              <Text style={[styles.primaryButtonText, { color: isSpinning || secondsUntilNextSpin > 0 ? colors.mutedForeground : colors.primaryForeground }]}>{isSpinning ? 'جاري الدوران...' : secondsUntilNextSpin > 0 ? 'عد غداً للمحاولة' : 'لف العجلة'}</Text>
            </LinearGradient>
          </Pressable>
          <View style={styles.countdownRow}><Ionicons name="time-outline" size={15} color={colors.gold} /><Text style={[styles.countdownLabel, { color: colors.mutedForeground }]}>{secondsUntilNextSpin > 0 ? 'اللفة التالية بعد' : 'لفّة مجانية متاحة الآن'}</Text>{secondsUntilNextSpin > 0 && <Text style={[styles.countdownValue, { color: colors.goldSoft }]}>{countdownText}</Text>}</View>
          <Text style={[styles.demoLabel, { color: colors.mutedForeground }]}><Ionicons name="shield-checkmark-outline" size={12} color={colors.violetBright} /> وضع معاينة — الجوائز تجريبية</Text>
        </ScrollView>
      ) : activeTab === 'prizes' ? <RewardsView history={rewardHistory} /> : activeTab === 'missions' ? <MissionsView missions={missions} /> : <AccountView balance={balance} />}
      <BottomNav active={activeTab} onChange={setActiveTab} />
      {result && <View style={styles.resultPosition}><ResultCard reward={result} onClose={() => setResult(null)} /></View>}
      {drawerOpen && <Drawer onClose={() => setDrawerOpen(false)} onSelect={setActiveTab} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  glow: { position: 'absolute', width: 280, height: 280, borderRadius: 140, opacity: 0.15 },
  glowLeft: { left: -150, top: 150 },
  glowBottom: { right: -160, bottom: 70 },
  stadiumLines: { ...StyleSheet.absoluteFillObject, opacity: 0.22, borderWidth: 1, borderColor: '#7c4fa9', transform: [{ skewY: '-12deg' }] },
  welcomeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22 },
  previewPill: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  previewPillText: { fontSize: 10, fontWeight: '700' },
  todayGift: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  todayGiftText: { fontSize: 11 },
  welcomeCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 22 },
  appMark: { width: 94, height: 94, borderRadius: 29, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#b05bd4', shadowOpacity: 0.35, shadowRadius: 28, shadowOffset: { width: 0, height: 7 }, elevation: 8 },
  appMarkImage: { width: 74, height: 74, borderRadius: 23 },
  brandKicker: { fontSize: 12, fontWeight: '700', letterSpacing: 4, marginBottom: 10 },
  welcomeTitle: { fontSize: 43, fontWeight: '900', letterSpacing: -1, marginBottom: 14 },
  welcomeSubtitle: { textAlign: 'center', fontSize: 16, lineHeight: 30 },
  welcomeBottom: { paddingHorizontal: 24 },
  primaryButton: { width: '100%', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#ffe274', shadowColor: '#e39e26', shadowOpacity: 0.26, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  primaryButtonGradient: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 20 },
  primaryButtonText: { fontSize: 17, fontWeight: '900' },
  footnote: { fontSize: 10, textAlign: 'center', marginTop: 11 },
  header: { zIndex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 },
  iconButton: { width: 42, height: 42, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  wordmark: { alignItems: 'center', lineHeight: 1 },
  wordmarkTop: { fontSize: 10, fontWeight: '800', letterSpacing: 3 },
  wordmarkBottom: { fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  balancePill: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: 14, paddingHorizontal: 9, paddingVertical: 7 },
  balanceLabel: { fontSize: 9, textAlign: 'right' },
  balanceValue: { fontSize: 14, fontWeight: '900', textAlign: 'right' },
  coinBadge: { borderWidth: 2, backgroundColor: '#f9d95c', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  coinInner: { opacity: 0.85 },
  coinLine: { position: 'absolute', left: 3, right: 3, height: 1 },
  homeContent: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 22 },
  homeKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 2, marginTop: 2 },
  homeTitle: { fontSize: 32, fontWeight: '900', marginTop: 0, textShadowColor: '#9745d4', textShadowRadius: 12 },
  homeSubtitle: { fontSize: 16, fontWeight: '700', marginTop: 2, marginBottom: 0 },
  wheelShell: { width: 340, height: 356, alignItems: 'center', justifyContent: 'center', marginTop: -1, marginBottom: -4 },
  wheelOuter: { position: 'absolute', width: 334, height: 334, borderRadius: 167, borderWidth: 5, shadowOpacity: 0.65, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 9 },
  wheelRotate: { width: 320, height: 320, alignItems: 'center', justifyContent: 'center' },
  pointer: { position: 'absolute', top: 0, width: 43, height: 47, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  pointerDot: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, borderColor: '#fff1a9' },
  spinAura: { position: 'absolute', width: 306, height: 306, borderRadius: 153, borderWidth: 2, opacity: 0.7 },
  disabledButton: { borderColor: '#8c789b' },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 11, minHeight: 22 },
  countdownLabel: { fontSize: 11 },
  countdownValue: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  demoLabel: { fontSize: 9, marginTop: 13 },
  playersHero: { width: '100%', height: 205, borderRadius: 24, borderWidth: 1, overflow: 'hidden', marginBottom: 13, shadowOpacity: 0.5, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 7 },
  playersHeroImage: { ...StyleSheet.absoluteFillObject },
  playersHeroFade: { ...StyleSheet.absoluteFillObject, top: '35%' },
  playersHeroCopy: { position: 'absolute', left: 14, right: 14, bottom: 13, alignItems: 'center' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  heroBadgeText: { fontSize: 10, fontWeight: '900' },
  heroPrompt: { fontSize: 18, fontWeight: '900', marginTop: 6, textShadowColor: '#000', textShadowRadius: 8 },
  heroSubline: { fontSize: 11, fontWeight: '800', marginTop: 2 },
  homeHeading: { alignItems: 'center' },
  bottomNav: { zIndex: 5, minHeight: 78, flexDirection: 'row', borderTopWidth: 1, paddingHorizontal: 8, paddingTop: 7, paddingBottom: 8 },
  bottomItem: { flex: 1, borderRadius: 13, alignItems: 'center', justifyContent: 'center', gap: 4 },
  bottomLabel: { fontSize: 10, fontWeight: '600' },
  resultPosition: { position: 'absolute', left: 14, right: 14, bottom: 91, zIndex: 10 },
  resultCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderRadius: 17, padding: 12, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 8 },
  resultIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  resultCopy: { flex: 1 },
  resultCaption: { fontSize: 11, textAlign: 'right' },
  resultAmount: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 4 },
  resultText: { fontSize: 17, fontWeight: '900' },
  utilityContent: { paddingHorizontal: 19, paddingTop: 19, paddingBottom: 32 },
  utilityKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  utilityTitle: { fontSize: 30, fontWeight: '900', marginTop: 4 },
  utilitySubtitle: { fontSize: 13, marginTop: 5, marginBottom: 22 },
  emptyState: { minHeight: 240, borderRadius: 25, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 24, marginTop: 10 },
  emptyIcon: { width: 66, height: 66, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 19, fontWeight: '800' },
  emptyBody: { textAlign: 'center', fontSize: 13, lineHeight: 22, marginTop: 8, maxWidth: 245 },
  historyRow: { borderWidth: 1, borderRadius: 17, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  historyIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  historyCopy: { flex: 1, marginHorizontal: 11 },
  historyTitle: { textAlign: 'right', fontSize: 15, fontWeight: '800' },
  historyDate: { textAlign: 'right', fontSize: 11, marginTop: 3 },
  missionCard: { borderWidth: 1, borderRadius: 19, padding: 13, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 11 },
  missionIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  missionCopy: { flex: 1, marginHorizontal: 11 },
  missionTitle: { fontSize: 15, fontWeight: '800', textAlign: 'right' },
  missionCaption: { fontSize: 11, marginTop: 3, textAlign: 'right' },
  progressTrack: { height: 6, borderRadius: 4, overflow: 'hidden', marginTop: 13 },
  progressFill: { height: 6, borderRadius: 4 },
  progressText: { fontSize: 10, marginTop: 7, textAlign: 'right' },
  profileCard: { borderWidth: 1, borderRadius: 24, alignItems: 'center', padding: 22, marginTop: 8 },
  profileAvatar: { width: 76, height: 76, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: 21, fontWeight: '900', marginTop: 13 },
  profileMode: { fontSize: 11, marginTop: 4 },
  profileDivider: { width: '100%', height: 1, marginVertical: 20 },
  profileBalance: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileBalanceText: { fontSize: 13, fontWeight: '700' },
  noticeCard: { borderWidth: 1, borderRadius: 17, padding: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 12 },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 20, textAlign: 'right' },
  drawerOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 30, backgroundColor: 'rgba(3,2,16,0.72)', flexDirection: 'row', justifyContent: 'flex-end' },
  drawer: { width: '83%', height: '100%', borderLeftWidth: 1, paddingHorizontal: 18, paddingTop: 25 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(128,97,153,0.25)' },
  drawerKicker: { fontSize: 11, textAlign: 'right' },
  drawerTitle: { fontSize: 22, fontWeight: '900', marginTop: 4, textAlign: 'right' },
  drawerItem: { minHeight: 67, borderWidth: 1, borderRadius: 17, padding: 10, flexDirection: 'row', alignItems: 'center', marginTop: 11 },
  drawerIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  drawerCopy: { flex: 1, marginHorizontal: 10 },
  drawerItemTitle: { fontSize: 13, fontWeight: '800', textAlign: 'right' },
  drawerItemCaption: { fontSize: 10, marginTop: 3, textAlign: 'right' },
  tipCard: { marginTop: 'auto', marginBottom: 25, borderWidth: 1, borderRadius: 17, padding: 14 },
  tipTitle: { fontSize: 12, fontWeight: '800', marginTop: 9, textAlign: 'right' },
  tipBody: { fontSize: 11, lineHeight: 19, marginTop: 4, textAlign: 'right' },
});
