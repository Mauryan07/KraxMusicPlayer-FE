import React, { useState, useEffect, useRef } from "react";
import { Tooltip, Button, theme as antdTheme, Flex } from "antd";
import {
    BulbOutlined,
    BulbFilled,
    MoonOutlined,
    SunOutlined
} from "@ant-design/icons";

/**
 * Elegant Icon Theme Toggle (no Switch component, no external CSS).
 *
 * Features:
 * - Single circular icon button.
 * - Subtle scale + rotate + fade cross‑fade between sun/moon (or bulb) icons.
 * - Uses Ant Design tokens for adaptive color & subtle gradient background.
 * - Accessible (aria-label, keyboard Space/Enter).
 * - Inline styles only (no external CSS files).
 *
 * Props:
 *  - themeMode: "light" | "dark"
 *  - setThemeMode: (mode) => void
 *  - variant (optional): "bulb" | "astro" (default "astro")
 */

export default function ThemeToggle({
                                        themeMode,
                                        setThemeMode,
                                        variant = "astro",
                                        size = 44
                                    }) {
    const { token } = antdTheme.useToken();
    const [animating, setAnimating] = useState(false);
    const prevModeRef = useRef(themeMode);

    const isDark = themeMode === "dark";

    const toggle = () => {
        if (animating) return;
        setAnimating(true);
        setThemeMode(isDark ? "light" : "dark");
    };

    useEffect(() => {
        if (prevModeRef.current !== themeMode) {
            const t = setTimeout(() => setAnimating(false), 380);
            prevModeRef.current = themeMode;
            return () => clearTimeout(t);
        }
    }, [themeMode]);

    // Choose icon set
    const LightIcon =
        variant === "bulb" ? (
            <BulbOutlined />
        ) : (
            <SunOutlined style={{ transform: "translateY(1px)" }} />
        );
    const DarkIcon =
        variant === "bulb" ? (
            <BulbFilled />
        ) : (
            <MoonOutlined style={{ transform: "translateY(1px)" }} />
        );

    // Layered icon cross‑fade
    const iconWrapperStyle = {
        position: "relative",
        width: size - 4,
        height: size - 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    };

    const commonIconLayer = {
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.55),
        transition:
            "opacity .38s cubic-bezier(.4,0,.2,1), transform .38s cubic-bezier(.4,0,.2,1)",
        pointerEvents: "none"
    };

    const lightStyle = {
        ...commonIconLayer,
        opacity: isDark ? 0 : 1,
        transform: isDark
            ? "scale(.6) rotate(-40deg)"
            : "scale(1) rotate(0deg)",
        color: token.colorWarning
    };

    const darkStyle = {
        ...commonIconLayer,
        opacity: isDark ? 1 : 0,
        transform: isDark
            ? "scale(1) rotate(0deg)"
            : "scale(.6) rotate(40deg)",
        color: token.colorPrimary
    };

    const gradientBg = isDark
        ? `linear-gradient(135deg, ${token.colorBgElevated} 0%, ${token.colorBgContainer} 85%)`
        : `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgElevated} 85%)`;

    const buttonStyle = {
        width: size,
        height: size,
        borderRadius: "50%",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: gradientBg,
        boxShadow: isDark
            ? "0 2px 6px rgba(0,0,0,0.45)"
            : "0 2px 6px rgba(0,0,0,0.15)",
        border: `1px solid ${token.colorBorderSecondary}`,
        transition:
            "background .4s ease, box-shadow .4s ease, transform .25s ease",
        transform: animating ? "scale(.95)" : "scale(1)"
    };

    const ringStyle = {
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        boxShadow: isDark
            ? `0 0 0 0 rgba(255,255,255,0.35)`
            : `0 0 0 0 rgba(0,0,0,0.25)`,
        animation: animating
            ? "kraxPulse 0.6s ease-out forwards"
            : "none",
        pointerEvents: "none"
    };

    // Inline keyframes via style injection (no external CSS)
    // Will only inject once.
    useEffect(() => {
        const id = "krax-theme-toggle-keyframes";
        if (!document.getElementById(id)) {
            const styleEl = document.createElement("style");
            styleEl.id = id;
            styleEl.innerHTML = `
@keyframes kraxPulse {
  0% { box-shadow: 0 0 0 0 rgba(0,0,0,0.25); opacity:1; }
  70% { box-shadow: 0 0 0 12px rgba(0,0,0,0); opacity:.4; }
  100% { box-shadow: 0 0 0 16px rgba(0,0,0,0); opacity:0; }
}
@media (prefers-reduced-motion: reduce) {
  @keyframes kraxPulse { 0%,100% { box-shadow:none; opacity:1; } }
}
`;
            document.head.appendChild(styleEl);
        }
    }, []);

    const label = isDark ? "Switch to light mode" : "Switch to dark mode";

    const onKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
        }
    };

    return (
        <Tooltip title={label} mouseEnterDelay={0.15}>
            <Flex
                role="button"
                aria-label={label}
                tabIndex={0}
                onKeyDown={onKeyDown}
                style={{
                    display: "inline-flex",
                    position: "relative"
                }}
            >
                <Button
                    type="text"
                    aria-hidden="true"
                    onClick={toggle}
                    style={buttonStyle}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <div style={iconWrapperStyle}>
                        <span style={lightStyle}>{LightIcon}</span>
                        <span style={darkStyle}>{DarkIcon}</span>
                        {animating && <span style={ringStyle} />}
                    </div>
                </Button>
            </Flex>
        </Tooltip>
    );
}