class GameScene extends Phaser.Scene {
    
    constructor() {
        super("Phenalty Kicks");
    }
    
    preload() {
        this.load.spritesheet('ball', 'assets/ball_soccer2.png', {frameWidth: 18, frameHeight: 18});
        this.load.image('goal', 'assets/elements.png');
        this.load.image('grass', 'assets/groundGrass.png');
        this.load.image('floor', 'assets/groundGrass.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');
        this.load.spritesheet('goalkeeper1', 'assets/character_robot_sheet.png', {frameWidth: 96, frameHeight: 128});
        this.load.spritesheet('goalkeeper2', 'assets/character_zombie_sheet.png', {frameWidth: 96, frameHeight: 128});
    }
    
    create() {
        map = this.add.tilemap('map');
        var golTiles = map.addTilesetImage('gol_tiles', 'goal');
        var grassTiles = map.addTilesetImage('grass_tiles', 'grass');
        var grassLayer = map.createDynamicLayer('GrassLayer', grassTiles, 0, 0);
        var golLayer = map.createDynamicLayer('GoalLayer', golTiles, 0, 0);
        var floorLayer = map.createDynamicLayer('FloorLayer', grassTiles, 0, 0);    
        floorLayer.setCollisionByProperty({'collides': true});
        this.ball = this.physics.add.sprite((768 / 2), 440, 'ball');
        this.ball.body.allowGravity = false;
        goalkeeper1 = this.physics.add.sprite((768 / 2), 90, 'goalkeeper1');
        goalkeeper2 = this.physics.add.sprite((768 / 2) - 25, 410, 'goalkeeper2');
        goalkeeper1.setFrame(0);
        goalkeeper2.setFrame(9);
        goalkeeper1.setScale(0.7);
        goalkeeper2.setScale(0.7);        
        this.physics.add.collider(goalkeeper1, floorLayer, this.hitFloor);
        this.physics.add.collider(goalkeeper2, floorLayer, this.hitFloor);
        this.physics.add.overlap(this.ball, goalkeeper1, this.defense);
        this.physics.add.overlap(this.ball, goalkeeper2);
        const anims = this.anims;
        anims.create({
            key: "goalkeeper1-jump-save",
            frameRate: 5,
            frames: this.anims.generateFrameNames("goalkeeper1", { start: 7, end: 8 }),
            repeat: 0
        });
        anims.create({
            key: "goalkeeper1-low-save",
            frameRate: 5,
            frames: this.anims.generateFrameNames("goalkeeper1", { frames: [3] }),
            repeat: 0
        });
        anims.create({
            key: "goalkeeper1-left-save",
            frameRate: 5,
            frames: this.anims.generateFrameNames("goalkeeper1", { frames: [17, 14, 19, 10] }),
            repeat: 0
        });
        anims.create({
            key: "goalkeeper2-jump-save",
            frameRate: 5,
            frames: this.anims.generateFrameNames("goalkeeper2", { start: 7, end: 8 }),
            repeat: 0
        });
        anims.create({
            key: "goalkeeper2-low-save",
            frameRate: 5,
            frames: this.anims.generateFrameNames("goalkeeper2", { frames: [3] }),
            repeat: 0
        });
        anims.create({
            key: "goalkeeper2-left-save",
            frameRate: 5,
            frames: this.anims.generateFrameNames("goalkeeper2", { frames: [17, 14, 19, 10] }),
            repeat: 0
        });
        const camera = this.cameras.main;
        text = this.add.text(90, 455, '', { font: '32px Arial' });
        text.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);
        bar = this.add.rectangle(135, 500, 5, 18, 0x9966ff);
        bar.visible = false;
    }    
    
    update() {
        if(clientStatus != null && clientStatus.playing) {            
            cursors = this.input.keyboard.createCursorKeys();
            if(chosenSide == null) {
                if(cursors.down.isDown) {                    
                    chosenSide = 1;                    
                }
                if(cursors.up.isDown) {                    
                    chosenSide = 2;
                }
                if(cursors.right.isDown) {                    
                    chosenSide = 3;                    
                }
                if(cursors.left.isDown) {                    
                    chosenSide = 4;                    
                }                
            }
            if(startPenalty) {
                startPenalty = false;            
                var saveDirectionDirection = clientStatus.saveDirection;                        
                if(!ballMoving) {
                    ballDirection = clientStatus.kickDirection;
                    ballMoving = true;
                }
                if(saveDirectionDirection == 1 && clientStatus.turn == player.texture.key) {
                    player.texture.key == 'goalkeeper1' ? player.anims.play('goalkeeper1-low-save', false) : player.anims.play('goalkeeper2-low-save', false);
                    var timedEvent = this.time.delayedCall(2000, this.onEvent, [], this);
                }
                else if(saveDirectionDirection == 1 && clientStatus.turn == opponent.texture.key) {
                    opponent.texture.key == 'goalkeeper1' ? opponent.anims.play('goalkeeper1-low-save', false) : opponent.anims.play('goalkeeper2-low-save', false); 
                }
                if(saveDirectionDirection == 2 && clientStatus.turn == player.texture.key) {
                    if(!isJumping) {
                        isJumping = true;
                        player.setVelocityY(-150);
                    }
                    player.texture.key == 'goalkeeper1' ? player.anims.play('goalkeeper1-jump-save', false) : player.anims.play('goalkeeper2-jump-save', false);
                    var timedEvent = this.time.delayedCall(2000, this.onEvent, [], this);
                }
                else if(saveDirectionDirection == 2 && clientStatus.turn == opponent.texture.key) {
                    if(!isJumping) {
                        isJumping = true;
                        opponent.setVelocityY(-150);
                    }
                    opponent.texture.key == 'goalkeeper1' ? opponent.anims.play('goalkeeper1-jump-save', false) : opponent.anims.play('goalkeeper2-jump-save', false); 
                }
                if(saveDirectionDirection == 3 && clientStatus.turn == player.texture.key) {
                    if(!wasFlipped) {
                        wasFlipped = true;
                        player.toggleFlipX();
                        player.setVelocityX(50);
                    }
                    player.texture.key == 'goalkeeper1' ? player.anims.play('goalkeeper1-left-save', false) : player.anims.play('goalkeeper2-left-save', false);
                    var timedEvent = this.time.delayedCall(2000, this.onEvent, [], this);
                }
                else if(saveDirectionDirection == 3 && clientStatus.turn == opponent.texture.key) {
                    if(!wasFlipped) {
                        wasFlipped = true;
                        opponent.toggleFlipX();
                        opponent.setVelocityX(50);
                    }
                    opponent.texture.key == 'goalkeeper1' ? opponent.anims.play('goalkeeper1-left-save', false) : opponent.anims.play('goalkeeper2-left-save', false);
                }
                if(saveDirectionDirection == 4 && clientStatus.turn == player.texture.key) {
                    player.setVelocityX(-50);
                    player.texture.key == 'goalkeeper1' ? player.anims.play('goalkeeper1-left-save', false) : player.anims.play('goalkeeper2-left-save', false);
                    var timedEvent = this.time.delayedCall(2000, this.onEvent, [], this);
                }
                else if(saveDirectionDirection == 4 && clientStatus.turn == opponent.texture.key) {
                    opponent.setVelocityX(-50);
                    opponent.texture.key == 'goalkeeper1' ? opponent.anims.play('goalkeeper1-left-save', false) : opponent.anims.play('goalkeeper2-left-save', false);
                }
                if(ballDirection == 1) {
                    var timedEvent = this.time.delayedCall(2500, this.onEvent, [], this); 
                    this.ball.setVelocityY(-150);
                }
                if(ballDirection == 2) {
                    var timedEvent = this.time.delayedCall(2500, this.onEvent, [], this); 
                    this.ball.setVelocityY(-150);                    
                }
                if(ballDirection == 3) {
                    var timedEvent = this.time.delayedCall(2500, this.onEvent, [], this); 
                    this.ball.setVelocityX(50);
                    this.ball.setVelocityY(-150);
                }
                if(ballDirection == 4) {
                    var timedEvent = this.time.delayedCall(2500, this.onEvent, [], this); 
                    this.ball.setVelocityX(-50);
                    this.ball.setVelocityY(-150);
                }
            }
        }
    }

    hitFloor() {
        if(chosenSide == 2 && !isJumping) {            
        }
    }    

    onEvent() {
        opponent.setVelocityX(0);
        if(ballMoving) {            
            player.setVelocityX(0);
            if(clientStatus.saveDirection == 1) {
                if(ballDirection == 1) {                    
                    if(clientStatus.turn == player.texture.key) {
                        player.setFrame(34);
                        opponent.setFrame(31);
                    }
                    else {
                        opponent.setFrame(34);
                        player.setFrame(31);
                    }
                }
                else {
                    this.switchCelebration();
                }
            }
            if(clientStatus.saveDirection == 2) {
                if(ballDirection == 2) {                    
                    if(clientStatus.turn == player.texture.key) {
                        player.setFrame(34);
                        opponent.setFrame(31);
                    }
                    else {
                        opponent.setFrame(34);
                        player.setFrame(31);
                    }
                }
                else {
                    this.switchCelebration();
                }
            }
            if(clientStatus.saveDirection == 3) {
                if(ballDirection == 3) {                    
                    if(clientStatus.turn == player.texture.key) {
                        player.setFrame(34);
                        opponent.setFrame(31);
                    }
                    else {
                        opponent.setFrame(34);
                        player.setFrame(31);
                    }
                }
                else {
                    this.switchCelebration();
                }
            }
            if(clientStatus.saveDirection == 4) {
                if(ballDirection == 4) {                    
                    if(clientStatus.turn == player.texture.key) {
                        player.setFrame(34);
                        opponent.setFrame(31);
                    }
                    else {
                        opponent.setFrame(34);
                        player.setFrame(31);
                    }
                }
                else {
                    this.switchCelebration();
                }        
            }
            this.ball.setVelocityX(0);
            this.ball.setVelocityY(0);
            this.ball.body.setImmovable(true);
            this.ball.body.allowGravity = false;
            this.ball.visible = false;
            if(!scoreDisplayed) {
                scoreDisplayed = true;
                this.painting = this.time.addEvent({
                    delay: 1000, callback: 
                    this.printResult(clientStatus.saveDirection, clientStatus.kickDirection, player.texture.key, (offsetY * penalties)), 
                    callbackScope: this,
                    loop: false
                });
            }
        }

    }

    switchCelebration() {
        if(clientStatus.turn == player.texture.key) {
            player.setFrame(31);
            opponent.setFrame(34);
        }
        else {
            opponent.setFrame(31);
            player.setFrame(34);
        }
    }

    printResult(saveDirection, kickDirection, player, offset) {            
        let x_player1 = 70;
        let x_player2 = 700;            
        if(clientStatus.turn == 'goalkeeper1') {
            if(saveDirection == kickDirection) {
                this.add.image(x_player1, HUD_Y + offset, "ball");
                this.add.image(x_player2, HUD_Y + offset, "ball").setTint(0xff0000);
                scoredPenalties++;
            }
            else {
                this.add.image(x_player1, HUD_Y + offset, "ball").setTint(0xff0000);
                this.add.image(x_player2, HUD_Y + offset, "ball");
            }
        }
        else {
            if(saveDirection == kickDirection) {
                this.add.image(x_player2, HUD_Y + offset, "ball");
                this.add.image(x_player1, HUD_Y + offset, "ball").setTint(0xff0000);
                scoredPenalties++;
            }
            else {
                this.add.image(x_player2, HUD_Y + offset, "ball").setTint(0xff0000);
                this.add.image(x_player1, HUD_Y + offset, "ball");
            }
        }        
        penalties++;
        this.ball.x = (768 / 2);
        this.ball.y = 440;
        this.ball.visible = true;
        ballMoving = false;
        scoreDisplayed = false;
        clientStatus = null;
        chosenSide = null;
        startPenalty = false;
        socket.emit('check-winner', player, penalties, scoredPenalties);
    }
    
}

function handlePenalty(gameStatus) {
    clientStatus = gameStatus;
    if(clientStatus.saveDirection != null && clientStatus.kickDirection != null) {        
        startPenalty = true;        
    }    
}

function handleInit(status) {
    if(status.online === 1) {
        text.setText("Aguardando outro jogador ficar online...");
        player = goalkeeper1;
        opponent = goalkeeper2;
        clientStatus = status;
    }
    else if(status.online === 2) {
        text.setText("Dois jogadores online. A partida vai iniciar...");
        if(player == null) {
            player = goalkeeper2;
            opponent = goalkeeper1;
        }
        clientStatus = status;
        setTimeout(()=> {
            if(clientStatus.turn == player.texture.key) {
                text.setText("Sua vez de defender o pênalti...");
                bar.visible = true;
                loadBar();
            }
            else {
                text.setText("Sua vez de chutar o pênalti...");
                bar.visible = true;
                loadBar();
            }
        }, 2000);
    }
    
}

function loadBar() {
    if(bar.width < 500) {
        setTimeout(()=> {
            bar.width += 5;
            loadBar();
        }, 32);
    }
    else {
        bar.width = 5;
        bar.visible = false;        
        socket.emit('loadbar-finished', player.texture.key, chosenSide, clientStatus.turn);
    }
}

function handleReconfig(gameStatus) {
    clientStatus = gameStatus;  
    ballMoving = false;
    startPenalty = false;
    chosenSide = null;
    wasFlipped = false;
    isJumping = false;
    if(clientStatus.turn == player.texture.key) {
        player.x = (768 / 2);
        player.y = 90;
        opponent.x = (768 / 2) - 25;
        opponent.y = 410;        
        opponent.setFrame(9);
        player.setFrame(0);
    }
    else {
        player.x = (768 / 2) - 25;
        player.y = 410;
        opponent.x = (768 / 2);
        opponent.y = 90;
        player.setFrame(9);
        opponent.setFrame(0);
    }    
    setTimeout(()=> {
        if(clientStatus.turn == player.texture.key) {
            text.setText("Sua vez de defender o pênalti...");
            bar.visible = true;
            loadBar();
        }
        else {
            text.setText("Sua vez de chutar o pênalti...");
            bar.visible = true;
            loadBar();
        }
    }, 2000);
}

var config = {
    type: Phaser.AUTO,
    parent: "game",
    width: 768,
    height: 512,
    backgroundColor: '#F2E7D4',
    scene: [GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 150
            },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
const socket = io();

setTimeout(() => {
    socket.emit('join');
}, 1000);

socket.on('game-setup', handleInit);
socket.on('game-penalty', handlePenalty);
socket.on('game-proceed', handleReconfig);

let map;
let ball;
let clientStatus;
let goalkeeper1, goalkeeper2;
let penalties = 0;
let scoredPenalties = 0;
let HUD_Y = 150;
let scoreDisplayed = false;
let text;
let bar;
let offsetY = 30;
var startPenalty = false;
var player = null;
var opponent = null;
var cursors;
var wasFlipped = false;
var chosenSide = null;
var ballMoving = false;
var ballDirection = 1;
var isJumping = false;
