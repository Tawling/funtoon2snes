import { useEffect, useRef, useState } from 'react';
import './App.css';
import ConnectionPanel from './components/ConnectionPanel';
import Connection from './Connection';

function App() {
    const connection = useRef(null);
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [deviceList, setDeviceList] = useState([]);

    useEffect(() => {
        connection.current = new Connection({
            setDeviceInfo,
            setDeviceList,
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

    return (
        <div className="App">
            <ConnectionPanel
                deviceInfo={deviceInfo}
                deviceList={deviceList}
                onDeviceSelect={onDeviceSelect}
                onRefreshDevices={onRefreshDevices} />
        </div>
    );
}

export default App;
