import React from "react";
import { Card, CardBody, CardHeader, Button, Input, Label } from "reactstrap";

import classNames from "classnames";

const States = {
    WARNING: 0x1,
    ERROR: 0x2,
    SUCCESS: 0,
}
function stateMessage(successMsg, errorCondition, errorMsg, warningCondition, warningMsg) {
    return {
        state: errorCondition ? States.ERROR : warningCondition ? States.WARNING : States.SUCCESS,
        message:  errorCondition ? errorMsg : warningCondition ? warningMsg : successMsg,
    }
}

const stateMask = (statefuls) => statefuls.reduce((a, v) => a | v.state, 0)

const interleave = (arr, thing) => [].concat(...arr.map(n => [n, thing])).slice(0, -1)

export default function ConnectionPanel(props) {
    const {
        readsPerSecond,
        enabled,
        autoRefreshEnabled,
        token,
        isTokenValid,
        channel,
        deviceInfo,
        deviceList,
        onDeviceSelect,
        refreshDevices,
        onAPITokenChange,
        onChannelChange,
        onToggleEnabled,
        onToggleAutoRefresh,
    } = props;

    const stateMessages = [
        stateMessage("Connected to USB2SNES service", deviceInfo === null, "Not Connected to USB2SNES service."),
        stateMessage(
            "FUNtoon API token is valid",
            isTokenValid === false,
            "Invalid channel name / FUNtoon API token combination.",
            isTokenValid === undefined,
            "Validating API token...",
        ),
    ]

    const headerState = stateMask(stateMessages)

    return (
        <Card>
            <CardHeader
                className={classNames({
                    "bg-danger": headerState & States.ERROR,
                    "bg-success": !headerState,
                    "bg-warning": headerState === States.WARNING,
                })}>
                { interleave(stateMessages.map(({message}) => message), <br />)}
            </CardHeader>
            <CardBody>
                <ul style={{ "list-style-type": "none" }}>
                    <li>
                        Channel Name:{" "}
                        <Input type="text" value={channel} onInput={(e) => onChannelChange(e.target.value)} />
                    </li>
                    <li>
                        FUNtoon API Token:
                        {channel ? (
                            <span>
                                <br />
                                (Get API token at{" "}
                                <a
                                    target="new"
                                    href={`https://funtoon.party/c/${channel.toLowerCase()}/script`}>{`funtoon.party/c/${channel.toLowerCase()}/script`}</a>
                                )
                            </span>
                        ) : null}
                        <Input type="password" value={token} onInput={(e) => onAPITokenChange(e.target.value)} />
                    </li>
                    <li>
                        Device:{" "}
                        <Input type="select" onChange={(e) => onDeviceSelect(e.target.value)}>
                            {deviceList
                                ? deviceList.map((result, i) => <option key={`device-${i}`}>{result}</option>)
                                : null}
                        </Input>
                    </li>
                    <li>{JSON.stringify(deviceInfo)}</li>
                </ul>
                <Button className="mt-3" color="secondary" onClick={refreshDevices}>
                    Refresh Device List
                </Button>
                <br />
                <Label>
                    <Input type="checkbox" checked={enabled} onInput={(e) => onToggleEnabled(!enabled)} /> Enable
                    Tracking
                </Label>
                <br />
                <Label>
                    <Input
                        type="checkbox"
                        checked={autoRefreshEnabled}
                        onInput={(e) => onToggleAutoRefresh(!autoRefreshEnabled)}
                    />{" "}
                    Enable Auto Update (checks for new version every 2 minutes and refreshes automatically)
                </Label>
                <br />
                Reads per Second: {(readsPerSecond || 0).toFixed(2)}
            </CardBody>
        </Card>
    );
}
