import React from 'react';
import { Card, CardBody, CardHeader, Input, Label } from 'reactstrap';
import { debounce } from 'lodash';
import classNames from 'classnames';

export default function ModuleStatePanel(props) {
    const { moduleStates, onModuleSettingChange, onModuleEnabledChange } = props;
    return (
        <Card>
            <CardHeader>Modules</CardHeader>
            <CardBody className="modules">
                    <ul style={{'list-style-type': 'none'}}>
                        {moduleStates ? Object.keys(moduleStates).map((moduleName) => {
                            const module = moduleStates[moduleName];
                            return (
                                <li>
                                    <Label>
                                        <Input
                                            type='checkbox'
                                            checked={module.enabled}
                                            onInput={(e) => onModuleEnabledChange(moduleName, !module.enabled)}
                                            />
                                        {' ' + module.displayName}
                                    </Label>
                                    <div className={"settings-div " + (module.enabled ? "" : "disabled")}>
                                        {Object.keys(module.settings).map((key) => {
                                            const def = module.settings[key];
                                            let input = null;
                                            switch (def.type) {
                                                case 'bool':
                                                    return (
                                                        <li>
                                                            <Label>
                                                                <Input
                                                                    type='checkbox'
                                                                    {...(def.attributes || {})}
                                                                    checked={def.value}
                                                                    onInput={(e) => onModuleSettingChange(moduleName, key, !def.value)}
                                                                    />
                                                                <span className="setting-label">
                                                                    {' ' + def.display}
                                                                </span>
                                                            </Label>
                                                        </li>
                                                    );
                                                case 'text':
                                                    return (
                                                        <li>
                                                            <span className="setting-label">
                                                                {def.display + ' '}
                                                            </span>
                                                            <Input
                                                                type="text"
                                                                {...(def.attributes || {})}
                                                                onInput={(e) => debounce(() => onModuleSettingChange(moduleName, key, e.target.value), 500)}
                                                                value={def.value} />
                                                        </li>
                                                    )
                                                case 'number':
                                                    return (
                                                        <li>
                                                            <span className="setting-label">
                                                                {def.display + ' '}
                                                            </span>
                                                            <Input
                                                                type="number"
                                                                {...(def.attributes || {})}
                                                                onInput={(e) => debounce(() => onModuleSettingChange(moduleName, key, e.target.value), 500)}
                                                                value={def.value} />
                                                        </li>
                                                    )
                                                case 'range':
                                                    return (
                                                        <li>
                                                            <span className="setting-label">
                                                                {def.display + ' '}
                                                            </span>
                                                            <Input
                                                                type="range"
                                                                {...(def.attributes || {})}
                                                                onInput={(e) => debounce(() => onModuleSettingChange(moduleName, key, e.target.value), 500)}
                                                                value={def.value} />
                                                        </li>
                                                    )
                                                case 'file':
                                                    return (
                                                        <li>
                                                            <span className="setting-label">
                                                                {def.display + ' '}
                                                            </span>
                                                            <Input
                                                                type="file"
                                                                {...(def.attributes || {})}
                                                                onInput={(e) => debounce(() => onModuleSettingChange(moduleName, key, e.target.value), 500)}
                                                                value={def.value} />
                                                        </li>
                                                    )
                                                default:
                                                    return null
                                            }
                                        })}
                                    </div>
                                </li>
                            );
                        }) : null}
                    </ul>
            </CardBody>
        </Card>
    );
}