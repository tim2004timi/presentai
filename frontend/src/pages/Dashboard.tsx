import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Plus,
  Search,
  LogOut,
  Presentation,
  Calendar,
  Layers,
  ChevronDown,
  Sparkles,
  User,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { presentationsApi } from "@/lib/api.ts";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: presentations = [], isLoading } = useQuery({
    queryKey: ["presentations"],
    queryFn: () => presentationsApi.getAll(),
  });

  const filteredPresentations = presentations.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Presentation className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold hidden sm:block">
              <span className="gradient-text">Present</span>
              <span className="text-foreground">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline text-sm font-medium">OpenAI GPT-4</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user?.login || "Пользователь"}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Добро пожаловать в{" "}
            <span className="gradient-text">PresentAI</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Создавайте профессиональные презентации за считанные минуты
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up">
          <Button
            size="lg"
            onClick={() => navigate("/create")}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Создать презентацию
          </Button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Поиск презентаций..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Мои презентации</h2>

          {isLoading ? (
            <div className="glass-card p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Загрузка презентаций...</p>
            </div>
          ) : filteredPresentations.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Presentation className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Презентации не найдены</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Попробуйте изменить поисковый запрос"
                  : "Создайте свою первую презентацию"}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate("/create")} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Создать презентацию
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPresentations.map((presentation, index) => (
                <div
                  key={presentation.id}
                  onClick={() => navigate(`/presentation/${presentation.id}`)}
                  className="glass-card-hover p-5 cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Presentation className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {presentation.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(presentation.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
