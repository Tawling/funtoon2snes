import React from 'react';
import { Card, CardBody, CardHeader, Input, Label } from 'reactstrap';

export default function ModuleStatePanel(props) {
    const { moduleStates, onModuleSettingChange } = props;
    return (
        <Card>
            <CardHeader>Modules</CardHeader>
            <CardBody>
                <ul style={{'list-style-type': 'none'}}>
                    {moduleStates ? Object.keys(moduleStates).map((moduleName) => {
                        const module = moduleStates[moduleName];
                        return (
                            <li>
                                <Label>
                                    <Input
                                        type='checkbox'
                                        checked={module.settings.enabled}
                                        onInput={(e) => onModuleSettingChange(moduleName, 'enabled', !module.settings.enabled)}
                                        />
                                    {' ' + module.displayName}
                                </Label>
                            </li>
                        );
                    }) : null}
                </ul>
            </CardBody>
        </Card>
    );
}