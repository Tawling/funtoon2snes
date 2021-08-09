import React from 'react';
import { Input } from 'reactstrap';

export default function RangeSetting({ def, settingName, moduleName, onModuleSettingChange }) {
    return (
        <li key={settingName}>
            <span className="setting-label">{def.display + " "}</span>
            <Input
                type="range"
                {...(def.attributes || {})}
                onChange={(e) =>
                    onModuleSettingChange(moduleName, settingName, e.target.value)
                }
                value={def.value}
            />
        </li>
    );
}