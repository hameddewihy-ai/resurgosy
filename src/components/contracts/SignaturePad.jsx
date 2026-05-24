import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, Check } from 'lucide-react';

export default function SignaturePad({ onSave, label }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [savedImage, setSavedImage] = useState(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Make it visually crisp
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0A192F'; // Navy color for signature
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasSignature) setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.closePath();
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSavedImage(null);
    onSave(null);
  };

  const saveSignature = () => {
    if (!hasSignature) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    setSavedImage(dataUrl);
    onSave(dataUrl);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <p className="text-sm font-bold text-navy mb-2 w-full text-right">{label}</p>
      
      {!savedImage ? (
        <div className="w-full relative border-2 border-dashed border-navy/20 rounded-xl overflow-hidden bg-cream/50 touch-none">
          <canvas
            ref={canvasRef}
            width={300}
            height={150}
            className="w-full h-[150px] cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="absolute top-2 left-2 pointer-events-none opacity-20">
            <span className="text-xs font-bold text-navy select-none">وقّع هنا</span>
          </div>
          
          <div className="absolute bottom-2 left-2 right-2 flex justify-between">
            <button 
              onClick={clearCanvas}
              type="button"
              className="text-[10px] flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md text-charcoal hover:text-red-500 transition-colors shadow-sm"
            >
              <RefreshCw size={10} /> مسح
            </button>
            
            {hasSignature && (
              <button 
                onClick={saveSignature}
                type="button"
                className="text-[10px] flex items-center gap-1 bg-brand text-white px-3 py-1 rounded-md shadow-sm hover:bg-brand/90 transition-colors"
              >
                <Check size={10} /> اعتماد
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full relative border-2 border-brand/20 bg-brand/5 rounded-xl p-4 flex flex-col items-center justify-center">
          <img src={savedImage} alt="توقيع معتمد" className="h-[100px] object-contain mb-3" />
          <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-full mb-3 border border-green-100">
            <Check size={14} /> تم اعتماد التوقيع الإلكتروني
          </div>
          <button 
            onClick={clearCanvas}
            className="text-[10px] text-charcoal/50 hover:text-red-500 underline underline-offset-2"
          >
            إعادة التوقيع
          </button>
        </div>
      )}
    </div>
  );
}
