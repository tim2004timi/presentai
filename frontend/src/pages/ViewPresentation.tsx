import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.tsx";
import {
  ArrowLeft,
  Download,
  FileText,
  Presentation,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { presentationsApi } from "@/lib/api.ts";

const ViewPresentation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const presentationId = id ? parseInt(id, 10) : null;

  const { data: presentation, isLoading } = useQuery({
    queryKey: ["presentation", presentationId],
    queryFn: () => presentationsApi.getById(presentationId!),
    enabled: !!presentationId,
  });

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useQuery({
    queryKey: ["presentation-pdf", presentation?.filename],
    queryFn: async () => {
      if (!presentation?.filename) return null;
      const baseFilename = presentation.filename.replace(/\.(pptx|pdf)$/, "");
      const filename = `${baseFilename}.pdf`;
      
      try {
        const blob = await presentationsApi.getFile(filename);
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        return url;
      } catch (error) {
        console.error("Failed to load PDF:", error);
        return null;
      }
    },
    enabled: !!presentation?.filename,
  });

  const handleDownload = async (format: "pptx" | "pdf") => {
    if (!presentation?.filename) {
      toast.error("Файл презентации не найден");
      return;
    }

    try {
      const baseFilename = presentation.filename.replace(/\.(pptx|pdf)$/, "");
      await presentationsApi.downloadFile(baseFilename, format);
      toast.success(`Файл ${format.toUpperCase()} скачан успешно`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка при скачивании файла";
      toast.error(message);
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка презентации...</p>
        </div>
      </div>
    );
  }

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

  const title = presentation.title || "Презентация";

  return (
    <div className="min-h-screen bg-background">
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

          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-fade-in space-y-6">
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

          <div className="glass-card p-4 sm:p-6">
            <div className="aspect-[4/3] bg-secondary/30 rounded-lg overflow-hidden">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Загрузка презентации...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

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
