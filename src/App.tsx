/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Camera, ChevronRight, RefreshCw, Loader2, Info, CheckCircle2, AlertCircle, Heart } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { AnalysisData } from "@/src/types";

// --- Components ---

const Header = () => (
  <nav className="flex justify-between items-center px-6 md:px-10 py-6 border-b border-editorial-border sticky top-0 bg-editorial-bg/80 backdrop-blur-md z-50">
    <div className="text-[10px] tracking-[0.3em] font-black uppercase">Chromatic | Vol. 24</div>
    <div className="hidden md:flex space-x-8 text-[10px] tracking-[0.2em] uppercase font-bold">
      <span className="opacity-40 cursor-not-allowed">Archive</span>
      <span className="opacity-40 cursor-not-allowed">Method</span>
      <span className="border-b border-editorial-text pb-1">Client Report</span>
    </div>
    <div className="text-[10px] tracking-[0.3em] uppercase">Seoul, KR</div>
  </nav>
);

const PhotoUpload = ({ onImageSelect, isAnalyzing, selectedImage }: { onImageSelect: (file: File) => void, isAnalyzing: boolean, selectedImage: string | null }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      onImageSelect(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12">
      <motion.div
        layout
        className={cn(
          "relative border border-editorial-border rounded-sm p-12 transition-all duration-300 flex flex-col items-center justify-center min-h-[450px] bg-white",
          isDragging ? "bg-neutral-50 scale-[0.98]" : "hover:border-editorial-text/30",
          selectedImage && "p-0 overflow-hidden"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          handleFile(file);
        }}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {selectedImage ? (
          <div className="relative w-full h-full group">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="w-full h-[600px] object-cover"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-editorial-bg/90 flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-dashed border-neutral-300 animate-[spin_10s_linear_infinite]" />
                <div className="absolute flex flex-col items-center justify-center">
                  <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-editorial-text/60">Analyzing Data</div>
                  <Loader2 className="animate-spin text-editorial-text mt-4" size={24} />
                </div>
              </div>
            )}
            {!isAnalyzing && (
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <div className="bg-white/90 px-6 py-3 border border-editorial-text text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                  <RefreshCw size={14} />
                  다른 사진 선택
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center font-serif text-editorial-text">
            <div className="w-24 h-24 border border-editorial-border rounded-full flex items-center justify-center mx-auto mb-8 bg-neutral-50 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
              <Camera className="text-editorial-text/40" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-italic mb-4 italic">Start Your Analysis</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-editorial-muted max-w-sm mx-auto leading-relaxed">
              업로드한 사진으로 최적의 퍼스널 컬러를 찾아보세요.
            </p>
            <button className="mt-12 px-10 py-3 border border-editorial-text text-[10px] uppercase tracking-widest font-black hover:bg-editorial-text hover:text-white transition-all">
              이미지 업로드
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ColorSwatch = ({ name, hex, reason, type = "recommend" }: { name: string, hex: string, reason?: string, type?: "recommend" | "avoid" }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="flex flex-col gap-2"
  >
    <div 
      className={cn(
        "w-full aspect-square rounded-sm border border-editorial-border flex items-center justify-center",
        type === "avoid" && "rounded-full opacity-80"
      )}
      style={{ backgroundColor: hex }}
    />
    <div className="text-center overflow-hidden">
      <span className="text-[10px] font-bold text-editorial-text block truncate uppercase tracking-tighter">{name}</span>
      <span className="text-[8px] text-editorial-muted font-mono uppercase opacity-60">{hex}</span>
    </div>
  </motion.div>
);

const ResultCard = ({ result, onRetry, userImage }: { result: AnalysisData, onRetry: () => void, userImage: string | null }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto border-x border-editorial-border bg-white min-h-[800px] flex flex-col mb-20 shadow-[40px_0_100px_rgba(0,0,0,0.02)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        {/* Left Column: Identity */}
        <div className="lg:col-span-4 border-r border-editorial-border p-8 md:p-12 flex flex-col bg-neutral-50/20">
          <div className="mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-editorial-muted block mb-3 font-bold">Case Identification</span>
            <h1 className="text-5xl font-serif italic leading-tight text-editorial-text mb-2">{result.season_type}</h1>
            <p className="text-sm tracking-widest uppercase opacity-70 font-bold">{result.sub_type}</p>
          </div>

          <div className="relative flex-1 bg-neutral-100 rounded-t-full overflow-hidden mb-8 border border-editorial-border group max-h-[500px]">
             {userImage ? (
               <img src={userImage} className="w-full h-full object-cover grayscale-[0.1] hover:grayscale-0 transition-all duration-700" alt="Analyzed" />
             ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-40">
                    <div className="w-24 h-24 rounded-full border border-dashed border-editorial-text mb-4" />
                    <p className="text-[9px] uppercase tracking-[0.2em]">Visual Data Locked</p>
                </div>
             )}
          </div>

          <div className="bg-editorial-bg border border-editorial-border p-6 rounded-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-editorial-muted mb-2">Confidence Level</p>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-serif">{result.confidence}<span className="text-sm font-sans ml-1 text-editorial-muted">%</span></span>
              <span className="text-[9px] uppercase tracking-widest text-editorial-muted italic">Expert Match</span>
            </div>
            <div className="w-full bg-neutral-200 h-[1px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence}%` }}
                className="bg-editorial-text h-full"
              />
            </div>
          </div>

          <button 
                onClick={onRetry}
                className="mt-8 w-full py-4 border border-editorial-text text-[10px] uppercase tracking-[0.3em] font-black hover:bg-neutral-text hover:text-white transition-all flex items-center justify-center gap-2 group"
              >
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                New Analysis
          </button>
        </div>

        {/* Right Column: Analysis & Details */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-editorial-border bg-white">
            <div className="p-8 border-b md:border-b-0 md:border-r border-editorial-border min-h-[160px]">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-editorial-muted font-bold">Skin Analysis</h3>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between border-b border-editorial-border/40 pb-1"><span>Tone</span><span className="font-bold">{result.analysis.skin_tone}</span></div>
                <div className="flex justify-between border-b border-editorial-border/40 pb-1"><span>Brightness</span><span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis ml-2 text-right">{result.analysis.brightness}</span></div>
              </div>
            </div>
            <div className="p-8 border-b md:border-b-0 md:border-r border-editorial-border min-h-[160px]">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-editorial-muted font-bold">Overall Impression</h3>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between border-b border-editorial-border/40 pb-1"><span>Contrast</span><span className="font-bold">{result.analysis.contrast}</span></div>
                <div className="flex justify-between border-b border-editorial-border/40 pb-1"><span>Saturation</span><span className="font-bold">{result.analysis.saturation}</span></div>
              </div>
            </div>
            <div className="p-8 bg-editorial-bg/50 min-h-[160px]">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 text-editorial-muted italic">Expert Summary</h3>
              <p className="text-sm leading-relaxed font-serif italic text-editorial-text">
                "{result.summary}"
              </p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            {/* Swatches Left */}
            <div className="p-10 border-b md:border-b-0 md:border-r border-editorial-border">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 border-b border-editorial-text/20 pb-4 flex justify-between items-center">
                Primary Palette
                <span className="text-[9px] font-normal opacity-40 italic">Selected 8</span>
              </h3>
              <div className="grid grid-cols-4 gap-x-4 gap-y-8">
                {result.recommended_colors.map((color, i) => (
                  <div key={i}>
                    <ColorSwatch 
                      name={color.name}
                      hex={color.hex}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-10 border-t border-editorial-border">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6">Cautionary Palette</h3>
                <div className="flex flex-wrap gap-3">
                  {result.avoid_colors.map((color, i) => (
                    <div key={i} className="group relative">
                      <div 
                        className="w-10 h-10 rounded-full border border-editorial-border grayscale-[0.5] hover:grayscale-0 transition-all cursor-help flex items-center justify-center" 
                        style={{ backgroundColor: color.hex }}
                      >
                         <div className="w-4 h-[1px] bg-white opacity-40 rotate-45" />
                      </div>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-editorial-text text-white text-[8px] py-1.5 px-3 rounded-sm opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all shadow-xl z-20">
                        {color.name} ({color.hex})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Styling Details Right */}
            <div className="p-10 bg-neutral-50/20">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-8 border-b border-editorial-text/20 pb-4">Styling Guidelines</h3>
               
               <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-black text-editorial-muted mb-2">Lip & Blush</h4>
                      <p className="text-[11px] leading-relaxed mb-1 text-editorial-text font-medium">{result.makeup_recommendations.lip.join(", ")}</p>
                      <p className="text-[11px] leading-relaxed text-editorial-muted italic">{result.makeup_recommendations.blush.join(", ")}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-black text-editorial-muted mb-2">Hair & Fashion</h4>
                      <p className="text-[11px] leading-relaxed text-editorial-text"><span className="font-bold">Hair:</span> {result.hair_recommendations.join(", ")}</p>
                      <p className="text-[11px] leading-relaxed text-editorial-text/80"><span className="font-bold">Fashion:</span> {result.fashion_recommendations.join(", ")}</p>
                    </div>
                  </div>

                  <div className="bg-editorial-bg p-6 border border-editorial-border rounded-sm relative mt-4 shadow-sm">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-black mb-3 text-editorial-text underline underline-offset-8 decoration-editorial-text/20">Style Advisory</h4>
                    <p className="text-xs font-serif italic leading-relaxed text-editorial-text">
                      "{result.style_tip}"
                    </p>
                    <Info className="absolute top-4 right-4 text-editorial-text/10" size={16} />
                  </div>

                  <div className="pt-8 border-t border-editorial-border">
                    <p className="text-[9px] text-editorial-muted uppercase tracking-[0.2em] leading-loose">
                      <span className="font-black text-editorial-text">Note:</span> {result.photo_quality_note}
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="px-10 py-8 border-t border-editorial-border flex justify-between items-center text-[9px] uppercase tracking-[0.4em] text-editorial-muted bg-neutral-900 text-neutral-400">
        <span className="flex items-center gap-3">
          <Info size={12} className="opacity-50" />
          CASE REF: AIS-{Math.random().toString(36).substring(7).toUpperCase()}
        </span>
        <span className="hidden md:block opacity-60">Photo-based analysis subject to lighting discrepancy</span>
        <span className="font-black text-white/40 italic">C. Consultant</span>
      </footer>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (file: File) => {
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Start analysis
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("분석에 실패했습니다.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text font-sans selection:bg-neutral-200 selection:text-editorial-text">
      <Header />
      
      <main className="container mx-auto">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PhotoUpload 
                onImageSelect={handleImageSelect} 
                isAnalyzing={isAnalyzing}
                selectedImage={selectedImage}
              />
              
              {error && (
                <div className="max-w-2xl mx-auto mt-6 px-6">
                  <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-sm flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{error}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div key="result-wrapper" className="pt-12">
              <ResultCard 
                result={result} 
                onRetry={reset}
                userImage={selectedImage}
              />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Decorative Pattern */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
    </div>
  );
}

