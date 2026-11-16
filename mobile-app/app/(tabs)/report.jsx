import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import CategoryCard from '../../components/report/CategoryCard';
import StepProgress from '../../components/report/StepProgress';
import {
  CATEGORY_GROUPS,
  CATEGORY_SECTIONS,
  COMPLAINT_CATEGORY_OPTIONS,
  categoryMatchesQuery,
} from '../../constants/complaintCategories';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { getComplaintDraft, updateComplaintDraft } from '../../state/complaintDraft';
import BrandLogo from '../../components/branding/BrandLogo';

export default function ReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(() => getComplaintDraft().categoryId || null);

  const selected = COMPLAINT_CATEGORY_OPTIONS.find((category) => category.id === selectedId) || null;

  const visible = useMemo(
    () => COMPLAINT_CATEGORY_OPTIONS.filter((category) => categoryMatchesQuery(category, query)),
    [query]
  );

  const groupA = visible.filter((category) => category.group === 'A');
  const groupB = visible.filter((category) => category.group === 'B');

  const selectCategory = (id) => {
    setSelectedId((current) => (current === id ? null : id));
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.navigate('/(tabs)');
  };

  const continueReport = () => {
    if (!selected) return;
    updateComplaintDraft({
      categoryId: selected.id,
      categoryName: selected.name,
      group: selected.group,
      routingType: selected.routingType,
    });
    router.push({
      pathname: '/report/details',
      params: {
        id: selected.id,
        name: selected.name,
        group: selected.group,
        routingType: selected.routingType,
      },
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.back} accessibilityLabel="Go back">
          <ArrowLeft size={20} color={COLORS.gray900} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Choose a category</Text>
          <Text style={styles.subtitle}>Select one issue to report</Text>
        </View>
        <BrandLogo size={42} />
      </View>
      <StepProgress step={1} total={4} label="Category" />

      <View style={styles.searchBox}>
        <Search size={18} color={COLORS.gray400} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search all 30 categories"
          placeholderTextColor={COLORS.gray400}
          style={styles.searchInput}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear search">
            <X size={18} color={COLORS.gray400} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {visible.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No matching categories</Text>
            <Text style={styles.emptyBody}>Try a different word, such as drain, road, or streetlight.</Text>
          </View>
        ) : (
          <>
            <CategoryGroup
              title="Municipal Maintenance"
              summary={CATEGORY_GROUPS.A.summary}
              categories={groupA}
              selectedId={selectedId}
              onSelect={selectCategory}
            />
            <CategoryGroup
              title="Infrastructure & Specialist Work"
              summary={CATEGORY_GROUPS.B.summary}
              categories={groupB}
              selectedId={selectedId}
              onSelect={selectCategory}
              sections={CATEGORY_SECTIONS}
            />
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {selected ? (
          <Text style={styles.selectedLabel} numberOfLines={1}>Selected: {selected.name}</Text>
        ) : null}
        <Pressable
          style={[styles.continueButton, !selected && styles.continueDisabled]}
          disabled={!selected}
          onPress={continueReport}
        >
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CategoryGroup({ title, summary, categories, selectedId, onSelect, sections }) {
  if (!categories.length) return null;

  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <Text style={styles.groupSummary}>{summary}</Text>
      {sections
        ? sections.map((section) => {
            const items = categories.filter((category) => category.section === section);
            if (!items.length) return null;
            return (
              <View key={section}>
                <Text style={styles.sectionTitle}>{section}</Text>
                {items.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    selected={category.id === selectedId}
                    onPress={() => onSelect(category.id)}
                  />
                ))}
              </View>
            );
          })
        : categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              selected={category.id === selectedId}
              onPress={() => onSelect(category.id)}
            />
          ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  headerCopy: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.gray900 },
  subtitle: { marginTop: 2, color: COLORS.gray500, fontSize: 13 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.gray900 },
  list: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.lg },
  group: { marginTop: SPACING.md },
  groupTitle: { fontSize: 16, fontWeight: '800', color: COLORS.gray900 },
  groupSummary: { marginTop: 4, marginBottom: SPACING.md, color: COLORS.gray500, fontSize: 13, lineHeight: 18 },
  sectionTitle: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  empty: {
    marginTop: SPACING.xxl,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.gray900 },
  emptyBody: { marginTop: 6, textAlign: 'center', color: COLORS.gray500, lineHeight: 20 },
  footer: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  continueButton: {
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  selectedLabel: { marginBottom: 8, color: COLORS.gray700, fontWeight: '600' },
  continueDisabled: { opacity: 0.45 },
  continueText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
