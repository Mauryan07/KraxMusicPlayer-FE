import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
    Layout,
    Menu,
    ConfigProvider,
    theme as antdTheme,
    Grid,
    Drawer,
    Button
} from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import KraxLogo from "../components/KraxLogo.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import FloatingPlayer from "../components/FloatingPlayer.jsx";

const { Header, Content, Sider } = Layout;

const THEME_STORAGE_KEY = "krax_theme";

export default function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const screens = Grid.useBreakpoint();

    const isDesktop = screens.lg;
    const isMobile = !isDesktop;

    // Load persisted theme (or system preference on first load)
    const getInitialTheme = () => {
        if (typeof window === "undefined") return "light";
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "dark" || stored === "light") return stored;
        // Fallback to system preference on first visit
        const prefersDark = window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
    };

    const [themeMode, setThemeMode] = useState(getInitialTheme);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Persist on change
    useEffect(() => {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, themeMode);
        } catch {
            /* ignore write errors */
        }
    }, [themeMode]);

    // Optional: react to system theme changes ONLY if user hasn’t explicitly toggled yet.
    // (If you want this behavior, uncomment below)
    /*
    useEffect(() => {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e) => setThemeMode(e.matches ? "dark" : "light");
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    }, []);
    */

    // Active menu key
    const activeKey = useMemo(() => {
        const seg = location.pathname.split("/")[1];
        return seg || "tracks";
    }, [location.pathname]);

    const algorithm = useMemo(
        () =>
            themeMode === "dark"
                ? [antdTheme.darkAlgorithm]
                : [antdTheme.defaultAlgorithm],
        [themeMode]
    );

    const themeConfig = useMemo(
        () => ({
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
                    colorBorderSecondary:
                        themeMode === "dark" ? "#303030" : "#e5e5e5"
                }
            }
        }),
        [algorithm, themeMode]
    );

    const menuItems = useMemo(
        () => [
            { key: "tracks", label: <Link to="/tracks">Tracks</Link> },
            { key: "albums", label: <Link to="/albums">Albums</Link> },
            { key: "search", label: <Link to="/search">Search</Link> },
            { key: "upload", label: <Link to="/upload">Upload</Link> }
        ],
        []
    );

    const toggleDrawer = useCallback(
        (open) => () => setDrawerOpen(open),
        []
    );

    const playerPadding = isMobile ? 170 : 220;

    return (
        <ConfigProvider theme={themeConfig}>
            <Layout
                style={{
                    minHeight: "100vh",
                    background: "var(--ant-color-bg-base)"
                }}
            >
                {isDesktop && (
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
                            onClick={() => navigate("/tracks")}
                            style={{
                                height: 72,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "8px 12px",
                                cursor: "pointer"
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
                )}

                <Layout>
                    <Header
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: isMobile ? "space-between" : "flex-end",
                            padding: isMobile ? "0 12px" : "0 24px",
                            gap: 16,
                            position: "sticky",
                            top: 0,
                            zIndex: 100,
                            height: 64
                        }}
                    >
                        {isMobile && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12
                                }}
                            >
                                <Button
                                    type="text"
                                    aria-label="Menu"
                                    icon={
                                        drawerOpen ? (
                                            <MenuUnfoldOutlined style={{ fontSize: 20 }} />
                                        ) : (
                                            <MenuFoldOutlined style={{ fontSize: 20 }} />
                                        )
                                    }
                                    onClick={toggleDrawer(true)}
                                />
                                <div
                                    onClick={() => {
                                        navigate("/tracks");
                                        setDrawerOpen(false);
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        cursor: "pointer"
                                    }}
                                >
                                    <KraxLogo
                                        mode={themeMode}
                                        height={40}
                                        showTagline={false}
                                    />
                                </div>
                            </div>
                        )}
                        <ThemeToggle
                            themeMode={themeMode}
                            setThemeMode={setThemeMode}
                        />
                    </Header>

                    {isMobile && (
                        // ...imports unchanged
                        <Drawer
                            title={
                                <div
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        navigate("/tracks");
                                        setDrawerOpen(false);
                                    }}
                                >
                                    <KraxLogo
                                        mode={themeMode}
                                        height={36}
                                        showTagline={false}
                                    />
                                </div>
                            }
                            placement="left"
                            width={240}
                            onClose={toggleDrawer(false)}
                            open={drawerOpen}
                            /* REPLACED bodyStyle with styles */
                            styles={{
                                body: { padding: "8px 8px 24px" },
                                header: { padding: "12px 16px" }
                            }}
                        >
                            <Menu
                                mode="inline"
                                selectedKeys={[activeKey]}
                                items={menuItems}
                                onClick={() => setDrawerOpen(false)}
                            />
                        </Drawer>
                    )}

                    <Content
                        style={{
                            padding: isMobile
                                ? `16px 16px ${playerPadding}px`
                                : `24px 32px ${playerPadding}px`,
                            maxWidth: 1280,
                            width: "100%",
                            margin: "0 auto",
                            boxSizing: "border-box",
                            paddingBottom: `calc(${playerPadding}px + env(safe-area-inset-bottom, 0px))`
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