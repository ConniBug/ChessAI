let socket
let color = '#000'
let strokeWidth = 4
let cv

let ctx

let center

SIZE = 50

function setup() {
	// Creating canvas
	cv = createCanvas(windowWidth / 2, windowHeight / 2)
	centerCanvas()
	cv.background(255, 255, 255)

	drawChessboard();

	// Start the socket connection
	socket = io.connect('http://localhost:3000')

	// Callback function
	socket.on('mouse', data => {
		stroke(data.color)
		strokeWeight(data.strokeWidth)
		line(data.x, data.y, data.px, data.py)
	})
}


function drawChessPiece(piece, i, j) {
	var img = new Image();
	img.onload = function() {
	  ctx.drawImage(img, center[0] + j * SIZE - ((8*SIZE) / 2), center[1] + i * SIZE - ((8*SIZE) / 2), SIZE, SIZE);
	};
	img.src = `/images/${piece}.png`;
}

board = 
[
	["BRo", "BKn", "BBi", "BQn" ,"BKi", "BBi", "BKn", "BRo"],
	["BPa", "BPa", "BPa", "BPa", "BPa", "BPa", "BPa", "BPa"],
	["  ", "  ", "  ", "  ", "  ", "  ", "  ", "  "],
	["  ", "  ", "  ", "  ", "  ", "  ", "  ", "  "],
	["  ", "  ", "  ", "  ", "  ", "  ", "  ", "  "],
	["  ", "  ", "  ", "  ", "  ", "  ", "  ", "  "],
	["WPa", "WPa", "WPa", "WPa", "WPa", "WPa", "WPa", "WPa"],
	["WRo", "WKn", "WBi", "WQn" ,"WKi", "WBi", "WKn", "WRo"]
]
turn = "WHITE"

function drawChessboard() {
	let canvas = document.getElementById("defaultCanvas0");
	ctx = canvas.getContext("2d");

	index = 0
	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {
			++index
			console.log("Drawing",board[i][j])

			ctx.beginPath();
			ctx.fillStyle = ["#eeeed2", "#630"][(i + j) % 2];
			ctx.fillRect(center[0] + j * SIZE - ((8*SIZE) / 2), center[1] + i * SIZE - ((8*SIZE) / 2), SIZE, SIZE);
			ctx.closePath();

			drawChessPiece(board[i][j], i, j);

		}
	}
}

function windowResized() {
	centerCanvas()
	cv.resizeCanvas(windowWidth / 2, windowHeight / 2, false)
}

function centerCanvas() {
	const x = (windowWidth - width) / 2
	const y = (windowHeight - height) / 2
	cv.position(x, y)
	center = [x, y]
}


function mouseDragged() {
	// Draw
	stroke(color)
	strokeWeight(strokeWidth)
	line(mouseX, mouseY, pmouseX, pmouseY)

	// Send the mouse coordinates
	sendmouse(mouseX, mouseY, pmouseX, pmouseY)
}

// Sending data to the socket
function sendmouse(x, y, pX, pY) {
	const data = {
		x: x,
		y: y,
		px: pX,
		py: pY,
		color: color,
		strokeWidth: strokeWidth,
	}

	socket.emit('mouse', data)
}