import { useEffect, useRef, useState } from "react";
import { Card, CardBody } from "reactstrap";
import "./App.css";
import ConnectionPanel from "./components/ConnectionPanel";
import ModulesPanel from "./components/ModulesPanel";

import ConnectionWorker from "./Connection.worker"; // eslint-disable-line

let refreshInterval = null;
let version = null;
let needsReload = false;
let reloadUnsafe = false;

function App() {
    const worker = useRef(null);
    const [deviceInfo, setDeviceInfo] = useState(null);
    const [deviceList, setDeviceList] = useState([]);
    const [channel, setChannel] = useState("");
    const [token, setAPIToken] = useState("");
    const [enabled, setEnabled] = useState(true);
    const [rps, setRPS] = useState(0);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

    const [moduleStates, setModuleStates] = useState({});

    const [messageQueue, setMessageQueue] = useState([]);

    function callExternal(name, ...args) {
        if (worker.current) {
            worker.current.postMessage({ name, args });
        } else {
            setMessageQueue([...messageQueue, { name, args }]);
        }
    }

    useEffect(() => {
        clearInterval(refreshInterval);
        refreshInterval = null;
        if (autoRefreshEnabled) {
            console.log();
            const checkVersion = async () => {
                try {
                    const res = await (await fetch("version.txt?t=" + Date.now())).text();
                    const serverVersion = +res.trim();
                    if (version === null) {
                        version = isNaN(serverVersion) ? 0 : serverVersion;
                        console.log("set version", version);
                    } else if (serverVersion !== version) {
                        if (reloadUnsafe) {
                            needsReload = true;
                            console.log("unsafe to reload, posponing until safe");
                        } else {
                            console.log("reloading");
                            window.location.reload();
                        }
                    }
                } catch (e) {
                    console.log("failed to fetch version number");
                    console.error(e);
                }
            };
            checkVersion();
            refreshInterval = setInterval(checkVersion, 120000);
        }
    }, [autoRefreshEnabled]);

    useEffect(() => {
        console.log("initializing worker...");
        worker.current = new ConnectionWorker();
        worker.current.addEventListener("message", (event) => {
            // console.log(event.data.name, event.data.args)
            switch (event.data.name) {
                case "log":
                    console.log(...event.data.args);
                    break;
                case "setDeviceInfo":
                    setDeviceInfo(...event.data.args);
                    break;
                case "setDeviceList":
                    setDeviceList(...event.data.args);
                    break;
                case "setChannel":
                    window.localStorage.setItem("channelName", event.data.args[0]);
                    setChannel(...event.data.args);
                    break;
                case "setAPIToken":
                    window.localStorage.setItem("funtoonAPIToken", event.data.args[0]);
                    setAPIToken(...event.data.args);
                    break;
                case "setEnabled":
                    window.localStorage.setItem("enabled", event.data.args[0]);
                    setEnabled(...event.data.args);
                    break;
                case "setRPS":
                    setRPS(...event.data.args);
                    break;
                case "setModuleStates":
                    window.localStorage.setItem("moduleStates", JSON.stringify(event.data.args[0]));
                    setModuleStates(...event.data.args);
                    break;
                case "setReloadUnsafe":
                    reloadUnsafe = event.data.args[0];
                    if (!reloadUnsafe && needsReload) {
                        window.location.reload();
                    }
                    break;
                default:
            }
        });
        for (const message of messageQueue) {
            worker.current.postMessage(message);
        }
        setMessageQueue([]);
        return () => worker.postMessage({ name: "stop", args: [] });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    function onDeviceSelect(deviceName) {
        callExternal("switchDevice", deviceName);
    }

    function onRefreshDevices() {
        callExternal("refreshDevices");
    }

    function onAPITokenChange(token) {
        callExternal("setAPIToken", token);
    }
    function onChannelChange(channel) {
        callExternal("setChannel", channel);
    }

    function onToggleEnabled(enabled) {
        callExternal("setEnabled", enabled);
    }

    function onToggleAutoRefresh(enabled) {
        setAutoRefreshEnabled(enabled);
        window.localStorage.setItem("autoRefreshEnabled", enabled);
    }

    function onModuleSettingChange(moduleName, settingName, value) {
        const newStates = { ...moduleStates };
        newStates[moduleName].settings[settingName].value = value;
        callExternal("setModuleStates", newStates);
    }

    function onModuleEnabledChange(moduleName, value) {
        const newStates = { ...moduleStates };
        newStates[moduleName].enabled = value;
        callExternal("setModuleStates", newStates);
    }

    useEffect(() => {
        console.log("loading channel and token");
        const channel = localStorage.getItem("channelName") || "";
        setChannel(channel);
        const token = localStorage.getItem("funtoonAPIToken") || "";
        setAPIToken(token);
        const enabled = localStorage.getItem("enabled") || true;
        setEnabled(enabled);

        const autoRefreshEnabled = localStorage.getItem("autoRefreshEnabled") || true;
        setAutoRefreshEnabled(autoRefreshEnabled);

        const moduleStates = JSON.parse(localStorage.getItem("moduleStates") || "{}");
        setModuleStates(moduleStates);

        callExternal("setAPIToken", token);
        callExternal("setChannel", channel);
        callExternal("setEnabled", enabled);
        callExternal("setModuleStates", moduleStates);
    }, [token, channel]); // eslint-disable-line react-hooks/exhaustive-deps

    const overlayURL = `https://funtoon.party/tracking.html?channel=${channel.toLowerCase()}&token=${token}`
    return (
        <div className="App">
            <h1>USB2SNES Memory Tracking for FUNtoon Integration</h1>
            <ConnectionPanel
                deviceInfo={deviceInfo}
                deviceList={deviceList}
                onDeviceSelect={onDeviceSelect}
                onRefreshDevices={onRefreshDevices}
                onAPITokenChange={onAPITokenChange}
                onChannelChange={onChannelChange}
                onToggleEnabled={onToggleEnabled}
                onToggleAutoRefresh={onToggleAutoRefresh}
                enabled={enabled}
                autoRefreshEnabled={autoRefreshEnabled}
                channel={channel}
                token={token}
                readsPerSecond={rps}
            />
            <Card>
                <CardBody>
                    <p><strong>New stream overlay for room times!</strong></p>
                    <p>After entering your channel name and FUNtoon API token above, add a Browser Source in OBS with the URL of <a href={overlayURL}>this page</a>.</p>
                </CardBody>
            </Card>
            <Card>
                <CardBody>
                    <p>
                        Due to issues with the SD2SNES/FXPak Pro firmware, some SNES ROMs may result in lower
                        Reads-Per-Second values, particularly practice ROMs.
                        <br />
                        Check out the <a href="https://sd2snes.de/blog/archives/1157">beta firmware</a> for a potential
                        fix.
                    </p>
                    <p>
                        Come join the{" "}
                        <a href="https://discord.gg/HdnJBhp" target="_blank" rel="noreferrer">
                            Official FUNtoon Discord Server
                        </a>{" "}
                        for help, information, updates, and suggestions.
                    </p>
                    <p>
                        <a href="https://github.com/Tawling/funtoon2snes" target="_blank" rel="noreferrer">
                            (GitHub source)
                        </a>
                    </p>
                </CardBody>
            </Card>
            <ModulesPanel
                moduleStates={moduleStates}
                onModuleSettingChange={onModuleSettingChange}
                onModuleEnabledChange={onModuleEnabledChange}
            />
        </div>
    );
}

export default App;
