import React from "react";
import ToggleSwitch from "../common/ToggleSwitch/ToggleSwitch";

export default function CheckboxSetting({ def, settingName, moduleName, onModuleSettingChange }) {
    return (
        <li key={settingName}>
            <ToggleSwitch
                className="input-group-btn"
                {...(def.attributes || {})}
                checked={def.value}
                onChange={() => onModuleSettingChange(moduleName, settingName, !def.value)}>
                <span className="setting-label">{" " + def.display}</span>
            </ToggleSwitch>
        </li>
    );
}
