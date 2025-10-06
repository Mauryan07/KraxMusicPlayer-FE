import React, { useState, useMemo } from "react";
import { Layout, Menu, ConfigProvider, theme as antdTheme } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import KraxLogo from "../components/KraxLogo.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import FloatingPlayer from "../components/FloatingPlayer.jsx";

const { Header, Content, Sider } = Layout;

export default function AppLayout() {
    const location = useLocation();
    const [themeMode, setThemeMode] = useState("light");

    // Selected menu key fallback
    const activeKey = location.pathname.replace("/", "") || "tracks";

    const algorithm = useMemo(
        () => (themeMode === "dark" ? [antdTheme.darkAlgorithm] : [antdTheme.defaultAlgorithm]),
        [themeMode]
    );

    // Token & component overrides
    const themeConfig = {
        algorithm,
        token: {
            borderRadius: 8,
            fontSize: 14
        },
        components: {
            Layout: {
                headerBg: themeMode === "dark" ? "#141414" : "#ffffff",
                siderBg: themeMode === "dark" ? "#0f0f0f" : "#ffffff",
                bodyBg: themeMode === "dark" ? "#111111" : "#f7f9fb"
            },
            Menu: {
                itemBg: "transparent",
                itemSelectedBg: themeMode === "dark" ? "#1f1f1f" : "#e6f4ff",
                itemSelectedColor: themeMode === "dark" ? "#ffffff" : "#1677ff",
                itemHoverBg: themeMode === "dark" ? "#1a1a1a" : "#f0f7ff"
            },
            Card: {
                colorBorderSecondary: themeMode === "dark" ? "#303030" : "#e5e5e5"
            }
        }
    };

    const menuItems = [
        { key: "tracks", label: <Link to="/tracks">Tracks</Link> },
        { key: "albums", label: <Link to="/albums">Albums</Link> },
        { key: "search", label: <Link to="/search">Search</Link> },
        { key: "upload", label: <Link to="/upload">Upload</Link> }
    ];

    return (
        <ConfigProvider theme={themeConfig}>
            <Layout style={{ minHeight: "100vh" }}>
                <Sider
                    breakpoint="lg"
                    collapsedWidth={0}
                    width={230}
                    style={{
                        boxShadow: themeMode === "dark"
                            ? "2px 0 8px rgba(0,0,0,0.4)"
                            : "2px 0 8px rgba(0,0,0,0.08)"
                    }}
                >
                    <div
                        style={{
                            height: 72,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "8px 12px"
                        }}
                    >
                        <KraxLogo mode={themeMode} height={48} />
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[activeKey]}
                        items={menuItems}
                        style={{
                            borderRight: "none",
                            padding: "8px 8px 24px"
                        }}
                    />
                </Sider>

                <Layout>
                    <Header
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            padding: "0 24px",
                            gap: 16,
                            position: "sticky",
                            top: 0,
                            zIndex: 50
                        }}
                    >
                        <ThemeToggle themeMode={themeMode} setThemeMode={setThemeMode} />
                    </Header>
                    <Content
                        style={{
                            padding: "24px 32px 120px",
                            maxWidth: 1280,
                            width: "100%",
                            margin: "0 auto"
                        }}
                    >
                        <Outlet />
                    </Content>
                    <FloatingPlayer />
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}