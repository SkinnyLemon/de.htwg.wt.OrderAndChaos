let size = 6
let game_json = {
    size : 6,
    6: {6:"E",5:"E",4:"E",3:"E",2:"E",1:"E"},
    5: {6:"E",5:"E",4:"E",3:"E",2:"E",1:"E"},
    4: {6:"E",5:"E",4:"E",3:"E",2:"E",1:"E"},
    3: {6:"E",5:"E",4:"E",3:"E",2:"E",1:"E"},
    2: {6:"E",5:"E",4:"E",3:"E",2:"E",1:"E"},
    1: {6:"E",5:"E",4:"E",3:"E",2:"E",1:"E"},
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
    html = "";
    for (var row in grid.cells) {
        for (var col in grid.cells[row]) {
            if (grid.cells[row][col] == "E") {
                html = html + "<a href=\"/play/" +row+"/" +col + "/R\" class=\"choice red-choice\" onclick='setCell("+row+","+col+",\"R\")'>" + "</a>" + "\n";
                html = html + "<a href=\"/play/" +row+"/"+col+"/B\" class=\"choice blue-choice\" onclick='setCell("+row+","+col+",\"B\")'>" + "</a>" + "\n";
            }
            console.log(html)
            document.getElementById("game-cell" + row + col).innerHTML = html;
            html = "";
        }
    }
}

function setCell(x, y , value) {
    console.log("Setting cell ("+x+","+y+")"+"to"+value);
    grid.cells[x][y] = value;
    document.getElementById("game-cell" + x + y).off("click");

}

$( document ).ready(function() {
    console.log( "Document is ready, filling grid" );
    fillGrid(grid);
    console.log("Grid is filled")
});