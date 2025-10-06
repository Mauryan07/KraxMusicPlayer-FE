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
    Flex,
    Grid
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
    MinusOutlined,
    PlusOutlined,
    ExpandAltOutlined,
    CompressOutlined
} from "@ant-design/icons";
import {
    pauseTrack,
    playTrack,
    playNext,
    playPrev,
    toggleShuffle
} from "../features/player/playerSlice";
import { getTrackAudioUrl, getTrackArtworkUrl } from "../api/musicApi";

const { useBreakpoint } = Grid;

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

    const screens = useBreakpoint();
    const isMobile = !screens.md;

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

    // New collapse state
    const [collapsed, setCollapsed] = useState(false);
    const toggleCollapsed = () => setCollapsed((c) => !c);

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

    // Sizes
    const artworkSize = collapsed ? (isMobile ? 40 : 44) : isMobile ? 56 : 140;

    // Collapsed layout rendering
    if (collapsed) {
        return (
            <Card
                bordered={false}
                bodyStyle={{
                    padding: isMobile ? "6px 10px 6px 56px" : "8px 16px 8px 70px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    background: token.colorBgElevated
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
                        "0 -4px 18px rgba(0,0,0,0.28), 0 -1px 0 rgba(255,255,255,0.05)"
                }}
            >
                {/* Small Artwork */}
                <div
                    style={{
                        position: "absolute",
                        left: isMobile ? 8 : 16,
                        bottom: "50%",
                        transform: "translateY(50%)",
                        width: artworkSize,
                        height: artworkSize,
                        borderRadius: 8,
                        overflow: "hidden",
                        boxShadow: "0 4px 12px -4px rgba(0,0,0,0.45)"
                    }}
                >
                    {buffering && !currentTime ? (
                        <Skeleton.Image
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                            }}
                            active
                        />
                    ) : (
                        <img
                            src={artworkUrl}
                            alt={track.title}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                            }}
                            onError={(e) => {
                                e.currentTarget.style.opacity = 0.25;
                            }}
                        />
                    )}
                </div>

                <Flex
                    align="center"
                    justify="space-between"
                    style={{ gap: 8, flexWrap: "nowrap" }}
                >
                    <Space
                        direction="vertical"
                        size={0}
                        style={{
                            flex: 1,
                            minWidth: 0,
                            paddingRight: 4
                        }}
                    >
                        <Typography.Text
                            ellipsis
                            style={{
                                fontSize: isMobile ? 13 : 14,
                                fontWeight: 600
                            }}
                            title={track.title}
                        >
                            {track.title}
                        </Typography.Text>
                        <Typography.Text
                            type="secondary"
                            style={{
                                fontSize: 11,
                                opacity: 0.7
                            }}
                        >
                            {queue.length
                                ? `${currentIndex + 1}/${queue.length}`
                                : "—"}
                        </Typography.Text>
                    </Space>

                    <Space
                        size={isMobile ? 2 : 6}
                        style={{ flexShrink: 0, alignItems: "center" }}
                    >
                        <Tooltip title="Previous">
                            <Button
                                type="text"
                                size="small"
                                icon={
                                    <StepBackwardOutlined
                                        style={{ fontSize: 16 }}
                                    />
                                }
                                disabled={queue.length <= 1}
                                onClick={() => dispatch(playPrev())}
                            />
                        </Tooltip>

                        <Tooltip title={isPlaying ? "Pause" : "Play"}>
                            <Button
                                type="text"
                                size="small"
                                onClick={onPlayPause}
                                icon={
                                    buffering ? (
                                        <LoadingOutlined
                                            style={{ fontSize: 28 }}
                                        />
                                    ) : isPlaying ? (
                                        <PauseCircleFilled
                                            style={{
                                                fontSize: 32,
                                                color: token.colorPrimary
                                            }}
                                        />
                                    ) : (
                                        <PlayCircleFilled
                                            style={{
                                                fontSize: 32,
                                                color: token.colorPrimary
                                            }}
                                        />
                                    )
                                }
                            />
                        </Tooltip>

                        <Tooltip title="Next">
                            <Button
                                type="text"
                                size="small"
                                icon={
                                    <StepForwardOutlined
                                        style={{ fontSize: 16 }}
                                    />
                                }
                                disabled={queue.length <= 1}
                                onClick={() => dispatch(playNext())}
                            />
                        </Tooltip>

                        <Tooltip
                            title={
                                shuffle
                                    ? "Shuffle On (random)"
                                    : "Shuffle Off"
                            }
                        >
                            <Button
                                type="text"
                                size="small"
                                onClick={() => dispatch(toggleShuffle())}
                                icon={
                                    <RetweetOutlined
                                        style={{
                                            fontSize: 18,
                                            color: shuffle
                                                ? token.colorPrimary
                                                : token.colorTextTertiary,
                                            transform: shuffle
                                                ? "rotate(25deg)"
                                                : "none",
                                            transition: "all .25s ease"
                                        }}
                                    />
                                }
                            />
                        </Tooltip>

                        <Tooltip title="Expand Player">
                            <Button
                                type="text"
                                size="small"
                                onClick={toggleCollapsed}
                                icon={
                                    <ExpandAltOutlined
                                        style={{ fontSize: 18 }}
                                    />
                                }
                            />
                        </Tooltip>
                    </Space>
                </Flex>

                {/* Slim progress bar */}
                <Slider
                    style={{ margin: isMobile ? "0 4px" : "2px 0 0" }}
                    min={0}
                    max={100}
                    value={progressPercent}
                    onChange={handleSeekChange}
                    onChangeComplete={handleSeekAfter}
                    tooltip={{ open: false }}
                />

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

    // Expanded layout (original richer view, with added collapse toggle)
    return (
        <Card
            bordered={false}
            bodyStyle={{
                position: "relative",
                padding: isMobile ? "8px 12px 10px 72px" : "16px 260px 18px 170px",
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? 6 : 10,
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
            {/* Artwork */}
            <div
                style={{
                    position: "absolute",
                    left: isMobile ? 8 : 28,
                    bottom: isMobile ? "50%" : 18,
                    width: artworkSize,
                    height: artworkSize,
                    transform: isMobile ? "translateY(50%)" : "translateY(-55%)",
                    borderRadius: isMobile ? 10 : 22,
                    overflow: "hidden",
                    boxShadow: isMobile
                        ? "0 4px 12px rgba(0,0,0,0.35)"
                        : "0 12px 32px -8px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.35)",
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

            <Flex
                align="center"
                justify="space-between"
                style={{
                    gap: isMobile ? 12 : 32,
                    flexWrap: "wrap",
                    paddingLeft: 0
                }}
            >
                <Space
                    direction="vertical"
                    style={{ flex: 1, minWidth: isMobile ? 140 : 240 }}
                    size={isMobile ? 0 : 4}
                >
                    <Typography.Text
                        strong
                        ellipsis
                        style={{
                            fontSize: isMobile ? 14 : 18,
                            letterSpacing: 0.4,
                            paddingRight: 4
                        }}
                        title={track.title}
                    >
                        {track.title}
                    </Typography.Text>
                    <Typography.Text
                        type="secondary"
                        style={{
                            fontSize: isMobile ? 11 : 13,
                            opacity: 0.65
                        }}
                    >
                        {queue.length
                            ? `Track ${currentIndex + 1} of ${queue.length}`
                            : "Single track"}
                    </Typography.Text>
                </Space>

                <Space
                    align="center"
                    style={{
                        flexShrink: 0,
                        gap: isMobile ? 4 : 14,
                        marginLeft: "auto"
                    }}
                >
                    <Tooltip title="Collapse Player">
                        <Button
                            type="text"
                            size={isMobile ? "small" : "middle"}
                            onClick={toggleCollapsed}
                            icon={
                                <CompressOutlined
                                    style={{ fontSize: isMobile ? 18 : 20 }}
                                />
                            }
                        />
                    </Tooltip>

                    <Tooltip title="Previous">
                        <Button
                            type="text"
                            size={isMobile ? "small" : "middle"}
                            icon={
                                <StepBackwardOutlined
                                    style={{ fontSize: isMobile ? 18 : 22 }}
                                />
                            }
                            disabled={queue.length <= 1}
                            onClick={() => dispatch(playPrev())}
                        />
                    </Tooltip>

                    <Tooltip title={isPlaying ? "Pause" : "Play"}>
                        <Button
                            type="text"
                            onClick={onPlayPause}
                            icon={
                                buffering ? (
                                    <LoadingOutlined
                                        style={{ fontSize: isMobile ? 34 : 46 }}
                                    />
                                ) : isPlaying ? (
                                    <PauseCircleFilled
                                        style={{
                                            fontSize: isMobile ? 40 : 52,
                                            color: token.colorPrimary
                                        }}
                                    />
                                ) : (
                                    <PlayCircleFilled
                                        style={{
                                            fontSize: isMobile ? 40 : 52,
                                            color: token.colorPrimary
                                        }}
                                    />
                                )
                            }
                        />
                    </Tooltip>

                    <Tooltip title="Next">
                        <Button
                            type="text"
                            size={isMobile ? "small" : "middle"}
                            icon={
                                <StepForwardOutlined
                                    style={{ fontSize: isMobile ? 18 : 22 }}
                                />
                            }
                            disabled={queue.length <= 1}
                            onClick={() => dispatch(playNext())}
                        />
                    </Tooltip>

                    <Tooltip
                        title={shuffle ? "Shuffle On (random order)" : "Shuffle Off"}
                    >
                        <Button
                            type="text"
                            size={isMobile ? "small" : "middle"}
                            onClick={() => dispatch(toggleShuffle())}
                            icon={
                                <RetweetOutlined
                                    style={{
                                        fontSize: isMobile ? 20 : 24,
                                        color: shuffle
                                            ? token.colorPrimary
                                            : token.colorTextTertiary,
                                        transform: shuffle ? "rotate(25deg)" : "none",
                                        transition: "all .25s ease"
                                    }}
                                />
                            }
                        />
                    </Tooltip>

                    {!isMobile && (
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
                                        <AudioMutedOutlined
                                            style={{ fontSize: 24 }}
                                        />
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
                    )}
                </Space>
            </Flex>

            {/* Progress */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isMobile ? 8 : 14,
                    marginTop: isMobile ? 2 : 0
                }}
            >
                <Typography.Text
                    style={{
                        width: isMobile ? 42 : 54,
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                        fontSize: isMobile ? 11 : 12
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
                        open: hoverTime !== null && !isMobile,
                        formatter: sliderTooltipFormatter
                    }}
                    onMouseMove={(e) => {
                        if (!effectiveDuration || isMobile) return;
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
                    style={{
                        width: isMobile ? 42 : 54,
                        fontVariantNumeric: "tabular-nums",
                        fontSize: isMobile ? 11 : 12
                    }}
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