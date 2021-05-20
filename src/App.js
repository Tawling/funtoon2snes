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

    useEffect(() => {
        console.log('loading channel and token')
        const channel = localStorage.getItem('channelName')
        setChannel(channel)
        const token = localStorage.getItem('funtoonAPIToken')
        setAPIToken(token)

        connection.current.setAPIToken(token)
        connection.current.setChannel(channel)
    }, [token, channel])

    return (
        <div className="App">
            THIS DOES NOT WORK WITH PRACTICE ROM
            <ConnectionPanel
                deviceInfo={deviceInfo}
                deviceList={deviceList}
                onDeviceSelect={onDeviceSelect}
                onRefreshDevices={onRefreshDevices}
                onAPITokenChange={onAPITokenChange}
                onChannelChange={onChannelChange}
                channel={channel}
                token={token} />
        </div>
    );
}

export default App;
