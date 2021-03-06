var config={
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade'
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	}
};
var bricks;
var paddle;
var ball;

var game = new Phaser.Game(config);
function preload(){
	this.load.atlas('assets', 'assets/breakout.png', 'assets/breakout.json');
}

function create(){
	this.physics.world.setBoundsCollision(true, true, true, false);
    bricks = this.physics.add.staticGroup({
            key: 'assets', frame: [ 'blue1', 'red1', 'green1', 'yellow1', 'silver1', 'purple1' ],
            frameQuantity: 10,
            gridAlign: { width: 10, height: 6, cellWidth: 64, cellHeight: 32, x: 112, y: 100 }
        });
    ball = this.physics.add.image(400, 500, 'assets', 'ball1').setCollideWorldBounds(true).setBounce(1);
    ball.setData('onPaddle', true);

    paddle = this.physics.add.image(400, 550, 'assets', 'paddle1').setImmovable();


        this.physics.add.collider(ball, bricks, hitBrick, null, this);
        this.physics.add.collider(ball, paddle, hitPaddle, null, this);


        this.input.on('pointermove', function (pointer){

            paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

            if (ball.getData('onPaddle'))
            {
                ball.x =paddle.x;
            }

        }, this);

        this.input.on('pointerup', function (pointer) {

            if (ball.getData('onPaddle'))
            {
                ball.setVelocity(-75, -300);
                ball.setData('onPaddle', false);
            }

        }, this);

}
function update()
{
	if (ball.y > 600)
        {
            resetBall();
        }

}
function hitBrick(ball, brick)
{
	brick.disableBody(true, true);
    if (bricks.countActive() === 0)
        {
            resetLevel();
        }

}

function resetBall()
{
        ball.setVelocity(0);
        ball.setPosition(this.paddle.x, 500);
        ball.setData('onPaddle', true);
}

function resetLevel()
{
        resetBall();
        bricks.children.each(function (brick) {
        brick.enableBody(false, 0, 0, true, true);
        });
}


function hitPaddle(ball, paddle)
 {  

        var diff = 0;
        
        if (ball.x < paddle.x)
        {
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        }
        else if (ball.x > paddle.x)
        {
            diff = ball.x -paddle.x;
            ball.setVelocityX(10 * diff);
        }
        else
        {
            ball.setVelocityX(2 + Math.random() * 8);
        }
    }