import React, { useState } from "react";
import {
    Upload,
    message,
    Typography,
    Space,
    theme,
    List,
    Button,
    Progress,
    Flex
} from "antd";
import { InboxOutlined, CloudUploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useDispatch } from "react-redux";
import { fetchTracks } from "../tracks/trackSlice";

/**
 * Simple multi-file MP3 uploader for a backend that exposes a single
 * endpoint accepting one or MANY files under the multipart field name `files`.
 *
 * Behavior:
 * - User selects (or drags) MP3 files (staged list).
 * - Click "Upload All" to POST one FormData with repeated `files` fields.
 * - Shows unified batch progress (average of file bytes uploaded).
 * - Refreshes track list after success.
 * - No external CSS, only Ant Design + inline styles.
 *
 * Adjust UPLOAD_ENDPOINT below if needed.
 */

const { Dragger } = Upload;
const UPLOAD_ENDPOINT = "/api/upload"; // CHANGE if your backend path differs (e.g. "/api/tracks/upload")

export default function UploadMusic() {
    const { token } = theme.useToken();
    const dispatch = useDispatch();

    const [staged, setStaged] = useState([]); // Array<File>
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0); // 0-100
    const [uploadedNames, setUploadedNames] = useState([]);
    const [lastError, setLastError] = useState(null);

    const isMp3 = (file) =>
        file.type === "audio/mpeg" ||
        file.name.toLowerCase().endsWith(".mp3");

    const beforeUpload = (file) => {
        if (!isMp3(file)) {
            message.error(`${file.name} is not an MP3 file`);
            return Upload.LIST_IGNORE;
        }
        // Prevent AntD auto upload; we batch manually
        return false;
    };

    const onChange = (info) => {
        const fresh = info.fileList
            .map((f) => f.originFileObj)
            .filter(Boolean)
            .filter(isMp3);

        // Keep only unique by name + size (rudimentary dedupe)
        const map = new Map();
        [...staged, ...fresh].forEach((f) => {
            map.set(`${f.name}_${f.size}`, f);
        });
        setStaged(Array.from(map.values()));
    };

    const clearStaged = () => {
        if (uploading) return;
        setStaged([]);
        setProgress(0);
        setLastError(null);
    };

    const doUploadAll = async () => {
        if (!staged.length) {
            message.info("No files selected");
            return;
        }
        setUploading(true);
        setProgress(0);
        setLastError(null);

        const formData = new FormData();
        staged.forEach((file) => {
            formData.append("files", file); // Repeated field 'files'
        });

        try {
            await axios.post(UPLOAD_ENDPOINT, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (evt) => {
                    if (evt.total) {
                        const pct = Math.round((evt.loaded / evt.total) * 100);
                        setProgress(pct);
                    }
                }
            });

            setUploadedNames((prev) => [
                ...prev,
                ...staged
                    .map((f) => f.name)
                    .filter((n) => !prev.includes(n))
            ]);

            message.success("Upload complete");
            dispatch(fetchTracks());
            setStaged([]);
            setProgress(100);
        } catch (err) {
            console.error(err);
            setLastError("Upload failed");
            message.error("Upload failed");
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1200);
        }
    };

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                padding: "40px 16px",
                boxSizing: "border-box"
            }}
        >
            <Space
                direction="vertical"
                size={28}
                style={{ width: "100%", maxWidth: 700 }}
            >
                <Flex
                    align="center"
                    justify="space-between"
                    wrap
                    style={{ gap: 16 }}
                >
                    <Typography.Title
                        level={3}
                        style={{ margin: 0, letterSpacing: 0.4 }}
                    >
                        Upload MP3 Files
                    </Typography.Title>
                    <Space>
                        <Button
                            disabled={!staged.length || uploading}
                            type="primary"
                            icon={<CloudUploadOutlined />}
                            loading={uploading}
                            onClick={doUploadAll}
                        >
                            Upload All
                        </Button>
                        <Button
                            disabled={!staged.length || uploading}
                            onClick={clearStaged}
                        >
                            Clear
                        </Button>
                    </Space>
                </Flex>

                <Dragger
                    multiple
                    accept=".mp3"
                    beforeUpload={beforeUpload}
                    showUploadList={false}
                    onChange={onChange}
                    disabled={uploading}
                    style={{
                        borderRadius: 14,
                        padding: "46px 16px",
                        background:
                            "linear-gradient(135deg,var(--ant-color-bg-elevated) 0%, var(--ant-color-bg-container) 85%)",
                        border: `1px dashed ${token.colorBorderSecondary}`,
                        transition: "border-color .3s ease"
                    }}
                >
                    <p
                        className="ant-upload-drag-icon"
                        style={{ marginBottom: 10 }}
                    >
                        <InboxOutlined
                            style={{ fontSize: 56, color: token.colorPrimary }}
                        />
                    </p>
                    <Typography.Text strong style={{ fontSize: 18 }}>
                        Drag & Drop MP3 files here
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary">
                        or click to select (they will stage until you press
                        Upload All)
                    </Typography.Text>
                    <br />
                    <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                    >
                        Backend expects multipart field name: <code>files</code>
                    </Typography.Text>
                </Dragger>

                {/* Staged Files */}
                {staged.length > 0 && (
                    <List
                        size="small"
                        header={
                            <Typography.Text strong>
                                Staged ({staged.length})
                            </Typography.Text>
                        }
                        dataSource={staged}
                        bordered
                        renderItem={(file) => (
                            <List.Item
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12
                                }}
                            >
                                <Typography.Text
                                    ellipsis
                                    style={{ maxWidth: "70%" }}
                                >
                                    {file.name}
                                </Typography.Text>
                                <Typography.Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                >
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </Typography.Text>
                            </List.Item>
                        )}
                        style={{
                            background: "var(--ant-color-bg-container)",
                            borderRadius: 10
                        }}
                    />
                )}

                {/* Progress */}
                {uploading && (
                    <div
                        style={{
                            background: "var(--ant-color-bg-container)",
                            padding: "12px 16px",
                            borderRadius: 10
                        }}
                    >
                        <Typography.Text
                            style={{
                                display: "block",
                                marginBottom: 8,
                                fontSize: 13
                            }}
                        >
                            Uploading…
                        </Typography.Text>
                        <div
                            style={{
                                position: "relative",
                                height: 8,
                                background: token.colorFillTertiary,
                                borderRadius: 4,
                                overflow: "hidden"
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: `${progress}%`,
                                    background: token.colorPrimary,
                                    transition: "width .25s ease"
                                }}
                            />
                        </div>
                        <Typography.Text
                            type="secondary"
                            style={{
                                fontSize: 12,
                                marginTop: 6,
                                display: "inline-block"
                            }}
                        >
                            {progress}%
                        </Typography.Text>
                    </div>
                )}

                {/* Errors */}
                {lastError && (
                    <Typography.Text type="danger">
                        {lastError}
                    </Typography.Text>
                )}

                {/* Uploaded this session */}
                {uploadedNames.length > 0 && (
                    <List
                        size="small"
                        header={
                            <Typography.Text strong>
                                Uploaded this session
                            </Typography.Text>
                        }
                        bordered
                        dataSource={uploadedNames}
                        renderItem={(name) => <List.Item>{name}</List.Item>}
                        style={{
                            background: "var(--ant-color-bg-container)",
                            borderRadius: 8
                        }}
                    />
                )}
            </Space>
        </div>
    );
}