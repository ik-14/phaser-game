import Phaser from "phaser";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1900,
  height: 800,
  render: {
    pixelArt: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 700 },
      debug: true,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
});

//variables im going to change later
let player;
let enemies;
let keys;
let gameover = false;
let gameoverText;
let timerText;
let instructionText;
let keysText;

//load up all the assets needed
function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("tiles", "assets/Tiles.png");
  this.load.tilemapTiledJSON("map", "assets/level1.json");
  this.load.spritesheet("run", "assets/runsheet.png", {
    frameWidth: 80,
    frameHeight: 75,
  });
  this.load.spritesheet("idle", "assets/idlesheet.png", {
    frameWidth: 64,
    frameHeight: 70,
  });
  this.load.spritesheet("jump", "assets/jump.png", {
    frameWidth: 64,
    frameHeight: 62,
  });
  this.load.spritesheet("attack", "assets/attacksheet.png", {
    frameWidth: 96,
    frameHeight: 75,
  });
  this.load.image("enemy", "assets/lizard.png");
}

//create all my assets
function create() {
  const background = this.add
    .image(0, 0, "background")
    .setOrigin(0, 0)
    .setScale(4, 2.9);
  const mymap = this.make.tilemap({ key: "map" });
  const tileset = mymap.addTilesetImage("mytileset", "tiles");
  const ground = mymap.createLayer("ground", tileset, 0, 550);
  const platforms = mymap.createLayer("Platforms", tileset, 0, 555);

  //create my enemies in a group
  enemies = this.physics.add.group({
    repeat: 10,
    setXY: { stepX: 200 },
    key: "enemy",
    immovable: true,
    CollideWorldBounds: true,
  });

  //add collision
  player = this.physics.add.sprite(300, 300, "idle");
  player.setBounce(0.1).setScale(0.8);
  player.setCollideWorldBounds(true);

  ground.setCollisionByExclusion(-1);
  platforms.setCollisionByExclusion(-1);
  this.physics.add.collider(ground, [enemies, player]);
  this.physics.add.collider(platforms, [enemies, player]);

  //add key input
  keys = this.input.keyboard.addKeys("LEFT,RIGHT,SPACE,X");

  //create all my animations
  this.anims.create({
    key: "left",
    frameRate: 15,
    repeat: -1,
    frames: this.anims.generateFrameNumbers("run", { end: 7 }),
  });
  this.anims.create({
    key: "right",
    frameRate: 15,
    repeat: -1,
    frames: this.anims.generateFrameNumbers("run", { end: 7 }),
  });
  this.anims.create({
    key: "idle",
    frameRate: 7,
    repeat: -1,
    frames: this.anims.generateFrameNumbers("idle", { end: 3 }),
  });
  this.anims.create({
    key: "jump",
    frameRate: 12,
    repeat: -1,
    frames: this.anims.generateFrameNumbers("jump", { end: 14 }),
  });
  this.anims.create({
    key: "attack",
    frameRate: 26,
    repeat: -1,
    frames: this.anims.generateFrameNumbers("attack", { end: 7 }),
  });

  //add an overlpap to enemies - allows me to kill enenmy
  this.physics.add.overlap(player, enemies, killenemy, null);

  //add camera zoom and follow
  this.cameras.main.setBounds(0, 0, 1900, 900).setZoom(1.2);
  this.cameras.main.startFollow(player);

  //add timer text and game over text
  timerText = this.add.text(800, 300).setScale(3);
  gameoverText = this.add.text(800, 400, "game over").setScale(5);
  gameoverText.visible = false;
  instructionText = this.add.text(100,300, 'how to play: kill all enemies quickly').setScale(1.5)
  keysText = this.add.text(100,350, 'Keys: left arrow, right arrow, X key, spacebar').setScale(1.5)
}

//timer function
let n = 0;
setInterval(function () {
  ++n;
  return n;
}, 1000);

function killenemy(player, enemy) {
  //kills enemy
  console.log(player.texture.key)
  if (player.texture.key == "attack") {
    enemy.disableBody(true,true);
  }
  //sets game over once all enemies killed
  if (enemies.countActive(true) === 1) {
    gameover = true;
    gameoverText.visible = true;
    alert(`time: ${n} seconds`)
  }
}

function update() {
  //displays gameover
  if (gameover) {
    timerText.setText("");
  } else {
    timerText.setText(`time: ${n}`);
  }

  //updates player movement corresponding to which key they press
  if (keys.LEFT.isDown) {
    player.flipX = true;
    player.setVelocityX(-290);

    if (player.body.onFloor()) {
      player.anims.play("left", true);
    }
  } else if (keys.RIGHT.isDown) {
    player.flipX = false;
    player.setVelocityX(290);

    if (player.body.onFloor()) {
      player.anims.play("right", true);
    }
  } else if (keys.X.isDown) {
    player.anims.play("attack", true);
  } else {
    player.setVelocityX(0);
    if (player.body.onFloor()) {
      player.anims.play("idle", true);
    }

    if (keys.SPACE.isDown && player.body.onFloor()) {
      player.setVelocityY(-350);
      player.anims.play("jump", true);
    }
  }
}
