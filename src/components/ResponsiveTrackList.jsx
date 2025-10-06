import React, { useEffect } from "react";
import { Table, List, Typography, Space, Skeleton, Empty, Grid } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchTracks } from "../features/tracks/trackSlice";
import { playTrack, setQueue } from "../features/player/playerSlice";

export default function ResponsiveTrackList() {
    const dispatch = useDispatch();
    const { items, status, error } = useSelector((s) => s.tracks);
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        if (status === "idle") dispatch(fetchTracks());
    }, [dispatch, status]);

    const handlePlay = (track) => {
        dispatch(setQueue({ tracks: items, startFileHash: track.fileHash }));
        dispatch(playTrack(track));
    };

    if (status === "loading")
        return <Skeleton active paragraph={{ rows: 6 }} />;
    if (status === "failed")
        return <Empty description={error || "Failed to load tracks"} />;
    if (!items.length) return <Empty description="No tracks found" />;

    if (isMobile) {
        return (
            <List
                dataSource={items}
                size="large"
                renderItem={(track, idx) => (
                    <List.Item
                        onClick={() => handlePlay(track)}
                        style={{ cursor: "pointer", paddingLeft: 8 }}
                    >
                        <Space
                            direction="vertical"
                            size={0}
                            style={{ width: "100%" }}
                        >
                            <Typography.Text strong ellipsis>
                                {idx + 1}. {track.title}
                            </Typography.Text>
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                {track.duration} • {track.bitrate} kbps
                            </Typography.Text>
                        </Space>
                    </List.Item>
                )}
            />
        );
    }

    const columns = [
        {
            title: "#",
            dataIndex: "index",
            width: 60,
            render: (_, __, i) => i + 1
        },
        {
            title: "Title",
            dataIndex: "title",
            render: (text, record) => (
                <Typography.Link
                    onClick={() => handlePlay(record)}
                >
                    {text}
                </Typography.Link>
            )
        },
        {
            title: "Duration",
            dataIndex: "duration",
            width: 120
        },
        {
            title: "Bitrate",
            dataIndex: "bitrate",
            width: 100,
            render: (b) => (b ? `${b} kbps` : "")
        }
    ];

    return (
        <Table
            rowKey="fileHash"
            dataSource={items}
            columns={columns}
            pagination={false}
            size="middle"
        />
    );
}