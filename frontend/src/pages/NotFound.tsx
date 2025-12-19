import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-destructive/10 rounded-full blur-[120px]" />
      </div>

      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-6xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Страница не найдена
        </p>
        <Button asChild size="lg" className="gap-2">
          <a href="/presentai/frontend/public">
            <Home className="w-5 h-5" />
            Вернуться на главную
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
