const http = require('http')
const { move } = require('./app')
const app = require('./app')

const normalizePort = val => {
	const port = parseInt(val, 10)

	if (isNaN(port)) {
		return val
	}
	if (port >= 0) {
		return port
	}
	return false
}
const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

const errorHandler = error => {
	if (error.syscall !== 'listen') {
		throw error
	}
	const address = server.address()
	const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port
	switch (error.code) {
	case 'EACCES':
		console.error(bind + ' requires elevated privileges.')
		process.exit(1)
		break
	case 'EADDRINUSE':
		console.error(bind + ' is already in use.')
		process.exit(1)
		break
	default:
		throw error
	}
}

const server = http.createServer(app)

server.on('error', errorHandler)
server.on('listening', () => {
	const address = server.address()
	const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port
	console.log('Listening on ' + bind)
})

board = 
[
	["BRo", "BKn", "BBi", "BQn" ,"BKi", "BBi", "BKn", "BRo"],
	["BPa", "BPa", "BPa", "BPa", "BPa", "BPa", "BPa", "BPa"],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["WPa", "WPa", "WPa", "WPa", "WPa", "WPa", "WPa", "WPa"],
	["WRo", "WKn", "WBi", "WQn" ,"WKi", "WBi", "WKn", "WRo"]
]
board = 
[
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["WPa", "WPa", "WPa", "", "", "", "", ""],
]
whosTurn = "W"

// Web sockets
const io = require('socket.io')(server);

io.sockets.on('connection', (socket) => {
	console.log('Client connected: ' + socket.id)

	socket.on('mouse', (data) => socket.broadcast.emit('mouse', data))
	socket.on('disconnect', () => console.log('Client has disconnected'))
})

function calculatePieceValue(piece) {
    switch(piece.type) {
        case("Pa"):
            return 1;
        case("Kn"):
            return 3.5;
        case("Bi"):
            return 3.5;
        case("Ro"):
            return 5.25;
        case("Qn"):
            return 10;
        case("Ki"):
            return 100;
    }
}
function getPiece(board, x, y) {
    return (getPieceDat(board[y][x]));
}
function getPieceDat(piece) {
    return {
        type: piece[1] + piece[2],
        colour: piece[0]
    }
}
function handleMove(board, from, to, diagonal=false, debug=false) {

    // First we have to validate this move.
    self = getPiece(board, from.x, from.y)
    isPawn = self.type == "Pa";
    if(debug) console.log("Checking move from:", self.colour, self.type, from.x + ", " + from.y, "to -", to.x + ", " + to.y)

    if(to.x < 0 || to.x > 7) {
        console.log("Out of X bounds move invalid.", newX);
        spaces = 0;
        return -1;
    }
    if(to.y < 0 || to.y > 7) {
        console.log("Out of Y bounds move invalid.", newY);
        spaces = 0;
        return -1;
    }

    landingOn = getPiece(board, to.x, to.y);
    landedOnSomething = landingOn.colour != undefined;
    if(landedOnSomething) {
        console.log("Landed on", landingOn);
        if(landingOn.colour == self.colour) {
            console.log("Cant land on your own team. canceling move.");
            throw("Invalid move.")
        }
        console.log("Landed on enemy piece.")
        if(isPawn) {
            if (!diagonal) {
                console.log("We are a pawn so we cant take via this method of moving.")
                throw("Invalid move.")
            }
        }
        pieceValue = calculatePieceValue(landingOn);
        console.log("We can take this piece for a score of:", pieceValue);
        return pieceValue;
    }
    if(diagonal) {
        console.log("We are a pawn so we can only go diagonaly if we are killing some dude..")
        throw("Invalid move.")
    }
    if(debug) console.log("Didnt land on anything.")
    return 0;
}

function checkForCheck(board, king) {

}

function checkInLine(board, startX, startY, direction, spaces, isPawn = false, diagonal = false, debug=false) {
    let newX = startX;
    let newY = startY;

    myColour = board[startY][startX][0];
    myType = board[startY][startX][1] + board[startY][startX][2];

    if(debug) {
        console.log("checking for inLine moves", board[newY][newX], "- at:", startX + ", " + startY);
        console.log("       Direction:", direction);
        console.log("       spaces:", spaces);
    }

    let moves = [];

    while (spaces > 0) {
        console.log("=======START MOVE=========")
        newX += direction.x
        newY += direction.y

        try {
            var value = handleMove(board, {x: startX, y: startY}, {x: newX, y: newY}, diagonal = diagonal);
            // TODO: Check if the move allows a check

            if (debug) console.log("Added new move with a value of:", value);
            let newBoard = board;


            newBoard[newY][newX] = myColour + myType;
            newBoard[startY][startX] = "";
            moves.push(
                {
                    moveBoard: newBoard,
                    from: {
                        x: startX,
                        y: startY
                    },
                    to: {
                        x: newX,
                        y: newY
                    },
                    value: value
                });
        } catch (e) {
            if (e == "Invalid move.") {
                if (debug) console.log(e);
                break;
            }
        }
        spaces--;
        if (debug) console.log("=======END MOVE=========");
    }
    if(debug) console.log(moves);
    return moves;
}

function findMovesFor(board, x, y, debug=false) {
    let moves = [];

    var piece = board[y][x];
    var colour = piece[0];
    piece = piece[1] + piece[2]
    if(!colour) {
        return [];
    }
    if(debug) console.log("=================================================================");
    if(debug) console.log("Finding all moves for:",colour, piece);
    switch(piece){
        case("Pa"):
            maxMoves = !((y == 1) || (y == 6)) ? 1 : 2;
            direction = (colour == "B") ? {x: 0, y: 1} : {x: 0, y: -1}; // Get direction
            directionH1 = (colour == "B") ? {x: 1, y: 1} : {x: 1, y: -1}; // Get direction
            directionH2 = (colour == "B") ? {x: -1, y: 1} : {x: -1, y: -1}; // Get direction
            

            checkInLine(board, x, y, direction, maxMoves, true).forEach(e => {
                console.log("=1==> ", e);
                moves.push(e);
            })
            checkInLine(board, x, y, directionH1, 1, isPawn=true, diagonal=true, spaces=1).forEach(e => {
                console.log("===2====> ", e);
                moves.push(e);
            })
            checkInLine(board, x, y, directionH2, 1, isPawn=true, diagonal=true, spaces=1).forEach(e => {
                console.log("====3=======> ", e);
                moves.push(e);
            })

            if(debug) console.log("====END OF CHECKS FOR PIECE=====");
            return moves;
    }
}


depth = 0
function processBoard(board) {
    // Iterate through all pieces on board
    for (var y = 0; y < 8; y++) {
	    for (var x = 0; x < 8; x++) {
            allMoves = []
            piece = getPiece(board, x, y);
            if(piece.colour != undefined) {
                console.log()
                if(piece.colour == whosTurn) {
                    moves = findMovesFor(board, x, y);
                    //console.log("FOUND SHIT FAM:", moves);
                    allMoves.concat(moves);
                }
            }
		}
	}
    //console.log("Moves.", moves);
    if(moves.length == 0) {
        console.log("Stalemate.")
    }
    
    moves.forEach(move => {
        console.log(move.from, move.to, move.value);
    });

    var fs = require("fs");
    fs.writeFileSync("./dat.json", JSON.stringify(moves, null, 4));
}

processBoard(board);

server.listen(port)