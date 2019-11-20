let game_json = {
    size: 6,
    6: {1: "B", 2: "B", 3: "E", 4: "E", 5: "B", 6: "R"},
    5: {1: "B", 2: "E", 3: "E", 4: "E", 5: "E", 6: "B"},
    4: {1: "E", 2: "E", 3: "E", 4: "E", 5: "E", 6: "E"},
    3: {1: "E", 2: "E", 3: "E", 4: "E", 5: "E", 6: "E"},
    2: {1: "R", 2: "E", 3: "E", 4: "E", 5: "E", 6: "R"},
    1: {1: "R", 2: "R", 3: "E", 4: "E", 5: "B", 6: "B"}
};

class Grid {
    constructor(size) {
        this.size = size;
        this.cells = {};
    }

    fill_json(json) {
        for (let idx = 1; idx < this.size + 1; idx++) {
            this.cells[idx] = json[idx];
        }
    }

}

let grid = new Grid(game_json.size);
grid.fill_json(game_json);

function fillGrid(grid) {
    for (const row in grid.cells) {
        for (const col in grid.cells[row]) {
            setCell(row, col, grid.cells[row][col])
        }
    }
}

function f() {
    console.log("Test")
}

function setCell(x, y, value) {
    console.log("Setting cell (" + x + "," + y + ") to " + value);
    grid.cells[x][y] = value;
    const query = $("#game-cell" + x + y);
    query.addClass(value === "E" ? "empty-cell" : value === "B" ? "blue-cell" : "red-cell");
    if (value === "E") {
        let html = "<div class=\"choice red-choice\"/>\n";
        html = html + "<div class=\"choice blue-choice\"/>\n";
        query.html(html);
        query.children().eq(0).click(function() { setCell(x, y, "R") });
        query.children().eq(1).click(function() { setCell(x, y, "B") });
    } else {
        query.empty();
    }
}

$(document).ready(function () {
    console.log("Document is ready, filling grid");
    fillGrid(grid);
    console.log("Grid is filled")
});