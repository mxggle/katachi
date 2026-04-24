'use client';

import { FormEvent, useState } from 'react';
import { isGoogleAuthEnabled } from '@/lib/supabase/config';
import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from './AuthProvider';

export default function LoginForm() {
  const { supabase, isConfigured, isLoading } = useAuth();
  const language = useStore((state) => state.language);
  const { t } = useTranslation(language);
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleEnabled = isGoogleAuthEnabled();

  const handleOtpRequest = async () => {
    if (!supabase) return;
    const result = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setStep('verify');
    setMessage(t('otpSent'));
  };

  const handleOtpVerify = async () => {
    if (!supabase) return;
    const result = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (result.error) {
      setError(t('invalidOtp'));
      return;
    }

    setMessage(t('signedIn'));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setError(t('authUnavailable'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (step === 'request') {
        await handleOtpRequest();
      } else {
        await handleOtpVerify();
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : t('authUnexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (!supabase || typeof window === 'undefined') {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const oauthResult = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthResult.error) {
        setError(oauthResult.error.message);
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : t('authUnexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="rounded-[1.5rem] border-[3px] border-[color:var(--ink)] bg-white px-5 py-4 text-sm font-bold text-[color:var(--muted)] shadow-[4px_4px_0px_0px_var(--ink)]">
        {t('localMode')}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-[1.5rem] border-[3px] border-[color:var(--ink)] bg-white p-5 shadow-[5px_5px_0px_0px_var(--ink)]"
    >
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">
          {t('account')}
        </p>
        <h2 className="mt-1 text-xl font-black text-[color:var(--ink)]">
          {t('signIn')}
        </h2>
        {step === 'request' && (
          <p className="mt-2 text-xs font-bold leading-relaxed text-[color:var(--muted)]">
            {t('otpNotice')}
          </p>
        )}
      </div>

      <label className="flex flex-col gap-1 text-sm font-bold text-[color:var(--ink)]">
        {t('email')}
        <input
          type="email"
          autoComplete="email"
          required
          disabled={step === 'verify'}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-11 rounded-xl border-2 border-[color:var(--ink)] px-3 text-base font-semibold outline-none focus:ring-4 focus:ring-[color:var(--accent-soft)] disabled:bg-[color:var(--ink)]/5"
        />
      </label>

      {step === 'verify' && (
        <label className="flex flex-col gap-1 text-sm font-bold text-[color:var(--ink)]">
          {t('enterOtp')}
          <input
            type="text"
            required
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            className="min-h-11 rounded-xl border-2 border-[color:var(--ink)] px-3 text-center text-2xl font-black tracking-[0.5em] outline-none focus:ring-4 focus:ring-[color:var(--accent-soft)]"
          />
        </label>
      )}

      {error && <p className="rounded-xl bg-[#fff1f2] px-3 py-2 text-sm font-bold text-[#b42318]">{error}</p>}
      {message && <p className="rounded-xl bg-[color:var(--accent-soft)] px-3 py-2 text-sm font-bold text-[color:var(--ink)]">{message}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="min-h-11 rounded-full border-[2px] border-[color:var(--ink)] bg-[color:var(--accent)] px-5 py-2 text-sm font-black text-white shadow-[3px_3px_0px_0px_var(--ink)] transition-all disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? t('working') : step === 'request' ? t('signIn') : t('verify')}
      </button>

      {step === 'verify' && (
        <button
          type="button"
          onClick={() => setStep('request')}
          className="text-sm font-bold text-[color:var(--muted)] underline decoration-2 underline-offset-4"
        >
          {t('resendOtp')}
        </button>
      )}

      {googleEnabled && (
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isSubmitting || isLoading}
          className="min-h-11 rounded-full border-[2px] border-[color:var(--ink)] bg-white px-5 py-2 text-sm font-black text-[color:var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)] transition-all disabled:cursor-wait disabled:opacity-60"
        >
          {t('continueWithGoogle')}
        </button>
      )}
    </form>
  );
}
