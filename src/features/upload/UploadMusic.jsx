import React, { useState } from "react";
import { Upload, message, Typography, Space, theme, List } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";

/**
 * Minimal MP3-only Upload Component.
 * - Auto uploads as soon as files are chosen.
 * - Only .mp3 accepted (frontend check).
 * - Shows a simple list of successfully uploaded filenames (session only).
 * - NO extra metadata handling, NO progress bars.
 */

const { Dragger } = Upload;

export default function UploadMusic() {
    const { token } = theme.useToken();
    const [uploadedNames, setUploadedNames] = useState([]);

    const uploadEndpoint = "/api/tracks/upload"; // change if needed

    const beforeUpload = (file) => {
        const isMp3 =
            file.type === "audio/mpeg" ||
            file.name.toLowerCase().endsWith(".mp3");

        if (!isMp3) {
            message.error(`${file.name} is not an MP3 file`);
            return Upload.LIST_IGNORE;
        }
        return true; // continue
    };

    const customRequest = async ({ file, onSuccess, onError }) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
            await axios.post(uploadEndpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setUploadedNames((prev) =>
                prev.includes(file.name) ? prev : [...prev, file.name]
            );
            message.success(`${file.name} uploaded`);
            onSuccess && onSuccess();
        } catch (err) {
            console.error(err);
            message.error(`${file.name} failed to upload`);
            onError && onError(err);
        }
    };

    return (
        <Space
            direction="vertical"
            size={24}
            style={{ width: "100%", maxWidth: 680, margin: "0 auto" }}
        >
            <Dragger
                multiple
                accept=".mp3"
                beforeUpload={beforeUpload}
                customRequest={customRequest}
                showUploadList={false}
                style={{
                    borderRadius: 12,
                    padding: "30px 8px",
                    background:
                        "linear-gradient(135deg, var(--ant-color-bg-elevated) 0%, var(--ant-color-bg-container) 80%)",
                    border: `1px dashed ${token.colorBorderSecondary}`
                }}
            >
                <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}>
                    <InboxOutlined
                        style={{ fontSize: 48, color: token.colorPrimary }}
                    />
                </p>
                <Typography.Text strong style={{ fontSize: 16 }}>
                    Drag & Drop MP3 files here
                </Typography.Text>
                <br />
                <Typography.Text type="secondary">
                    or click to select (MP3 only)
                </Typography.Text>
            </Dragger>

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
                    style={{ background: "var(--ant-color-bg-container)" }}
                />
            )}
        </Space>
    );
}