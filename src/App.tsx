import React, { useState, useRef, useEffect, type ChangeEvent } from "react";

function App() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showCamera, facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("No se pudo acceder a la cámara");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);

    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return newPreviews;
    });
  };

  const takePhoto = () => {
    if (!videoRef.current || photos.length >= 10) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const photoUrl = URL.createObjectURL(blob);
            setPhotos((prev) => [...prev, photoUrl]);
          }
        },
        "image/jpeg",
        0.9
      );
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const clearPhotos = () => {
    photos.forEach((url) => URL.revokeObjectURL(url));
    setPhotos([]);
  };

  const clearSelectedFiles = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews([]);
    setSelectedFiles([]);
  };

  const toggleCameraView = () => {
    setShowCamera(!showCamera);
  };

  const allImages = [...previews, ...photos];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Subir Fotos
        </h1>

        {/* Controles principales */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              id="file-input"
              className="hidden"
            />
            <label
              htmlFor="file-input"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors inline-block text-center"
            >
              📁 Seleccionar Archivos
            </label>
            {selectedFiles.length > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {selectedFiles.length}{" "}
                  {selectedFiles.length === 1
                    ? "foto seleccionada"
                    : "fotos seleccionadas"}
                </p>
                <button
                  onClick={clearSelectedFiles}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <button
              onClick={toggleCameraView}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              📷 {showCamera ? "Cerrar Cámara" : "Abrir Cámara"}
            </button>
            {photos.length > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {photos.length} foto{photos.length !== 1 ? "s" : ""} capturada
                  {photos.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={clearPhotos}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cámara */}
        {showCamera && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col items-center gap-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded-xl shadow-md w-full max-w-md"
              />

              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={takePhoto}
                  disabled={photos.length >= 10}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {photos.length >= 10
                    ? "Límite alcanzado (10)"
                    : "📸 Capturar"}
                </button>
                <button
                  onClick={toggleCamera}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🔄 Cambiar Cámara
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Galería de imágenes */}
        {allImages.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Imágenes ({allImages.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {previews.map((preview, index) => (
                <div key={`file-${index}`} className="relative group">
                  <img
                    src={preview}
                    alt={`Archivo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg shadow-sm"
                  />
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                    📁
                  </div>
                </div>
              ))}
              {photos.map((photo, index) => (
                <div key={`photo-${index}`} className="relative group">
                  <img
                    src={photo}
                    alt={`Captura ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg shadow-sm"
                  />
                  <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                    📷
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {allImages.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500">
              No hay imágenes seleccionadas. Usa los botones de arriba para
              seleccionar archivos o capturar fotos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
