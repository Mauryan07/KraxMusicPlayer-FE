import React from "react";
import { theme } from "antd";

/**
 * KraxLogo (Text Only)
 *
 * Removed the previous headphone/speaker graphic.
 * Renders a clean “KRAX” wordmark that adapts to light/dark theme.
 *
 * Props:
 *  - mode: 'light' | 'dark'
 *  - height: visual height (affects font size scaling)
 *  - showTagline: boolean (default true)
 *  - accentColor: override highlight color for the stylized X
 *  - style: additional wrapper styles
 */
export default function KraxLogo({
                                     mode = "light",
                                     height = 48,
                                     showTagline = true,
                                     accentColor,
                                     style = {}
                                 }) {
    const { token } = theme.useToken();
    const textColor = mode === "dark" ? token.colorTextLightSolid : token.colorText;
    const accent = accentColor || token.colorPrimary;

    // Derive font sizes from provided height
    const mainFontSize = Math.round(height * 0.85);
    const taglineFontSize = Math.max(12, Math.round(height * 0.28));

    return (
        <div
            style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-start",
                lineHeight: 1,
                userSelect: "none",
                ...style
            }}
            aria-label="Krax Music Player"
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "baseline",
                    fontFamily: "Segoe UI, 'Inter', Arial, sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    fontSize: mainFontSize,
                    color: textColor
                }}
            >
                <span style={{ marginRight: 4 }}>KRA</span>
                <span
                    style={{
                        color: accent,
                        display: "inline-block",
                        transform: "translateY(-2%)"
                    }}
                >
          X
        </span>
            </div>
            {showTagline && (
                <div
                    style={{
                        marginTop: 2,
                        fontFamily: "Segoe UI, 'Inter', Arial, sans-serif",
                        fontSize: taglineFontSize,
                        fontWeight: 400,
                        letterSpacing: "0.25em",
                        color: textColor,
                        opacity: 0.75
                    }}
                >
                    MUSIC PLAYER
                </div>
            )}
        </div>
    );
}