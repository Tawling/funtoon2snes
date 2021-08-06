import { useEffect, useRef, useState } from 'react';
import './App.css';
import ConnectionPanel from './components/ConnectionPanel';
import ModuleStatePanel from './components/ModuleStatePanel';

import ConnectionWorker from './Connection.worker' // eslint-disable-line

function App() {
    const worker = useRef(null);
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [deviceList, setDeviceList] = useState([]);
    const [channel, setChannel] = useState('');
    const [token, setAPIToken] = useState('');
    const [checked, setEnabled] = useState(true);
    const [rps, setRPS] = useState(0);

    const [moduleStates, setModuleStates] = useState({})

    const [messageQueue, setMessageQueue] = useState([]);

    function callExternal(name, ...args) {
        if (worker.current) {
            worker.current.postMessage({ name, args })
        } else {
            setMessageQueue([...messageQueue, { name, args }])
        }
    }

    useEffect(() => {
        console.log('initializing worker...');
        worker.current = new ConnectionWorker();
        worker.current.addEventListener('message', (event) => {
            // console.log(event.data.name, event.data.args)
            switch (event.data.name) {
                case 'log':
                    console.log(...event.data.args);
                    break;
                case 'setDeviceInfo':
                    setDeviceInfo(...event.data.args);
                    break;
                case 'setDeviceList':
                    setDeviceList(...event.data.args);
                    break;
                case 'setChannel':
                    window.localStorage.setItem('channelName', event.data.args[0])
                    setChannel(...event.data.args);
                    break;
                case 'setAPIToken':
                    window.localStorage.setItem('funtoonAPIToken', event.data.args[0])
                    setAPIToken(...event.data.args);
                    break;
                case 'setEnabled':
                    window.localStorage.setItem('enabled', event.data.args[0])
                    setEnabled(...event.data.args);
                    break;
                case 'setRPS':
                    setRPS(...event.data.args);
                    break;
                case 'setModuleStates':
                    window.localStorage.setItem('moduleStates', JSON.stringify(event.data.args[0]));
                    setModuleStates(...event.data.args);
                    break;
                default:
            }
        });
        for (const message of messageQueue) {
            worker.current.postMessage(message)
        }
        setMessageQueue([])
        return () => worker.postMessage({ name: 'stop', args: [] })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    function onDeviceSelect(deviceName) {
        callExternal('switchDevice', deviceName);
    }

    function onRefreshDevices() {
        callExternal('refreshDevices');
    }

    function onAPITokenChange(token) {
        callExternal('setAPIToken', token);
    }
    function onChannelChange(channel) {
        callExternal('setChannel', channel);
    }

    function onToggleEnabled(enabled) {
        callExternal('setEnabled', enabled);
    }

    function onModuleSettingChange(moduleName, settingName, value) {
       const newStates = {...moduleStates};
       newStates[moduleName].settings[settingName].value = value;
       callExternal('setModuleStates', newStates);
    }

    function onModuleEnabledChange(moduleName, value) {
        const newStates = {...moduleStates};
        newStates[moduleName].enabled = value;
        callExternal('setModuleStates', newStates);
     }

    useEffect(() => {
        console.log('loading channel and token');
        const channel = localStorage.getItem('channelName') || '';
        setChannel(channel);
        const token = localStorage.getItem('funtoonAPIToken') || '';
        setAPIToken(token);
        const enabled = localStorage.getItem('enabled') || true;
        setEnabled(enabled);

        const moduleStates = JSON.parse(localStorage.getItem('moduleStates') || '{}');
        setModuleStates(moduleStates)

        callExternal('setAPIToken', token);
        callExternal('setChannel', channel);
        callExternal('setEnabled', enabled);
        callExternal('setModuleStates', moduleStates);
    }, [token, channel]);  // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="App">
            <h1>USB2SNES Automated Guessing Games (Alpha)</h1>
            THIS DOES NOT WORK PROPERLY WITH PRACTICE ROM
            <ConnectionPanel
                deviceInfo={deviceInfo}
                deviceList={deviceList}
                onDeviceSelect={onDeviceSelect}
                onRefreshDevices={onRefreshDevices}
                onAPITokenChange={onAPITokenChange}
                onChannelChange={onChannelChange}
                onToggleEnabled={onToggleEnabled}
                checked={checked}
                channel={channel}
                token={token}
                readsPerSecond={rps} />
            <ModuleStatePanel
                moduleStates={moduleStates}
                onModuleSettingChange={onModuleSettingChange}
                onModuleEnabledChange={onModuleEnabledChange} />
        </div>
    );
}

export default App;
