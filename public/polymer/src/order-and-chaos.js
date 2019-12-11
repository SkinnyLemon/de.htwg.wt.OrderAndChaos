import {html, css, LitElement} from 'lit-element';
import "jquery";

export class OrderAndChaos extends LitElement {

    constructor() {
        super();
        this.rows = [ '1', '2', '3', '4', '5', '6' ];
        this.columns = [ '1', '2', '3', '4', '5', '6' ];
    }

    static get properties() {
        return {
            rows: { type: Array },
            columns: { type: Array }
        };
    }

    static get styles() {
        return css`
        .row {
            width: 100%;
        }
        
        @media (min-width: 365px) {
            .game {
                width: 330px;
            }
        
            .game-row {
                height: 55px;
                padding-top: 2px;
                padding-bottom: 2px;
            }
        
            .game-cell {
                margin-left: 2px;
                margin-right: 2px;
            }
        
            .choice {
                opacity: 10%;
            }
        }
        
        @media (min-width: 576px) {
            .choice {
                opacity: 0;
            }
        }
        
        @media (min-width: 768px) {
            .game {
                width: 460px;
            }
        
            .game-row {
                height: 76px;
                padding-top: 4px;
                padding-bottom: 4px;
            }
        
            .game-cell {
                margin-left: 4px;
                margin-right: 4px;
            }
        }
        
        @media (min-width: 992px) {
            .game {
                width: 620px;
            }
        
            .game-row {
                height: 103px;
                padding-top: 5px;
                padding-bottom: 5px;
            }
        
            .game-cell {
                margin-left: 5px;
                margin-right: 5px;
            }
        }
        
        @media (min-width: 1200px) {
            .game {
                width: 740px;
            }
        
            .game-row {
                height: 123px;
                padding-top: 10px;
                padding-bottom: 10px;
            }
        
            .game-cell {
                margin-left: 10px;
                margin-right: 10px;
            }
        }
        
        body {
            background-color: #333333;
        }
        
        .game {
            margin: auto;
            font-family: Calibri, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-radius: 5px;
            background-color: #666666;
        }
        
        .game-row {
            width: 100%;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: space-around;
            align-items: center;
        }
        
        
        .turn {
            text-align: center;
        }
        
        
        .game-cell {
            flex-grow: 1;
            height: 100%;
            width : 100%;
            border-radius: 5%;
            position: relative;
            display: flex;
        }
        
        .empty-cell {
            background-color: #888888;
        }
        
        .empty-cell-blocked {
            background-color: #777777;
        }
        
        .red-cell {
            background-color: darkred;
        }
        
        .blue-cell {
            background-color: darkblue;
        }
        
        .choice {
            width: 50%;
            height: 100%;
            border-radius: 5%;
        }
        
        .choice:hover {
            opacity: 100%;
        }
        
        .red-choice {
            background-color: red;
        }
        
        .blue-choice {
            background-color: blue;
        }
        
        .side-buttons {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-around;
        }
        
        .side-button {
            margin: 5px;
            width: 100px;
            flex-grow: 1;
        }
        
        .error-message {
            margin: 10px auto;
        }`
    }

    render() {
        return html`
            <div class="container">
                <div class="row">
                    <div class="col-sm-12">
                        <h1 class="turn text-light" id="top-text">Turn: Order</h1>
                    </div>
                </div>
                <div class="row">
                    <div class="game">
                        ${this.rows.map(row => html`
                            <div class="game-row">
                                ${this.columns.map(col => html `
                                    <div class="game-cell" id="game-cell${col.value}${row.value}"></div>
                                `)}
                            </div>
                        `)}
                    </div>
                    <div class="side-buttons">
                        <div class="button" id="undo-button">Undo</div>
                        <div class="button" id="redo-button">Redo</div>
                    </div>
                </div>
            </div>
`;}
}

window.customElements.define('order-and-chaos', OrderAndChaos);

let status;
let webSocket;

class Status {
    constructor(websocket) {
        this.loadFromJson(websocket)
    }

    loadFromJson(json) {
        this.cells = json.grid.fields;
        this.player = json.turn;
        this.type = json.type;
        this.updateCells();
        this.updateTopText()
    }

    updateCells() {
        for (const row in this.cells) {
            for (const col in this.cells[row]) {
                this.updateCell(row, col)
            }
        }
    }

    updateCell(x, y) {
        const cellType = this.cells[y][x].type;
        console.log("Updating cell (" + x + "," + y + ") to " + cellType);
        const query = $("#game-cell" + x + y);
        if (cellType !== "R") {
            query.removeClass("red-cell");
        }
        if (cellType !== "B") {
            query.removeClass("blue-cell");
        }
        if (cellType !== "E" || this.type !== "standard") {
            query.removeClass("empty-cell")
        }
        if (cellType !== "E" || this.type !== "game-over") {
            query.removeClass("empty-cell-blocked")
        }

        query.addClass(cellType === "B" ? "blue-cell" : cellType === "R" ? "red-cell" : this.type === "standard" ? "empty-cell" : "empty-cell-blocked");

        if (cellType === "E" && this.type === "standard") {
            query.addClass("empty-cell");
            let html = "<div class=\"choice red-choice\"/>\n";
            html = html + "<div class=\"choice blue-choice\"/>\n";
            query.html(html);
            query.children().eq(0).click(function () {
                setCell(x, y, "R")
            });
            query.children().eq(1).click(function () {
                setCell(x, y, "B")
            });
        } else {
            query.empty();
        }
    }

    updateTopText() {
        const start = this.type === "standard" ? "Turn: " : "Winner: ";
        $("#top-text").html(start + this.player)
    }
}

function setCell(x, y, type) {
    console.log("Setting cell (" + x + "," + y + ") to " + type);
    const message = {x, y, type, "action": "set"};
    sendMessage(message);
}

function undo() {
    console.log("Undoing last step");
    const message = {"action": "undo"};
    sendMessage(message);
}

function redo() {
    console.log("Redoing last step");
    const message = {"action": "redo"};
    sendMessage(message);
}

function sendMessage(message) {
    webSocket.send(JSON.stringify(message))
}

$(document).ready(function () {
    $("#undo-button").click(function () {
        undo()
    });
    $("#redo-button").click(function () {
        redo()
    });
    webSocket = new WebSocket("ws://localhost:9000/socket");
    webSocket.onopen = function () {
        console.log("WebSocket opened");
    };
    webSocket.onmessage = function (message) {
        console.log("WebSocket Message received");
        console.log(JSON.parse(message.data));
        status = new Status(JSON.parse(message.data));
    };
    webSocket.onerror = function () {
        console.error("WebSocket error");
    };
    webSocket.onclose = function () {
        console.log("WebSocket closed");
    };
});

