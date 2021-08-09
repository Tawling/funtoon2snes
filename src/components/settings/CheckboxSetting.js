import React from 'react';
import { Label, Input } from 'reactstrap';

export default function CheckboxSetting({ def, key, moduleName, onModuleSettingChange }) {
    return (
        <li key={key}>
            <Label class="input-group-btn">
                <Input
                    type="checkbox"
                    {...(def.attributes || {})}
                    checked={def.value}
                    onChange={() =>
                        onModuleSettingChange(moduleName, key, !def.value)
                    }
                />
                <span className="setting-label">{" " + def.display}</span>
            </Label>
        </li>
    );
}