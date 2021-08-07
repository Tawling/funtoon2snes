import React from 'react';
import { Card, CardBody, CardHeader, Input, Label, Select, Option } from 'reactstrap';
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
                                    <div className={classNames({'settings-div': true, 'disabled': !module.enabled})}>
                                        {Object.keys(module.settings).map((key) => {
                                            const def = module.settings[key];
                                            let input = null;
                                            switch (def.type) {
                                                case 'bool':
                                                    return (
                                                        <li key={key}>
                                                            <Label>
                                                                <Input
                                                                    disabled={!module.enabled}
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
                                                        <li key={key}>
                                                            <span className="setting-label">
                                                                {def.display + ' '}
                                                            </span>
                                                            <Input
                                                                disabled={!module.enabled}
                                                                type="text"
                                                                {...(def.attributes || {})}
                                                                onInput={(e) => debounce(() => onModuleSettingChange(moduleName, key, e.target.value), 500)}
                                                                value={def.value} />
                                                        </li>
                                                    )
                                                case 'number':
                                                    return (
                                                        <li key={key}>
                                                            <span className="setting-label">
                                                                {def.display + ' '}
                                                            </span>
                                                            <Input
                                                                disabled={!module.enabled}
                                                                type="number"
                                                                {...(def.attributes || {})}
                                                                onInput={(e) => debounce(() => onModuleSettingChange(moduleName, key, e.target.value), 500)}
                                                                value={def.value} />
                                                        </li>
                                                    )
                                                case 'range':
                                                    return (
                                                        <li key={key}>
                                                            <span className="setting-label">
                                                                {def.display + ' '}
                                                            </span>
                                                            <Input
                                                                disabled={!module.enabled}
                                                                type="range"
                                                                {...(def.attributes || {})}
                                                                onInput={(e) => debounce(() => onModuleSettingChange(moduleName, key, e.target.value), 500)}
                                                                value={def.value} />
                                                        </li>
                                                    )
                                                case 'file':
                                                    return (
                                                        <li key={key}>
                                                            <span className="setting-label">
                                                                {def.display + ' '}
                                                            </span>
                                                            <Input
                                                                disabled={!module.enabled}
                                                                type="file"
                                                                {...(def.attributes || {})}
                                                                onInput={(e) => onModuleSettingChange(moduleName, key, e.target.value)}
                                                                value={def.value} />
                                                        </li>
                                                    )

                                                case 'dropdown':
                                                    return (
                                                        <li key={key}>
                                                            <span className="setting-label">
                                                                {def.display + ' '}
                                                            </span>
                                                            <Select
                                                                disabled={!module.enabled}
                                                                type="file"
                                                                {...(def.attributes || {})}
                                                                onInput={(e) => onModuleSettingChange(moduleName, key, e.target.value)}
                                                                value={def.value}>
                                                                    {def.options.map((opt) => <Option key={opt.display} value={opt.value}>{opt.display}</Option>)}
                                                            </Select>
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