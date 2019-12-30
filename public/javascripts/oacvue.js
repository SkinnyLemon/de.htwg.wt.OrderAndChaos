let grid = [row(1),row(2),row(3),row(4),row(5),row(6)]

function row(row) {
    let gameCells= []
    for (let col=1;col<7;col++) {
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
                gamecells: grid
            }
        },

})

Vue.component('my-buttons', {
    template: `
        <div class="col-sm-4">
            <div class="side-buttons">
                <div class="btn btn-primary side-button" id="undo-button"> Undo </div>
                <div class="btn btn-primary side-button" id="redo-button"> Redo </div>
            </div>
        </div>
    `
})

$(document).ready(function() {

    var game = new Vue({
        el: '#game',
    })
    console.log("i am here")
})