import React from 'react';

const toOption = (opt) => {
    if (typeof opt === 'string') {
        return { display: opt, value: opt }
    } else if (typeof opt === 'object') {
        if (opt.display) {
            return opt
        } else {
            return { display: opt.value, ...opt }
        }
    } else if (typeof opt === 'number') {
        return { display: opt, value: opt }
    }
}

export default function DropdownSetting({ def, settingName, moduleName, onModuleSettingChange }) {
    return (
        <li key={settingName}>
            <span className="setting-label">{def.display + " "}</span>
            <select
                type="file"
                {...(def.attributes || {})}
                onChange={(e) =>
                    onModuleSettingChange(moduleName, settingName, e.target.value)
                }
                value={def.value}
            >
                {def.options
                    .map((opt) => toOption(opt))
                    .map((opt) => (
                        <option key={opt.display} value={opt.value}>
                            {opt.display}
                        </option>
                    ))}
            </select>
        </li>
    );
}