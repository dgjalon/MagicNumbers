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
    var STACK_BALLS = 3;
    this.stack = new Array();
    for(i=0; i < STACK_BALLS; i++)
        this.stack.push( new Ball() );
}
BallStack.prototype.getBall = function(){
    this.stack.push( new Ball() );
    return this.stack.shift();
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
    for (var col=0;col<this.maxCols-1;col++){
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
        //console.log(row+", "+col);
        result = this.isEmptyPos({x:row, y:col});
        if (!result)
            break;
    }
    return result;
}
Board.prototype.update = function(){
    // Convert to zeros
    for(var row=this.maxRows-1; row>0; row--){
        for(var col=this.maxCols-1; col>0; col--){
            this.simplify(this.table[row][col].number, {x:row, y:col});
        }
    }
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
    if ((value != 0)&&(value != 1)){
        var s = new Set();
        s.add(pos);
        var allAdjacents = this.getAdjacents(s, 0);
        if (value <= allAdjacents.length){
            for(var i=0;i<allAdjacents.length;i++){                
                this.table[allAdjacents[i].x][allAdjacents[i].y] = new Ball(0);
            }
        }
    }
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
    for(var row = 0; row < aCol.length; row++)
        this.table[row][col] = aCol[row];
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
    //console.log("LENGTH: "+len);console.log("NEW_LENGTH: "+new_len);console.log("\n");
    //console.log("PSET:");
    //console.log(psSet.getAll());console.log("\n"); 
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
Board.prototype.draw = function(){
    var res = "";
    for(var row = 0; row < this.table.length; row++) {
        for(var col = 0; col < this.table[row].length; col++) {
            res += this.table[row][col].number + " ";
        }
        res += "\n";
    }
    console.log(res + "\n");
}


var Set = function() {}
Set.prototype.add = function(o) { this[o.x+""+o.y] = true; }
Set.prototype.remove = function(o) { delete this[o]; }
Set.prototype.getAll = function(){
    var keys = [];
    for(var key in this){
        if ( Number(key) )
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
    var game_over = false;
    var ball_stack = new BallStack();
    var board = new Board(5, 8);
    board.initialize(true);
    board.update();
    board.draw();
    
    while(!game_over){
        console.log("MOVE: "+moves);
        var new_ball = ball_stack.getBall();
        console.log(new_ball);
        console.log(ball_stack);
        board.draw();
        
        var validPos = false;
        while(!validPos){
            validPos = board.isValidPos({x:0, y:Math.floor((Math.random() * board.maxCols))});
        }
        board.addBall(validPos, new_ball);
        
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
        board.update();                
        moves++;
    }
}






/*****************
 * START THE GAME
 *****************/
var level = 5;
var game = new Game();