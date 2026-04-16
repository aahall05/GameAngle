import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from './Layout';
import Card from '../Components/Card';
import { useAuth } from '../AuthContext';
import '../Stylesheets/GameViewer.css';

type Video = {
    id: number;
    collage_id: number;
    filename: string;
    original_name: string;
    path: string;
    created_at?: string;
    time?: string;
    length_seconds?: number | null;
};

type Collage = {
    id: number;
    name: string;
    creator_user_id?: number | null;
};

type VideoWindow = {
    videoId: number;
    startMs: number;
    endMs: number;
};

const LOUD_EVENT_MIN_GAP_SEC = 1;

const formatTime = (seconds: number) => {
    const clamped = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(clamped / 3600);
    const minutes = Math.floor((clamped % 3600) / 60);
    const secs = clamped % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const parseVideoWindow = (video: Video): VideoWindow | null => {
    if (!video.created_at || !video.time || !video.length_seconds || video.length_seconds <= 0) {
        return null;
    }

    const datePart = video.created_at.slice(0, 10);
    const timeMatch = video.time.match(/\d{2}:\d{2}:\d{2}/);
    if (!timeMatch) {
        return null;
    }

    const startDate = new Date(`${datePart}T${timeMatch[0]}`);
    if (Number.isNaN(startDate.getTime())) {
        return null;
    }

    const startMs = startDate.getTime();
    const endMs = startMs + video.length_seconds * 1000;

    return {
        videoId: video.id,
        startMs,
        endMs,
    };
};

const detectLoudEvents = (audioBuffer: AudioBuffer): number[] => {
    const chunkSize = 2048;
    const sampleRate = audioBuffer.sampleRate;
    const channelCount = audioBuffer.numberOfChannels;

    if (channelCount === 0) {
        return [];
    }

    const channels: Float32Array[] = [];
    for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
        channels.push(audioBuffer.getChannelData(channelIndex));
    }

    const chunkRms: number[] = [];

    for (let start = 0; start < audioBuffer.length; start += chunkSize) {
        const end = Math.min(start + chunkSize, audioBuffer.length);
        let energy = 0;
        let sampleCount = 0;

        for (let frame = start; frame < end; frame += 1) {
            let mixedSample = 0;
            for (let channelIndex = 0; channelIndex < channels.length; channelIndex += 1) {
                mixedSample += channels[channelIndex][frame] ?? 0;
            }

            mixedSample /= channels.length;
            energy += mixedSample * mixedSample;
            sampleCount += 1;
        }

        const rms = sampleCount > 0 ? Math.sqrt(energy / sampleCount) : 0;
        chunkRms.push(rms);
    }

    if (chunkRms.length === 0) {
        return [];
    }

    const mean = chunkRms.reduce((sum, value) => sum + value, 0) / chunkRms.length;
    const variance = chunkRms.reduce((sum, value) => sum + (value - mean) ** 2, 0) / chunkRms.length;
    const stdDev = Math.sqrt(variance);

    const sorted = [...chunkRms].sort((a, b) => a - b);
    const percentileIndex = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
    const p95 = sorted[percentileIndex];

    const threshold = Math.max(mean + stdDev * 2, p95 * 0.9);
    const detectedTimes: number[] = [];
    let lastAcceptedSec = -Infinity;

    for (let i = 1; i < chunkRms.length - 1; i += 1) {
        const current = chunkRms[i];
        const isPeak = current >= threshold && current >= chunkRms[i - 1] && current >= chunkRms[i + 1];
        if (!isPeak) {
            continue;
        }

        const eventSec = (i * chunkSize) / sampleRate;
        if (eventSec - lastAcceptedSec < LOUD_EVENT_MIN_GAP_SEC) {
            continue;
        }

        detectedTimes.push(eventSec);
        lastAcceptedSec = eventSec;
    }

    return detectedTimes;
};

function GameViewer() {
    const navigate = useNavigate();
    const { loggedIn, userId } = useAuth();
    const { collageId } = useParams();
    const [collage, setCollage] = useState<Collage | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
    const [timelinePositionSec, setTimelinePositionSec] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [interestMomentsSec, setInterestMomentsSec] = useState<number[]>([]);
    const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const selectedVideoRef = useRef<HTMLVideoElement | null>(null);
    const thumbnailVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

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
                    setSelectedVideoId(data.videos[0].id);
                }
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Failed to load session videos');
            } finally {
                setLoading(false);
            }
        };

        fetchCollageVideos();
    }, [collageId]);

    const videoWindows = useMemo(
        () => videos.map(parseVideoWindow).filter((window): window is VideoWindow => window !== null),
        [videos]
    );

    const timelineBounds = useMemo(() => {
        if (videoWindows.length === 0) {
            return null;
        }

        const startMs = Math.min(...videoWindows.map((window) => window.startMs));
        const endMs = Math.max(...videoWindows.map((window) => window.endMs));

        return { startMs, endMs };
    }, [videoWindows]);

    const videoWindowsById = useMemo(() => {
        const mapping = new Map<number, VideoWindow>();
        videoWindows.forEach((window) => {
            mapping.set(window.videoId, window);
        });
        return mapping;
    }, [videoWindows]);

    const angleNumberByVideoId = useMemo(() => {
        const indexedVideos = videos.map((video) => {
            const windowInfo = videoWindowsById.get(video.id);
            return {
                videoId: video.id,
                sortStart: windowInfo ? windowInfo.startMs : Number.MAX_SAFE_INTEGER,
                tieBreaker: video.id,
            };
        });

        indexedVideos.sort((a, b) => {
            if (a.sortStart !== b.sortStart) {
                return a.sortStart - b.sortStart;
            }
            return a.tieBreaker - b.tieBreaker;
        });

        const mapping = new Map<number, number>();
        indexedVideos.forEach((entry, index) => {
            mapping.set(entry.videoId, index + 1);
        });

        return mapping;
    }, [videos, videoWindowsById]);

    useEffect(() => {
        setTimelinePositionSec(0);
    }, [timelineBounds?.startMs, timelineBounds?.endMs]);

    const selectedVideo = useMemo(
        () => videos.find((video) => video.id === selectedVideoId) ?? null,
        [videos, selectedVideoId]
    );

    const selectedVideoWindow = useMemo(() => {
        if (!selectedVideo) {
            return null;
        }

        return parseVideoWindow(selectedVideo);
    }, [selectedVideo]);

    const absoluteTimelineMs = useMemo(() => {
        if (!timelineBounds) {
            return null;
        }

        return timelineBounds.startMs + timelinePositionSec * 1000;
    }, [timelineBounds, timelinePositionSec]);

    const isSelectedVideoAvailableAtTimeline = useMemo(() => {
        if (!selectedVideoWindow || absoluteTimelineMs === null) {
            return false;
        }

        return absoluteTimelineMs >= selectedVideoWindow.startMs && absoluteTimelineMs <= selectedVideoWindow.endMs;
    }, [selectedVideoWindow, absoluteTimelineMs]);

    useEffect(() => {
        if (!selectedVideoRef.current || !selectedVideoWindow || absoluteTimelineMs === null) {
            return;
        }

        if (!isSelectedVideoAvailableAtTimeline) {
            selectedVideoRef.current.pause();
            return;
        }

        const relativeSeconds = (absoluteTimelineMs - selectedVideoWindow.startMs) / 1000;
        const clampedSeconds = Math.max(0, relativeSeconds);

        if (!isPlaying) {
            selectedVideoRef.current.currentTime = clampedSeconds;
            return;
        }

        const drift = Math.abs(selectedVideoRef.current.currentTime - clampedSeconds);
        if (drift > 0.5) {
            selectedVideoRef.current.currentTime = clampedSeconds;
        }
    }, [selectedVideoWindow, absoluteTimelineMs, isSelectedVideoAvailableAtTimeline, isPlaying]);

    const timelineDurationSec = useMemo(() => {
        if (!timelineBounds) {
            return 0;
        }

        return Math.max(0, Math.round((timelineBounds.endMs - timelineBounds.startMs) / 1000));
    }, [timelineBounds]);

    const timelineClockLabel = useMemo(() => {
        if (absoluteTimelineMs === null) {
            return '--:--:--';
        }

        const date = new Date(absoluteTimelineMs);
        return date.toLocaleTimeString() + " UTC";
    }, [absoluteTimelineMs]);

    useEffect(() => {
        let cancelled = false;

        const analyzeLoudMoments = async () => {
            if (!timelineBounds || videos.length === 0) {
                setInterestMomentsSec([]);
                return;
            }

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) {
                setInterestMomentsSec([]);
                return;
            }

            setIsAnalyzingAudio(true);
            const audioContext: AudioContext = new AudioContextClass();
            const collectedMoments: number[] = [];

            try {
                for (const video of videos) {
                    const windowInfo = videoWindowsById.get(video.id);
                    if (!windowInfo) {
                        continue;
                    }

                    const response = await fetch(`http://localhost:3000${video.path}`, {
                        credentials: 'include',
                    });

                    if (!response.ok) {
                        continue;
                    }

                    const buffer = await response.arrayBuffer();
                    const audioBuffer = await audioContext.decodeAudioData(buffer.slice(0));
                    const relativeLoudTimes = detectLoudEvents(audioBuffer);

                    relativeLoudTimes.forEach((relativeSec) => {
                        const absoluteMs = windowInfo.startMs + relativeSec * 1000;
                        const timelineSec = (absoluteMs - timelineBounds.startMs) / 1000;

                        if (timelineSec >= 0) {
                            collectedMoments.push(timelineSec);
                        }
                    });
                }

                const sorted = collectedMoments.sort((a, b) => a - b);
                const deduped: number[] = [];
                for (const time of sorted) {
                    if (deduped.length === 0 || time - deduped[deduped.length - 1] >= LOUD_EVENT_MIN_GAP_SEC) {
                        deduped.push(time);
                    }
                }

                if (!cancelled) {
                    setInterestMomentsSec(deduped);
                }
            } catch (error) {
                if (!cancelled) {
                    setInterestMomentsSec([]);
                }
            } finally {
                if (!cancelled) {
                    setIsAnalyzingAudio(false);
                }
                audioContext.close().catch(() => undefined);
            }
        };

        analyzeLoudMoments();

        return () => {
            cancelled = true;
        };
    }, [timelineBounds, videos, videoWindowsById]);

    useEffect(() => {
        if (!isPlaying || timelineDurationSec === 0) {
            return;
        }

        const tickMs = 250;
        const id = window.setInterval(() => {
            setTimelinePositionSec((current) => {
                const next = current + tickMs / 1000;

                if (next >= timelineDurationSec) {
                    window.clearInterval(id);
                    setIsPlaying(false);
                    return timelineDurationSec;
                }

                return next;
            });
        }, tickMs);

        return () => window.clearInterval(id);
    }, [isPlaying, timelineDurationSec]);

    useEffect(() => {
        const player = selectedVideoRef.current;
        if (!player) {
            return;
        }

        if (isPlaying && isSelectedVideoAvailableAtTimeline) {
            const playPromise = player.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => undefined);
            }
            return;
        }

        player.pause();
    }, [isPlaying, isSelectedVideoAvailableAtTimeline, selectedVideoId]);

    const handleTogglePlayPause = () => {
        if (timelineDurationSec === 0) {
            return;
        }

        if (!isPlaying && timelinePositionSec >= timelineDurationSec) {
            setTimelinePositionSec(0);
        }

        setIsPlaying((current) => !current);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code !== 'Space') {
                return;
            }

            const activeElement = document.activeElement as HTMLElement | null;
            const tagName = activeElement?.tagName?.toLowerCase();
            const isTypingTarget =
                tagName === 'input' ||
                tagName === 'textarea' ||
                tagName === 'select' ||
                activeElement?.isContentEditable;

            if (isTypingTarget) {
                return;
            }

            event.preventDefault();
            handleTogglePlayPause();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [timelineDurationSec, timelinePositionSec, isPlaying]);

    const handleSelectVideo = (video: Video) => {
        setSelectedVideoId(video.id);
    };

    const handleJumpToMoment = (momentSec: number) => {
        setTimelinePositionSec(momentSec);
    };

    const canUploadToCollage = useMemo(() => {
        if (!loggedIn || userId === null || !collage) {
            return false;
        }

        return collage.creator_user_id === userId;
    }, [loggedIn, userId, collage]);

    const getRelativeSecondsForVideo = (videoId: number) => {
        if (absoluteTimelineMs === null) {
            return null;
        }

        const windowInfo = videoWindowsById.get(videoId);
        if (!windowInfo) {
            return null;
        }

        if (absoluteTimelineMs < windowInfo.startMs || absoluteTimelineMs > windowInfo.endMs) {
            return null;
        }

        return Math.max(0, (absoluteTimelineMs - windowInfo.startMs) / 1000);
    };

    useEffect(() => {
        videos.forEach((video) => {
            const thumbnailPlayer = thumbnailVideoRefs.current.get(video.id);
            if (!thumbnailPlayer) {
                return;
            }

            const relativeSeconds = getRelativeSecondsForVideo(video.id);
            if (relativeSeconds === null) {
                thumbnailPlayer.pause();
                return;
            }

            if (thumbnailPlayer.readyState < 1) {
                return;
            }

            const safeTargetTime = Number.isFinite(thumbnailPlayer.duration)
                ? Math.min(relativeSeconds, thumbnailPlayer.duration)
                : relativeSeconds;

            const drift = Math.abs(thumbnailPlayer.currentTime - safeTargetTime);
            if (drift > 0.2) {
                thumbnailPlayer.currentTime = safeTargetTime;
            }

            thumbnailPlayer.pause();
        });
    }, [videos, absoluteTimelineMs, videoWindowsById]);

    return (
        <Layout>
            <div className="game-viewer-container">

                <Card className="game-viewer-header-card">
                    <div className="game-viewer-header-row">
                        <h2>{collage ? collage.name : 'Session Viewer'}</h2>
                        {canUploadToCollage && (
                            <button onClick={() => navigate(`/upload/${collageId}`)}>
                                Upload Video
                            </button>
                        )}
                    </div>
                </Card>

                {loading && <p>Loading videos...</p>}
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                {!loading && !errorMessage && videos.length === 0 && (
                    <p>No videos uploaded yet for this session.</p>
                )}

                {!loading && !errorMessage && videos.length > 0 && (
                    <Card className="game-viewer-player-card">
                        {selectedVideo && isSelectedVideoAvailableAtTimeline ? (
                            <video
                                ref={selectedVideoRef}
                                className="video-player"
                                src={`http://localhost:3000${selectedVideo.path}`}
                                controls={false}
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="video-player blank-video-state">
                                <p>No footage for selected video at this timeline position.</p>
                            </div>
                        )}
                    </Card>
                )}

                {!loading && !errorMessage && videos.length > 0 && (
                    <Card className="game-viewer-timeline-card">
                        <div className="timeline-header-row">
                            <div className="timeline-left-controls">
                                <button
                                    type="button"
                                    onClick={handleTogglePlayPause}
                                    disabled={timelineDurationSec === 0}
                                >
                                    {isPlaying ? 'Pause' : 'Play'}
                                </button>
                                <strong>Timeline</strong>
                            </div>
                            <span>{timelineClockLabel}</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={timelineDurationSec}
                            step={0.25}
                            value={timelinePositionSec}
                            onChange={(event) => setTimelinePositionSec(Number(event.target.value))}
                            className="timeline-scrubber"
                            disabled={timelineDurationSec === 0}
                        />
                        <div className="timeline-marker-row" aria-hidden={timelineDurationSec === 0}>
                            {timelineDurationSec > 0 && interestMomentsSec.map((momentSec, index) => {
                                const clamped = Math.min(Math.max(momentSec, 0), timelineDurationSec);
                                const leftPercent = (clamped / timelineDurationSec) * 100;

                                return (
                                    <button
                                        key={`${momentSec}-${index}`}
                                        type="button"
                                        className="timeline-interest-marker"
                                        style={{ left: `${leftPercent}%` }}
                                        title={`Loud sound at ${formatTime(clamped)}`}
                                        onClick={() => handleJumpToMoment(clamped)}
                                    >
                                        ▲
                                    </button>
                                );
                            })}
                        </div>
                        {isAnalyzingAudio && <p className="timeline-analyzing-label">Analyzing audio for highlights…</p>}
                        <div className="timeline-label-row">
                            <span>00:00</span>
                            <span>{formatTime(timelinePositionSec)}</span>
                            <span>{formatTime(timelineDurationSec)}</span>
                        </div>
                    </Card>
                )}

                {!loading && !errorMessage && videos.length > 0 && (
                <Card className="game-viewer-angle-card">
                    <div className="angle-strip">
                        {videos.map((video) => (
                            (() => {
                                const relativeSeconds = getRelativeSecondsForVideo(video.id);
                                const hasFootageAtTimeline = relativeSeconds !== null;

                                return (
                                    <div
                                        key={video.id}
                                        className={`angle-thumbnail ${selectedVideoId === video.id ? 'angle-thumbnail-selected' : ''}`}
                                        onClick={() => handleSelectVideo(video)}
                                    >
                                        <div className="angle-thumbnail-preview">
                                            {hasFootageAtTimeline ? (
                                                <video
                                                    ref={(node) => {
                                                        if (node) {
                                                            thumbnailVideoRefs.current.set(video.id, node);
                                                        } else {
                                                            thumbnailVideoRefs.current.delete(video.id);
                                                        }
                                                    }}
                                                    className="angle-thumbnail-video"
                                                    src={`http://localhost:3000${video.path}`}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                    onLoadedMetadata={(event) => {
                                                        const targetSeconds = getRelativeSecondsForVideo(video.id);
                                                        if (targetSeconds === null) {
                                                            return;
                                                        }

                                                        const safeTarget = Number.isFinite(event.currentTarget.duration)
                                                            ? Math.min(targetSeconds, event.currentTarget.duration)
                                                            : targetSeconds;
                                                        event.currentTarget.currentTime = safeTarget;
                                                        event.currentTarget.pause();
                                                    }}
                                                />
                                            ) : (
                                                <div className="angle-thumbnail-black" />
                                            )}
                                        </div>
                                        <p>{`Angle ${angleNumberByVideoId.get(video.id) ?? '?'}`}</p>
                                        <small>
                                            {video.time || 'unknown start'} • {video.length_seconds ?? 0}s
                                        </small>
                                    </div>
                                );
                            })()
                        ))}
                    </div>
                </Card>
                )}

            </div>
        </Layout>
    );
}

export default GameViewer;