import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';  
import '../Stylesheets/Upload.css';
import Layout from './Layout';
import { useAuth } from '../AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://gameangle.onrender.com';

function Upload() {
  const { collageId } = useParams(); // gets string from /upload/:collageId
  const collageIdNum = collageId ? parseInt(collageId, 10) : null;
  const [searchParams] = useSearchParams();
  const { userId, loggedIn } = useAuth();

  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [createDate, setCreateDate] = useState('');
  const [duration, setDuration] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);

  const showSharePanel = searchParams.get('share') === '1';

  const uploadLink = useMemo(() => {
    if (!collageIdNum) {
      return '';
    }

    return `${window.location.origin}/upload/${collageIdNum}`;
  }, [collageIdNum]);

  const qrCodeUrl = useMemo(() => {
    if (!uploadLink) {
      return '';
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(uploadLink)}`;
  }, [uploadLink]);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!collageIdNum || !loggedIn || userId === null) {
        setIsOwner(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/collages/${collageIdNum}/videos`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          setIsOwner(false);
          return;
        }

        const data = await response.json();
        setIsOwner(data.collage?.creator_user_id === userId);
      } catch (error) {
        setIsOwner(false);
      }
    };

    checkOwnership();
  }, [collageIdNum, loggedIn, userId]);

  const extractVideoDuration = (videoFile: File): Promise<number | null> => {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(videoFile);
      const videoElement = document.createElement('video');

      videoElement.preload = 'metadata';
      videoElement.onloadedmetadata = () => {
        const rawDuration = Number.isFinite(videoElement.duration) ? videoElement.duration : NaN;
        URL.revokeObjectURL(objectUrl);

        if (Number.isNaN(rawDuration) || rawDuration < 0) {
          resolve(null);
          return;
        }

        resolve(Math.round(rawDuration));
      };

      videoElement.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };

      videoElement.src = objectUrl;
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setCreateDate(new Date(selectedFile.lastModified).toISOString());

      const extractedDuration = await extractVideoDuration(selectedFile);
      setDuration(extractedDuration !== null ? String(extractedDuration) : '');

      setMessage(null);
      setMessageType(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {  
    if (!file) return;

    setUploading(true);
    setMessage(null);
    setMessageType(null);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('create_date', createDate);
    formData.append('duration', duration);

    try {
      const response = await fetch(`${API_BASE}/api/upload/${collageIdNum}`, {
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
      setMessageType('success');
      setFile(null);



    } catch (err: any) {
      setMessage(`Upload failed: ${err.message}`);
      setMessageType('error');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

    return (
    <Layout>
      
    <>

      <div className="upload-container">
        {showSharePanel && isOwner && uploadLink && (
          <div className="share-panel">
            <h3>Share Upload Link</h3>
            <p className="share-link">{uploadLink}</p>
            <img className="share-qr" src={qrCodeUrl} alt="Upload QR code" />
          </div>
        )}

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
            <br />
            Auto metadata: create_date={createDate || 'unknown'}, duration={duration || 'unknown'}s
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
            backgroundColor: messageType === 'error' ? '#ffe6e6' : '#e6ffe6',
            color: messageType === 'error' ? '#cc0000' : '#006600',
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
                src={`${API_BASE}/videofiles/${uploadResult.filename}`}
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