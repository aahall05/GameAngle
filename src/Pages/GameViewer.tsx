import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from './Layout';
import Card from '../Components/Card';
import '../Stylesheets/GameViewer.css';

function GameViewer() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [videoSrc] = useState<string>(`../../VideoFileStorage/test_video.mp4`); {/* TODO : get video from server and replace hard coded path */ }

    return (
        <Layout>
            <div className="game-viewer-container">

                {/*video title header*/}
                <Card className="game-viewer-header-card">                   
                    <h2>Boone High vs Edgewater - March 15, 2026</h2> {/* TODO : get title from database */}
                </Card>

                {/* video player */}
                <Card className="game-viewer-player-card">
                    <video
                        className="video-player"
                        controls
                        src={videoSrc}
                    >
                        Your browser does not support the video tag.
                    </video>
                </Card>

                {/* video selection strip */}
                <Card className="game-viewer-angle-card">
                    <button className="angle-scroll-btn">&#9664;</button>

                    <div className="angle-strip">
                    {/* 
                        TODO : figure out how to create and store thumbnails

                        one idea is using ffmpeg to generate a thumbnail image from 
                        the first frame when a video is uploaded, store that in the database,
                        then retrieve and display that thumbnail in the angle strip.

                        another idea is using ReactPlayer library, but it makes video playback more involved
                    */}
                        {/* placeholder thumbnails */}
                        {[1, 2, 3, 4, 5].map((i) => (
                            // TODO : on click, update videoSrc to the video for the selected angle
                            <div key={i} className="angle-thumbnail">
                                <p>Video player preview for a different angle</p>
                            </div>
                        ))}
                    </div>

                    <button className="angle-scroll-btn">&#9654;</button>
                </Card>

            </div>
        </Layout>
    );
}

export default GameViewer;