import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/theme';

const LOGO = require('../../assets/civicfix-logo.png');

export default function AppLoadingScreen() {
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.9));

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 12,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]);
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.04,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    entrance.start(({ finished }) => {
      if (finished) pulse.start();
    });

    return () => {
      entrance.stop();
      pulse.stop();
    };
  }, [opacity, scale]);

  return (
    <View style={styles.screen}>
      <Animated.Image
        source={LOGO}
        style={[styles.logo, { opacity, transform: [{ scale }] }]}
        resizeMode="contain"
        accessible
        accessibilityLabel="CivicFix user"
      />
      <Text style={styles.caption}>Making your city better</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  logo: { width: 220, height: 220 },
  caption: {
    marginTop: 16,
    color: COLORS.gray600,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
