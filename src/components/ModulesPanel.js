import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

import ModuleSettingsPanel from "./ModuleSettingsPanel";

export default function ModulesPanel(props) {
    const { moduleStates, onModuleSettingChange, onModuleEnabledChange } = props;
    return (
        <Card>
            <CardHeader>Modules</CardHeader>
            <CardBody className="modules">
                <ul style={{ "list-style-type": "none" }}>
                    {moduleStates
                        ? Object.keys(moduleStates).map((moduleName) => {
                              const module = moduleStates[moduleName];
                              return module.hidden ? null : (
                                  <ModuleSettingsPanel
                                      module={module}
                                      moduleName={moduleName}
                                      onModuleEnabledChange={onModuleEnabledChange}
                                      onModuleSettingChange={onModuleSettingChange}
                                  />
                              );
                          })
                        : null}
                </ul>
            </CardBody>
        </Card>
    );
}
