import { useRef, useState, useEffect, useCallback } from 'react';
import { Trash2, PenLine, CheckCircle } from 'lucide-react';

export default function SignaturePad({ onSigned, disabled }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const lastPos = useRef(null);

  // Retina display scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.strokeStyle = '#5B7DBE';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    setDrawing(true);
    const canvas = canvasRef.current;
    lastPos.current = getPos(e, canvas);
  }, [disabled]);

  const draw = useCallback((e) => {
    if (!drawing || disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasStrokes(true);
  }, [drawing, disabled]);

  const endDraw = useCallback(() => {
    setDrawing(false);
    lastPos.current = null;
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    setHasStrokes(false);
  };

  const confirm = () => {
    if (!hasStrokes) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSigned?.(dataUrl);
  };

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <PenLine size={13} className="text-brand" />
          ارسم توقيعك داخل الإطار
        </label>
        {hasStrokes && (
          <button onClick={clear} type="button"
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
            مسح
          </button>
        )}
      </div>

      {/* Canvas */}
      <div className={`rounded-xl border-2 overflow-hidden transition-colors bg-white/5 ${
        disabled ? 'border-slate-700 opacity-60' : hasStrokes ? 'border-brand/60' : 'border-dashed border-slate-600 hover:border-brand/40'
      }`} style={{ height: 130 }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', cursor: disabled ? 'not-allowed' : 'crosshair', touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      {!hasStrokes && (
        <p className="text-slate-600 text-xs text-center">ارسم توقيعك بالماوس أو اللمس</p>
      )}

      {hasStrokes && !disabled && (
        <button onClick={confirm} type="button"
          className="w-full flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-semibold text-sm py-2.5 rounded-xl transition-colors">
          <CheckCircle size={16} />
          تأكيد التوقيع
        </button>
      )}
    </div>
  );
}
