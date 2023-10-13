document.addEventListener('DOMContentLoaded', function () {
    const socket = io();

    const boardDiv = document.getElementById('board');
    const messageDiv = document.getElementById('message');

    for (let i = 0; i < 9; i++) {
        const square = document.createElement('div');
        square.className = 'square';
        square.dataset.index = i;
        boardDiv.appendChild(square);
    }

    boardDiv.addEventListener('click', function (event) {
        if (event.target.classList.contains('square')) {
            const index = event.target.dataset.index;
            socket.emit('move', { index: index });
        }
    });

    socket.on('board', function (board) {
        const squares = document.querySelectorAll('.square');
        squares.forEach((square, index) => {
            square.textContent = board[index];
        });
    });

    socket.on('message', function (message) {
        messageDiv.textContent = message;
    });
});