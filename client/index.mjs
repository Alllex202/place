import timeout from "./timeout.mjs";
import drawer from "./drawer.mjs";
import picker from "./picker.mjs";

document.querySelector("#start").addEventListener("submit", e => {
    e.preventDefault();
    main(new FormData(e.currentTarget).get("apiKey"));
    document.querySelector(".container").classList.add("ready");
});

const main = apiKey => {
    const ws = connect(apiKey);
    ws.addEventListener("message", (e) => {
        const data = JSON.parse(e.data);
        // console.log(data)
        if (data.type === 'startRender') {
            drawer.putArray(data.payload.place);
            timeout.next = data.payload.nextTime ? new Date(data.payload.nextTime) : new Date();
        }
        if (data.type === 'setPoint') {
            drawer.put(data.payload.x, data.payload.y, data.payload.color);
        }
        if (data.type === 'timeout') {
            timeout.next = new Date(data.payload.nextTime);
        }
    });
    timeout.next = new Date();
    drawer.onClick = (x, y) => {
        ws.send(JSON.stringify({
            type: 'setPoint',
            payload: {
                x,
                y,
                color: picker.color,
            }
        }))
    };
};

const connect = apiKey => {
    const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
    return new WebSocket(url);
};
