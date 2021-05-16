import React from 'react';
import { Card, CardBody, CardHeader, Button, Input } from 'reactstrap';

import classNames from 'classnames';

export function ConnectionPanel(props) {
    const { device, onDeviceSelect, onConnect } = props;

    return (
        <Card>
            <CardHeader className={classNames({
                'bg-danger': device.state === 0,
                'bg-success': device.state !== 0,
            })}>Connection</CardHeader>
            <CardBody>
                <li>Status: {['Disconnected', 'Connected'][device.state]}</li>
                    {!device.selecting
                        ? <li>Device: {device.name}</li>
                        : (<>
                            <li>Multiple USB2SNES Devices detected, please select one below:</li>
                            <li>
                                <Input type="select" onChange={(e) => onDeviceSelect(e.target.value)}>
                                    {device.list.map((result, i) =>
                                        <option key={`device-${i}`}>{result}</option>
                                    )}
                                </Input>
                            </li>
                        </>)
                    }
                    <li>Version: {device.version}</li>
                {device.state === 0 && (
                    <Button className="mt-3" color="primary" onClick={onConnect}>Connect</Button>
                )}
            </CardBody>
        </Card>
    )
}

export default function ConnectionPanel2(props) {
    const { deviceInfo, deviceList, onDeviceSelect, refreshDevices} = props;
    return (
        <Card>
            <CardHeader className={classNames({
                'bg-danger': deviceInfo === null,
                'bg-success': deviceInfo !== null,
            })}>Connection</CardHeader>
            <CardBody>
                <ul>
                    <li>Device: <Input type="select" onChange={(e) => onDeviceSelect(e.target.value)}>
                        {
                            deviceList
                                ? deviceList.map((result, i) =>
                                    <option key={`device-${i}`}>{result}</option>
                                )
                                : null
                        }
                    </Input>
                    </li>
                    <li>{JSON.stringify(deviceInfo)}</li>
                </ul>
                <Button className='mt-3' color='secondary' onClick={refreshDevices}>Refresh Device List</Button>
            </CardBody>
        </Card>
    );
}