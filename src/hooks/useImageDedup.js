import { useCallback } from 'react';

const HASH_SIZE = 16; // 16x16 = 256-bit fingerprint
const DUPE_THRESHOLD = 8; // Hamming distance — lower = stricter

// Resize image to HASH_SIZE x HASH_SIZE on a canvas, return grayscale pixel array
async function fingerprintImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = HASH_SIZE;
      canvas.height = HASH_SIZE;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, HASH_SIZE, HASH_SIZE);
      const { data } = ctx.getImageData(0, 0, HASH_SIZE, HASH_SIZE);
      // Grayscale: 0.299R + 0.587G + 0.114B
      const gray = [];
      for (let i = 0; i < data.length; i += 4) {
        gray.push(Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]));
      }
      URL.revokeObjectURL(url);
      resolve(gray);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// Average hash (aHash): compare each pixel to mean brightness
function aHash(gray) {
  const avg = gray.reduce((a, b) => a + b, 0) / gray.length;
  return gray.map((v) => (v >= avg ? 1 : 0));
}

// Hamming distance between two bit arrays
function hammingDistance(a, b) {
  return a.reduce((acc, bit, i) => acc + (bit !== b[i] ? 1 : 0), 0);
}

export function useImageDedup() {
  const filterDuplicates = useCallback(async (newFiles, existingFiles = []) => {
    const results = [];
    const duplicates = [];
    const allFingerprints = [];

    // Fingerprint existing files first
    for (const f of existingFiles) {
      const gray = await fingerprintImage(f.file);
      if (gray) allFingerprints.push({ hash: aHash(gray), name: f.file.name });
    }

    for (const file of newFiles) {
      const gray = await fingerprintImage(file);
      if (!gray) { results.push(file); continue; }

      const hash = aHash(gray);
      const matchedWith = allFingerprints.find(
        (fp) => hammingDistance(hash, fp.hash) <= DUPE_THRESHOLD
      );

      if (matchedWith) {
        duplicates.push({ file, matchedWith: matchedWith.name });
      } else {
        results.push(file);
        allFingerprints.push({ hash, name: file.name });
      }
    }

    return { unique: results, duplicates };
  }, []);

  return { filterDuplicates };
}
