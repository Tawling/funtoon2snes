import React from 'react';
import { Card, CardBody, CardHeader, Input, Label } from 'reactstrap';

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
                                                                    checked={def.value}
                                                                    onInput={(e) => onModuleSettingChange(moduleName, key, !def.value)}
                                                                    />
                                                                {' ' + def.display}
                                                            </Label>
                                                        </li>
                                                    );
                                                default:
                                            }
                                            return <li>{input}</li>
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