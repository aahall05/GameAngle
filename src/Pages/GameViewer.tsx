import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from './Layout';
import Card from '../Components/Card';
import '../Stylesheets/GameViewer.css';

type Video = {
    id: number;
    collage_id: number;
    filename: string;
    original_name: string;
    path: string;
};

type Collage = {
    id: number;
    name: string;
};

function GameViewer() {
    const navigate = useNavigate();
    const { collageId } = useParams();
    const [collage, setCollage] = useState<Collage | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedVideoSrc, setSelectedVideoSrc] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchCollageVideos = async () => {
            if (!collageId) {
                setErrorMessage('Missing collage id.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/api/collages/${collageId}/videos`, {
                    method: 'GET',
                    credentials: 'include',
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load session videos');
                }

                setCollage(data.collage);
                setVideos(data.videos);

                if (data.videos.length > 0) {
                    setSelectedVideoSrc(`http://localhost:3000${data.videos[0].path}`);
                }
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Failed to load session videos');
            } finally {
                setLoading(false);
            }
        };

        fetchCollageVideos();
    }, [collageId]);

    const handleSelectVideo = (video: Video) => {
        setSelectedVideoSrc(`http://localhost:3000${video.path}`);
    };

    return (
        <Layout>
            <div className="game-viewer-container">

                <Card className="game-viewer-header-card">
                    <div className="game-viewer-header-row">
                        <h2>{collage ? collage.name : 'Session Viewer'}</h2>
                        <button onClick={() => navigate(`/upload/${collageId}`)}>
                            Upload Video
                        </button>
                    </div>
                </Card>

                {loading && <p>Loading videos...</p>}
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                {!loading && !errorMessage && videos.length === 0 && (
                    <p>No videos uploaded yet for this session.</p>
                )}

                {!loading && !errorMessage && selectedVideoSrc && (
                <Card className="game-viewer-player-card">
                    <video
                        className="video-player"
                        controls
                        src={selectedVideoSrc}
                    >
                        Your browser does not support the video tag.
                    </video>
                </Card>
                )}

                {!loading && !errorMessage && videos.length > 0 && (
                <Card className="game-viewer-angle-card">
                    <div className="angle-strip">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                className="angle-thumbnail"
                                onClick={() => handleSelectVideo(video)}
                            >
                                <p>{video.original_name}</p>
                            </div>
                        ))}
                    </div>
                </Card>
                )}

            </div>
        </Layout>
    );
}

export default GameViewer;