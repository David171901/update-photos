import { useState, useRef, useEffect, type ChangeEvent } from "react";
import "./App.css";

function App() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // iniciar cámara
  useEffect(() => {
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
        console.error("Error al acceder a la cámara:", err);
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };

    startCamera();
    return () => stopCamera();
  }, [facingMode, stream]);

  // seleccionar fotos desde archivos
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

  // tomar foto con cámara
  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob && photos.length < 10) {
          setPhotos((prev) => [...prev, URL.createObjectURL(blob)]);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const clearPhotos = () => {
    setPhotos([]);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="container">
      <h1>Subir o Capturar Fotos</h1>

      {/* --- SUBIR ARCHIVOS --- */}
      <div className="upload-section">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          id="file-input"
          className="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          Seleccionar Fotos
        </label>
        {selectedFiles.length > 0 && (
          <p className="selected-count">
            {selectedFiles.length}{" "}
            {selectedFiles.length === 1
              ? "foto seleccionada"
              : "fotos seleccionadas"}
          </p>
        )}
      </div>

      {/* --- MOSTRAR PREVIEW DE ARCHIVOS SUBIDOS --- */}
      {previews.length > 0 && (
        <div className="preview-grid">
          {previews.map((preview, index) => (
            <div key={index} className="preview-item">
              <img src={preview} alt={`Preview ${index + 1}`} />
            </div>
          ))}
        </div>
      )}

      {/* --- SECCIÓN DE CÁMARA --- */}
      <div className="camera-section">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="rounded-xl shadow-md w-full max-w-md"
        />

        <div className="flex gap-2 mt-2">
          <button
            onClick={takePhoto}
            disabled={photos.length >= 10}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {photos.length >= 10 ? "Límite alcanzado" : "Capturar"}
          </button>
          <button
            onClick={toggleCamera}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Cambiar cámara
          </button>
          <button
            onClick={clearPhotos}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Limpiar
          </button>
        </div>

        {/* --- PREVISUALIZAR FOTOS TOMADAS --- */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {photos.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`captura-${idx}`}
                className="w-24 h-24 object-cover rounded-md shadow"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
