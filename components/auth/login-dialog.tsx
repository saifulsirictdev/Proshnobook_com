"use client";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Gift, X, Eye, EyeOff } from "lucide-react";
import { login, register, googleLogin } from "@/app/actions/auth";
import "./login-dialog.css";

function GoogleButton() {
  const { pending } = useFormStatus();
  return (
    <button className="qm-login-google" disabled={pending}>
      <svg width="25" height="25" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"
        />
        <path
          fill="#FBBC05"
          d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
        />
      </svg>
      {pending ? "সংযোগ হচ্ছে…" : "Continue with Google"}
    </button>
  );
}
function PasswordField({
  confirm = false,
  mode,
}: {
  confirm?: boolean;
  mode: "login" | "register";
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label>
      {confirm ? "পাসওয়ার্ড নিশ্চিত করুন" : "পাসওয়ার্ড"}
      <span className="qm-password-wrap">
        <input
          name={confirm ? "confirmPassword" : "password"}
          type={visible ? "text" : "password"}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          required
          placeholder={confirm ? "আবার পাসওয়ার্ড লিখুন" : "আপনার পাসওয়ার্ড লিখুন"}
          onInput={(e) => e.currentTarget.setCustomValidity("")}
          onBlur={(e) => {
            if (confirm) {
              const password = e.currentTarget.form?.elements.namedItem(
                "password",
              ) as HTMLInputElement | null;
              e.currentTarget.setCustomValidity(
                password?.value === e.currentTarget.value
                  ? ""
                  : "দুটি পাসওয়ার্ড মেলেনি।",
              );
            }
          }}
        />
        <button
          type="button"
          className="qm-password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </span>
    </label>
  );
}
function Credentials({
  next,
  mode,
}: {
  next: string;
  mode: "login" | "register";
}) {
  const [error, action, pending] = useActionState(
    mode === "login" ? login : register,
    "",
  );
  return (
    <form
      action={action}
      className="qm-login-credentials"
      onSubmit={(e) => {
        if (mode === "register") {
          const form = e.currentTarget;
          const password = form.elements.namedItem(
            "password",
          ) as HTMLInputElement;
          const confirm = form.elements.namedItem(
            "confirmPassword",
          ) as HTMLInputElement;
          confirm.setCustomValidity(
            password.value === confirm.value ? "" : "দুটি পাসওয়ার্ড মেলেনি।",
          );
          if (!form.reportValidity()) e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="next" value={next} />
      {mode === "register" && (
        <label>
          পূর্ণ নাম
          <input
            name="name"
            autoComplete="name"
            placeholder="আপনার পূর্ণ নাম লিখুন"
            required
            minLength={2}
          />
        </label>
      )}
      <label>
        ইমেইল
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="আপনার ইমেইল লিখুন"
          required
        />
      </label>
      <PasswordField mode={mode} />
      {mode === "register" && <PasswordField mode={mode} confirm />}
      <small>পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।</small>
      {error && (
        <p role="alert" className="qm-login-error">
          {error}
        </p>
      )}
      <button className="qm-login-primary" disabled={pending}>
        {pending
          ? "অপেক্ষা করুন…"
          : mode === "login"
            ? "লগইন করুন"
            : "অ্যাকাউন্ট তৈরি করুন"}
      </button>
    </form>
  );
}
/** Native modal gives background inertness/focus containment, including forms/links behind it. */
export default function LoginDialog({
  next = "/",
  initialMode = "login",
}: {
  next?: string;
  initialMode?: "login" | "register";
}) {
  const router = useRouter(),
    dialog = useRef<HTMLDialogElement>(null),
    heading = useId(),
    description = useId(),
    formId = useId();
  const [email, setEmail] = useState(true),
    [mode, setMode] = useState<"login" | "register">(initialMode);
  const close = () => router.replace("/");
  useEffect(() => {
    const el = dialog.current;
    const previous = document.body.style.overflow;
    // Server-rendered open fallback remains visible before hydration; upgrade to top-layer modal.
    if (el) {
      if (el.open) el.close();
      el.showModal();
    }
    document.body.style.overflow = "hidden";
    return () => {
      el?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      open
      ref={dialog}
      className="qm-login-dialog"
      aria-labelledby={heading}
      aria-describedby={description}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const controls = Array.from(
          e.currentTarget.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input:not([type=hidden]):not(:disabled),a[href],select:not(:disabled),textarea:not(:disabled)",
          ),
        ).filter((el) => el.getClientRects().length > 0);
        const first = controls[0],
          last = controls[controls.length - 1];
        if (!first) {
          e.preventDefault();
          return;
        }
        if (
          !controls.includes(document.activeElement as HTMLElement) ||
          (e.shiftKey && document.activeElement === first) ||
          (!e.shiftKey && document.activeElement === last)
        ) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <button
        type="button"
        className="qm-login-close"
        aria-label="লগইন বন্ধ করুন"
        onClick={close}
        autoFocus
      >
        <X size={20} />
      </button>
      <div className="qm-login-brand">
        <img src="/proshnobook-p-logo.png" width={36} height={36} alt="" className="qm-login-mark" />
        প্রশ্নবুক<span>.কম</span>
      </div>
      <h1 id={heading}>
        {mode === "login" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
      </h1>
      <p id={description} className="qm-login-description">
        লগইন করে প্রশ্ন তৈরি শুরু করুন।
      </p>
      <span className="qm-login-bonus">
        <Gift size={19} aria-hidden="true" /> প্রথম লগইনে ৳২০ বোনাস
      </span>
      <form action={googleLogin} className="qm-login-google-form">
        <input type="hidden" name="next" value={next} />
        <GoogleButton />
      </form>
      {!email && (
        <button
          type="button"
          className="qm-login-primary"
          aria-expanded={email}
          aria-controls={formId}
          onClick={() => setEmail(true)}
        >
          লগইন করুন
        </button>
      )}
      <div className="qm-login-divider">
        <span>অথবা</span>
      </div>
      <div id={formId}>
        {email && (
          <>
            <Credentials key={mode} next={next} mode={mode} />
            <button
              type="button"
              className="qm-login-switch"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login"
                ? "নতুন ব্যবহারকারী? অ্যাকাউন্ট তৈরি করুন"
                : "অ্যাকাউন্ট আছে? লগইন করুন"}
            </button>
          </>
        )}
      </div>
      <p className="qm-login-footnote">
        লগইন করলেই শ্রেণি, বিষয় ও অধ্যায় বেছে প্রশ্ন তৈরি শুরু করতে পারবেন।
      </p>
    </dialog>
  );
}
