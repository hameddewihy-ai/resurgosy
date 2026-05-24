import { useState, useCallback } from 'react';

// Serialize report data to a canonical string for hashing
function canonicalize(reportData) {
  return JSON.stringify(reportData, Object.keys(reportData).sort());
}

// SHA-256 via SubtleCrypto → hex string
async function sha256(text) {
  const buffer = new TextEncoder().encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Build official seal: engineer_id | timestamp | report_hash
async function buildSeal({ engineerId, reportData }) {
  const reportHash = await sha256(canonicalize(reportData));
  const timestamp = new Date().toISOString();
  const sealPayload = `${engineerId}|${timestamp}|${reportHash}`;
  const sealHash = await sha256(sealPayload);
  return { reportHash, sealHash, timestamp, sealPayload };
}

export function useDigitalSignature() {
  const [state, setState] = useState({
    signed: false,
    signing: false,
    sealHash: null,
    reportHash: null,
    timestamp: null,
    error: null,
  });

  const signReport = useCallback(async ({ engineerId, reportData, signatureDataUrl }) => {
    if (!signatureDataUrl) {
      setState((s) => ({ ...s, error: 'لا يمكن التوقيع بدون رسم التوقيع أولاً' }));
      return null;
    }
    setState((s) => ({ ...s, signing: true, error: null }));
    try {
      // Include signature image hash in the seal
      const sigHash = await sha256(signatureDataUrl.slice(0, 5000));
      const { sealHash, reportHash, timestamp } = await buildSeal({
        engineerId,
        reportData: { ...reportData, signatureHash: sigHash },
      });
      const result = { sealHash, reportHash, timestamp, engineerId };
      setState({ signed: true, signing: false, error: null, ...result });
      return result;
    } catch (err) {
      setState((s) => ({ ...s, signing: false, error: 'فشل توليد التوقيع الرقمي' }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ signed: false, signing: false, sealHash: null, reportHash: null, timestamp: null, error: null });
  }, []);

  return { ...state, signReport, reset };
}
