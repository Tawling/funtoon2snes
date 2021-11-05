import React from "react";
import { Input } from "reactstrap";

export default function TextSetting({ def, settingName, moduleName, onModuleSettingChange }) {
    return (
        <li key={settingName}>
            <span className="setting-label">{def.display + " "}</span>
            <Input
                type="text"
                {...(def.attributes || {})}
                onInput={(e) => onModuleSettingChange(moduleName, settingName, e.target.value)}
                value={def.value}
            />
        </li>
    );
}
