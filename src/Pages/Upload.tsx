import { useState } from 'react';
import tempLogo from '../assets/TempLogo2.png';
import '../Stylesheets/Upload.css';
import Layout from './Layout'

function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setMessage(null);
      setProgress(0);
      setUploadResult(null);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);
    setMessage(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('video', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setProgress(percentComplete);
      }
    };

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            console.log('Progress:', percent, '%', event.loaded, '/', event.total);
            setProgress(percent);
        } else {
            console.log('Progress not computable');
        }
        };



    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setUploadResult(data);
          setMessage(`Success! Video saved as: ${data.filename}`);
          setFile(null); // optional: clear selection
          setProgress(0);
        } catch (e) {
          setMessage('Upload succeeded but response parsing failed');
        }
      } else {
        setMessage(`Upload failed: ${xhr.statusText || 'Server error'}`);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setMessage('Network error during upload');
    };

    xhr.open('POST', 'http://localhost:3000/api/upload-video', true);
    xhr.send(formData);
  };

    return (
    <Layout>
      
    <>
      <div>
        <img src={tempLogo} className="logo" alt="GameAngle logo" />
      </div>
      <div className="upload-container">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          id="video-upload"
          style={{ display: 'none' }}
        />

        <label htmlFor="video-upload" className="upload-button">
          Choose Video
        </label>

        {file && (
          <div className="file-info">
            Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
          </div>
        )}

        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="upload-button"
            style={{ marginTop: '1rem', backgroundColor: '#0066cc' }}
          >
            {uploading ? 'Uploading...' : 'Send Video to Server'}
          </button>
        )}

        {message && (
          <div style={{
            marginTop: '1rem',
            padding: '10px',
            borderRadius: '6px',
            backgroundColor: message.includes('Error') ? '#ffe6e6' : '#e6ffe6',
            color: message.includes('Error') ? '#cc0000' : '#006600',
          }}>
            {message}
          </div>
        )}

        {uploadResult && (
          <div className="result-container">
            <p>Uploaded successfully!</p>
            <p>Filename: {uploadResult.filename}</p>

            {/* Video preview */}
            <video width="500" controls style={{ margin: '1rem 0' }}>
              <source
                src={`http://localhost:3000/videofiles/${uploadResult.filename}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>

            {/* All metadata dump */}
            <div className="metadata-section">
              <h4>Full Upload Metadata:</h4>
              <pre>
                {JSON.stringify(uploadResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

                </div>
            </>
    </Layout>
       
  );
}

export default Upload;