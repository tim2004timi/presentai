import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Presentation, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!login || !password || !confirmPassword) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов");
      return;
    }

    setIsLoading(true);

    // Simulate registration
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Регистрация успешна!");
    navigate("/dashboard");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Presentation className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">Present</span>
              <span className="text-foreground">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Создавайте презентации с помощью ИИ</span>
          </div>
        </div>

        {/* Register Card */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Регистрация</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                type="text"
                placeholder="Введите логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground text-sm">
              Уже есть аккаунт?{" "}
              <Link
                to="/"
                className="text-primary hover:underline font-medium"
              >
                Войти
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
