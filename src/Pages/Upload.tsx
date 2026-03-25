import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  
import tempLogo from '../assets/TempLogo2.png';
import '../Stylesheets/Upload.css';
import Layout from './Layout';

function Upload() {
  const { collageId } = useParams(); // gets string from /upload/:collageId
  const collageIdNum = collageId ? parseInt(collageId, 10) : null;

  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);



  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setMessage(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {  
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await fetch(`http://localhost:3000/api/upload/${collageIdNum}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',           //ession cookie for auth later
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status})`);
      }

      const data = await response.json();

      setUploadResult(data);
      setMessage(`Success! Video uploaded to collage #${data.collageId}`);
      setFile(null);



    } catch (err: any) {
      setMessage(`Upload failed: ${err.message}`);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

    return (
    <Layout>
      
    <>

      <div className="upload-container">
        <button
          className="upload-button"
          onClick={() => navigate(`/game-viewer/${collageIdNum}`)}
          style={{ marginBottom: '1rem', backgroundColor: '#444' }}
        >
          Back to Session Viewer
        </button>

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