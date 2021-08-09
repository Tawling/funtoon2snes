import React from "react";
import { useState } from "react";
import { Input, Label, Collapse, Button } from "reactstrap";
import classNames from "classnames";

import CheckboxSetting from "./settings/CheckboxSetting";
import TextSetting from "./settings/TextSetting";
import NumberSetting from "./settings/NumberSetting";
import RangeSetting from "./settings/RangeSetting";
import DropdownSetting from "./settings/DropdownSetting";
import FileSetting from "./settings/FileSetting";

function getComponentForDef(def) {
    switch (def.type) {
        case "bool":
            return CheckboxSetting;
        case "text":
            return TextSetting;
        case "number":
            return NumberSetting;
        case "range":
            return RangeSetting;
        case "dropdown":
            return DropdownSetting;
        case 'file':
            return FileSetting;
        default:
            return null;
    }
}

export default function ModuleSettingsPanel({
    module,
    moduleName,
    onModuleEnabledChange,
    onModuleSettingChange,
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <li>
            <div class="form-group">
                <Label>
                    <Input
                        type="checkbox"
                        checked={module.enabled}
                        onChange={(e) => onModuleEnabledChange(moduleName, !module.enabled)}
                    />
                    {" " + module.displayName}
                </Label>
                <span class="input-group-btn">
                    {Object.keys(module.settings).length > 0 ? (
                        <button className="icon-btn" type="button" onClick={() => setIsOpen(!isOpen)}>
                            <img src={isOpen ? "arrow-down.svg" : "arrow-right.svg"}></img>
                        </button>
                    ) : (
                        <div></div>
                    )}
                </span>
            </div>
            <Collapse isOpen={isOpen}>
                <div
                    className={classNames({
                        "settings-div": true,
                        disabled: !module.enabled,
                    })}
                >
                    {Object.keys(module.settings).map((key) => {
                        const def = module.settings[key];
                        const C = getComponentForDef(def);
                        return C ? (
                            <C 
                                moduleName={moduleName}
                                key={key}
                                def={def}
                                onModuleSettingChange={onModuleSettingChange}
                            />
                        ) : null;
                    })}
                </div>
            </Collapse>
        </li>
    );
}
