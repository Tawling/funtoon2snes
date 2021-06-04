import Connection from './Connection'

const connection = new Connection((name, ...args) => {
    postMessage({ name, args });
});

onmessage = function (event) {
    connection.onExternal(event.data)
}

connection.start();