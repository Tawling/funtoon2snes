import React from "react";
import "./SettingDescription.css";
import Markdown from "../common/Markdown/Markdown";

export default function SettingDescription({ description }) {
    return description ? (
            <Markdown className="setting-description" src={description} />
    ) : null;
}
