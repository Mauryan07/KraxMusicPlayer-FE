import React, { useEffect, useState, useMemo } from "react";
import {
    Card,
    List,
    Typography,
    Skeleton,
    Empty,
    Row,
    Col,
    Space,
    Button,
    Grid,
    Breadcrumb,
    Tag,
    Tooltip
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { fetchAlbums } from "./albumSlice";
import { playTrack } from "../player/playerSlice";
import {
    LeftOutlined,
    PlayCircleOutlined
} from "@ant-design/icons";

const Artwork = ({ artwork, name, size = 140, radius = 14 }) => {
    if (!artwork || !artwork.imageData) {
        return (
            <div
                style={{
                    width: "100%",
                    height: size,
                    background:
                        "linear-gradient(135deg,#ececec,#f5f5f5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#888",
                    borderRadius: radius
                }}
            >
                No Artwork
            </div>
        );
    }
    return (
        <img
            src={`data:${artwork.mimeType};base64,${artwork.imageData}`}
            alt={name}
            style={{
                width: "100%",
                height: size,
                objectFit: "cover",
                borderRadius: radius,
                display: "block"
            }}
            draggable={false}
        />
    );
};

export default function ResponsiveAlbumBrowser() {
    const dispatch = useDispatch();
    const { items: albums, status, error } = useSelector(
        (s) => s.albums
    );
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchAlbums());
        }
    }, [status, dispatch]);

    const sortedAlbums = useMemo(
        () =>
            [...(albums || [])].sort((a, b) =>
                a.name.localeCompare(b.name)
            ),
        [albums]
    );

    const openAlbum = (album) => setSelectedAlbum(album);
    const backToAlbums = () => setSelectedAlbum(null);

    /* ---------- States ---------- */
    if (status === "loading")
        return <Skeleton active paragraph={{ rows: 6 }} />;
    if (status === "failed")
        return <Empty description={error || "Failed to load albums"} />;
    if (!albums?.length)
        return <Empty description="No albums found" />;

    /* ---------- Album Detail View ---------- */
    if (selectedAlbum) {
        const alb = selectedAlbum;
        return (
            <Card
                style={{
                    maxWidth: 960,
                    margin: "0 auto",
                    background: "var(--ant-color-bg-container)"
                }}
                bodyStyle={{ padding: screens.lg ? 32 : 20 }}
                title={
                    <Breadcrumb
                        items={[
                            {
                                title: (
                                    <Typography.Link onClick={backToAlbums}>
                                        Albums
                                    </Typography.Link>
                                )
                            },
                            { title: alb.name }
                        ]}
                    />
                }
                extra={
                    <Button
                        type="text"
                        icon={<LeftOutlined />}
                        onClick={backToAlbums}
                    >
                        Back
                    </Button>
                }
            >
                <Row gutter={[32, 32]}>
                    {!isMobile && (
                        <Col xs={24} md={8} lg={7}>
                            <Artwork
                                artwork={alb.artwork}
                                name={alb.name}
                                size={240}
                                radius={18}
                            />
                            <Space
                                direction="vertical"
                                size={8}
                                style={{ marginTop: 16, display: "block" }}
                            >
                                <Typography.Title
                                    level={4}
                                    style={{ margin: 0 }}
                                    ellipsis
                                >
                                    {alb.name}
                                </Typography.Title>
                                <Tag color="geekblue">
                                    {alb.tracks.length} track
                                    {alb.tracks.length !== 1 ? "s" : ""}
                                </Tag>
                            </Space>
                        </Col>
                    )}
                    <Col xs={24} md={16} lg={17}>
                        {isMobile && (
                            <Space
                                direction="vertical"
                                size={6}
                                style={{ marginBottom: 16, width: "100%" }}
                            >
                                <Artwork
                                    artwork={alb.artwork}
                                    name={alb.name}
                                    size={180}
                                    radius={16}
                                />
                                <Typography.Title
                                    level={4}
                                    style={{ margin: "8px 0 0" }}
                                    ellipsis
                                >
                                    {alb.name}
                                </Typography.Title>
                                <Tag color="geekblue">
                                    {alb.tracks.length} track
                                    {alb.tracks.length !== 1 ? "s" : ""}
                                </Tag>
                            </Space>
                        )}

                        <List
                            header={
                                <Typography.Text strong>
                                    Tracks
                                </Typography.Text>
                            }
                            dataSource={alb.tracks}
                            size="large"
                            bordered={!isMobile}
                            renderItem={(track, idx) => (
                                <List.Item
                                    style={{
                                        cursor: "pointer",
                                        paddingLeft: isMobile ? 8 : 16
                                    }}
                                    onClick={() => dispatch(playTrack(track))}
                                >
                                    <Space
                                        direction="vertical"
                                        size={0}
                                        style={{ width: "100%" }}
                                    >
                                        <Space
                                            align="center"
                                            style={{
                                                width: "100%",
                                                justifyContent: "space-between"
                                            }}
                                            size={12}
                                        >
                                            <Typography.Text
                                                ellipsis
                                                style={{ maxWidth: "70%" }}
                                            >
                                                <Tooltip title={track.title}>
                                                    <Typography.Link
                                                        onClick={(e) => {
                                                            e.preventDefault();
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
                                                    opacity: 0.7,
                                                    fontVariantNumeric: "tabular-nums"
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
    }

    /* ---------- Album Grid / List ---------- */
    if (isMobile) {
        return (
            <List
                size="large"
                dataSource={sortedAlbums}
                renderItem={(album) => (
                    <List.Item
                        style={{ cursor: "pointer" }}
                        onClick={() => openAlbum(album)}
                    >
                        <Space
                            align="center"
                            size={16}
                            style={{ width: "100%" }}
                        >
                            <Artwork
                                artwork={album.artwork}
                                name={album.name}
                                size={64}
                                radius={12}
                            />
                            <Space
                                direction="vertical"
                                size={2}
                                style={{ flex: 1, minWidth: 0 }}
                            >
                                <Typography.Text
                                    strong
                                    ellipsis
                                    style={{ fontSize: 15 }}
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
                            </Space>
                        </Space>
                    </List.Item>
                )}
            />
        );
    }

    // Desktop grid
    return (
        <Row gutter={[28, 32]}>
            {sortedAlbums.map((album) => (
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
                        onClick={() => openAlbum(album)}
                        bodyStyle={{ padding: 16 }}
                        cover={
                            <div style={{ padding: 14 }}>
                                <Artwork
                                    artwork={album.artwork}
                                    name={album.name}
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
                                    openAlbum(album);
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
}