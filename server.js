const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

app.set('port', 3000);

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, '/public/index.html'));
});

let board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
let players = 0;
let turn = 'X';

io.on('connection', function (socket) {
    
    players++;
    if (players > 2) {
        socket.emit('message', 'Lo siento, la sala está llena.');
        socket.disconnect();
    } else {
        socket.emit('board', board);
        if (players === 1) {
            console.log("user 1 conected")
            socket.emit('message', 'Bienvenido a Ta Te Ti! Eres el jugador 1 (X)');
        } else if (players === 2) {
            console.log("user 2 conected")
            socket.emit('message', 'Bienvenido a Ta Te Ti! Eres el jugador 2 (O)');
            io.sockets.emit('message', '¡El juego ha comenzado! Jugador X comienza.');
        }

        socket.on('move', function (data) {
            if (turn !== socket.player) {
                socket.emit('message', 'Espera tu turno.');
            } else {
                const index = data.index;
                if (board[index] === ' ') {
                    board[index] = turn;
                    io.sockets.emit('board', board);
                    if (checkWin()) {
                        io.sockets.emit('message', `¡Jugador ${turn} ha ganado!`);
                        resetBoard();
                    } else if (board.indexOf(' ') === -1) {
                        io.sockets.emit('message', '¡Es un empate!');
                        resetBoard();
                    } else {
                        turn = turn === 'X' ? 'O' : 'X';
                        io.sockets.emit('message', `Turno del Jugador ${turn}`);
                    }
                } else {
                    socket.emit('message', 'Esa casilla ya está ocupada. Intenta de nuevo.');
                }
            }
        });

        socket.on('reset', function () {
            resetBoard();
            io.sockets.emit('board', board);
            io.sockets.emit('message', 'Tablero reiniciado. Turno del Jugador X');
        });

        socket.on('disconnect', function () {
            console.log("user disconnecterd")
            players--;
            if (players === 1) {
                io.sockets.emit('message', 'El otro jugador se ha desconectado. Reinicia el juego para jugar de nuevo.');
            }
        });

        if (players === 1) {
            socket.player = 'X';
        } else if (players === 2) {
            socket.player = 'O';
        }
    }
});

function checkWin() {
    const winCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let combo of winCombos) {
        if (
            board[combo[0]] !== ' ' &&
            board[combo[0]] === board[combo[1]] &&
            board[combo[1]] === board[combo[2]]
        ) {
            return true;
        }
    }
    return false;
}

function resetBoard() {
    board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
    turn = 'X';
}

server.listen(3000, function () {
    console.log('Starting server on port 3000');
});