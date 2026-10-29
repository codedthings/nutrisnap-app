import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Flame,
  CheckCircle2,
  ChevronRight,
  Info,
  Maximize2
} from 'lucide-react';
import { SAMPLE_MEALS } from '../data/sampleMeals';
import { SampleMeal } from '../types/nutrition';

interface CameraCaptureProps {
  onCaptureImage: (imageBase64: string, notes?: string) => void;
  onSelectSampleMeal: (sample: SampleMeal) => void;
  isLoading: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCaptureImage,
  onSelectSampleMeal,
  isLoading,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [userNotes, setUserNotes] = useState<string>('');
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Check available video devices
  useEffect(() => {
    async function checkDevices() {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      } catch (e) {
        console.warn('Could not enumerate media devices:', e);
      }
    }
    checkDevices();
  }, []);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. You can still upload a meal photo or test with sample meals below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please upload a photo or pick a sample meal.');
      } else {
        setCameraError('Could not start camera. Upload a photo or select a sample meal below.');
      }
    }
  }, [facingMode]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Toggle front/rear camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [facingMode]);

  // Snap photo from video feed
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Trigger visual shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    onCaptureImage(dataUrl, userNotes.trim() ? userNotes.trim() : undefined);
  };

  // Handle uploaded photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onCaptureImage(dataUrl, userNotes.trim() ? userNotes.trim() : undefined);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Title & Value Proposition */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Instant Meal Calorie & Macro Scanner
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Snap your food. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Know your calories.</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
          AI detects ingredients, portions, calories, and macros in seconds with scientific accuracy.
        </p>
      </div>

      {/* Main Viewfinder / Camera Container */}
      <div className="relative bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/20 aspect-[4/3] sm:aspect-[16/11] flex flex-col items-center justify-center">
        {/* Shutter flash overlay */}
        {isFlashing && <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200" />}

        {/* Video stream element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            cameraActive ? 'opacity-100' : 'opacity-0 hidden'
          }`}
        />

        {/* Hidden canvas for snapshot capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewfinder Overlay when Camera is Active */}
        {cameraActive ? (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-10">
            {/* Viewfinder Target Framing Marks */}
            <div className="flex justify-between items-start">
              <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400/90 rounded-tl-lg" />
              <div className="px-3 py-1 bg-slate-950/70 backdrop-blur-md rounded-full border border-slate-700 text-[11px] font-medium text-slate-300 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Camera
              </div>
              <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400/90 rounded-tr-lg" />
            </div>

            {/* Center target guide */}
            <div className="self-center text-center space-y-1">
              <div className="w-48 h-48 sm:w-60 sm:h-60 border border-dashed border-emerald-400/40 rounded-2xl flex items-center justify-center">
                <div className="w-3 h-3 border border-emerald-400/60 rounded-full" />
              </div>
              <span className="inline-block text-xs font-medium text-white/90 drop-shadow-md bg-slate-950/60 px-2.5 py-0.5 rounded-full">
                Center your plate or bowl here
              </span>
            </div>

            <div className="flex justify-between items-end">
              <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400/90 rounded-bl-lg" />
              <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400/90 rounded-br-lg" />
            </div>
          </div>
        ) : (
          /* Empty / Standby State when camera hasn't been launched */
          <div className="p-6 text-center space-y-4 max-w-sm z-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <Camera className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Capture Food Picture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take a photo directly with your camera, or upload a photo from your gallery.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                onClick={startCamera}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Start Camera
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>
            </div>

            {cameraError && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}

        {/* Top Controls if camera active */}
        {cameraActive && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {hasMultipleCameras && (
              <button
                onClick={toggleFacingMode}
                className="p-2.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 rounded-full text-slate-200 backdrop-blur-md transition shadow-lg active:scale-95"
                title="Switch Camera (Front/Rear)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Shutter & Capture Controls when camera is active */}
        {cameraActive && (
          <div className="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center gap-4 px-6">
            {/* Gallery Upload shortcut */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-700 rounded-full text-slate-200 backdrop-blur-md transition shadow-lg active:scale-95"
              title="Upload photo from files"
            >
              <Upload className="w-5 h-5" />
            </button>

            {/* Shutter Button */}
            <button
              onClick={captureSnapshot}
              disabled={isLoading}
              className="group relative p-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 active:scale-90 transition-transform shadow-2xl"
              title="Snap Meal Photo"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 flex items-center justify-center shadow-lg shadow-emerald-500/40 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full border-2 border-slate-950/60 bg-emerald-400 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-slate-950" />
                </div>
              </div>
            </button>

            {/* Close camera button */}
            <button
              onClick={() => {
                if (stream) {
                  stream.getTracks().forEach((track) => track.stop());
                }
                setCameraActive(false);
              }}
              className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-700 rounded-full text-slate-300 backdrop-blur-md transition shadow-lg text-xs font-semibold px-4"
              title="Cancel Camera"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Optional Context Note Input */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="user-meal-note" className="text-slate-300 font-medium flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            Add meal context for higher accuracy (optional)
          </label>
          <span className="text-[11px] text-slate-500">e.g., dressing on side, olive oil</span>
        </div>
        <div className="relative">
          <input
            id="user-meal-note"
            type="text"
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="e.g. Cooked with butter, oat milk latte, 2 eggs instead of 1..."
            className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />
          {userNotes && (
            <button
              onClick={() => setUserNotes('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick Test with Sample Meals Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Or try one of these sample meals
          </h2>
          <span className="text-[11px] text-slate-500">1-click demo</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {SAMPLE_MEALS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSampleMeal(sample)}
              className="group relative bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-2.5 text-left transition flex items-center gap-3 active:scale-98 overflow-hidden"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-800 relative">
                <img
                  src={sample.imageUrl}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition truncate">
                  {sample.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-extrabold text-white">{sample.calories}</span>
                  <span className="text-[10px] text-slate-400">kcal</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {sample.category}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
