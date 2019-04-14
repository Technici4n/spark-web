let socket;

/**
 * Called by the application to initialise the monitoring view.
 *
 * @param payload the payload data.
 */
function loadMonitoringData(payload) {

    const socketAddress = payload["socket"];

    // create a new socket connection
    socket = new WebSocket(socketAddress);
    socket.onmessage = onSocketMessage;
    socket.onopen = onSocketOpen;
    socket.onclose = onSocketClose;
    socket.onerror = onSocketError;

    // array of entries by time
    const data = payload["data"];
    let content = "";

    for (let entry of data) {
        content += JSON.stringify(entry, null, 2);
        content += "\n";
    }

    $("#monitoring-content").html(content);
    $("#loading").hide();
    $("#monitoring").show();
}

function onSocketMessage(e) {
    console.log("new message");

    const newEntry = JSON.parse(e.data);
    const content = JSON.stringify(newEntry, null, 2) + "\n" + $("#monitoring-content").html();
    $("#monitoring-content").html(content);
}

function onSocketOpen(e) {
    console.log("socket open");
    console.log(e);
}

function onSocketClose(e) {
    console.log("socket open");
    console.log(e);
}

function onSocketError(e) {
    console.log("socket open");
    console.log(e);
}