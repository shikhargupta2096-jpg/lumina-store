import React, { useRef } from 'react';
import Cropper from 'react-cropper';
import { X } from 'lucide-react';

const ImageCropper = ({ imageSrc, aspectRatio, onCropComplete, onCancel }) => {
  const cropperRef = useRef(null);
  
  const handleCrop = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      cropperRef.current?.cropper.getCroppedCanvas({
        maxWidth: 1024,
        maxHeight: 1024
      }).toBlob((blob) => {
        onCropComplete(blob);
      }, 'image/jpeg', 0.85);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Crop Image</h3>
          <button onClick={onCancel} className="modal-close"><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <Cropper
            src={imageSrc}
            style={{ height: 400, width: '100%' }}
            aspectRatio={aspectRatio}
            guides={true}
            ref={cropperRef}
            viewMode={1}
            background={false}
          />
        </div>
        
        <div className="modal-footer">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={handleCrop} className="btn-primary">Apply Crop</button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
