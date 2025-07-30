import React from "react";
import { Input } from "reactstrap";

import SettingDescription from "./SettingDescription";


export default function RangeSetting({ def, settingName, moduleName, onModuleSettingChange }) {
    return (
        <li key={settingName}>
            <span className="setting-label">{def.display + " "}</span>
            <SettingDescription description={def.description} />
            <Input
                type="range"
                {...(def.attributes || {})}
                onChange={(e) => onModuleSettingChange(moduleName, settingName, e.target.value)}
                value={def.value}
            />
        </li>
    );
}
