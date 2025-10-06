import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    useMemo
} from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Card,
    Typography,
    Slider,
    Space,
    Button,
    Tooltip,
    Dropdown,
    theme,
    Grid,
    Divider,
    Flex
} from "antd";
import {
    PlayCircleFilled,
    PauseCircleFilled,
    StepForwardOutlined,
    StepBackwardOutlined,
    SoundOutlined,
    AudioMutedOutlined,
    RetweetOutlined
} from "@ant-design/icons";
import {
    pauseTrack,
    playTrack,
    nextTrack,
    prevTrack,
    toggleShuffle,
    setTrackCollection
} from "../features/player/playerSlice";
import { getTrackAudioUrl, getTrackArtworkUrl } from "../api/musicApi";

/* ================== CONFIG ================== */
const DESKTOP_ARTWORK = 120;
const MOBILE_ARTWORK = 72;
const FLOAT_LIFT = 28; // how much artwork floats above bar
/* ============================================ */

const formatTime = (secs) => {
    if (secs == null || isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const parseDurationString = (durStr) => {
    if (!durStr) return 0;
    const parts = durStr.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return Number(durStr) || 0;
};

export default function FloatingPlayer() {
    const dispatch = useDispatch();
    const { token } = theme.useToken();
    const screens = Grid.useBreakpoint();

    const {
        track,
        isPlaying,
        shuffle,
        trackCollection
    } = useSelector((s) => s.player);
    const libraryTracks = useSelector((s) => s.tracks?.items || []); // fallback if player collection empty

    // Ensure player slice has a collection (once tracks load)
    useEffect(() => {
        if (!trackCollection.length && libraryTracks.length) {
            dispatch(setTrackCollection(libraryTracks));
        }
    }, [trackCollection.length, libraryTracks, dispatch]);

    // Hook order must never be conditional
    const audioRef = useRef(null);
    const rafRef = useRef(null);

    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [volume, setVolume] = useState(() => {
        const stored = localStorage.getItem("krax_volume");
        return stored ? Number(stored) : 0.85;
    });
    const [lastNonZeroVolume, setLastNonZeroVolume] = useState(0.85);
    const [isMuted, setIsMuted] = useState(false);
    const [buffering, setBuffering] = useState(false);

    // Derived
    const declaredDuration = useMemo(
        () => (track ? parseDurationString(track.duration) : 0),
        [track]
    );
    const effectiveDuration = duration || declaredDuration || 0;
    const progressPercent = effectiveDuration
        ? (currentTime / effectiveDuration) * 100
        : 0;

    const isMobile = !screens.md; // AntD: md breakpoint ~ 768px
    const artworkSize = isMobile ? MOBILE_ARTWORK : DESKTOP_ARTWORK;
    const showVolumeInline = screens.lg; // Only show slider inline on large screens

    // Stable tick for progress
    const tick = useCallback(() => {
        const audio = audioRef.current;
        if (audio && !seeking) {
            setCurrentTime(audio.currentTime);
        }
        rafRef.current = requestAnimationFrame(tick);
    }, [seeking]);

    useEffect(() => {
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [tick]);

    // Manage playback & volume
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !track) return;
        audio.volume = isMuted ? 0 : volume;
        if (isPlaying) {
            audio.play().catch(() => {});
        } else {
            audio.pause();
        }
    }, [isPlaying, volume, isMuted, track]);

    // Reset on track change
    useEffect(() => {
        if (!track) {
            setDuration(0);
            setCurrentTime(0);
            setBuffering(false);
        } else {
            setCurrentTime(0);
            setDuration(0);
            setBuffering(false);
        }
    }, [track]);

    // Persist volume
    useEffect(() => {
        localStorage.setItem("krax_volume", volume);
    }, [volume]);

    // Track last non-zero volume
    useEffect(() => {
        if (volume > 0) {
            setLastNonZeroVolume(volume);
            setIsMuted(false);
        } else {
            setIsMuted(true);
        }
    }, [volume]);

    /* Handlers */
    const handleLoadedMetadata = () => {
        const meta = audioRef.current?.duration;
        if (meta && !isNaN(meta)) setDuration(Math.floor(meta));
    };
    const handleWaiting = () => setBuffering(true);
    const handlePlaying = () => setBuffering(false);
    const handleSeekChange = (val) => {
        if (!effectiveDuration) return;
        setSeeking(true);
        setCurrentTime((val / 100) * effectiveDuration);
    };
    const handleSeekDone = (val) => {
        const audio = audioRef.current;
        if (audio && effectiveDuration) {
            audio.currentTime = (val / 100) * effectiveDuration;
        }
        setSeeking(false);
    };
    const toggleMute = () => {
        if (isMuted || volume === 0) {
            const restore = lastNonZeroVolume || 0.6;
            setVolume(restore);
            setIsMuted(false);
        } else {
            setIsMuted(true);
            setVolume(0);
        }
    };
    const togglePlay = () => {
        if (!track) return;
        if (isPlaying) dispatch(pauseTrack());
        else dispatch(playTrack(track));
    };
    const doNext = () => dispatch(nextTrack());
    const doPrev = () => dispatch(prevTrack());
    const doToggleShuffle = () => dispatch(toggleShuffle());

    if (!track) {
        return (
            <div
                style={{
                    position: "fixed",
                    left: 0,
                    bottom: 0,
                    width: "100%",
                    pointerEvents: "none"
                }}
            />
        );
    }

    const artworkUrl = getTrackArtworkUrl(track.fileHash);
    const audioUrl = getTrackAudioUrl(track.fileHash);

    const volumeControl = (
        <div style={{ padding: 12, width: 180 }}>
            <Typography.Text style={{ fontSize: 12 }}>Volume</Typography.Text>
            <Slider
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={setVolume}
                tooltip={{ open: false }}
                style={{ marginTop: 8 }}
            />
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11
                }}
            >
                <Typography.Text type="secondary">
                    {isMuted || volume === 0 ? "Muted" : `${Math.round(volume * 100)}%`}
                </Typography.Text>
                <Typography.Link onClick={toggleMute}>
                    {isMuted ? "Unmute" : "Mute"}
                </Typography.Link>
            </div>
        </div>
    );

    return (
        <Card
            variant="borderless"
            styles={{
                body: {
                    position: "relative",
                    padding: isMobile
                        ? `10px 16px 12px ${artworkSize + 24}px`
                        : `16px 260px 18px ${artworkSize + 64}px`,
                    display: "flex",
                    flexDirection: "column",
                    gap: isMobile ? 8 : 10,
                    background: `linear-gradient(115deg, ${token.colorBgElevated} 0%, ${token.colorBgElevated}E6 65%)`,
                    backdropFilter: "blur(8px)"
                }
            }}
            style={{
                position: "fixed",
                left: 0,
                bottom: 0,
                width: "100%",
                zIndex: 2000,
                borderRadius: 0,
                boxShadow:
                    "0 -6px 24px -4px rgba(0,0,0,0.35), 0 -1px 0 rgba(255,255,255,0.06)",
                borderTop: `1px solid ${token.colorBorderSecondary}`
            }}
        >
            {/* Floating Artwork */}
            <div
                style={{
                    position: "absolute",
                    left: isMobile ? 8 : 24,
                    bottom: isMobile ? 8 : 16,
                    width: artworkSize,
                    height: artworkSize,
                    transform: `translateY(-${isMobile ? FLOAT_LIFT * 0.6 : FLOAT_LIFT}px)`,
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow:
                        "0 14px 30px -10px rgba(0,0,0,0.45), 0 4px 10px rgba(0,0,0,0.3)",
                    background: token.colorBgContainer,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: `1px solid ${token.colorBorderSecondary}`,
                    outlineOffset: "-1px"
                }}
            >
                <img
                    src={artworkUrl}
                    alt={track.title}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                    }}
                    onError={(e) => (e.currentTarget.style.opacity = 0.3)}
                    draggable={false}
                />
            </div>

            {/* Top Row */}
            <Flex
                align="center"
                justify="space-between"
                gap={isMobile ? 12 : 24}
                wrap="wrap"
                style={{ minHeight: isMobile ? 50 : 70 }}
            >
                <Space
                    direction="vertical"
                    size={isMobile ? 0 : 2}
                    style={{ flex: 1, minWidth: 160 }}
                >
                    <Typography.Text
                        strong
                        ellipsis
                        style={{
                            fontSize: isMobile ? 14 : 18,
                            letterSpacing: 0.3
                        }}
                        title={track.title}
                    >
                        {track.title}
                    </Typography.Text>
                    {!isMobile && (
                        <Typography.Text
                            type="secondary"
                            style={{ fontSize: 12, opacity: 0.65 }}
                        >
                            Audio Track
                        </Typography.Text>
                    )}
                </Space>

                {/* Transport + Volume cluster */}
                <Space
                    align="center"
                    size={isMobile ? 4 : 12}
                    style={{ flexShrink: 0 }}
                >
                    <Tooltip title={shuffle ? "Shuffle On" : "Shuffle Off"}>
                        <Button
                            aria-label="Toggle shuffle"
                            type="text"
                            onClick={doToggleShuffle}
                            icon={
                                <RetweetOutlined
                                    style={{
                                        fontSize: isMobile ? 20 : 22,
                                        color: shuffle
                                            ? token.colorPrimary
                                            : token.colorTextSecondary
                                    }}
                                />
                            }
                        />
                    </Tooltip>

                    <Tooltip title="Previous">
                        <Button
                            aria-label="Previous"
                            type="text"
                            size="small"
                            icon={<StepBackwardOutlined style={{ fontSize: 18 }} />}
                            onClick={doPrev}
                            disabled={!trackCollection.length}
                        />
                    </Tooltip>

                    <Button
                        aria-label={isPlaying ? "Pause" : "Play"}
                        type="text"
                        onClick={togglePlay}
                        icon={
                            isPlaying ? (
                                <PauseCircleFilled
                                    style={{
                                        fontSize: isMobile ? 44 : 52,
                                        color: token.colorPrimary
                                    }}
                                />
                            ) : (
                                <PlayCircleFilled
                                    style={{
                                        fontSize: isMobile ? 44 : 52,
                                        color: token.colorPrimary
                                    }}
                                />
                            )
                        }
                    />

                    <Tooltip title="Next">
                        <Button
                            aria-label="Next"
                            type="text"
                            size="small"
                            icon={<StepForwardOutlined style={{ fontSize: 18 }} />}
                            onClick={doNext}
                            disabled={!trackCollection.length}
                        />
                    </Tooltip>

                    {showVolumeInline ? (
                        <Space
                            style={{
                                width: 140,
                                marginLeft: 4
                            }}
                        >
                            <Button
                                aria-label="Mute"
                                type="text"
                                onClick={toggleMute}
                                icon={
                                    isMuted || volume === 0 ? (
                                        <AudioMutedOutlined style={{ fontSize: 22 }} />
                                    ) : (
                                        <SoundOutlined
                                            style={{
                                                fontSize: 22,
                                                color: token.colorPrimary
                                            }}
                                        />
                                    )
                                }
                            />
                            <Slider
                                min={0}
                                max={1}
                                step={0.01}
                                value={isMuted ? 0 : volume}
                                onChange={setVolume}
                                tooltip={{ open: false }}
                                style={{ flex: 1 }}
                            />
                        </Space>
                    ) : (
                        <Dropdown
                            trigger={["click"]}
                            placement="topRight"
                            popupRender={() => volumeControl}
                        >
                            <Button
                                aria-label="Volume menu"
                                type="text"
                                icon={
                                    isMuted || volume === 0 ? (
                                        <AudioMutedOutlined style={{ fontSize: 24 }} />
                                    ) : (
                                        <SoundOutlined
                                            style={{
                                                fontSize: 24,
                                                color: token.colorPrimary
                                            }}
                                        />
                                    )
                                }
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Dropdown>
                    )}
                </Space>
            </Flex>

            {!isMobile && <Divider style={{ margin: "4px 0 2px" }} />}

            {/* Progress Row */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                }}
            >
                <Typography.Text
                    style={{
                        width: 52,
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 12
                    }}
                >
                    {formatTime(currentTime)}
                </Typography.Text>
                <Slider
                    aria-label="Seek"
                    style={{ flex: 1 }}
                    min={0}
                    max={100}
                    value={progressPercent}
                    onChange={handleSeekChange}
                    onChangeComplete={handleSeekDone}
                    tooltip={{ open: false }}
                    styles={{
                        rail: { background: token.colorBorderSecondary },
                        track: { background: token.colorPrimary }
                    }}
                />
                <Typography.Text
                    style={{
                        width: 52,
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 12
                    }}
                >
                    {formatTime(effectiveDuration)}
                </Typography.Text>
            </div>

            <audio
                ref={audioRef}
                src={audioUrl}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
                onEnded={() => dispatch(nextTrack())}
                preload="metadata"
            />
        </Card>
    );
}