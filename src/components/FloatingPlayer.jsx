import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Card,
    Typography,
    Slider,
    Space,
    Button,
    Tooltip,
    Dropdown,
    Skeleton,
    theme as antdTheme,
    Flex
} from "antd";
import {
    PlayCircleFilled,
    PauseCircleFilled,
    StepForwardOutlined,
    StepBackwardOutlined,
    SoundOutlined,
    AudioMutedOutlined,
    LoadingOutlined,
    RetweetOutlined,
    RetweetOutlined as ShuffleActiveIcon
} from "@ant-design/icons";
import {
    pauseTrack,
    playTrack,
    playNext,
    playPrev,
    toggleShuffle
} from "../features/player/playerSlice";
import { getTrackAudioUrl, getTrackArtworkUrl } from "../api/musicApi";

const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return "00:00";
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
    const { token } = antdTheme.useToken();
    const { track, isPlaying, queue, currentIndex, shuffle } = useSelector(
        (s) => s.player
    );

    // Always keep hook order stable
    const audioRef = useRef(null);
    const rafRef = useRef(null);

    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [buffering, setBuffering] = useState(false);
    const [hoverTime, setHoverTime] = useState(null);
    const [volume, setVolume] = useState(() => {
        const stored = localStorage.getItem("krax_volume");
        return stored !== null ? Number(stored) : 0.85;
    });
    const [lastNonZeroVolume, setLastNonZeroVolume] = useState(0.85);
    const [isMuted, setIsMuted] = useState(false);

    const updateTime = useCallback(() => {
        const audio = audioRef.current;
        if (audio && !seeking) {
            setCurrentTime(audio.currentTime);
        }
        rafRef.current = requestAnimationFrame(updateTime);
    }, [seeking]);

    useEffect(() => {
        rafRef.current = requestAnimationFrame(updateTime);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [updateTime, track]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = isMuted ? 0 : volume;
        if (track) {
            if (isPlaying) {
                audio.play().catch(() => {});
            } else {
                audio.pause();
            }
        }
    }, [isPlaying, volume, isMuted, track]);

    useEffect(() => {
        if (!track) {
            setDuration(0);
            setCurrentTime(0);
            setBuffering(false);
            setSeeking(false);
            setHoverTime(null);
        } else {
            setCurrentTime(0);
            setDuration(0);
            setBuffering(false);
        }
    }, [track]);

    useEffect(() => {
        localStorage.setItem("krax_volume", volume);
    }, [volume]);

    useEffect(() => {
        if (volume > 0) {
            setLastNonZeroVolume(volume);
            setIsMuted(false);
        } else if (volume === 0) {
            setIsMuted(true);
        }
    }, [volume]);

    const declaredDuration = useMemo(
        () => (track ? parseDurationString(track.duration) : 0),
        [track]
    );
    const effectiveDuration = duration || declaredDuration || 0;
    const progressPercent = effectiveDuration
        ? (currentTime / effectiveDuration) * 100
        : 0;

    const artworkUrl = track ? getTrackArtworkUrl(track.fileHash) : "";
    const audioSrc = track ? getTrackAudioUrl(track.fileHash) : "";

    const onPlayPause = () => {
        if (!track) return;
        if (isPlaying) dispatch(pauseTrack());
        else dispatch(playTrack(track));
    };

    const handleLoadedMetadata = () => {
        const audio = audioRef.current;
        if (!audio) return;
        const metaDuration = Math.floor(audio.duration);
        if (metaDuration && !isNaN(metaDuration)) setDuration(metaDuration);
    };
    const handleWaiting = () => setBuffering(true);
    const handlePlaying = () => setBuffering(false);

    const handleSeekChange = (val) => {
        if (!effectiveDuration) return;
        setSeeking(true);
        setCurrentTime((val / 100) * effectiveDuration);
    };
    const handleSeekAfter = (val) => {
        const audio = audioRef.current;
        if (!audio || !effectiveDuration) {
            setSeeking(false);
            return;
        }
        audio.currentTime = (val / 100) * effectiveDuration;
        setSeeking(false);
    };

    const handleVolumeChange = (val) => {
        setVolume(val);
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

    const sliderTooltipFormatter = (val) => {
        const previewTime = effectiveDuration * (val / 100);
        return formatTime(previewTime);
    };

    const volumeNode = (
        <div
            style={{
                padding: "8px 12px",
                width: 160
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <Typography.Text style={{ fontSize: 12, opacity: 0.7 }}>
                Volume
            </Typography.Text>
            <Slider
                style={{ margin: "6px 0 4px" }}
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                tooltip={{ open: false }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    {isMuted || volume === 0
                        ? "Muted"
                        : `${Math.round(volume * 100)}%`}
                </Typography.Text>
                <Typography.Link style={{ fontSize: 11 }} onClick={toggleMute}>
                    {isMuted ? "Unmute" : "Mute"}
                </Typography.Link>
            </div>
        </div>
    );

    // If no track, render stable empty container (maintains hook order)
    if (!track) {
        return (
            <div
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    pointerEvents: "none"
                }}
            />
        );
    }

    return (
        <Card
            bordered={false}
            bodyStyle={{
                position: "relative",
                padding: "16px 260px 18px 170px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: token.colorBgElevated,
                backdropFilter: "blur(8px)"
            }}
            style={{
                position: "fixed",
                left: 0,
                bottom: 0,
                width: "100%",
                zIndex: 1200,
                margin: 0,
                borderRadius: 0,
                boxShadow:
                    "0 -6px 24px rgba(0,0,0,0.28), 0 -1px 0 rgba(255,255,255,0.05)"
            }}
        >
            {/* Enlarged Floating Artwork */}
            <div
                style={{
                    position: "absolute",
                    left: 28,
                    bottom: 18,
                    width: 140,
                    height: 140,
                    transform: "translateY(-55%)",
                    borderRadius: 22,
                    overflow: "hidden",
                    boxShadow:
                        "0 12px 32px -8px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.35)",
                    background:
                        "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform .4s ease"
                }}
            >
                {buffering && !currentTime ? (
                    <Skeleton.Image
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        active
                    />
                ) : (
                    <img
                        src={artworkUrl}
                        alt={track.title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block"
                        }}
                        onError={(e) => {
                            e.currentTarget.style.opacity = 0.25;
                        }}
                    />
                )}
            </div>

            {/* Top Row */}
            <Flex
                align="center"
                justify="space-between"
                style={{ gap: 32, flexWrap: "wrap" }}
            >
                <Space
                    direction="vertical"
                    style={{ flex: 1, minWidth: 240 }}
                    size={4}
                >
                    <Typography.Text
                        strong
                        ellipsis
                        style={{ fontSize: 18, letterSpacing: 0.4 }}
                        title={track.title}
                    >
                        {track.title}
                    </Typography.Text>
                    <Typography.Text
                        type="secondary"
                        style={{ fontSize: 13, opacity: 0.65 }}
                    >
                        {queue.length
                            ? `Track ${currentIndex + 1} of ${queue.length}`
                            : "Single track"}
                    </Typography.Text>
                </Space>

                <Space
                    align="center"
                    style={{ flexShrink: 0, gap: 14, marginLeft: "auto" }}
                >
                    <Tooltip title="Previous">
                        <Button
                            type="text"
                            icon={<StepBackwardOutlined style={{ fontSize: 22 }} />}
                            disabled={queue.length <= 1 || (!shuffle && currentIndex <= 0)}
                            onClick={() => dispatch(playPrev())}
                        />
                    </Tooltip>

                    <Tooltip title={isPlaying ? "Pause" : "Play"}>
                        <Button
                            type="text"
                            onClick={onPlayPause}
                            icon={
                                buffering ? (
                                    <LoadingOutlined style={{ fontSize: 46 }} />
                                ) : isPlaying ? (
                                    <PauseCircleFilled
                                        style={{ fontSize: 52, color: token.colorPrimary }}
                                    />
                                ) : (
                                    <PlayCircleFilled
                                        style={{ fontSize: 52, color: token.colorPrimary }}
                                    />
                                )
                            }
                        />
                    </Tooltip>

                    <Tooltip title="Next">
                        <Button
                            type="text"
                            icon={<StepForwardOutlined style={{ fontSize: 22 }} />}
                            disabled={
                                queue.length <= 1 ||
                                (!shuffle && currentIndex >= queue.length - 1)
                            }
                            onClick={() => dispatch(playNext())}
                        />
                    </Tooltip>

                    <Tooltip
                        title={shuffle ? "Shuffle On (random order)" : "Shuffle Off"}
                    >
                        <Button
                            type="text"
                            onClick={() => dispatch(toggleShuffle())}
                            icon={
                                <RetweetOutlined
                                    style={{
                                        fontSize: 24,
                                        color: shuffle ? token.colorPrimary : token.colorTextTertiary,
                                        transform: shuffle ? "rotate(25deg)" : "none",
                                        transition: "all .25s ease"
                                    }}
                                />
                            }
                        />
                    </Tooltip>

                    <Dropdown
                        trigger={["click"]}
                        dropdownRender={() => volumeNode}
                        placement="topRight"
                    >
                        <Button
                            type="text"
                            style={{ marginLeft: 8 }}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleMute();
                            }}
                        />
                    </Dropdown>
                </Space>
            </Flex>

            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Typography.Text
                    style={{
                        width: 54,
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums"
                    }}
                >
                    {formatTime(currentTime)}
                </Typography.Text>
                <Slider
                    style={{ flex: 1 }}
                    min={0}
                    max={100}
                    value={progressPercent}
                    onChange={handleSeekChange}
                    onChangeComplete={handleSeekAfter}
                    tooltip={{
                        open: hoverTime !== null,
                        formatter: sliderTooltipFormatter
                    }}
                    onMouseMove={(e) => {
                        if (!effectiveDuration) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = Math.min(
                            1,
                            Math.max(0, (e.clientX - rect.left) / rect.width)
                        );
                        setHoverTime(ratio * effectiveDuration);
                    }}
                    onMouseLeave={() => setHoverTime(null)}
                />
                <Typography.Text
                    style={{ width: 54, fontVariantNumeric: "tabular-nums" }}
                >
                    {formatTime(effectiveDuration)}
                </Typography.Text>
            </div>

            <audio
                ref={audioRef}
                src={audioSrc}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
                onEnded={() => dispatch(playNext())}
                preload="metadata"
            />
        </Card>
    );
}