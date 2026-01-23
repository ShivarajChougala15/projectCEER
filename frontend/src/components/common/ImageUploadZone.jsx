import { useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

const ImageUploadZone = ({
    imagePreview,
    onImageSelect,
    onImageRemove,
    label = "Image",
    className = ""
}) => {
    const uploadZoneRef = useRef(null);

    // Handle file selection from dropzone or file input
    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            onImageSelect(file);
        }
    }, [onImageSelect]);

    // Setup dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
        },
        maxFiles: 1,
        multiple: false
    });

    // Handle paste from clipboard
    useEffect(() => {
        const handlePaste = (e) => {
            // Only handle paste if the upload zone is focused or if we're in the modal
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        onImageSelect(file);
                    }
                    break;
                }
            }
        };

        // Add paste listener to the document
        document.addEventListener('paste', handlePaste);

        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, [onImageSelect]);

    return (
        <div className={`flex items-start gap-6 ${className}`}>
            {/* Preview */}
            <div className="relative w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {imagePreview ? (
                    <>
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        {onImageRemove && (
                            <button
                                type="button"
                                onClick={onImageRemove}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                                title="Remove image"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </>
                ) : (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
            </div>

            {/* Upload Zone */}
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <div
                    {...getRootProps()}
                    ref={uploadZoneRef}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActive
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                        }`}
                >
                    <input {...getInputProps()} />
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragActive ? 'text-emerald-500' : 'text-gray-400'}`} />
                    <p className="text-sm text-gray-600 mb-1">
                        {isDragActive ? (
                            <span className="text-emerald-600 font-medium">Drop the image here</span>
                        ) : (
                            <>
                                <span className="font-medium text-emerald-600">Click to upload</span> or drag and drop
                            </>
                        )}
                    </p>
                    <p className="text-xs text-gray-400">
                        You can also paste (Ctrl+V / Cmd+V) an image from clipboard
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, GIF, WebP, SVG (max 10MB)
                    </p>
                </div>
                <p className="text-xs text-gray-400 mt-2">Uploaded to Cloudinary</p>
            </div>
        </div>
    );
};

export default ImageUploadZone;
