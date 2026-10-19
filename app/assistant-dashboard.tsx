"use client";

import {
  Activity,
  AlertTriangle,
  AudioLines,
  Camera,
  Check,
  CircleHelp,
  Glasses,
  ImagePlus,
  Languages,
  LoaderCircle,
  Mic2,
  Radio,
  ScanEye,
  Settings2,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Webcam,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

type Language = "ar" | "en";
type Task = "describe" | "obstacles";
type Status = "ready" | "camera" | "analyzing" | "speaking" | "error";
type ActivityItem = { id: number; task: Task; text: string; time: string };

const copy = {
  ar: {
    brand: "عينك المساعدة",
    subtitle: "مساعد الرؤية الذكي",
    eyeglass: "النظارة",
    disconnected: "غير متصلة",
    camera: "كاميرا الجهاز",
    running: "تعمل",
    stopped: "متوقفة",
    title: "لوحة المساعدة الذكية",
    intro: "شغّل كاميرا جهازك لتحليل المشهد عند الطلب. لا تُرسل أي صورة للتحليل إلا عندما تختار ذلك.",
    operational: "المساعد جاهز",
    starting: "جارٍ فتح الكاميرا...",
    start: "بدء المساعدة الذكية",
    stop: "إيقاف المساعدة",
    preview: "المشاهدة المباشرة من كاميرا جهازك",
    previewHint: "اسمح بالوصول إلى الكاميرا لعرض المشهد والتقاط صورة للتحليل عند الطلب.",
    allowCamera: "تشغيل الكاميرا",
    cameraUnsupported: "لا يدعم هذا المتصفح الكاميرا. اختر صورة بدلاً من ذلك.",
    cameraDenied: "تعذّر فتح الكاميرا. تحقّق من إذن المتصفح واستخدم اتصال HTTPS.",
    pickImage: "اختيار صورة",
    takePhoto: "تصوير الآن",
    chosen: "صورة مختارة",
    clearImage: "إزالة الصورة",
    controls: "أوامر المساعدة",
    describe: "صِف ما أمامي الآن",
    obstacle: "تحقّق من العوائق المحتملة",
    describeHint: "وصف موجز للأشياء والمشهد الظاهر.",
    obstacleHint: "ملاحظة بصرية لاحتمال وجود عائق ظاهر.",
    working: "جارٍ تحليل الصورة...",
    settings: "إعدادات الصوت",
    language: "لغة الوصف",
    arabic: "العربية",
    english: "English",
    speechSpeed: "سرعة الكلام",
    speechVolume: "مستوى الصوت",
    listen: "قراءة الوصف صوتيًا",
    stopSpeech: "إيقاف الصوت فورًا",
    speechUnsupported: "ميزة النطق الصوتي غير مدعومة في هذا المتصفح.",
    activity: "آخر الأوصاف والتنبيهات",
    emptyHistory: "ستظهر أحدث نتائج التحليل هنا.",
    description: "وصف المشهد",
    obstacleResult: "ملاحظة العوائق",
    emptyResult: "ابدأ المساعدة أو اختر صورة، ثم اطلب وصف المشهد أو فحص العوائق المحتملة.",
    serviceMissing: "خدمة تحليل الصور غير مُعدّة بعد. أضف مفتاح OPENAI_API_KEY إلى إعدادات الخادم.",
    serviceError: "تعذّر تحليل الصورة. تحقّق من اتصال الخدمة وحاول مجددًا.",
    uploadError: "اختر صورة JPEG أو PNG أو WebP لا يتجاوز حجمها 16 ميغابايت.",
    consent: "كل طلب يحلّل صورة واحدة بعد ضغطك على الزر. تُرسل الصورة إلى مزوّد التحليل عند تهيئة الخدمة.",
    safety: "مساندة وصفية وليست نظام ملاحة أو ضمانًا لتجنّب المخاطر. استخدم وسائل السلامة المعتادة.",
    glassesNote: "اتصال النظارة غير مُفعّل: لا يتوفر برنامج تشغيل أو عتاد مقترن في هذا المشروع.",
    connection: "اتصال النظارة",
    statusReady: "جاهز",
    statusCamera: "الكاميرا تعمل",
    statusAnalyzing: "يحلّل الصورة",
    statusSpeaking: "يقرأ الوصف",
    statusError: "حدث خطأ",
    facts: "حالة النظام",
    stoppedMessage: "أُوقفت المساعدة وأُغلقت الكاميرا.",
    noFrame: "شغّل الكاميرا أو اختر صورة قبل بدء التحليل.",
    takePhotoError: "انتظر حتى تظهر معاينة الكاميرا، ثم حاول مجددًا.",
    historyDescribe: "وصف",
    historyObstacles: "عوائق محتملة",
    footer: "مشروع ابتكاري لتوظيف الذكاء الاصطناعي في خدمة المجتمع",
  },
  en: {
    brand: "Ainak Al-Musaida",
    subtitle: "AI vision assistant",
    eyeglass: "Smart glasses",
    disconnected: "Not connected",
    camera: "Device camera",
    running: "Running",
    stopped: "Stopped",
    title: "Smart assistance dashboard",
    intro: "Start your device camera to analyze a scene on demand. Images are only sent for analysis when you choose to do so.",
    operational: "Assistant ready",
    starting: "Opening camera...",
    start: "Start smart assistance",
    stop: "Stop assistance",
    preview: "Live view from your device camera",
    previewHint: "Allow camera access to view a scene and capture an image for analysis on demand.",
    allowCamera: "Start camera",
    cameraUnsupported: "This browser does not support the camera. Choose an image instead.",
    cameraDenied: "Could not open the camera. Check browser permissions and use an HTTPS connection.",
    pickImage: "Choose an image",
    takePhoto: "Capture now",
    chosen: "Selected image",
    clearImage: "Remove image",
    controls: "Assistance controls",
    describe: "Describe what is in front of me",
    obstacle: "Check for potential obstacles",
    describeHint: "A short description of visible objects and the scene.",
    obstacleHint: "Visual note about a possible visible obstacle.",
    working: "Analyzing image...",
    settings: "Audio settings",
    language: "Description language",
    arabic: "العربية",
    english: "English",
    speechSpeed: "Speech rate",
    speechVolume: "Speech volume",
    listen: "Read description aloud",
    stopSpeech: "Stop audio now",
    speechUnsupported: "Speech playback is not supported in this browser.",
    activity: "Recent descriptions and alerts",
    emptyHistory: "Recent analysis results will appear here.",
    description: "Scene description",
    obstacleResult: "Obstacle observation",
    emptyResult: "Start assistance or choose an image, then request a scene description or an obstacle check.",
    serviceMissing: "Image analysis is not configured. Add OPENAI_API_KEY to the server environment.",
    serviceError: "Image analysis failed. Check the service connection and try again.",
    uploadError: "Choose a JPEG, PNG, or WebP image no larger than 16 MB.",
    consent: "Each request analyzes one image only after you press a button. Images are sent to the configured analysis provider.",
    safety: "Assistive descriptions are not navigation or a guarantee against hazards. Use your usual safety aids.",
    glassesNote: "Glasses connection is not configured: no paired hardware or device driver is available in this project.",
    connection: "Glasses connection",
    statusReady: "Ready",
    statusCamera: "Camera active",
    statusAnalyzing: "Analyzing image",
    statusSpeaking: "Reading description",
    statusError: "An error occurred",
    facts: "System status",
    stoppedMessage: "Assistance stopped and camera closed.",
    noFrame: "Start the camera or choose an image before analyzing.",
    takePhotoError: "Wait for the camera preview, then try again.",
    historyDescribe: "Description",
    historyObstacles: "Potential obstacles",
    footer: "An innovative project using AI to serve the community",
  },
} as const;

function formatTime(language: Language) {
  return new Intl.DateTimeFormat(language === "ar" ? "ar-AE" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

async function compressImage(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = url;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("The selected image could not be decoded."));
    });
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is unavailable.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.8, 0.65, 0.5]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= 3_800_000) {
        const name = file.name.replace(/\.[^.]+$/, "") || "camera-image";
        return new File([blob], `${name}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
      }
    }
    throw new Error("The image exceeds the supported upload size.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function AssistantDashboard() {
  const [language, setLanguage] = useState<Language>("ar");
  const [status, setStatus] = useState<Status>("ready");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [description, setDescription] = useState("");
  const [activeTask, setActiveTask] = useState<Task>("describe");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ActivityItem[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const languageRef = useRef<Language>(language);
  const t = copy[language];
  const isArabic = language === "ar";
  const assistantRunning = stream !== null;

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!stream || !videoRef.current) return;
    videoRef.current.srcObject = stream;
    void videoRef.current.play().catch(() => {
      setMessage(copy[languageRef.current].cameraDenied);
      setStatus("error");
    });
  }, [stream]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [stream]);

  const stopSpeech = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    setStatus((current) => current === "speaking" ? (stream ? "camera" : "ready") : current);
  }, [stream]);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCameraLoading(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [stream]);

  async function startAssistant() {
    setMessage("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage(t.cameraUnsupported);
      setStatus("error");
      return;
    }
    setCameraLoading(true);
    try {
      const liveStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(liveStream);
      setStatus("camera");
    } catch (error) {
      setMessage(
        error instanceof DOMException && ["NotAllowedError", "SecurityError"].includes(error.name)
          ? t.cameraDenied
          : t.cameraUnsupported,
      );
      setStatus("error");
    } finally {
      setCameraLoading(false);
    }
  }

  function stopAssistant() {
    stopSpeech();
    stopCamera();
    setStatus("ready");
    setMessage(t.stoppedMessage);
  }

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    setMessage("");
    setDescription("");
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type) || selected.size === 0 || selected.size > 16 * 1024 * 1024) {
      setFile(null);
      setMessage(t.uploadError);
      setStatus("error");
      return;
    }
    setFile(selected);
    setStatus(stream ? "camera" : "ready");
  }

  async function captureFrame(): Promise<File | null> {
    const video = videoRef.current;
    if (!stream || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return null;
    const longestEdge = Math.max(video.videoWidth, video.videoHeight);
    const scale = Math.min(1, 1600 / longestEdge);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
    return image ? new File([image], "camera-capture.jpg", { type: "image/jpeg", lastModified: Date.now() }) : null;
  }

  async function analyze(task: Task) {
    if (status === "analyzing") return;
    let image: File | null = null;
    try {
      image = file ?? (stream ? await captureFrame() : null);
      if (image) image = await compressImage(image);
    } catch {
      setMessage(t.uploadError);
      setStatus("error");
      return;
    }
    if (!image) {
      setMessage(stream ? t.takePhotoError : t.noFrame);
      setStatus(stream ? "error" : "ready");
      if (stream) window.setTimeout(() => setStatus((current) => current === "error" ? "camera" : current), 3500);
      return;
    }
    stopSpeech();
    setMessage("");
    setDescription("");
    setActiveTask(task);
    setStatus("analyzing");
    const form = new FormData();
    form.append("image", image);
    form.append("language", language);
    form.append("task", task);
    try {
      const response = await fetch("/api/analyze", { method: "POST", body: form });
      const result: { description?: string; error?: string; code?: string } = await response.json();
      if (!response.ok) {
        const reason = result.code === "NOT_CONFIGURED"
          ? t.serviceMissing
          : result.code === "INVALID_IMAGE" || result.code === "IMAGE_TOO_LARGE"
            ? t.uploadError
            : t.serviceError;
        setMessage(reason);
        setStatus("error");
        return;
      }
      const resultDescription = result.description?.trim();
      if (!resultDescription) {
        setMessage(t.serviceError);
        setStatus("error");
        return;
      }
      setDescription(resultDescription);
      setStatus(stream ? "camera" : "ready");
      setHistory((previous) => [
        { id: Date.now(), task, text: resultDescription, time: formatTime(languageRef.current) },
        ...previous,
      ].slice(0, 6));
    } catch {
      setMessage(t.serviceError);
      setStatus("error");
    }
  }

  function speakDescription() {
    if (!description) return;
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setMessage(t.speechUnsupported);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(description);
    utterance.lang = language === "ar" ? "ar-AE" : "en-US";
    utterance.rate = speechRate;
    utterance.volume = speechVolume;
    utterance.onstart = () => {
      setSpeaking(true);
      setStatus("speaking");
    };
    utterance.onend = () => {
      setSpeaking(false);
      setStatus(stream ? "camera" : "ready");
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setStatus(stream ? "camera" : "ready");
    };
    window.speechSynthesis.speak(utterance);
  }

  const currentStatusLabel = status === "error" ? t.statusError
    : status === "analyzing" ? t.statusAnalyzing
      : status === "speaking" ? t.statusSpeaking
        : status === "camera" ? t.statusCamera : t.statusReady;

  return (
    <main className={`assist-app${isArabic ? " language-ar" : " language-en"}`} lang={language} dir={isArabic ? "rtl" : "ltr"}>
      <div className="assist-frame">
        <header className="assist-header">
          <a className="assist-brand" href="#main" aria-label={t.brand}>
            <span className="assist-brand-mark"><Glasses size={26} strokeWidth={1.8} /></span>
            <span><strong>{t.brand}</strong><small>{t.subtitle}</small></span>
          </a>
          <div className="assist-header-state" aria-label={t.facts}>
            <span className="connection-pill" title={t.glassesNote}>
              <Glasses size={16} aria-hidden="true" />
              <span className="connection-label">{t.eyeglass}</span>
              <i className="status-indicator offline" />
              <strong>{t.disconnected}</strong>
            </span>
            <span className={`connection-pill camera-pill${assistantRunning ? " camera-online" : ""}`}>
              <Camera size={16} aria-hidden="true" />
              <span className="connection-label">{t.camera}</span>
              <i className={`status-indicator${assistantRunning ? " online" : ""}`} />
              <strong>{assistantRunning ? t.running : t.stopped}</strong>
            </span>
          </div>
          <button className="assist-language" onClick={() => { stopSpeech(); setLanguage(isArabic ? "en" : "ar"); }}>
            <Languages size={17} /><span>{isArabic ? "English" : "العربية"}</span>
          </button>
        </header>

        <section className="assist-welcome" id="main" aria-labelledby="dashboard-title">
          <div>
            <span className="assist-eyebrow"><Sparkles size={15} />{t.subtitle}</span>
            <h1 id="dashboard-title">{t.title}</h1>
            <p>{t.intro}</p>
          </div>
          <div className={`system-indicator status-${status}`} role="status" aria-live="polite">
            {status === "analyzing" ? <LoaderCircle className="assist-spin" size={17} /> :
              status === "error" ? <AlertTriangle size={17} /> :
                status === "speaking" ? <AudioLines size={17} /> :
                  status === "camera" ? <Activity size={17} /> : <Check size={17} />}
            {cameraLoading ? t.starting : currentStatusLabel}
          </div>
        </section>

        <div className="assist-layout">
          <section className="camera-panel" aria-labelledby="camera-preview-title">
            <div className="panel-heading">
              <span className="panel-title"><span className={`camera-live-dot${assistantRunning ? " is-live" : ""}`} /><span id="camera-preview-title">{t.preview}</span></span>
              <span className={`camera-badge${assistantRunning ? " is-live" : ""}`}><Webcam size={15} />{assistantRunning ? t.running : t.stopped}</span>
            </div>
            <div className={`camera-view${assistantRunning && !preview ? " is-live" : ""}${preview ? " has-image" : ""}`}>
              <video ref={videoRef} className={`live-video${assistantRunning && !preview ? " is-visible" : ""}`} autoPlay muted playsInline aria-label={t.preview} />
              {preview && !assistantRunning ? <img className="still-preview" src={preview} alt={isArabic ? "معاينة الصورة المختارة للتحليل" : "Preview of the selected image"} /> : null}
              {!assistantRunning && !preview && <div className="camera-empty">
                <span className="camera-empty-icon"><Camera size={29} /></span>
                <strong>{t.previewHint}</strong>
              </div>}
              {assistantRunning && !preview && <span className="camera-rec-label"><i />{t.running}</span>}
              {preview && <button className="clear-image-button" onClick={() => { setFile(null); setDescription(""); setMessage(""); setStatus(stream ? "camera" : "ready"); }} aria-label={t.clearImage}><X size={19} /></button>}
              <span className="camera-counter" aria-hidden="true">{assistantRunning && !preview ? "CAM / LIVE" : "CAM / IDLE"}</span>
            </div>
            <div className="camera-actions">
              {!assistantRunning ?
                <button className="control-button control-primary camera-start-button" disabled={cameraLoading} onClick={startAssistant}>
                  {cameraLoading ? <LoaderCircle className="assist-spin" size={21} /> : <Camera size={21} />}
                  <span>{cameraLoading ? t.starting : t.start}</span>
                </button> :
                <>
                  <button className="control-button control-primary" onClick={() => analyze("describe")} disabled={status === "analyzing"}>
                    <ScanEye size={21} /><span>{t.describe}</span>
                  </button>
                  <button className="control-button control-danger" onClick={stopAssistant}><X size={20} /><span>{t.stop}</span></button>
                </>}
              <button className="control-button control-secondary image-pick-button" onClick={() => galleryRef.current?.click()}>
                <ImagePlus size={20} /><span>{t.pickImage}</span>
              </button>
              {assistantRunning && <button className="control-button control-secondary capture-button" onClick={async () => {
                const snapshot = await captureFrame();
                if (snapshot) { setFile(snapshot); setMessage(""); setStatus("camera"); }
                else { setMessage(t.takePhotoError); setStatus("error"); }
              }}><Camera size={20} /><span>{t.takePhoto}</span></button>}
              <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={selectImage} hidden aria-label={t.pickImage} />
            </div>
            {message && <div className={`assist-message${status === "error" ? " message-error" : ""}`} role={status === "error" ? "alert" : "status"}>
              {status === "error" ? <CircleHelp size={18} /> : <Check size={18} />}{message}
            </div>}
            <p className="camera-consent"><ShieldCheck size={16} />{t.consent}</p>
          </section>

          <aside className="assist-sidebar">
            <section className="command-panel" aria-labelledby="command-title">
              <div className="panel-heading"><span className="panel-title"><Radio size={18} /><span id="command-title">{t.controls}</span></span></div>
              <div className="command-buttons">
                <button className="control-button control-primary action-button" disabled={!file && !assistantRunning || status === "analyzing"} onClick={() => analyze("describe")}>
                  {status === "analyzing" && activeTask === "describe" ? <LoaderCircle className="assist-spin" size={22} /> : <ScanEye size={22} />}
                  <span><strong>{status === "analyzing" && activeTask === "describe" ? t.working : t.describe}</strong><small>{t.describeHint}</small></span>
                </button>
                <button className="control-button control-obstacle action-button" disabled={!file && !assistantRunning || status === "analyzing"} onClick={() => analyze("obstacles")}>
                  {status === "analyzing" && activeTask === "obstacles" ? <LoaderCircle className="assist-spin" size={22} /> : <AlertTriangle size={22} />}
                  <span><strong>{status === "analyzing" && activeTask === "obstacles" ? t.working : t.obstacle}</strong><small>{t.obstacleHint}</small></span>
                </button>
              </div>
              {description ? <div className="description-card" aria-live="polite">
                <div className="description-title"><span><Sparkles size={17} /></span><strong>{activeTask === "obstacles" ? t.obstacleResult : t.description}</strong></div>
                <p>{description}</p>
                <div className="speech-controls">
                  {!speaking ?
                    <button className="speech-action" onClick={speakDescription}><Volume2 size={19} /><span>{t.listen}</span></button> :
                    <button className="speech-action speech-stop" onClick={stopSpeech}><VolumeX size={19} /><span>{t.stopSpeech}</span></button>}
                </div>
              </div> :
                <div className="result-empty"><span><AudioLines size={21} /></span><p>{status === "analyzing" ? t.working : t.emptyResult}</p></div>}
            </section>

            <section className="preferences-panel" aria-labelledby="preferences-title">
              <div className="panel-heading"><span className="panel-title"><Settings2 size={18} /><span id="preferences-title">{t.settings}</span></span></div>
              <label className="setting-select-label" htmlFor="assist-language">{t.language}</label>
              <select id="assist-language" value={language} onChange={(event) => { stopSpeech(); setLanguage(event.target.value as Language); }} className="setting-select">
                <option value="ar">{t.arabic}</option><option value="en">{t.english}</option>
              </select>
              <label className="slider-setting" htmlFor="speech-speed">
                <span><span>{t.speechSpeed}</span><output htmlFor="speech-speed">{speechRate.toFixed(1)}×</output></span>
                <input id="speech-speed" type="range" min="0.65" max="1.5" step="0.05" value={speechRate} onChange={(event) => setSpeechRate(Number(event.target.value))} />
              </label>
              <label className="slider-setting" htmlFor="speech-volume">
                <span><span>{t.speechVolume}</span><output htmlFor="speech-volume">{Math.round(speechVolume * 100)}%</output></span>
                <input id="speech-volume" type="range" min="0.1" max="1" step="0.05" value={speechVolume} onChange={(event) => setSpeechVolume(Number(event.target.value))} />
              </label>
            </section>

            <section className="history-panel" aria-labelledby="history-title">
              <div className="panel-heading"><span className="panel-title"><Activity size={18} /><span id="history-title">{t.activity}</span></span>
                <span className="history-count">{history.length}</span>
              </div>
              {history.length ? <ul className="history-list">{history.map((item) =>
                <li className="history-item" key={item.id}>
                  <span className={`history-icon${item.task === "obstacles" ? " history-obstacle" : ""}`}>{item.task === "obstacles" ? <AlertTriangle size={16} /> : <ScanEye size={16} />}</span>
                  <span className="history-copy"><strong>{item.task === "obstacles" ? t.historyObstacles : t.historyDescribe}</strong><span>{item.text}</span></span>
                  <time>{item.time}</time>
                </li>)}</ul> :
                <p className="history-empty">{t.emptyHistory}</p>}
            </section>
          </aside>
        </div>

        <div className="device-notice"><Glasses size={20} /><p><strong>{t.connection}: {t.disconnected}</strong><span>{t.glassesNote}</span></p><span className="device-tag">HARDWARE / NOT CONFIGURED</span></div>
        <div className="safety-banner"><AlertTriangle size={19} /><p><strong>{t.safety}</strong></p></div>
        <footer className="assist-footer"><span><Glasses size={17} />{t.brand}</span><span>{t.footer}</span><Mic2 size={17} /></footer>
      </div>
    </main>
  );
}
