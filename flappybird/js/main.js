
var loadScene = {
    key:'loadScene',
    active:true,
    preload: loadPreload,
    create: loadCreate,
}
var gameStartScene = {
    key:'gameStartScene',
    create: gameCreate,
    update: update
}
var gameOverScene = {
    key:'gameOverScene',
    create:overCreate
}

var config = {
    type: Phaser.AUTO,
    width: 288,
    height: 505,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false,
        }
    },
    scene: [loadScene,gameStartScene,gameOverScene],
};
var platforms,play,ground,ground2,bg,scoreText = null
var OVER = false
var groundSpeed = 0
var bgSpeed = 0
var score = 0
var platformsSpeed = -200
var pipesW = 54
var pipesX = config.width
var rd,topY,bottomY;
var game = new Phaser.Game(config);

function loadFn(){
    var width = this.cameras.main.width;
    var height = this.cameras.main.height;
    var loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Loading...',
        style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    var percentText = this.make.text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
    });
    percentText.setOrigin(0.5, 0.5);
       
    this.load.on('progress', function (value) {
        percentText.setText(parseInt(value * 100) + '%');
    });

    this.load.on('complete', function () {
        loadingText.destroy();
        percentText.destroy();
    }); 
}

function loadPreload() {
    this.load.image('title','assets/title.png')
    this.load.image('start-button','assets/start-button.png')
    this.load.image('instructions','assets/instructions.png')
    this.load.image('background','assets/background.png')
    this.load.image('ground','assets/ground.png')
    this.load.image('gameover','assets/gameover.png')
    this.load.audio('score','assets/score.wav')
    this.load.audio('ground-hit','assets/ground-hit.wav')
    this.load.audio('pipe-hit','assets/pipe-hit.wav')
    this.load.spritesheet('pipes','assets/pipes.png',{frameWidth:pipesW,frameHeight:320})
    this.load.spritesheet('bird','assets/bird.png',{frameWidth:34,frameHeight:24})
    loadFn.call(this)    
}

function loadCreate(){   
    bg = this.add.tileSprite(config.width/2, config.height/2, config.width, config.height, 'background')
    var title =  this.add.image(config.width/2,100,'title')
    var instructions =  this.add.image(config.width/2,config.height/2,'instructions')
    var startButton = this.add.image(config.width/2,config.height-100,'start-button').setInteractive()
    this.anims.create({
        key:'fly',
        frames:this.anims.generateFrameNumbers('bird',{start : 0,end : 2}),
        frameRate:10,
        repeat:-1,
    })
    
    startButton.on('pointerdown', function (pointer) {
        title.destroy()
        startButton.destroy()
        instructions.destroy()   
        game.scene.start('gameStartScene');
    });
}

function createPipes(){
     rd = Phaser.Math.Between(100,135)
     topY = Phaser.Math.Between(-40,20)
     bottomY = Phaser.Math.Between(380,440)
     pipesX+=rd 

    platforms.create(pipesX,topY,"pipes")

    platforms.create(pipesX,bottomY,"pipes",1) 

    platforms.children.iterate(function(child){
        child.body.allowGravity = false;
    })
    if(platforms.children.size<4){
        createPipes()
    }
}

function updatePipes(that){
    platforms.children.iterate(function(child){
        if(child.body.x< -pipesW){
            topY = Phaser.Math.Between(-60,0)
            bottomY = Phaser.Math.Between(400,460)
            if(child.body.y<20){
                score++
                scoreText.setText(score)
                that.sound.play('score')
                child.body.reset(config.width,topY)
            }else{
                child.body.reset(config.width,bottomY)
            }          
        }
    })
}

function gameCreate() { 
    var that = this
    platforms = this.physics.add.group()
    // platforms.enableBody = true;
    createPipes()
    ground = this.add.tileSprite(config.width-335/2, config.height-112/2,335,112, 'ground')
    ground = this.physics.add.existing(ground, 'staticSprite')
    scoreText = this.add.text(10,10,score)
    scoreText.setFontSize(36);
    player = this.physics.add.sprite(100,100,'bird')
    this.input.on('pointerdown', function(pointer, currentlyOver){
        if(OVER) return;
        that.tweens.add({
            targets: player,
            duration:50,
            angle:-30,
        })
        player.setVelocityY(-200)     
    });   
    player.anims.play('fly')
}
function overCreate() {
    var title = this.add.image(config.width/2,100,'gameover')
    var startButton = this.add.image(config.width/2,config.height-100,'start-button').setInteractive()
    var that = this
    startButton.on('pointerdown', function (pointer) {
        OVER = false
        title.destroy()
        startButton.destroy()    
        // platforms.clear(true)
        // player.destroy()
        // ground.destroy()
        // scoreText.destroy()
        // game.scene.start('gameStartScene');    
        restart()
    });
}
function restart(){
    rd = Phaser.Math.Between(100,135)
    pipesX+=rd 
    platforms.children.entries[0].body.reset(pipesX,Phaser.Math.Between(-40,30))
    platforms.children.entries[1].body.reset(pipesX,Phaser.Math.Between(390,440))
    platforms.children.entries[2].body.reset(pipesX+rd,Phaser.Math.Between(-40,30))
    platforms.children.entries[3].body.reset(pipesX+rd,Phaser.Math.Between(390,440))
    player.x = 100
    player.y = 100
    player.angle = 0
    player.anims.play('fly')
    scoreText.setText(score)
    game.scene.resume('gameStartScene');      
}
function gameOver(that){
    OVER = true
    score = 0
    bgSpeed = 0
    groundSpeed = 0
    pipesX = config.width
    player.anims.stop('fly')
    platforms.setVelocityX(0) 
    game.scene.start('gameOverScene');
}

function update() {
    var that = this

    if(!OVER){
        bgSpeed+=0.5
        groundSpeed+=5
        bg.tilePositionX =  bgSpeed
        ground.tilePositionX =  groundSpeed
        updatePipes(this)
        platforms.setVelocityX(platformsSpeed) 

    if(player.angle < 90) player.angle += 2.5;
        this.physics.resume()
    }else{
        this.physics.pause()
    }

    this.physics.add.overlap(player,platforms,function(){
        if(OVER) return;
        that.sound.play('pipe-hit')
        gameOver()
    })
    this.physics.add.collider(player,ground,function(){
        if(OVER) return;
        that.sound.play('ground-hit')
        gameOver()
    })
}