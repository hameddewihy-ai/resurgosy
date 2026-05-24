import KYCGate from '../invest/KYCGate';

export function isKYCVerified() {
  try {
    const kyc = JSON.parse(localStorage.getItem('resurgo-kyc') || 'null');
    return kyc?.verified === true;
  } catch { return false; }
}

export default function KYCGateModal({ isOpen, onClose, onComplete }) {
  return <KYCGate isOpen={isOpen} onClose={onClose} onComplete={onComplete} />;
}
