import React from "react";
import { Card, CardBody, CardHeader, Button, Input, Label } from "reactstrap";

import classNames from "classnames";

export default function ConnectionPanel(props) {
    const {
        readsPerSecond,
        enabled,
        autoRefreshEnabled,
        token,
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
    return (
        <Card>
            <CardHeader
                className={classNames({
                    "bg-danger": deviceInfo === null,
                    "bg-success": deviceInfo !== null,
                })}>
                {deviceInfo === null ? "Not Connected to USB2SNES service..." : "Connected to USB2SNES service."}
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
