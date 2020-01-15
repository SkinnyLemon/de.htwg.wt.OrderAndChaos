import {Component, Prop, h, State} from '@stencil/core';

@Component({
    tag: 'order-and-chaos',
    styleUrls: ['order-and-chaos.css', 'bootstrap.css'],
    shadow: true
})

export class OrderAndChaos {
    // private status: string;
    private webSocket: WebSocket;
    private cells: Cell[][] = [];
    private type: string;
    @State() private topText: string;
    @Prop() address: string;

    constructor() {
        this.webSocket = new WebSocket("ws://" + this.address);
        this.webSocket.onopen = () => {
            console.log("WebSocket opened");
        };
        this.webSocket.onmessage = (message) => {
            console.log("WebSocket Message received");
            console.log(JSON.parse(message.data));
            this.loadFromJson(JSON.parse(message.data));
        };
        this.webSocket.onerror = () => {
            console.error("WebSocket error");
        };
        this.webSocket.onclose = () => {
            console.log("WebSocket closed");
        };
    }

    render() {
        return <div class="container">
            <div class="row">
                <div class="col-sm-12">
                    <h1 class="turn">{this.topText}</h1>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-8">
                    <div class="game">
                        {this.cells.map(row =>
                            <div class="game-row">
                                {row.map(cell =>
                                    <div class={this.buildCellName(cell)}>
                                        {cell.type === "E" && this.type === "standard"
                                            ? <div class="choice-container">
                                                <div class="choice red-choice" onClick={() => this.setCell(cell, "R")}/>
                                                <div class="choice blue-choice"
                                                     onClick={() => this.setCell(cell, "B")}/>
                                            </div>
                                            : <div/>
                                        }
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div class="col-sm-4">
                    <div class="side-buttons">
                        <div class="btn btn-primary side-button" onClick={() => this.undo()}> Undo</div>
                        <div class="btn btn-primary side-button" onClick={() => this.redo()}> Redo</div>
                    </div>
                </div>
            </div>
        </div>;
    }

    buildCellName(cell: Cell) {
        return "game-cell ".concat(
            cell.type === "B"
                ? "blue-cell"
                : cell.type === "R"
                ? "red-cell"
                : this.type === "standard"
                    ? "empty-cell"
                    : "empty-cell-blocked");
    }

    loadFromJson(json) {
        let i: number;
        for (i = 0; i < json.grid.fields.length; i++) {
            this.cells[i] = [];
            let j: number;
            for (j = 0; j < json.grid.fields.length; j++) {
                this.cells[i][j] = {
                    x: j.toString(),
                    y: i.toString(),
                    type: json.grid.fields[i][j].type
                }
            }
        }
        this.type = json.type;
        this.topText = (this.type === "standard" ? "Turn: " : "Winner: ") + json.turn;
    }

    setCell(cell: Cell, cellType: string) {
        console.log("Setting cell (" + cell.x + "," + cell.y + ") to " + cell.type);
        const message = {
            "x": cell.x,
            "y": cell.y,
            "type": cellType,
            "action": "set"
        };
        this.sendMessage(message);
    }

    undo() {
        console.log("Undoing last step");
        const message = {"action": "undo"};
        this.sendMessage(message);
    }

    redo() {
        console.log("Redoing last step");
        const message = {"action": "redo"};
        this.sendMessage(message);
    }

    sendMessage(message) {
        this.webSocket.send(JSON.stringify(message));
    }
}

interface Cell {
    type: string;
    x: string;
    y: string;
}
