import { useState, type ChangeEvent } from "react";
import "./App.css";

function App() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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

  return (
    <div className="container">
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
      {previews.length > 0 && (
        <div className="preview-grid">
          {previews.map((preview, index) => (
            <div key={index} className="preview-item">
              <img src={preview} alt={`Preview ${index + 1}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
