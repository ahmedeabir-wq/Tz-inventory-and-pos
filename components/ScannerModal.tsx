import React, { useEffect, useRef, useState } from 'react';
import { X, Camera } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Simulate scanning for demo purposes as we don't have a barcode library
  // In production, integrate 'react-zxing' or 'html5-qrcode' here
  const simulateScan = () => {
    const randomCodes = ['123456', '888888', '112233'];
    const random = randomCodes[Math.floor(Math.random() * randomCodes.length)];
    onScan(random);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
        >
          <X size={20} />
        </button>

        <div className="relative aspect-square bg-black">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 border-2 border-white/30 flex items-center justify-center">
            <div className="w-64 h-40 border-2 border-accent rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-accent -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-accent -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-accent -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-accent -mb-1 -mr-1"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 opacity-50 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="p-6 text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Scan Barcode</h3>
          <p className="text-sm text-gray-500 mb-6">Point camera at product barcode</p>
          
          <button 
            onClick={simulateScan}
            className="w-full flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            <Camera size={20} />
            Simulate Scan (Demo)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;