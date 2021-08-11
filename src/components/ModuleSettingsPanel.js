import React, { useState, useRef } from "react";
import { Collapse, Tooltip } from "reactstrap";
import classNames from "classnames";

import CheckboxSetting from "./settings/CheckboxSetting";
import TextSetting from "./settings/TextSetting";
import NumberSetting from "./settings/NumberSetting";
import RangeSetting from "./settings/RangeSetting";
import DropdownSetting from "./settings/DropdownSetting";
import FileSetting from "./settings/FileSetting";
import ToggleSwitch from "./common/ToggleSwitch/ToggleSwitch";

import './ModuleSettingsPanel.css';

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
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const moduleNameRef = useRef(null);

    return (
        <li>
            <div class="form-group">
                <ToggleSwitch
                    type="checkbox"
                    checked={module.enabled}
                    onChange={(e) => onModuleEnabledChange(moduleName, !module.enabled)}
                >
                    <span ref={moduleNameRef}>{" " + module.displayName}</span>
                    {module.tooltip ? (
                        <Tooltip
                            placement="top"
                            isOpen={tooltipOpen}
                            target={moduleNameRef}
                            toggle={() => setTooltipOpen(!tooltipOpen)}
                        >
                            {module.tooltip}
                        </Tooltip>
                    ): null}
                    <span class="input-group-btn">
                    {Object.keys(module.settings).length > 0 ? (
                        <button className="icon-btn module-settings-toggle" type="button" onClick={() => setIsOpen(!isOpen)}>
                            Settings <img
                                        alt=""
                                        style={{verticalAlign: 'middle'}}
                                        src={isOpen ? "arrow-down.svg" : "arrow-right.svg"}
                                    />
                        </button>
                    ) : null}
                </span>
                </ToggleSwitch>
            </div>
            <Collapse isOpen={isOpen}>
                <div className="module-collapsible">
                    {module.description ? (
                        <div className="module-description">
                            {module.description}
                        </div>
                    ) : null}
                    <div
                        className={classNames({
                            "settings-div": true,
                            disabled: !module.enabled,
                        })}
                    >
                        {Object.keys(module.settings).map((settingName) => {
                            const def = module.settings[settingName];
                            const C = getComponentForDef(def);
                            return C ? (
                                <C 
                                    moduleName={moduleName}
                                    settingName={settingName}
                                    def={def}
                                    onModuleSettingChange={onModuleSettingChange}
                                />
                            ) : null;
                        })}
                    </div>
                </div>
            </Collapse>
        </li>
    );
}
