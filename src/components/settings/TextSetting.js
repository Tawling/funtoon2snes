import React from 'react';
import { Input } from 'reactstrap';

export default function TextSetting({ def, key, moduleName, onModuleSettingChange }) {
    return (
        <li key={key}>
            <span className="setting-label">{def.display + " "}</span>
            <Input
                type="text"
                {...(def.attributes || {})}
                onInput={(e) =>
                    onModuleSettingChange(moduleName, key, e.target.value)
                }
                value={def.value}
            />
        </li>
    );
}