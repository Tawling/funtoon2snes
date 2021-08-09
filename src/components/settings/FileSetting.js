import React from 'react';
import { Input } from 'reactstrap';

export default function FileSetting({ def, key, moduleName, onModuleSettingChange }) {
    // TODO: localhost file storage
    return (
        <li key={key}>
            <span className="setting-label">
                {def.display + ' '}
            </span>
            <Input
                type="file"
                {...(def.attributes || {})}
                onChange={(e) => onModuleSettingChange(moduleName, key, e.target.value)}
                value={def.value} />
        </li>
    );
}