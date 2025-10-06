import React, { useEffect } from 'react';
import { Table, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTracks } from './trackSlice';
import { playTrack } from '../player/playerSlice';

export default function TrackTable() {
    const dispatch = useDispatch();
    const { items, status } = useSelector(state => state.tracks);

    useEffect(() => { dispatch(fetchTracks()); }, [dispatch]);

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) =>
                <Typography.Link onClick={() => dispatch(playTrack(record))}>{text}</Typography.Link>
        },
        { title: 'Duration', dataIndex: 'duration', key: 'duration' },
        { title: 'Bitrate', dataIndex: 'bitrate', key: 'bitrate' },
    ];

    return <Table columns={columns} dataSource={items} rowKey="fileHash" loading={status === 'loading'} />;
}