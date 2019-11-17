let size = 6
let game_json = {
    size = 6
    0: {0:"E",1:"E",2:"E",3:"E",4:"E",5:"E"},
    1: {0:"E",1:"E",2:"E",3:"E",4:"E",5:"E"},
    2: {0:"E",1:"E",2:"E",3:"E",4:"E",5:"E"},
    3: {0:"E",1:"E",2:"E",3:"E",4:"E",5:"E"},
    4: {0:"E",1:"E",2:"E",3:"E",4:"E",5:"E"},
    5: {0:"E",1:"E",2:"E",3:"E",4:"E",5:"E"},
};

class Grid {
    constructor(size) {
        this.size = size;
        this.cells = {};
    }

    fill_json(json) {
        for (let idx = 0; idx < this.size; idx++) {
            this.cells[idx] = json[idx]:
        }
    }

}

let grid = new Grid(game_json.size);
grid.fill_json(game_json)

function fillGrid(grid) {
    html = ""
    for (var rows in grid.cells) {
        for (var cell in rows) {
            if (grid.cells[rows][cell] == "E") {
                html = html + "<a href="/play/@x/@y/R" class="choice red-choice">" + "</a>" + "\n"
                html = html + "<a href="/play/@x/@y/B" class="choice blue-choice">" + "</a>" + "\n"
            }
        }
    }
}

fucntion setCell(x, y , value) {
    console.log("Setting cell ("+x+","+y+")"+"to"+value);
    grid.cells[x][y] = value;

}

$( document ).ready(function() {
    console.log( "Document is ready, filling grid" );
    fillGrid(grid);
    registerClickListener();

});