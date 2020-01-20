let mygrid = [row(0),row(1),row(2),row(3),row(4),row(5)]

function row(row) {
    let gameCells= []
    for (let col=0;col<6;col++) {
        gameCells.push({row: row, col: col, pos: "game-cell" + row + col})
    }
    return gameCells
}

Vue.component('my-game-field', {
        template: `
            <div class="col-sm-8">
                <div class="game">
                    <div class="game-row" v-for="row in gamecells">
                        <div v-for="cell in row" class="game-cell empty-cell" v-bind:id="cell.pos"></div>
                    </div>
                </div>
            </div>


        `,
        data:function() {
            return {
                gamecells: mygrid
            }
        },

})

Vue.component('my-buttons', {
    template: `
        <div class="col-sm-4">
            <div class="side-buttons">
                <div class="btn btn-primary side-button" id="undo-button" @click="undo"> Undo </div>
                <div class="btn btn-primary side-button" id="redo-button" @click="redo"> Redo </div>
            </div>
        </div>
    `,
    methods: {
        undo: function() {
            console.log("Undoing last step");
            const message = {"action": "undo"};
            sendMessage(message);
        },
        redo: function() {
            console.log("Redoing last step");
            const message = {"action": "redo"};
            sendMessage(message);
        }
    }
})

let status;
const webSocket = new WebSocket("ws://localhost:9000/socket");
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

    toJson() {
        return {
            "type": this.type,
            "turn": this.player,
            "grid": {
                "fields": this.cells
            }
        }
    }
}

function setCell(x, y, type) {
    console.log("Setting cell (" + x + "," + y + ") to " + type);
    const message = {x, y, type, "action": "set"};
    sendMessage(message);
}


function sendMessage(message) {
    webSocket.send(JSON.stringify(message))
}


$(document).ready(function() {
    var game = new Vue({
        el: '#game',
    });
    $("#undo-button").click(function () {
        undo()
    });
    $("#redo-button").click(function () {
        redo()
    });
})