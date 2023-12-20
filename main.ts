namespace SpriteKind {
    export const treasure = SpriteKind.create()
    export const hitbox = SpriteKind.create()
    export const enemy_projectile = SpriteKind.create()
    export const port = SpriteKind.create()
    export const minimap = SpriteKind.create()
}
function update_text () {
    treasure_text.setText(convertToText(treasure_onboard))
    treasure_text.right = 160
    treasure_text.bottom = 120
}
function make_projectile (source: Sprite, kind: number) {
    proj = sprites.create(assets.image`cannon ball`, kind)
    proj.setPosition(source.x, source.y)
    proj.lifespan = 1500
    proj.setFlag(SpriteFlag.GhostThroughWalls, true)
    return proj
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (minimap_open) {
        minimap_sprite.setFlag(SpriteFlag.Invisible, true)
        minimap_open = false
    } else {
        minimap_sprite.setFlag(SpriteFlag.Invisible, false)
        minimap_open = true
    }
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.port, function (sprite, otherSprite) {
    info.changeScoreBy(treasure_onboard)
    treasure_onboard = 0
    update_text()
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    rotation = 0
    for (let index = 0; index < 2; index++) {
        proj = make_projectile(ship, SpriteKind.Projectile)
        rotation += 180
        angle = transformSprites.getRotation(ship) + rotation
        angle = spriteutils.degreesToRadians(angle)
        spriteutils.setVelocityAtAngle(proj, angle, 100)
    }
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.enemy_projectile, function (player2, cannon_ball) {
    info.changeLifeBy(-1)
    cannon_ball.destroy()
    pause(1000)
})
function spawn_fort () {
    fort = sprites.create(assets.image`fort`, SpriteKind.Enemy)
    tiles.placeOnTile(fort, tile)
    statusbar = statusbars.create(20, 4, StatusBarKind.EnemyHealth)
    statusbar.attachToSprite(fort)
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.hitbox, function (ship, treasure_hitbox) {
    treasure_onboard = randint(500, 2000)
    update_text()
    sprites.readDataSprite(treasure_hitbox, "treasure").destroy()
    treasure_hitbox.destroy()
})
function make_minimap () {
    minimap_object = minimap.minimap(MinimapScale.Eighth, 2, 15)
    minimap_image = minimap.getImage(minimap_object)
    minimap_sprite = sprites.create(minimap_image, SpriteKind.minimap)
    minimap_sprite.z = 10
    minimap_sprite.setFlag(SpriteFlag.RelativeToCamera, true)
    minimap_sprite.setFlag(SpriteFlag.Invisible, true)
}
function enemy_fire (fort: Sprite) {
    if (randint(1, 100) == 1 && spriteutils.distanceBetween(fort, ship) < 80) {
        proj = make_projectile(fort, SpriteKind.enemy_projectile)
        angle = spriteutils.angleFrom(fort, ship)
        spriteutils.setVelocityAtAngle(proj, angle, 100)
    }
}
sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Projectile, function (fort, cannon_ball) {
    statusbar = statusbars.getStatusBarAttachedTo(StatusBarKind.EnemyHealth, fort)
    statusbar.value += -10
    cannon_ball.destroy()
    if (statusbar.value < 1) {
        tile = fort.tilemapLocation()
        spawn_treasure()
        fort.destroy()
    }
})
function spawn_treasure () {
    treasure_sprite = sprites.create(assets.image`x`, SpriteKind.treasure)
    treasure_hitbox = sprites.create(image.create(47, 47), SpriteKind.hitbox)
    spriteutils.drawCircle(
    treasure_hitbox.image,
    24,
    24,
    20,
    1
    )
    treasure_hitbox.setFlag(SpriteFlag.Invisible, true)
    tiles.placeOnTile(treasure_sprite, tile)
    tiles.placeOnTile(treasure_hitbox, tile)
    sprites.setDataSprite(treasure_hitbox, "treasure", treasure_sprite)
}
sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Enemy, function (enemy, other_enemy) {
    sprites.allOfKind(SpriteKind.Enemy).pop().destroy()
})
function turn_ship () {
    if (controller.left.isPressed()) {
        turn += turn_speed * -1
    } else if (controller.right.isPressed()) {
        turn += turn_speed
    }
    turn = turn * 0.7
    transformSprites.changeRotation(ship, turn * speed / 10)
}
function move () {
    if (controller.up.isPressed()) {
        speed += ship_acceleration
    } else if (controller.down.isPressed()) {
        speed += ship_acceleration * -1
    }
    speed = speed * 0.98
    angle = spriteutils.degreesToRadians(transformSprites.getRotation(ship) - 90)
    spriteutils.setVelocityAtAngle(ship, angle, speed)
}
function make_ports () {
    for (let index = 0; index < 3; index++) {
        port_sprite = sprites.create(img`
            d d d d d d d d d d d d d d d d 
            d 7 7 7 7 7 a a a 7 7 7 7 7 7 d 
            d 7 7 7 7 a a a a a 7 7 7 7 7 d 
            d 7 7 7 a 3 3 3 3 3 a 7 7 7 7 d 
            d 7 7 7 7 3 1 3 1 3 7 7 7 7 7 d 
            d 7 7 7 7 3 3 3 3 3 7 7 7 7 7 d 
            d 7 7 7 7 3 3 e 3 3 7 7 7 7 7 d 
            d 7 7 7 7 7 7 7 7 7 7 7 7 7 7 d 
            d 7 7 7 7 7 7 7 7 7 7 a a a 7 d 
            d 7 7 7 7 7 7 7 7 7 a a a a a d 
            d 7 7 a a a 7 7 7 a 3 3 3 3 3 a 
            d 7 a a a a a 7 7 7 3 1 3 1 3 d 
            d a 3 3 3 3 3 a 7 7 3 3 3 3 3 d 
            d 7 3 1 3 1 3 7 7 7 3 3 e 3 3 d 
            d 7 3 3 3 3 3 7 7 7 7 7 7 7 7 d 
            d d 3 3 e 3 3 d d d d d d d d d 
            `, SpriteKind.port)
        port_hitbox = sprites.create(image.create(47, 47), SpriteKind.port)
        spriteutils.drawCircle(
        port_hitbox.image,
        24,
        24,
        20,
        1
        )
        port_hitbox.setFlag(SpriteFlag.Invisible, true)
        tile = tilesAdvanced.getAllWallTiles()._pickRandom()
        tiles.placeOnTile(port_sprite, tile)
        tiles.placeOnTile(port_hitbox, tile)
        sprites.setDataSprite(port_hitbox, "treasure", port_sprite)
        tiles.setWallAt(tile, false)
    }
}
let port_hitbox: Sprite = null
let port_sprite: Sprite = null
let treasure_hitbox: Sprite = null
let treasure_sprite: Sprite = null
let minimap_image: Image = null
let minimap_object: minimap.Minimap = null
let statusbar: StatusBarSprite = null
let tile: tiles.Location = null
let fort: Sprite = null
let angle = 0
let rotation = 0
let minimap_sprite: Sprite = null
let proj: Sprite = null
let minimap_open = false
let treasure_text: TextSprite = null
let treasure_onboard = 0
let ship: Sprite = null
let turn = 0
let speed = 0
let turn_speed = 0
let ship_acceleration = 0
ship_acceleration = 1.5
turn_speed = 0.2
speed = 0
turn = 0
ship = sprites.create(assets.image`ship`, SpriteKind.Player)
transformSprites.rotateSprite(ship, 90)
tiles.setCurrentTilemap(tilemap`level`)
scene.cameraFollowSprite(ship)
treasure_onboard = 0
treasure_text = textsprite.create("")
treasure_text.z = 10
treasure_text.setFlag(SpriteFlag.RelativeToCamera, true)
update_text()
make_ports()
make_minimap()
minimap_open = false
game.onUpdate(function () {
    turn_ship()
    move()
    for (let enemy of sprites.allOfKind(SpriteKind.Enemy)) {
        enemy_fire(enemy)
    }
})
game.onUpdateInterval(2000, function () {
    if (sprites.allOfKind(SpriteKind.treasure).length < 10) {
        tile = tilesAdvanced.getAllWallTiles()._pickRandom()
        spawn_treasure()
    }
    if (sprites.allOfKind(SpriteKind.Enemy).length < 10) {
        tile = tilesAdvanced.getAllWallTiles()._pickRandom()
        spawn_fort()
    }
})
game.onUpdateInterval(100, function () {
    if (minimap_open) {
        minimap_object = minimap.minimap(MinimapScale.Eighth, 2, 15)
        minimap.includeSprite(minimap_object, ship, MinimapSpriteScale.Double)
        for (let value of sprites.allOfKind(SpriteKind.treasure)) {
            minimap.includeSprite(minimap_object, value, MinimapSpriteScale.Double)
        }
        for (let value of sprites.allOfKind(SpriteKind.Enemy)) {
            minimap.includeSprite(minimap_object, value, MinimapSpriteScale.Double)
        }
        for (let value of sprites.allOfKind(SpriteKind.port)) {
            minimap.includeSprite(minimap_object, value, MinimapSpriteScale.Double)
        }
        minimap_sprite.setImage(minimap.getImage(minimap_object))
    }
})
