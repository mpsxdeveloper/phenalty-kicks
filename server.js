const express = require('express')
const router = express.Router()
const path = require('path')
const http = require('http')
const socketIO = require('socket.io')
const cors = require('cors')
const port = 3000

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

server.listen(3000, () => {
    console.log('Server running on: http://localhost:3000')
})

app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'html');

router.get('/', (req, res) => {
    res.send('index')
})

router.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', 'game.html'))
})

app.use(router)

let gameStatus = {
    online : 0,
    playing: false,
    turn: 'goalkeeper1',
    players: ['goalkeeper1', 'goalkeeper2'],
    kickDirection: null,
    saveDirection: null,
    penaltyAttempts: [0, 0],
    successfulPenalties: [0, 0],
    penaltyRound : 0
}

io.on('connection', client => {
    client.on('join', () => {
        if(gameStatus.online == 0) {
            gameStatus.online++
            client.emit('game-setup', gameStatus, 'Player 1')
        }
        else if(gameStatus.online == 1) {
            gameStatus.online++
            gameStatus.playing = true
            io.emit('game-setup', gameStatus, 'Player 2')
        }        
    })
    client.on('loadbar-finished', (player, kickDirection, defender) => {               
        if(gameStatus.turn == player) {
            gameStatus.saveDirection = kickDirection            
        }
        else {
            gameStatus.kickDirection = kickDirection
        }
        if(gameStatus.saveDirection != null && gameStatus.kickDirection != null) {
            gameStatus.penaltyRound = 0
            io.emit('game-penalty', gameStatus)
        }
    })
    client.on('check-winner', (player, penaltyAttempts, successfulPenalties) => {
        if(player == 'goalkeeper1') {
            gameStatus.penaltyAttempts[0] = penaltyAttempts
            gameStatus.successfulPenalties[0] = successfulPenalties
            gameStatus.penaltyRound++
        }
        else if(player == 'goalkeeper2') {
            gameStatus.penaltyAttempts[1] = penaltyAttempts
            gameStatus.successfulPenalties[1] = successfulPenalties
            gameStatus.penaltyRound++
        }
        if(gameStatus.saveDirection != null && gameStatus.kickDirection != null && gameStatus.penaltyRound == 2) {            
            if(gameStatus.penaltyAttempts[0] < 3 && gameStatus.penaltyAttempts[1] < 3) {
                if(gameStatus.turn == 'goalkeeper1') {
                    gameStatus.turn = 'goalkeeper2'
                }
                else {
                    gameStatus.turn = 'goalkeeper1'
                }
                io.emit('game-proceed', gameStatus)
            }            
        }
    })        
})