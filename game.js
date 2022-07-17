var stars = null;
var score = 0;
var coinSound = null;
var fallSound = null;
var explosionSound = null;
var bombs = null;
var scoreText = null;
var gameOverText = null;
var gameStarted = false;
var cursors = null;
var base = null;
var player = null; 

var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        arent: 'Jump2k21',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    audio: {
        disableWebAudio: false
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

function preload() {
    this.load.audio("coinwav", "assets/collect.ogg");
    this.load.audio("fall", "assets/bong_001.ogg");
    this.load.audio("explosion", "assets/open_004.ogg");//select_008
    this.load.audio("destroy", "assets/close_002.ogg");
    this.load.image('sky', 'assets/backgroundCastles.png');
    this.load.image('ground', 'assets/ground_wood.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/meteor.png');
    this.load.image('blank', 'assets/blank.png');
    this.load.spritesheet('player', 'assets/adventurer.png', { frameWidth: 80, frameHeight: 110 });
    this.load.image('wingman1', 'assets/wingMan1.png');
    this.load.image('wingman2', 'assets/wingMan2.png');
    this.load.image('wingman3', 'assets/wingMan3.png');
    this.load.image('wingman4', 'assets/wingMan4.png');
    this.load.image('wingman5', 'assets/wingMan5.png');
    this.load.image('bronze', 'assets/bronze_1.png');
}

function enableTouchScreenControls(g) {

    $("#tdleft").on("pointerup", function () {
        cursors.left.isDown = false;
        gameStarted = true;
    })

    $("#tdleft").on("pointerdown", function () {
        cursors.left.isDown = true;
        gameStarted = true;
    })

    $("#tdright").on("pointerup", function () {
        cursors.right.isDown = false;
        gameStarted = true;
    })

    $("#tdright").on("pointerdown", function () {
        cursors.right.isDown = true;
        gameStarted = true;
    })

    $("#tdup,#tdup1").on("pointerup", function () {
        cursors.up.isDown = false;
        gameStarted = true;
    })

    $("#tdup,#tdup1").on("pointerdown", function () {
        cursors.up.isDown = true;
        gameStarted = true;
    })

    g.input.keyboard.on('keydown', () => { gameStarted = true; scoreText.setText('Score: ' + score); });
}


function handleCollisions(g) {

    g.physics.add.collider(player, platforms, (player, ground) => {
        if (Math.abs(player.body.velocity.y) > 60) {
            fallSound.play();
        }
    });

    g.physics.add.collider(base, bombs, (bs, bm) => {
        bm.destroy(true);
    });

    g.physics.add.collider(player, bombs, (p, bm) => {
        if (p.visible) {
            explosionSound.play()
        }
        p.visible = false;
        gameOverText.visible = true;
        scoreText.setText('Score: ' + score + " . Please press F5 to play again !");
        bm.destroy(true)
    });

    g.physics.add.collider(player, enemies, (p, en) => {

        if (p.body.velocity.y < 50) {
            if (p.visible) {
                explosionSound.play()
            }
            p.visible = false;
            gameOverText.visible = true;
        } else {
            score = score + 20;
            scoreText.setText('Score: ' + score);
            destroySound.play()
        }

        en.destroy(true)

    });


    g.physics.add.collider(enemies, fence, (en, fe) => {
        let a = en.flipX

        if (a) {
            en.setVelocityX(Math.random() * 10 + 10)
        } else {
            en.setVelocityX(-1 * (Math.random() * 10 + 10))
        }

        en.flipX = !a;

    });

    g.physics.add.overlap(player, stars, (pl, str) => {
        if (pl.visible) {            
            coinSound.play()
            str.disableBody(true, true);
            str.destroy(true)
            score = score + 10;
        }
    }, null, g);


}


function create() {

    let background = this.add.image(400, 300, 'sky');
    background.setInteractive();
    enableTouchScreenControls(this)

    platforms = this.physics.add.staticGroup();
    stars = this.physics.add.staticGroup();
    fence = this.physics.add.staticGroup();
    bombs = this.physics.add.group({ allowGravity: false });
    enemies = this.physics.add.group({ allowGravity: false })

    this.anims.create({
        key: 'wingman',
        frames: [
            { key: 'wingman1' }, { key: 'wingman2' }, { key: 'wingman3' },
            { key: 'wingman4' }, { key: 'wingman5' }
        ],
        frameRate: 10,
        repeat: -1
    });


    for (var i = 1; i < 8; i++) {
        platforms.create(i * 90, i * 70, 'ground').setScale(0.5, 0.16).refreshBody();
        fence.create(i * 90 - 90, i * 70 - 20, 'blank').setScale(0.5, 1).refreshBody();
        fence.create(i * 90 + 60, i * 70 - 20, 'blank').setScale(0.5, 1).refreshBody();

        let enemy = enemies.create(i * 90 - 70, i * 70 - 25, 'enemy')
        enemy.setScale(0.23)
        enemy.anims.play('wingman', true);
        enemy.setVelocityX(10 + Math.random() * 10);
        enemy.flipX = false;
        for (var t = 0; t < 2; t++) {
            let star = stars.create((i * 90) + t * 40, (i * 70) - 20, 'bronze')
            star.setScale(0.23).refreshBody()
        }
    }

    if (gameStarted == true) {
        for (var i = 1; i < 8; i++) {
            let b = bombs.create(Math.random() * 800, 10, 'bomb').setScale(0.5)
            b.setVelocityY(Math.random() * 40 + 40)
        }
    }

    base = platforms.create(400, 600, 'ground').setScale(4, 0.5).refreshBody();
    player = this.physics.add.sprite(100, 450, 'player');
    player.setScale(0.48)
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);

    coinSound = this.sound.add('coinwav');
    fallSound = this.sound.add('fall');
    explosionSound = this.sound.add('explosion')
    destroySound = this.sound.add('destroy')

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { frames: [9, 10, 9] }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { frames: [9, 10, 9] }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'still',
        frames: this.anims.generateFrameNumbers('player', { frames: [0] }),
        frameRate: 1,
        repeat: -1
    });

    handleCollisions(this)

    cursors = this.input.keyboard.createCursorKeys();
    scoreText = this.add.text(10, 10, 'score: 0 . Press any key to start !', { fontSize: '10px', fill: 'brown', fontFamily: 'font1' });
    gameOverText = this.add.text(100, 250, 'GAME OVER !', { fontSize: '60px', fill: 'brown', fontFamily: 'font1' });
    gameOverText.visible = false;

}


function update() {

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        player.flipX = true;
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        player.flipX = false;
    }
    else {
        player.setVelocityX(0);
        player.anims.play('still', true);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    if (bombs.children.entries.length < 12 && gameStarted == true) {
        for (var i = 1; i < 8 - bombs.children.entries.length; i++) {
            let b = bombs.create(Math.random() * 800, 10, 'bomb').setScale(0.5)
            b.setVelocityY(Math.random() * 40 + 40)
        }
    }

    if (stars.children.entries.length == 0 && gameStarted == true) {
        gameOverText.setText("You Won !!")
        gameOverText.visible = true;
        scoreText.setText('Score: ' + score + " . Please press F5 or ↻ to play again !");
    }
}

 document.addEventListener("DOMContentLoaded", (event) => {
    var game = new Phaser.Game(config);
    game.resize(window.innerWidth, window.innerHeight);

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/serviceworker.js')
            .then(function (registration) {
                console.log('Registration successful, scope is:', registration.scope);
            })
            .catch(function (error) {
                console.log('Service worker registration failed, error:', error);
            });
    }

});
