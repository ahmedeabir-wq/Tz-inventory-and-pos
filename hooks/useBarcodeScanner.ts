import { useEffect, useState } from 'react';

// USB Scanners typically emulate a keyboard. 
// They type the barcode string very quickly and usually end with 'Enter'.

export const useBarcodeScanner = (onScan: (code: string) => void) => {
  const [barcode, setBarcode] = useState('');
  
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const isCharacter = e.key.length === 1;

      // If keys are typed very slowly, it's probably manual user input, not a scanner.
      // Reset buffer if gap is too large (e.g., > 50ms)
      if (currentTime - lastKeyTime > 100) {
        buffer = '';
      }
      
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length > 2) {
            // It's a scan!
            onScan(buffer);
            buffer = '';
            // Prevent default form submission if any
            e.preventDefault();
        }
      } else if (isCharacter) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScan]);
};