import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  TreePine,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAdminSession } from "../hooks/useAdminSession";
import { useAdminLogin } from "../hooks/useQueries";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setToken } = useAdminSession();
  const loginMutation = useAdminLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    try {
      const token = await loginMutation.mutateAsync({ username, password });
      if (token) {
        setToken(token);
        navigate({ to: "/admin/dashboard" });
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[oklch(0.38_0.10_145_/_0.12)] mb-4">
            <TreePine className="w-8 h-8 text-forest" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
            Admin Toegang
          </h1>
          <p className="text-muted-foreground text-sm">
            Meld u aan voor het beheerderspaneel van het Natuur-Feedback systeem
          </p>
        </div>

        <div className="nature-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="admin-username" className="text-sm font-medium">
                Gebruikersnaam
              </Label>
              <Input
                id="admin-username"
                data-ocid="admin.username_input"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(false);
                }}
                autoComplete="username"
                placeholder="Gebruikersnaam"
                disabled={loginMutation.isPending}
                className="border-border bg-background"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-sm font-medium">
                Wachtwoord
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  data-ocid="admin.password_input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  autoComplete="current-password"
                  placeholder="Wachtwoord"
                  disabled={loginMutation.isPending}
                  className="border-border bg-background pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                data-ocid="admin.error_state"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Verkeerde gebruikersnaam of wachtwoord</span>
              </motion.div>
            )}

            {/* Submit */}
            <Button
              data-ocid="admin.login_button"
              type="submit"
              disabled={loginMutation.isPending || !username || !password}
              size="lg"
              className="w-full bg-forest text-primary-foreground hover:bg-forest/90 rounded-xl font-semibold"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aanmelden...
                </>
              ) : (
                "Inloggen"
              )}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar leerkrachtenportaal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
