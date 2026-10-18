import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseClient, isSupabaseConfigured } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { COMPANY } from "@/lib/company";
import logo from "@/assets/khater-brand.svg";

type Mode = "signin" | "signup";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>(window.location.pathname.endsWith("/signup") ? "signup" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const nextPath = searchParams.get("next");
  const destination = nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isSupabaseConfigured) {
      setError("Workspace sign-in is not connected yet. The site owner must configure the approved Khater Property Consultant & Builders Supabase project before accounts can be created.");
      return;
    }

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      const client = getSupabaseClient();
      if (mode === "signup") {
        const { data, error: authError } = await client.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (authError) throw authError;
        if (data.session) {
          navigate(destination, { replace: true });
        } else {
          setMessage("Account request received. Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      } else {
        const { error: authError } = await client.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (authError) throw authError;
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not complete sign-in. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const sendResetLink = async () => {
    setError("");
    setMessage("");
    if (!isSupabaseConfigured) {
      setError("Password recovery becomes available after the Khater Property Consultant & Builders authentication project is configured.");
      return;
    }
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setBusy(true);
    try {
      const { error: resetError } = await getSupabaseClient().auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/login` },
      );
      if (resetError) throw resetError;
      setMessage("If this email belongs to an account, password recovery instructions will be sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not request a password reset.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <SEO title="Sign in | Khater Property Consultant & Builders Workspace" description="Secure sign-in for Khater Property Consultant & Builders workspace users." path="/login" robots="noindex,nofollow" />
      <div className="mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center">
        <Link to="/" className="mb-8 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Khater Property Consultant & Builders
        </Link>

        <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-xl lg:grid-cols-[1fr_0.9fr]">
          <section className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-luxe p-10 text-luxe-foreground lg:flex">
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
            <div className="relative">
              <div className="inline-flex rounded-2xl bg-white p-3">
                <img src={logo} alt={COMPANY.name} className="h-16 w-auto object-contain" />
              </div>
              <p className="mt-10 text-xs uppercase tracking-[0.25em] text-gold">KHATER WORKSPACE</p>
              <h1 className="mt-4 max-w-lg text-4xl font-light leading-tight">
                One workspace for your property business.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-luxe-foreground/80">
                Manage listings, customer enquiries, projects, team activity, events and promotions from one place.
              </p>
            </div>
            <div className="relative flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <p className="text-sm leading-6 text-luxe-foreground/80">
                Your business data should only be available to the people authorised to see it. Access is controlled by your account and business role.
              </p>
            </div>
          </section>

          <section className="flex items-center p-6 sm:p-10 lg:p-12">
            <Card className="w-full border-0 shadow-none">
              <CardHeader className="px-0 pt-0">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">Welcome</p>
                <CardTitle className="mt-2 text-3xl font-light text-primary">
                  {mode === "signin" ? "Sign in to your workspace" : "Create your account"}
                </CardTitle>
                <CardDescription className="text-sm leading-6">
                  {mode === "signin"
                    ? "Continue to your personal or business dashboard."
                    : "Start with your own account. A business workspace can be created after sign-in."}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-0 pb-0">
                {!isSupabaseConfigured && (
                  <div role="status" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                    Authentication is not connected in this deployment yet. No fake login is provided. Configure the approved Khater Property Consultant & Builders Supabase project to enable real accounts.
                  </div>
                )}
                {error && <div role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
                {message && <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-foreground">{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Full name</Label>
                      <Input id="full-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} placeholder="Your full name" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="password">Password</Label>
                      {mode === "signin" && (
                        <button type="button" onClick={sendResetLink} disabled={busy} className="text-xs text-primary underline-offset-4 hover:underline disabled:opacity-50">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} placeholder="At least 8 characters" className="pr-12" />
                      <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-3 inline-flex items-center text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="h-12 w-full" disabled={busy || !isSupabaseConfigured}>
                    {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {mode === "signin" ? "Sign in" : "Create account"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  {mode === "signin" ? "New to Khater Property Consultant & Builders Workspace?" : "Already have an account?"}{" "}
                  <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }} className="font-medium text-primary underline-offset-4 hover:underline">
                    {mode === "signin" ? "Create account" : "Sign in"}
                  </button>
                </p>
                <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
                  By continuing, you agree to use Khatir responsibly and protect any customer information you access.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Auth;
