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

function fillGrid(grid) {
    for (const row in grid.cells) {
        for (const col in grid.cells[row]) {
            setCell(row, col, grid.cells[row][col])
        }
    }
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
        setCellOnServer(x,y,value)
    }
}

function setCellOnServer(x, y, value) {
    $.get("/play/"+x+"/"+y+"/"+value, function(data) {
            console.log("Set cell on Server");
    });
}

function loadJson() {
    $.ajax({
        method: "GET",
        url: "/json",
        dataType: "json",

        success: function (result) {
            grid = new Grid(result.grid.size);
            grid.fill_json(result.grid.cells);
            fillGrid(grid);
        }
    });
}

$(document).ready(function () {
    console.log("Document is ready, filling grid");
    loadJson();
    console.log("Grid is filled");
});