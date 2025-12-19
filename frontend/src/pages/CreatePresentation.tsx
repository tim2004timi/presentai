import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Download,
  FileText,
  Loader2,
  Check,
  Presentation,
} from "lucide-react";
import { toast } from "sonner";

interface Slide {
  id: string;
  order: number;
  title: string;
  content: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

const CreatePresentation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 state
  const [title, setTitle] = useState(id ? "Квартальный отчёт Q4 2024" : "");
  const [slideCount, setSlideCount] = useState(8);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // Step 2 state
  const [slides, setSlides] = useState<Slide[]>([]);

  // Step 3 state - mock PDF
  const pdfUrl = "https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg";

  const steps = [
    { number: 1, label: "Ввод данных" },
    { number: 2, label: "Редактирование" },
    { number: 3, label: "Просмотр" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    const newFiles: UploadedFile[] = Array.from(uploadedFiles).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    toast.success(`Загружено ${newFiles.length} файл(ов)`);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " Б";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
    return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
  };

  const handleStep1Next = async () => {
    if (!title.trim()) {
      toast.error("Введите название презентации");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock slides
    const mockSlides: Slide[] = Array.from({ length: slideCount }, (_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      order: i + 1,
      title: `Слайд ${i + 1}: ${
        i === 0
          ? "Введение"
          : i === slideCount - 1
          ? "Заключение"
          : `Раздел ${i}`
      }`,
      content:
        i === 0
          ? "Краткое описание содержания презентации и основных тем."
          : i === slideCount - 1
          ? "Подведение итогов и ключевые выводы презентации."
          : `Основной контент для слайда ${i + 1}. Здесь будет размещена информация по теме раздела.`,
    }));

    setSlides(mockSlides);
    setIsLoading(false);
    setCurrentStep(2);
  };

  const handleStep2Next = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setCurrentStep(3);
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const newSlides = [...slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [
      newSlides[targetIndex],
      newSlides[index],
    ];

    // Update order numbers
    newSlides.forEach((slide, i) => {
      slide.order = i + 1;
    });

    setSlides(newSlides);
  };

  const deleteSlide = (id: string) => {
    const newSlides = slides
      .filter((s) => s.id !== id)
      .map((slide, i) => ({ ...slide, order: i + 1 }));
    setSlides(newSlides);
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: Math.random().toString(36).substr(2, 9),
      order: slides.length + 1,
      title: `Новый слайд ${slides.length + 1}`,
      content: "Введите содержимое слайда",
    };
    setSlides([...slides, newSlide]);
  };

  const updateSlide = (id: string, field: "title" | "content", value: string) => {
    setSlides((prev) =>
      prev.map((slide) =>
        slide.id === id ? { ...slide, [field]: value } : slide
      )
    );
  };

  const handleDownload = (format: "pptx" | "pdf") => {
    toast.success(`Скачивание ${format.toUpperCase()} файла...`);
  };

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

          {/* Step Indicator */}
          <div className="flex items-center gap-2 sm:gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`step-indicator ${
                    currentStep === step.number
                      ? "active"
                      : currentStep > step.number
                      ? "completed"
                      : "pending"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden md:block ${
                    currentStep === step.number
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                      currentStep > step.number
                        ? "bg-primary"
                        : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="w-20" /> {/* Spacer for alignment */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Step 1: Input */}
        {currentStep === 1 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Создание презентации</h1>
              <p className="text-muted-foreground">
                Заполните информацию для генерации презентации
              </p>
            </div>

            <div className="glass-card p-6 sm:p-8 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Название презентации *</Label>
                <Input
                  id="title"
                  placeholder="Введите название..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Slide Count */}
              <div className="space-y-2">
                <Label htmlFor="slideCount">Количество слайдов</Label>
                <Input
                  id="slideCount"
                  type="number"
                  min={3}
                  max={50}
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="max-w-[150px]"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Описание содержания</Label>
                <Textarea
                  id="description"
                  placeholder="Опишите, о чём должна быть презентация..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <Label>Загрузка файлов (опционально)</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-dashed gap-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Нажмите для загрузки файлов</span>
                </Button>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next Button */}
              <Button
                onClick={handleStep1Next}
                disabled={isLoading}
                size="lg"
                className="w-full gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Генерация структуры...
                  </>
                ) : (
                  <>
                    Далее
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Edit Slides */}
        {currentStep === 2 && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-muted-foreground">
                Редактирование структуры слайдов
              </p>
            </div>

            {isLoading ? (
              <div className="glass-card p-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg font-medium">Генерация слайдов...</p>
                <p className="text-muted-foreground">Это может занять некоторое время</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="glass-card p-5 animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Order & Controls */}
                        <div className="flex flex-col items-center gap-1 pt-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                            {slide.order}
                          </div>
                          <div className="flex flex-col gap-1 mt-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7"
                              onClick={() => moveSlide(index, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7"
                              onClick={() => moveSlide(index, "down")}
                              disabled={index === slides.length - 1}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-3">
                          <Input
                            value={slide.title}
                            onChange={(e) =>
                              updateSlide(slide.id, "title", e.target.value)
                            }
                            className="font-semibold"
                            placeholder="Название слайда"
                          />
                          <Textarea
                            value={slide.content}
                            onChange={(e) =>
                              updateSlide(slide.id, "content", e.target.value)
                            }
                            placeholder="Содержимое слайда..."
                            className="min-h-[100px]"
                          />
                        </div>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSlide(slide.id)}
                          className="text-muted-foreground hover:text-destructive"
                          disabled={slides.length <= 1}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Slide Button */}
                <Button
                  variant="outline"
                  onClick={addSlide}
                  className="w-full gap-2 border-dashed h-14"
                >
                  <Plus className="w-5 h-5" />
                  Добавить слайд
                </Button>

                {/* Next Button */}
                <Button
                  onClick={handleStep2Next}
                  disabled={isLoading}
                  size="lg"
                  className="w-full gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Генерация презентации...
                    </>
                  ) : (
                    <>
                      Далее
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Step 3: Preview & Download */}
        {currentStep === 3 && (
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
                  PPTX
                </Button>
                <Button
                  onClick={() => handleDownload("pdf")}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
              </div>
            </div>

            {/* PDF Preview Placeholder */}
            <div className="glass-card overflow-hidden">
              <div className="aspect-[4/3] bg-secondary/30 flex items-center justify-center relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                  <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Presentation className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Предварительный просмотр</h3>
                    <p className="text-muted-foreground max-w-md">
                      Здесь будет отображаться сгенерированная презентация в формате PDF
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {slides.slice(0, 6).map((slide) => (
                      <div
                        key={slide.id}
                        className="w-24 h-16 bg-card border border-border rounded-lg flex items-center justify-center text-xs font-medium text-muted-foreground"
                      >
                        {slide.order}
                      </div>
                    ))}
                    {slides.length > 6 && (
                      <div className="w-24 h-16 bg-card border border-border rounded-lg flex items-center justify-center text-xs font-medium text-muted-foreground">
                        +{slides.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Dashboard */}
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
        )}
      </main>
    </div>
  );
};

export default CreatePresentation;
