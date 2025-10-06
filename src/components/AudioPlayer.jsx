import React from 'react';

export default function AudioPlayer({ src }) {
    return (
        <audio controls src={src} style={{ width: '100%' }} />
    );
}