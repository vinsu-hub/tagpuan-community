import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

function redirectTarget(): string {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("redirect");
  if (raw && raw.startsWith("/")) return raw;
  return "/admin";
}

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setLocation(redirectTarget());
    });
  }, [setLocation]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message || "Could not sign in. Check your details.");
      return;
    }
    window.location.assign(redirectTarget());
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "#f5efe4",
        color: "#3a2c1e",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fffdf8",
          border: "1px solid #e0d4bf",
          borderRadius: 14,
          padding: "2rem",
          boxShadow: "0 18px 40px -24px rgba(58,44,30,0.4)",
        }}
      >
        <img
          src="/assets/tagpuan/mark.png"
          alt="Tagpuan"
          width={52}
          height={52}
          style={{ display: "block", marginBottom: "0.75rem" }}
        />
        <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.25rem" }}>
          Tagpuan Admin
        </h1>
        <p style={{ margin: "0 0 1.5rem", fontSize: "0.9rem", opacity: 0.75 }}>
          Sign in to manage the community.
        </p>

        <label
          style={{ display: "block", fontSize: "0.8rem", marginBottom: 4 }}
        >
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          autoComplete="email"
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label
          style={{
            display: "block",
            fontSize: "0.8rem",
            margin: "1rem 0 4px",
          }}
        >
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          autoComplete="current-password"
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error ? (
          <p
            role="alert"
            style={{ color: "#a3412b", fontSize: "0.85rem", marginTop: 12 }}
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: "1.5rem",
            width: "100%",
            padding: "0.7rem",
            borderRadius: 10,
            border: "none",
            background: "#b4552d",
            color: "#fff",
            fontSize: "0.95rem",
            cursor: submitting ? "wait" : "pointer",
          }}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.7rem",
  borderRadius: 8,
  border: "1px solid #d8c9ae",
  background: "#fff",
  fontSize: "0.95rem",
  fontFamily: "inherit",
};
