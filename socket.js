const DDPClient = require("ddp");

let providers = [
    'open.rocket.chat/websocket',
    'chat-hug.inovae.ch'
];

for (let provider of providers) {
    let ddpclient = new DDPClient({
        // All properties optional, defaults shown
        host: provider,
        port: 3000,
        ssl: false,
        autoReconnect: true,
        autoReconnectTimer: 500,
        maintainCollections: true,
        ddpVersion: '1',  // ['1', 'pre2', 'pre1'] available
        // uses the SockJs protocol to create the connection
        // this still uses websockets, but allows to get the benefits
        // from projects like meteorhacks:cluster
        // (for load balancing and service discovery)
        // do not use `path` option when you are using useSockJs
        useSockJs: true,
        // Use a full url instead of a set of `host`, `port` and `ssl`
        // do not set `useSockJs` option if `url` is used
        url: 'wss://' + provider + '/websocket'
    });

    // Connect to the Meteor Server
    ddpclient.connect(function (error, wasReconnect) {

    });

    // Useful for debugging and learning the ddp protocol
    ddpclient.on('message', function (msg) {
        console.log('Message from', provider, msg);
    });

    ddpclient.on('socket-error', function(error) {
        console.log('Error from', provider, error.message);
    });
}

