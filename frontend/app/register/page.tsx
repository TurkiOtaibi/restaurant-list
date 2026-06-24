"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { Button, StatusMessage, TasteMarkIcon, TextInput } from "@/components/ui";
import { ApiError, AuthResponse, apiRequest, saveAccessToken } from "@/lib/api";

type FieldErrors = {
  displayName?: string;
  email?: string;
  password?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const displayNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    displayNameRef.current?.focus();
  }, []);

  function currentValues() {
    return {
      displayName: displayNameRef.current?.value ?? displayName,
      email: emailRef.current?.value ?? email,
      password: passwordRef.current?.value ?? password
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const values = currentValues();
    const validation = validateAuthFields(values.displayName, values.email, values.password);
    setErrors(validation);
    if (validation.displayName || validation.email || validation.password) {
      (validation.displayName ? displayNameRef : validation.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify({
          displayName: values.displayName.trim(),
          email: values.email,
          password: values.password
        })
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
            autoComplete="name"
            error={errors.displayName}
            id="register-display-name"
            label="اسم العرض"
            name="displayName"
            onChange={(event) => {
              setDisplayName(event.target.value);
              setErrors((current) => ({ ...current, displayName: undefined }));
              setFormError("");
            }}
            ref={displayNameRef}
            value={displayName}
          />
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

function validateAuthFields(displayName: string, email: string, password: string): FieldErrors {
  return {
    displayName: displayName.trim()
      ? undefined
      : "اسم العرض مطلوب.",
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
