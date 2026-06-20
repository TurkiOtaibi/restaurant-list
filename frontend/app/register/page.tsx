"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { Button, StatusMessage, TasteMarkIcon, TextInput } from "@/components/ui";
import { ApiError, AuthResponse, apiRequest, saveAccessToken } from "@/lib/api";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const validation = validateAuthFields(email, password);
    setErrors(validation);
    if (validation.email || validation.password) {
      (validation.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password })
      });
      saveAccessToken(response.accessToken);
      router.push("/lists");
    } catch (caught) {
      setFormError(
        caught instanceof ApiError
          ? caught.message
          : "تعذر إنشاء الحساب."
      );
      emailRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="register-title">
        <div className="auth-card__header">
          <div className="auth-brand" aria-hidden="true">
            <TasteMarkIcon />
            <span>سجل</span>
          </div>
          <h1 id="register-title">إنشاء حساب</h1>
          <p className="muted">أنشئ حسابًا لحفظ قوائمك وأماكنك.</p>
        </div>

        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          <TextInput
            autoComplete="email"
            error={errors.email}
            id="register-email"
            label="البريد الإلكتروني"
            name="email"
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: undefined }));
              setFormError("");
            }}
            ref={emailRef}
            type="email"
            value={email}
          />
          <TextInput
            autoComplete="new-password"
            error={errors.password}
            id="register-password"
            label="كلمة المرور"
            name="password"
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined }));
              setFormError("");
            }}
            ref={passwordRef}
            type="password"
            value={password}
          />
          {formError ? <StatusMessage tone="error">{formError}</StatusMessage> : null}
          <Button className="ds-button--full" isLoading={submitting} type="submit">
            إنشاء حساب
          </Button>
        </form>

        <p className="auth-card__switch">
          لديك حساب؟ <Link href="/login">تسجيل الدخول</Link>
        </p>
      </section>
    </main>
  );
}

function validateAuthFields(email: string, password: string): FieldErrors {
  return {
    email: validEmail(email)
      ? undefined
      : "أدخل بريدًا صحيحًا.",
    password: password.trim()
      ? undefined
      : "كلمة المرور مطلوبة."
  };
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
