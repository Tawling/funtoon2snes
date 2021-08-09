import React from 'react';
import { Input } from 'reactstrap';

export default function FileSetting({ def, settingName, moduleName, onModuleSettingChange }) {
    // TODO: localhost file storage
    return (
        <li key={settingName}>
            <span className="setting-label">
                {def.display + ' '}
            </span>
            <Input
                type="file"
                {...(def.attributes || {})}
                onChange={(e) => onModuleSettingChange(moduleName, settingName, e.target.value)}
                value={def.value} />
        </li>
    );
}