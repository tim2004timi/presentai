import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import {
  ArrowLeft,
  Download,
  FileText,
  Presentation,
} from "lucide-react";
import { toast } from "sonner";

// Mock data for presentations
const mockPresentations: Record<string, { name: string; slides: number }> = {
  "1": { name: "Квартальный отчёт Q4 2024", slides: 12 },
  "2": { name: "Маркетинговая стратегия 2025", slides: 8 },
  "3": { name: "Презентация продукта", slides: 15 },
  "4": { name: "Обучение новых сотрудников", slides: 20 },
};

const ViewPresentation = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const presentation = id ? mockPresentations[id] : null;
  const title = presentation?.name || "Презентация";

  // Mock PDF preview image
  const pdfUrl = "https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg";

  const handleDownload = (format: "pptx" | "pdf") => {
    toast.success(`Скачивание ${format.toUpperCase()} файла...`);
  };

  if (!presentation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <Presentation className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Презентация не найдена</h2>
          <p className="text-muted-foreground mb-6">
            Запрашиваемая презентация не существует или была удалена
          </p>
          <Button onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Назад</span>
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Presentation className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold hidden sm:block">Просмотр презентации</span>
          </div>

          <div className="w-20" /> {/* Spacer for alignment */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-fade-in space-y-6">
          {/* Title and Download Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-muted-foreground">
                Просмотр и скачивание презентации
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleDownload("pptx")}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Скачать</span> PPTX
              </Button>
              <Button
                onClick={() => handleDownload("pdf")}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Скачать</span> PDF
              </Button>
            </div>
          </div>

          {/* PDF Preview */}
          <div className="glass-card p-4 sm:p-6">
            <div className="aspect-[4/3] bg-secondary/30 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={pdfUrl}
                alt="Превью презентации"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          {/* Navigation */}
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="w-full gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Вернуться на главную
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ViewPresentation;
