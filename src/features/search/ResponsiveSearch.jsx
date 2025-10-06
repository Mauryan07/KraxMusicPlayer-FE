import React, { useState } from "react";
import {
    Input,
    Tabs,
    List,
    Typography,
    Space,
    Button,
    Empty,
    Skeleton,
    Row,
    Col,
    Card,
    Grid,
    Tag,
    Breadcrumb,
    Tooltip
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchTrackResults,
    fetchAlbumResults,
    setQuery,
    clearSearch
} from "./searchSlice";
import { playTrack, setQueue } from "../player/playerSlice";
import { LeftOutlined, PlayCircleOutlined } from "@ant-design/icons";

const Artwork = ({ album, size = 120, radius = 14 }) => {
    if (!album?.artwork?.imageData) {
        return (
            <div
                style={{
                    width: "100%",
                    height: size,
                    background:
                        "linear-gradient(135deg,#ececec,#f5f5f5)",
                    borderRadius: radius,
                    fontSize: 11,
                    color: "#777",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                No Artwork
            </div>
        );
    }
    return (
        <img
            src={`data:${album.artwork.mimeType};base64,${album.artwork.imageData}`}
            alt={album.name}
            style={{
                width: "100%",
                height: size,
                objectFit: "cover",
                borderRadius: radius
            }}
            draggable={false}
        />
    );
};

export default function ResponsiveSearch() {
    const dispatch = useDispatch();
    const {
        query,
        trackResults,
        albumResults,
        loadingTracks,
        loadingAlbums,
        errorTracks,
        errorAlbums
    } = useSelector((s) => s.search);
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    const onSearch = () => {
        if (!query.trim()) return;
        setSelectedAlbum(null);
        dispatch(fetchTrackResults(query));
        dispatch(fetchAlbumResults(query));
    };

    const onClear = () => {
        dispatch(clearSearch());
        setSelectedAlbum(null);
    };

    const albumDrill = selectedAlbum && (
        <Card
            bodyStyle={{
                padding: screens.lg ? 28 : 20
            }}
            title={
                <Breadcrumb
                    items={[
                        {
                            title: (
                                <Typography.Link
                                    onClick={() => setSelectedAlbum(null)}
                                >
                                    Albums
                                </Typography.Link>
                            )
                        },
                        { title: selectedAlbum.name }
                    ]}
                />
            }
            extra={
                <Button
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={() => setSelectedAlbum(null)}
                >
                    Back
                </Button>
            }
        >
            <Row gutter={[32, 32]}>
                {!isMobile && (
                    <Col xs={24} md={8} lg={7}>
                        <Artwork album={selectedAlbum} size={220} radius={18} />
                        <Space
                            direction="vertical"
                            size={8}
                            style={{ marginTop: 16, display: "block" }}
                        >
                            <Typography.Title level={4} style={{ margin: 0 }}>
                                {selectedAlbum.name}
                            </Typography.Title>
                            <Tag color="geekblue">
                                {selectedAlbum.tracks.length} track
                                {selectedAlbum.tracks.length !== 1 ? "s" : ""}
                            </Tag>
                        </Space>
                    </Col>
                )}
                <Col xs={24} md={16} lg={17}>
                    {isMobile && (
                        <Space
                            direction="vertical"
                            size={6}
                            style={{ marginBottom: 16 }}
                        >
                            <Artwork
                                album={selectedAlbum}
                                size={180}
                                radius={16}
                            />
                            <Typography.Title
                                level={4}
                                style={{ margin: "8px 0 0" }}
                            >
                                {selectedAlbum.name}
                            </Typography.Title>
                            <Tag color="geekblue">
                                {selectedAlbum.tracks.length} track
                                {selectedAlbum.tracks.length !== 1 ? "s" : ""}
                            </Tag>
                        </Space>
                    )}
                    <List
                        header={
                            <Typography.Text strong>Tracks</Typography.Text>
                        }
                        dataSource={selectedAlbum.tracks}
                        size="large"
                        bordered={!isMobile}
                        renderItem={(track, idx) => (
                            <List.Item
                                style={{
                                    cursor: "pointer",
                                    paddingLeft: isMobile ? 8 : 16
                                }}
                                onClick={() => {
                                    dispatch(
                                        setQueue({
                                            tracks: selectedAlbum.tracks,
                                            startFileHash: track.fileHash
                                        })
                                    );
                                    dispatch(playTrack(track));
                                }}
                            >
                                <Space
                                    direction="vertical"
                                    size={0}
                                    style={{ width: "100%" }}
                                >
                                    <Space
                                        style={{
                                            width: "100%",
                                            justifyContent: "space-between"
                                        }}
                                    >
                                        <Typography.Text ellipsis>
                                            <Tooltip title={track.title}>
                                                <Typography.Link
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        dispatch(
                                                            setQueue({
                                                                tracks: selectedAlbum.tracks,
                                                                startFileHash:
                                                                track.fileHash
                                                            })
                                                        );
                                                        dispatch(playTrack(track));
                                                    }}
                                                    style={{
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {idx + 1}. {track.title}
                                                </Typography.Link>
                                            </Tooltip>
                                        </Typography.Text>
                                        <Typography.Text
                                            type="secondary"
                                            style={{
                                                fontSize: 12,
                                                opacity: 0.7
                                            }}
                                        >
                                            {track.duration}
                                        </Typography.Text>
                                    </Space>
                                    <Typography.Text
                                        type="secondary"
                                        style={{
                                            fontSize: 11,
                                            opacity: 0.55
                                        }}
                                    >
                                        Bitrate: {track.bitrate || "—"} kbps
                                    </Typography.Text>
                                </Space>
                                <Button
                                    type="text"
                                    icon={
                                        <PlayCircleOutlined
                                            style={{
                                                fontSize: 22,
                                                color: "var(--ant-color-primary)"
                                            }}
                                        />
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(
                                            setQueue({
                                                tracks: selectedAlbum.tracks,
                                                startFileHash: track.fileHash
                                            })
                                        );
                                        dispatch(playTrack(track));
                                    }}
                                />
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>
        </Card>
    );

    const renderTracks = () => {
        if (loadingTracks)
            return <Skeleton active paragraph={{ rows: 6 }} />;
        if (errorTracks)
            return <Empty description={errorTracks} />;
        if (!trackResults.length)
            return <Empty description="No tracks" />;

        if (isMobile) {
            return (
                <List
                    dataSource={trackResults}
                    size="large"
                    renderItem={(track, idx) => (
                        <List.Item
                            onClick={() => {
                                dispatch(
                                    setQueue({
                                        tracks: trackResults,
                                        startFileHash: track.fileHash
                                    })
                                );
                                dispatch(playTrack(track));
                            }}
                            style={{ cursor: "pointer", paddingLeft: 8 }}
                        >
                            <Space
                                direction="vertical"
                                size={0}
                                style={{ width: "100%" }}
                            >
                                <Typography.Text
                                    strong
                                    ellipsis
                                    style={{ fontSize: 15 }}
                                >
                                    {idx + 1}. {track.title}
                                </Typography.Text>
                                <Typography.Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                >
                                    {track.duration} •{" "}
                                    {track.bitrate ? `${track.bitrate} kbps` : "—"}
                                </Typography.Text>
                            </Space>
                        </List.Item>
                    )}
                />
            );
        }

        return (
            <List
                dataSource={trackResults}
                size="large"
                renderItem={(track, idx) => (
                    <List.Item
                        style={{
                            cursor: "pointer",
                            paddingLeft: 12
                        }}
                        onClick={() => {
                            dispatch(
                                setQueue({
                                    tracks: trackResults,
                                    startFileHash: track.fileHash
                                })
                            );
                            dispatch(playTrack(track));
                        }}
                    >
                        <Space
                            direction="vertical"
                            size={0}
                            style={{ width: "100%" }}
                        >
                            <Space
                                align="center"
                                size={10}
                                style={{
                                    width: "100%",
                                    justifyContent: "space-between"
                                }}
                            >
                                <Typography.Text ellipsis>
                                    <Typography.Link
                                        onClick={(e) => {
                                            e.preventDefault();
                                            dispatch(
                                                setQueue({
                                                    tracks: trackResults,
                                                    startFileHash: track.fileHash
                                                })
                                            );
                                            dispatch(playTrack(track));
                                        }}
                                        style={{ fontWeight: 500 }}
                                    >
                                        {idx + 1}. {track.title}
                                    </Typography.Link>
                                </Typography.Text>
                                <Typography.Text
                                    type="secondary"
                                    style={{
                                        fontSize: 12,
                                        opacity: 0.7,
                                        minWidth: 90,
                                        textAlign: "right",
                                        fontVariantNumeric: "tabular-nums"
                                    }}
                                >
                                    {track.duration}
                                </Typography.Text>
                            </Space>
                            <Typography.Text
                                type="secondary"
                                style={{ fontSize: 11, opacity: 0.55 }}
                            >
                                Bitrate: {track.bitrate || "—"} kbps
                            </Typography.Text>
                        </Space>
                    </List.Item>
                )}
            />
        );
    };

    const renderAlbums = () => {
        if (selectedAlbum) return albumDrill;
        if (loadingAlbums)
            return <Skeleton active paragraph={{ rows: 5 }} />;
        if (errorAlbums)
            return <Empty description={errorAlbums} />;
        if (!albumResults.length)
            return <Empty description="No albums" />;

        if (isMobile) {
            return (
                <List
                    size="large"
                    dataSource={albumResults}
                    renderItem={(album) => (
                        <List.Item
                            onClick={() => setSelectedAlbum(album)}
                            style={{ cursor: "pointer" }}
                        >
                            <Space
                                align="center"
                                size={16}
                                style={{ width: "100%" }}
                            >
                                <Artwork album={album} size={58} radius={10} />
                                <Space
                                    direction="vertical"
                                    size={2}
                                    style={{ flex: 1 }}
                                >
                                    <Typography.Text strong ellipsis>
                                        {album.name}
                                    </Typography.Text>
                                    <Typography.Text
                                        type="secondary"
                                        style={{ fontSize: 12 }}
                                    >
                                        {album.tracks.length} track
                                        {album.tracks.length !== 1 ? "s" : ""}
                                    </Typography.Text>
                                </Space>
                            </Space>
                        </List.Item>
                    )}
                />
            );
        }

        return (
            <Row gutter={[26, 30]}>
                {albumResults.map((album) => (
                    <Col
                        key={album.name}
                        xs={24}
                        sm={12}
                        md={8}
                        lg={6}
                        xl={6}
                    >
                        <Card
                            hoverable
                            bodyStyle={{ padding: 14 }}
                            onClick={() => setSelectedAlbum(album)}
                            cover={
                                <div style={{ padding: 14 }}>
                                    <Artwork
                                        album={album}
                                        size={180}
                                        radius={16}
                                    />
                                </div>
                            }
                        >
                            <Space
                                direction="vertical"
                                size={6}
                                style={{ width: "100%" }}
                            >
                                <Typography.Text
                                    strong
                                    ellipsis
                                    style={{ fontSize: 16 }}
                                >
                                    {album.name}
                                </Typography.Text>
                                <Typography.Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                >
                                    {album.tracks.length} track
                                    {album.tracks.length !== 1 ? "s" : ""}
                                </Typography.Text>
                                <Button
                                    size="small"
                                    type="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAlbum(album);
                                    }}
                                >
                                    View
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <Space
            direction="vertical"
            style={{ width: "100%" }}
            size={isMobile ? 16 : 24}
        >
            <Space wrap size={12}>
                <Input.Search
                    placeholder="Search tracks or albums..."
                    value={query}
                    onChange={(e) => dispatch(setQuery(e.target.value))}
                    onSearch={onSearch}
                    enterButton="Search"
                    style={{ width: isMobile ? "100%" : 340 }}
                    allowClear
                />
                {query && (trackResults.length || albumResults.length) ? (
                    <Button onClick={onClear} type="default">
                        Reset
                    </Button>
                ) : null}
            </Space>

            <Tabs
                destroyInactiveTabPane
                defaultActiveKey="tracks"
                items={[
                    {
                        key: "tracks",
                        label: "Tracks",
                        children: renderTracks()
                    },
                    {
                        key: "albums",
                        label: selectedAlbum
                            ? `Album: ${selectedAlbum.name}`
                            : "Albums",
                        children: renderAlbums()
                    }
                ]}
            />
        </Space>
    );
}