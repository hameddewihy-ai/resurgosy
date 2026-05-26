import { useEffect, useRef, useState } from 'react';
import { Box, RotateCcw, ZoomIn, ZoomOut, Layers, AlertCircle } from 'lucide-react';


const APS_ACCESS_TOKEN  = process.env.REACT_APP_APS_ACCESS_TOKEN  || '';
const APS_MODEL_URN     = process.env.REACT_APP_APS_MODEL_URN     || '';

// ── Autodesk APS real viewer ──────────────────────────────────────────────
function loadForgeScript() {
  return new Promise((resolve, reject) => {
    if (window.Autodesk) { resolve(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function APSViewerReal({ urn, token, onReady }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    let viewer;
    loadForgeScript()
      .then(() => {
        const options = {
          env: 'AutodeskProduction2',
          api: 'streamingV2',
          getAccessToken: (cb) => cb(token, 3600),
        };
        window.Autodesk.Viewing.Initializer(options, () => {
          viewer = new window.Autodesk.Viewing.GuiViewer3D(containerRef.current);
          viewer.start();
          const docUrn = `urn:${urn}`;
          window.Autodesk.Viewing.Document.load(
            docUrn,
            (doc) => {
              const defaultModel = doc.getRoot().getDefaultGeometry();
              viewer.loadDocumentNode(doc, defaultModel);
              viewerRef.current = viewer;
              onReady?.();
            },
            () => {}
          );
        });
      })
      .catch(() => {});

    return () => { viewerRef.current?.finish(); };
  }, [urn, token, onReady]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

// ── CSS 3D BIM placeholder (no API key needed) ────────────────────────────
function BIMPlaceholder({ projectName }) {
  const [angle, setAngle] = useState(35);
  const [zoom, setZoom] = useState(1);
  const [layer, setLayer] = useState('all');
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    if (!rotating) return;
    const id = setInterval(() => setAngle((a) => (a + 0.5) % 360), 30);
    return () => clearInterval(id);
  }, [rotating]);

  const LAYERS = {
    all:         { label: 'كامل',        color: '#5B7DBE' },
    structure:   { label: 'هيكل',        color: '#F97316' },
    mep:         { label: 'MEP',          color: '#22c55e' },
    facade:      { label: 'واجهة',        color: '#a78bfa' },
  };

  // Building floors as CSS 3D boxes
  const floors = [
    { h: 18, w: 180, d: 120, y: 0,   label: 'الطابق الأرضي — تجاري' },
    { h: 14, w: 160, d: 100, y: 20,  label: 'الطابق الأول' },
    { h: 14, w: 150, d: 95,  y: 36,  label: 'الطابق الثاني' },
    { h: 14, w: 140, d: 90,  y: 52,  label: 'الطابق الثالث' },
    { h: 12, w: 100, d: 70,  y: 68,  label: 'الطابق الرابع' },
  ];

  const faceColor = LAYERS[layer].color;

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 rounded-2xl overflow-hidden select-none">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/60">
        <div className="flex items-center gap-2">
          <Box size={16} className="text-brand" />
          <span className="text-white text-sm font-semibold">{projectName}</span>
          <span className="text-xs bg-brand/10 border border-brand/20 text-brand px-2 py-0.5 rounded-full">BIM · IFC 2x3</span>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(LAYERS).map(([k, v]) => (
            <button key={k} onClick={() => setLayer(k)}
              className={`text-xs px-2 py-1 rounded transition-all border ${layer === k ? 'text-white border-transparent' : 'text-slate-400 border-slate-700 hover:text-white'}`}
              style={layer === k ? { background: v.color + '33', borderColor: v.color } : {}}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.min(z + 0.1, 1.8))} className="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-colors"><ZoomIn size={14}/></button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))} className="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-colors"><ZoomOut size={14}/></button>
          <button onClick={() => setRotating((r) => !r)}
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${rotating ? 'bg-brand text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
            <RotateCcw size={14} className={rotating ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 3D viewport */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center"
        onMouseMove={(e) => { if (e.buttons === 1) setAngle((a) => a + e.movementX * 0.5); }}
        onWheel={(e) => { e.preventDefault(); setZoom((z) => Math.min(Math.max(z - e.deltaY * 0.001, 0.5), 1.8)); }}>

        {/* Grid floor */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#5B7DBE 1px, transparent 1px), linear-gradient(90deg, #5B7DBE 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Building */}
        <div style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}>
          <div style={{ perspective: 800, perspectiveOrigin: '50% 40%' }}>
            <div style={{ transformStyle: 'preserve-3d', transform: `rotateX(25deg) rotateY(${angle}deg)`, transition: rotating ? 'none' : 'transform 0.1s' }}>
              {floors.map((f, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: f.w, height: f.h,
                  transformStyle: 'preserve-3d',
                  transform: `translateX(${-f.w / 2}px) translateY(${-(f.y + f.h) * 2.2}px) translateZ(${-f.d / 2}px)`,
                }}>
                  {/* Front */}
                  <div style={{ position:'absolute', width:f.w, height:f.h, background: faceColor+'22', border:`1px solid ${faceColor}66`, transform:'translateZ(0px)' }} />
                  {/* Back */}
                  <div style={{ position:'absolute', width:f.w, height:f.h, background: faceColor+'11', border:`1px solid ${faceColor}44`, transform:`translateZ(-${f.d}px) rotateY(180deg)` }} />
                  {/* Top */}
                  <div style={{ position:'absolute', width:f.w, height:f.d, background: faceColor+'44', border:`1px solid ${faceColor}88`, transform:`translateY(-${f.d/2}px) rotateX(90deg) translateZ(${f.d/2}px)` }} />
                  {/* Left */}
                  <div style={{ position:'absolute', width:f.d, height:f.h, background: faceColor+'1a', border:`1px solid ${faceColor}44`, transform:`translateX(-${f.d/2}px) rotateY(-90deg) translateZ(${f.d/2}px)` }} />
                  {/* Right */}
                  <div style={{ position:'absolute', width:f.d, height:f.h, background: faceColor+'1a', border:`1px solid ${faceColor}44`, transform:`translateX(${f.w}px) translateX(${f.d/2}px) rotateY(90deg) translateZ(${-f.d/2}px)` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overlay notice */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-slate-400">
            <AlertCircle size={12} className="text-amber-400" />
            أضف <code className="text-brand mx-1">REACT_APP_APS_ACCESS_TOKEN</code> لتفعيل Autodesk APS Viewer الحقيقي
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-800/40 flex items-center gap-6 text-xs text-slate-400">
        <span className="flex items-center gap-1"><Layers size={12} className="text-brand" />5 طوابق · 850 م²</span>
        <span>IFC-2X3 · BIM Level 2</span>
        <span className="mr-auto">اسحب للتدوير · عجلة الفأرة للتكبير</span>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function BIMViewer({ projectName = 'مجمع حمص الصناعي — المرحلة أ' }) {
  if (APS_ACCESS_TOKEN && APS_MODEL_URN) {
    return (
      <div className="w-full h-full rounded-2xl overflow-hidden">
        <APSViewerReal urn={APS_MODEL_URN} token={APS_ACCESS_TOKEN} />
      </div>
    );
  }
  return <BIMPlaceholder projectName={projectName} />;
}
