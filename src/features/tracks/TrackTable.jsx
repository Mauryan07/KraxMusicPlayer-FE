import React, { useEffect } from "react";
import { Table, Typography } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { fetchTracks } from "./trackSlice";
import { setQueue, playTrack } from "../player/playerSlice";

export default function TrackTable() {
    const dispatch = useDispatch();
    const { items, status } = useSelector((state) => state.tracks);

    useEffect(() => {
        if (status === "idle") dispatch(fetchTracks());
    }, [dispatch, status]);

    const onPlay = (record) => {
        dispatch(setQueue({ tracks: items, startFileHash: record.fileHash }));
        dispatch(playTrack(record));
    };

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <Typography.Link onClick={() => onPlay(record)}>
                    {text}
                </Typography.Link>
            )
        },
        { title: "Duration", dataIndex: "duration", key: "duration", width: 110 },
        { title: "Bitrate", dataIndex: "bitrate", key: "bitrate", width: 100 }
    ];

    return (
        <Table
            columns={columns}
            dataSource={items}
            rowKey="fileHash"
            loading={status === "loading"}
            pagination={false}
            size="middle"
        />
    );
}