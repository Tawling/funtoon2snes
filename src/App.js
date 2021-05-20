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

    useEffect(() => {
        connection.current = new Connection({
            setDeviceInfo,
            setDeviceList,
            setAPIToken,
            setChannel,
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

    return (
        <div className="App">
            <ConnectionPanel
                deviceInfo={deviceInfo}
                deviceList={deviceList}
                onDeviceSelect={onDeviceSelect}
                onRefreshDevices={onRefreshDevices}
                onAPITokenChange={onAPITokenChange}
                onChannelChange={onChannelChange}
                channel={channel} />
        </div>
    );
}

export default App;
