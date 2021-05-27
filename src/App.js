import { useEffect, useRef, useState } from 'react';
import './App.css';
import ConnectionPanel from './components/ConnectionPanel';
import Connection from './Connection';

function App() {
    const connection = useRef(null);
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [deviceList, setDeviceList] = useState([]);
    const [channel, setChannel] = useState('');
    const [token, setAPIToken] = useState('');
    const [checked, setEnabled] = useState(true);
    const [rps, setRPS] = useState(0);

    useEffect(() => {
        connection.current = new Connection({
            setDeviceInfo,
            setDeviceList,
            setAPIToken,
            setChannel,
            setEnabled,
            setRPS,
        });
        connection.current.start();
        return () => connection.current.stop();
    }, [])

    function onDeviceSelect(deviceName) {
        connection.current.switchDevice(deviceName);
    }

    function onRefreshDevices() {
        connection.current.refreshDevices();
    }

    function onAPITokenChange(token) {
        connection.current.setAPIToken(token);
    }
    function onChannelChange(channel) {
        connection.current.setChannel(channel);
    }

    function onToggleEnabled(enabled) {
        connection.current.setEnabled(enabled);
    }

    useEffect(() => {
        console.log('loading channel and token');
        const channel = localStorage.getItem('channelName') || '';
        setChannel(channel);
        const token = localStorage.getItem('funtoonAPIToken') || '';
        setAPIToken(token);
        const enabled = localStorage.getItem('enabled') || true;
        setEnabled(enabled);

        connection.current.setAPIToken(token);
        connection.current.setChannel(channel);
        connection.current.setEnabled(enabled);
    }, [token, channel]);

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
        </div>
    );
}

export default App;
