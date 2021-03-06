//Import Kaboom.
kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    debug: true,
    clearColor: [0, 0, 0, 1],
  })


// Speed identifiers
const MOVE_SPEED = 120
const JUMP_FORCE = 360
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE
const FALL_DEATH = 400
const ENEMY_SPEED = 30

// Game logic

let isJumping = true

// Loading root url with extensions for game images
loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', 'nqQ79eI.png')
// blue environment
loadSprite('blue-block', 'fVscIbn.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-evil-shroom', 'SvV4ueD.png')
loadSprite('blue-surprise', 'RMqCc1G.png')

  // this function wraps game logic/settings
  scene('game', ({level, score}) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
        [
            '                                                           ',
            '                                                           ',
            '                                                           ',
            '                                                           ',
            '                                          ==               ',
            '     %   =*=%=                       ==                    ',
            '                                ==                         ',
            '                                                         -+',
            '            ^        ^   ^                               ()',
            '==============================                 ====    ====',
          ],
          [
            '??                                                         ??',
            '??                                                         ??',
            '??                                                         ??',
            '??                                                         ??',
            '??                                          x              ??',
            '??        @@&@@                        x    x              ??',
            '??                                x    x    x              ??',
            '??                           x    x    x    x   x        -+??',
            '??               z   z   x   x    xz   x    x   x        ()??',
            '!!!!!!!!!!!!!!!!!!!!!!!!!   !!   !!   !!   !!  !!    !!!!!!',
          ],
          [
            '??                                                       -+??',
            '??                                                       ()??',
            '??                     @                               xxxx??',
            '??                                                         ??',
            '??                         z                               ??',
            '??                xx  xxxx                                 ??',
            '??                            xxx       &          xx      ??',
            '??         @x@                                             ??',
            '??                                                         ??',
            '??                                                         ??',
            '??    xx                               xxxxxx              ??',
            '??                                                         ??',
            '??                                                         ??',
            '??        @x&x@                                            ??',
            '??                                                         ??',
            '??               z   z                                     ??',
            '!!!!!!!!!!!!!!!!!!!!!!                                !!!!!',
          ]
          
    ]
  
// setting images to symbols which represent them when in building map/level
  const levelCfg = {
    width: 20,
    height: 20,
    '=': [sprite('block'), solid()],
    '$': [sprite('coin'), 'coin'],
    '%': [sprite('surprise'), solid(), 'coin-surprise'],
    '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
    '}': [sprite('unboxed'), solid()],
    '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
    ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
    '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
    '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
    '^': [sprite('evil-shroom'), solid(), 'dangerous'],
    '#': [sprite('mushroom'), solid(), 'mushroom', body()], // body adds gravity to obj
    '!': [sprite('blue-block'), solid(), scale(0.5)],
    '??': [sprite('blue-brick'), solid(), scale(0.5)],
    'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
    '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
    '&': [sprite('blue-surprise'), solid(), scale(0.5), 'mushroom-surprise'],
    'x': [sprite('blue-steel'), solid(), scale(0.5)],

  }

  const gameLevel = addLevel(maps[level], levelCfg)

  // Setting a running score across levels top of screen
  const scoreLabel = add([
    text('Score ' + score),
    pos(180, 6),
    layer('ui'),
    {
      value: score,
    }
  ])

  // increase level indicator
  add([text('Level ' + parseInt(level + 1)), pos(250, 6)])

  // logic for making player big 
  function big() {
    let timer = 0
    let isBig = false
    return {
      update() {
        if (isBig) {
          CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
          timer -= dt() // dt is a kaboom method (delta time)
          if (timer <= 0) {
            this.smallify()
          }
        }
      },
      isBig() {
        return isBig
      },
      smallify() {
        this.scale = vec2(1) //scale down
        CURRENT_JUMP_FORCE = JUMP_FORCE
        timer = 0
        isBig = false
      },
      biggify(time) {
        this.scale = vec2(2) //scale up
        timer = time
        isBig = true     
      }
    }
  }

  // Setting mario/player
  const player = add([
    sprite('mario'), solid(),
    pos(30, 0),
    body(),
    big(),
    origin('bot')
  ])

  // mushroom speed
  action('mushroom', (m) => {
    m.move(20, 0)
  })

  // player headbumps surpise block
  player.on("headbump", (obj) => {
    if (obj.is('coin-surprise')) {
      gameLevel.spawn('$', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0,0))
    }
    if (obj.is('mushroom-surprise')) {
      gameLevel.spawn('#', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0,0))
    }
  })

  // player gets a mushroom, 6 is amount of time(seconds) 
  player.collides('mushroom', (m) => {
    destroy(m)
    player.biggify(6)
  })

  // player gets a coin, updates running score
  player.collides('coin', (c) => {
    destroy(c)
    scoreLabel.value++
    scoreLabel.text = 'Score ' + scoreLabel.value
  })

  // enemy speed
  action('dangerous', (d) => {
    d.move(-ENEMY_SPEED, 0)
  })

  // player encounters dangerous obj
  player.collides('dangerous', (d) => {
    if (isJumping) {
      destroy(d)
      gameLevel.spawn('$', d.gridPos.sub(5, 0))
    } else {
      go('lose', { score: scoreLabel.value})
    }
  })

  // player falls
  player.action(() => {
    camPos(player.pos)//camera position
    if (player.pos.y >= FALL_DEATH) {
      go('lose', { score: scoreLabel.value})
    }
  })

  // player drops into pipe
  player.collides('pipe', () => {
    keyPress('down', () => {
      go('game', {
        level: (level + 1) % maps.length,
        score: scoreLabel.value
      })
    })
  })


  // Keyboard settings for making Mario move
  keyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })

  keyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })

  player.action(() => {
    if(player.grounded()) {
      isJumping = false
    }
  })

  keyPress('space', () => {
    if (player.grounded()) {
      isJumping = true
      player.jump(CURRENT_JUMP_FORCE)
    }
  })
})

// if player falls or dies
scene('lose', ({ score }) => {
    add([text('Score: ' + score, 18), origin('center'), pos(width()/2, height()/ 2)])
    if (score < 6) {
        add([text('Better luck next time!', 16), origin('center'), pos(width()/2, height()/ 3)])
    } else if (score < 11) {
        add([text('Not bad. Keep trying!', 16), origin('center'), pos(width()/2, height()/ 3)])
    } else {
        add([text('Super Impressive!', 24), origin('center'), pos(width()/2, height()/ 3)])
    }
  })

start('game', { level: 0, score: 0})