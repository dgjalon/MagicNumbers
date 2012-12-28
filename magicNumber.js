function Ball(number){
    if ( number == undefined)
        this.number = Math.floor((Math.random() * level)+1);  
    else
        this.number = number;
}
Ball.prototype.fusion = function(ball){
    this.number += ball.number;
}


function BallStack(){
    this.STACK_BALLS = 3;
    this.stack = new Array();
    for(var i=0; i < this.STACK_BALLS; i++)
        this.stack.push( new Ball() );
}
BallStack.prototype.getBall = function(){
    var ball_res = new Ball( this.stack[0].number );
    this.stack.shift()
    this.stack.push( new Ball() );
    $("#stack_balls div").last().effect("explode", "slow");
    this.draw();
    return ball_res;
}
BallStack.prototype.draw = function(){
     $("#stack_balls").empty();
     for(var i=0; i < this.STACK_BALLS; i++)
         $("#stack_balls").prepend('<div data-value="'+this.stack[i].number+'" class="stack_element ui-state-default">'+this.stack[i].number+'</div>');
}


function Board(nCols, nRows){
    this.maxCols = nCols;
    this.maxRows = nRows;
    this.table = new Array(nRows); 
    for(var i = 0; i < this.table.length; i++)
        this.table[i] = new Array(nCols);
}
Board.prototype.initialize = function(random){
    for(var row = 0; row < this.table.length; row++) {
        for(var col = 0; col < this.table[row].length; col++) {
            this.table[row][col] = new Ball(0);
        }
    }
    if (random){
        for(var i=0;i<this.maxCols*this.maxCols/2;i++){
            var pos = {x:(i*2)%this.maxRows, y:(i*2)%this.maxCols};
            this.addBall(pos, new Ball())
        }
    }
}
Board.prototype.addBall = function(pos, ball){
    pos.x = this.getFreeRow(pos.y);
    if (this.isValidPos(pos))
        this.table[pos.x][pos.y] = ball;
    return this.isValidPos(pos);
}
Board.prototype.addLine = function(){
    var lastRow = this.getRow(0);
    for (var row = 1;row<this.maxRows;row++){
        this.setRow(row-1, this.getRow(row));
    }
    var newRow = new Array();
    for (var col=0;col<this.maxCols;col++){
        newRow.push(new Ball());
    }
    this.setRow(this.maxRows-1, newRow);
}
Board.prototype.getFreeRow = function(col){
    var row = this.maxRows-1;
    while (row >= 0){
        if( this.table[row][col].number == 0 )            
            break;
        row--;       
    }    
    return row;
}
Board.prototype.isValidPos = function(pos){
    return (((pos.x >= 0) && (pos.x < this.maxRows)) && ((pos.y >= 0) && (pos.y < this.maxCols)))
}
Board.prototype.isEmptyPos = function(pos){
    return (this.table[pos.x][pos.y].number == 0)
}
Board.prototype.isEmptyRow = function(row){
    var result = true;
    for(var col=0;col<this.maxCols;col++){
        result = this.isEmptyPos({x:row, y:col});
        if (!result)
            break;
    }
    return result;
}
Board.prototype.isFullRow = function(row){
    var result = false;
    for(var col=0;col<this.maxCols;col++){
        result = !this.isEmptyPos({x:row, y:col});
        if (!result)
            break;
    }
    return result;
}
Board.prototype.isFullCol = function(col){
    var result = false;
    for(var row=0;row<this.maxRows;row++){
        result = !this.isEmptyPos({x:row, y:col});
        if (!result)
            break;
    }
    return result;
}
Board.prototype.isFusionable = function(pos1, pos2){
    return  (this.table[pos1.x][pos1.y].number != 0) &&
            (this.table[pos2.x][pos2.y].number != 0) &&
    ((this.table[pos1.x][pos1.y].number + this.table[pos2.x][pos2.y].number) <= level);
}
Board.prototype.fusion = function(pos_drag, pos_drop){
    this.table[pos_drop.x][pos_drop.y].number += this.table[pos_drag.x][pos_drag.y].number;
    this.table[pos_drag.x][pos_drag.y].number = 0;
    // GUI
    $("#"+pos_drop.x+pos_drop.y).html( this.table[pos_drop.x][pos_drop.y].number );
    $("#"+pos_drag.x+pos_drag.y).html( 0 );
}

Board.prototype.update = function(){
    var recall = false;
    var board = this;
    setTimeout( function(){
        board.compact();
        board.draw();
    }, 250);
    
    setTimeout( function(){
        recall = board.minimize();
        console.log(recall);
        setTimeout( function(){
            board.compact();
            board.draw();
        }, 250);
        if (recall)
            board.update();
    }, 450);    
}
Board.prototype.minimize = function(){
    var update = false;
    // Convert to zeros
    for(var row=this.maxRows-1; row>=0; row--){
        for(var col=this.maxCols-1; col>=0; col--){
            var res = this.simplify(this.table[row][col].number, {x:row, y:col});
            if (res)
                update = true;
        }
    }
    return update;
}
Board.prototype.compact = function(){
    // Compact all cols
    for (var col = 0; col < this.maxCols; col++)
        this.setCol(col, this.compactCol( this.getCol(col) ) );
}
Board.prototype.compactCol = function(aCol){
    var aNoZeros = aCol.filter(function(x) { return x.number != 0 });
    aNoZeros.reverse();
    for (var i=aNoZeros.length; i < aCol.length; i++)
        aNoZeros.push(new Ball(0));        
    return aNoZeros.reverse();
}
Board.prototype.simplify = function(value, pos){
    var simplify = false;
    if ((value != 0)&&(value != 1)){
        var s = new Set();
        s.add(pos);
        var allAdjacents = this.getAdjacents(s, 0);
        if (value <= allAdjacents.length){
            simplify = true;
            for(var i=0;i<allAdjacents.length;i++){
                $("#"+allAdjacents[i].x+allAdjacents[i].y).effect("explode");
                $("#"+allAdjacents[i].x+allAdjacents[i].y).html(0);
                this.table[allAdjacents[i].x][allAdjacents[i].y] = new Ball(0);
            }
        }
    }
    return simplify;
}
Board.prototype.getCol = function(col){
    var aCol = new Array()
    for(var row = 0; row < this.maxRows; row++)
        aCol.push( this.table[row][col] );
    return aCol;
}
Board.prototype.getRow = function(row){
    var aCol = new Array()
    for(var col = 0; col < this.maxCols; col++)
        aCol.push( this.table[row][col] );
    return aCol;
}
Board.prototype.setCol = function(col, aCol){
    for(var row = 0; row < aCol.length; row++){
        this.table[row][col] = aCol[row];
        // GUI
        $("#"+row+col).html(aCol[row].number);
        $("#"+row+col).attr("data-value", aCol[row].number);        
    }
    $("div [data-value=0]").addClass("invisible");
}
Board.prototype.setRow = function(row, aRow){
    for(var col = 0; col < aRow.length; col++)
        this.table[row][col] = aRow[col];
}
Board.prototype.posEquals = function(pos1, pos2){
    return ( this.table[pos1.x][pos1.y].number == this.table[pos2.x][pos2.y].number )   
}
Board.prototype.getEquals = function(pos){
    var adjacentsEquals = [pos];
    var pos2;
    // up
    if(pos.y > 0){
        pos2 = {x: pos.x, y: pos.y-1}
        if (this.posEquals(pos, pos2)){
            adjacentsEquals.push(pos2)
        }
    }
    // down
    if(pos.y < this.maxCols-1){
        pos2 = {x: pos.x, y: pos.y+1}
        if (this.posEquals(pos, pos2)){
            adjacentsEquals.push(pos2)
        }
    }
    // left
    if(pos.x > 0){
        pos2 = {x: pos.x-1, y: pos.y}
        if (this.posEquals(pos, pos2)){
            adjacentsEquals.push(pos2)
        }
    }
    // right
    if(pos.x < this.maxRows-1){
        pos2 = {x: pos.x+1, y: pos.y}
        if (this.posEquals(pos, pos2)){
            adjacentsEquals.push(pos2)
        }
    }
    return adjacentsEquals;
}
Board.prototype.getAdjacents = function(psSet, len){
    var new_len = psSet.size(); 
    if ((psSet.size() == len)){
        return psSet.getAll();
    }
    var psList = psSet.getAll();
    for (var i=0; i < psList.length; i++){
        var adjacentsEquals = this.getEquals(psList[i]);
        for (var j=0; j < adjacentsEquals.length; j++)
            psSet.add(adjacentsEquals[j]);
        }
    return this.getAdjacents(psSet, new_len);
}
Board.prototype.draw_text = function(){
    var res = "";
    for(var row = 0; row < this.table.length; row++) {
        for(var col = 0; col < this.table[row].length; col++) {
            res += this.table[row][col].number + " ";
        }
        res += "\n";
    }
    console.log(res + "\n");
}
Board.prototype.draw = function(){
    var board = this;
    this.draw_text();
    $("#sortable").empty();
    for(var row = 0; row < this.table.length; row++) {
        for(var col = 0; col < this.table[row].length; col++) {
            var number=this.table[row][col].number;
            $("#sortable").append('<div id="'+row+col+'" data-value="'+number+'" class="draggable ui-state-default">'+number+'</div>');
        }
    }
    $("div [data-value=0]").addClass("invisible");
    $("#sortable div.invisible").click( function () { 
        var col = $(this).attr("id")[1];        
        if(!board.isFullCol(col)){
            board.addBall({x:0, y:col}, ball_stack.getBall());
            board.draw();
            board.update();
        }
    });
    $( ".draggable" )
        .draggable({ 
            zIndex: 100,
            revert: "invalid"
        })
        .droppable({
            hoverClass: "ui-state-active",
            accept: function(drag) {
                var pos_drag = $(drag).attr("id");
                var pos_drop = $(this).attr("id");
                pos_drag = {x:pos_drag[0], y:pos_drag[1]};
                pos_drop = {x:pos_drop[0], y:pos_drop[1]};
                return board.isFusionable(pos_drag, pos_drop);
            },
            drop: function( event, ui ) {
                var pos_drag = $(ui.draggable).attr("id");
                var pos_drop = $(this).attr("id");
                pos_drag = {x:pos_drag[0], y:pos_drag[1]};
                pos_drop = {x:pos_drop[0], y:pos_drop[1]};
                board.fusion(pos_drag, pos_drop);
                $(ui.draggable).addClass("invisible");
                //$(this).effect("bounce", { times:3 }, 400);
                board.update();                
            }
        });
    $( ".draggable" ).disableSelection();
}


var Set = function() {}
Set.prototype.add = function(o) { this[o.x+""+o.y] = true; }
Set.prototype.remove = function(o) { delete this[o]; }
Set.prototype.getAll = function(){
    var keys = [];
    for(var key in this){
        if ( !isNaN(key) )
            keys.push({x:Number(key[0]), y:Number(key[1])});
    }
    return keys;        
}
Set.prototype.size = function(){
    var size = 0;
    for(var key in this)
        if ( Number(key) )
            size++;
    return size;        
}


function Game(){
    var moves = 0;
    var LINE_MOVES = 5;
    var COLS = 5;
    var ROWS = 5;//8;
    var game_over = false;
    ball_stack = new BallStack();
    board = new Board(COLS, ROWS);
    board.initialize(true);
    board.minimize();
    board.compact();
    board.draw();
    console.log(ball_stack);
    ball_stack.draw();
    
    $("#next").click(function(){
        console.log( ball_stack.getBall() ); 
    });
    
    $("#add_line").click(function(){
        board.addLine();
        board.draw();
        board.update();
    });
    $("#compact").click(function(){
        board.compact();
        board.draw();
    });
    $("#update").click(function(){
        board.minimize();
        setTimeout( function(){
            $("#compact").click();
        }, 250);
    });
    
    
    /*
    while (!game_over){
        if (board.isEmptyRow( 0 )){
            console.log("-----> ADD LINE");
            board.addLine();
            board.draw();
        }else{
            game_over = true;
            continue;
        }
    }*/
    
    
    /*while(!game_over){
        if (board.isFullRow(0)){
            game_over = true;
            continue;
        }
        console.log("MOVE: "+moves);
        var new_ball = ball_stack.getBall();
        console.log(new_ball);
        console.log(ball_stack);
        board.draw();
                             
        var validPos = false;
        while(!validPos){
            var pos = {x:0, y:Math.floor((Math.random() * board.maxCols))};
            validPos = board.isValidPos(pos);
        }
        board.addBall(pos, new_ball);
        board.draw();
        
        if (moves % LINE_MOVES == 0){
            if (board.isEmptyRow( 0 )){
                console.log("-----> ADD LINE");
                board.addLine();
                board.draw();
            }else{
                game_over = true;
                continue;
            }
        }
        if (board.minimize()){
            board.compact();
            console.log("****************** UPDATE");
            board.draw();
        }
        moves++;
    }
    console.log("FINAL:");
    board.draw();
    */
}






/*****************
 * START THE GAME
 *****************/
var level = 5;
var board;
var ball_stack;
$(function() {
    
    var game = new Game();
       
});
