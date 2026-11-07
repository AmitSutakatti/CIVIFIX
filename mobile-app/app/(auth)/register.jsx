// app/(auth)/register.jsx
//
// Citizen registration screen.
// Calls POST /api/auth/signup via AuthContext.register().
// Phone must be a valid 10-digit Indian mobile number (backend enforces this).

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

// ── Validation schema ─────────────────────────────────────
// Phone validation mirrors isValidMobile() in backend/utils/phone.js
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number (starts with 6–9)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ confirmPassword, ...userData }) => {
    setLoading(true);
    try {
      const result = await register(userData);
      if (result.success) {
        const bonus = result.registrationBonus;
        if (bonus?.awarded) {
          Toast.show({
            type: 'success',
            text1: '🎉 Account Created!',
            text2: `Welcome! You received ${bonus.points} CivicFix points.`,
            visibilityTime: 4000,
          });
        } else {
          Toast.show({ type: 'success', text1: 'Account Created!', text2: 'Welcome to CivicFix.' });
        }
        router.replace('/(tabs)/');
      } else {
        Toast.show({ type: 'error', text1: 'Registration Failed', text2: result.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>CF</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join CivicFix and make your city better</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Field label="Full Name" error={errors.name}>
            <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
              <InputRow icon={<User size={18} color={COLORS.gray400} />} error={!!errors.name}>
                <TextInput
                  style={styles.input} placeholder="Your full name"
                  placeholderTextColor={COLORS.gray400}
                  autoCapitalize="words" value={value}
                  onChangeText={onChange} onBlur={onBlur}
                />
              </InputRow>
            )} />
          </Field>

          <Field label="Email Address" error={errors.email}>
            <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
              <InputRow icon={<Mail size={18} color={COLORS.gray400} />} error={!!errors.email}>
                <TextInput
                  style={styles.input} placeholder="you@example.com"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="email-address" autoCapitalize="none"
                  autoCorrect={false} value={value}
                  onChangeText={onChange} onBlur={onBlur}
                />
              </InputRow>
            )} />
          </Field>

          <Field label="Mobile Number" error={errors.phone}>
            <Controller control={control} name="phone" render={({ field: { onChange, onBlur, value } }) => (
              <InputRow icon={<Phone size={18} color={COLORS.gray400} />} error={!!errors.phone}>
                <TextInput
                  style={styles.input} placeholder="10-digit mobile (e.g. 9876543210)"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="phone-pad" maxLength={10}
                  value={value} onChangeText={onChange} onBlur={onBlur}
                />
              </InputRow>
            )} />
          </Field>

          <Field label="Password" error={errors.password}>
            <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
              <InputRow icon={<Lock size={18} color={COLORS.gray400} />} error={!!errors.password}>
                <TextInput
                  style={styles.input} placeholder="At least 6 characters"
                  placeholderTextColor={COLORS.gray400}
                  secureTextEntry={!showPassword}
                  value={value} onChangeText={onChange} onBlur={onBlur}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword ? <EyeOff size={18} color={COLORS.gray400} /> : <Eye size={18} color={COLORS.gray400} />}
                </TouchableOpacity>
              </InputRow>
            )} />
          </Field>

          <Field label="Confirm Password" error={errors.confirmPassword}>
            <Controller control={control} name="confirmPassword" render={({ field: { onChange, onBlur, value } }) => (
              <InputRow icon={<Lock size={18} color={COLORS.gray400} />} error={!!errors.confirmPassword}>
                <TextInput
                  style={styles.input} placeholder="Re-enter password"
                  placeholderTextColor={COLORS.gray400}
                  secureTextEntry={!showConfirm}
                  value={value} onChangeText={onChange} onBlur={onBlur}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                  {showConfirm ? <EyeOff size={18} color={COLORS.gray400} /> : <Eye size={18} color={COLORS.gray400} />}
                </TouchableOpacity>
              </InputRow>
            )} />
          </Field>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Bottom padding for keyboard */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Reusable sub-components for this screen ───────────────
function Field({ label, error, children }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error && <Text style={styles.errorText}>{error.message}</Text>}
    </View>
  );
}

function InputRow({ icon, error, children }) {
  return (
    <View style={[styles.inputRow, error && styles.inputError]}>
      <View style={styles.icon}>{icon}</View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.primary },
  container: { flexGrow: 1, padding: SPACING.lg, paddingTop: SPACING.xxl },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
    elevation: 8,
  },
  logoText: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.white },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16,
    elevation: 10,
  },
  fieldGroup: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.gray700, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray50, paddingHorizontal: SPACING.md, height: 50,
  },
  inputError: { borderColor: COLORS.error },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.gray900 },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4 },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    height: 52, justifyContent: 'center', alignItems: 'center',
    marginTop: SPACING.sm,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  footerText: { color: COLORS.gray500, fontSize: 14 },
  link: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
