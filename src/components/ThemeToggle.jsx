import React from "react";
import { Switch, Tooltip } from "antd";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";

export default function ThemeToggle({ themeMode, setThemeMode }) {
    return (
        <Tooltip title={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <Switch
                checked={themeMode === "dark"}
                onChange={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
                checkedChildren={<BulbFilled />}
                unCheckedChildren={<BulbOutlined />}
            />
        </Tooltip>
    );
}