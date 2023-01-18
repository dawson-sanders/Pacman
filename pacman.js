//================================================================================================
// Name: Dawson Sanders
// Description: This is a pacman game
//================================================================================================

// Setting up the canvas and context 
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Setting the canvas to the entire windows width and height
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// This selects the score from the html file 
const scoreElement = document.querySelector('#scoreElement');

// This selects the win condition from the html file 
const winConditionElement = document.querySelector('#winConditionElement');


//================================================================================================
// Boundary Class
//================================================================================================
class Boundary {
    static width = 40;
    static height = 40;
    constructor({ position, image }) {
        this.position = position; // Setting the position dynamically
        this.width = 40;          // Setting the width statically
        this.height = 40;         // Setting the height statically
        this.image = image;       // Setting the image dynamically
    }

    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y);
    }
}


//================================================================================================
// Pacman Class
//================================================================================================
class Pacman {
    constructor( { position, velocity } ) {
        this.position = position; // Setting the position dynamically
        this.velocity = velocity; // Setting the velocity dynamically
        this.radius = 15;         // Setting the radius statically
        this.radians = 0.75;      // Setting the radians statically
        this.openRate = 0.12;     // Setting the openRate statically
        this.rotation = 0;        // Setting the rotation statically
    }

    draw() {
        ctx.save(); // Saves the default state
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.translate(-this.position.x, -this.position.y);
        ctx.beginPath(); // Tells canvas context(ctx) that we are beginning a path to create an arc
        ctx.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians); // Creates an arc to draw a circle
        ctx.lineTo(this.position.x, this.position.y);
        ctx.fillStyle = 'yellow'; // Styles the circle with the color yellow
        ctx.fill(); // Fills the circle with color
        ctx.closePath(); // Closes the path 
        ctx.restore(); // Restores the default state
    }

    update() {
        this.draw(); // Draws pacman
        this.position.x += this.velocity.x; // Adds velocity to the position in x-direction
        this.position.y += this.velocity.y; // Adds velocity to the position in y-direction

        if (this.radians < 0 || this.radians > 0.75) {
            this.openRate = -this.openRate;
        }
        this.radians += this.openRate;
    }
}

//================================================================================================
// Pellet Class
//================================================================================================
class Pellet {
    constructor( { position } ) {
        this.position = position; // Setting the position dynamically
        this.radius = 3;          // Setting the radius statically
    }

    draw() {
        ctx.beginPath(); // Tells canvas context(ctx) that we are beginning a path to create an arc
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2); // Creates an arc to draw a circle
        ctx.fillStyle = 'white'; // Styles the circle with the color white
        ctx.fill(); // Fills the circle with color
        ctx.closePath(); // Closes the path 
    }
}


//================================================================================================
// Ghost Class
//================================================================================================
class Ghost {
    static speed = 2;
    constructor( { position, velocity, color } ) {
        this.position = position; // Setting the position dynamically
        this.velocity = velocity; // Setting the velocity dynamically
        this.radius = 15;         // Setting the radius statically
        this.color = color;       // Setting the color statically
        this.prevCollisions = []; // Stores all the ghosts previous collisions  
        this.speed = 2;  
        this.scared = false;
    }

    draw() {
        ctx.beginPath(); // Tells canvas context(ctx) that we are beginning a path to create an arc
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2); // Creates an arc to draw a circle
        ctx.fillStyle = this.scared ? 'blue' : this.color; // Styles the circle with either blue or other color
        ctx.fill(); // Fills the circle with color
        ctx.closePath(); // Closes the path 
    }

    update() {
        this.draw(); // Draws pacman
        this.position.x += this.velocity.x; // Adds velocity to the position in x-direction
        this.position.y += this.velocity.y; // Adds velocity to the position in y-direction
    }
}


//================================================================================================
// PowerUp Class
//================================================================================================
class PowerUp {
    constructor( { position } ) {
        this.position = position; // Setting the position dynamically
        this.radius = 8;         // Setting the radius statically
    }

    draw() {
        ctx.beginPath(); // Tells canvas context(ctx) that we are beginning a path to create an arc
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2); // Creates an arc to draw a circle
        ctx.fillStyle = 'white'; // Styles the circle with the color white
        ctx.fill(); // Fills the circle with color
        ctx.closePath(); // Closes the path 
    }
}

//================================================================================================
// 
//================================================================================================

// Creating a pacman object
const pacman = new Pacman({
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x: 0,
        y: 0
    }
});

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowDown: {
        pressed: false
    },
    ArrowUp: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    }
};

let lastkey = '';

let score = 0;

// This array holds the pellet positions when a new pellet is pushed
const pellets = [];

// This array holds the powwer up positions when a new power up is pushed
const powerUps = [];

// This array holds the boundary positions when a new boundary is pushed
const boundaries = [];

// This array holds the ghosts positions when a new ghost is pushed
const ghosts = [
    new Ghost({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'red'
    }),

    new Ghost({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height * 3 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'pink' 
    }),
    new Ghost({
        position: {
            x: Boundary.width * 10 + Boundary.width / 2,
            y: Boundary.height * 7 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'blue' 
    })
];

// This creates a representation of what the map should look like
const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', ' ', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '[', ']', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '.', '_', '.', 'p', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', '-', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '[', ']', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', '-', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '[', ']', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
];

function createImage(src) {
    const image = new Image();
    image.src = src;
    return image;
};

// These forEach loops go through the map arrays and everywhere there is a dash pushes a new boundary
map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/pipeHorizontal.png')
                    })
                )
                break;
            
            case '|':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/pipeVertical.png')
                    })
                )
                break;
            
            case '1':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/pipeCorner1.png')
                    })
                )
                break;
            
            case '2':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/pipeCorner2.png')
                    })
                )
                break;

            case '3':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/pipeCorner3.png')
                    })
                )
                break;
            
            case '4':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/pipeCorner4.png')
                    })
                )
                break;

            case 'b':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/block.png')
                    })
                )
                break;
            
            case '[':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/capLeft.png')
                    })
                )
                break;
            
            case ']':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/capRight.png')
                    })
                )
                break;

            case '_':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/capBottom.png')
                    })
                )
                break;

            case '^':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/capTop.png')
                    })
                )
                break;

            case '+':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/pipeCross.png')
                    })
                )
                break;

            case '5':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/pipeConnectorTop.png')
                    })
                )
                break;

            case '6':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/pipeConnectorRight.png')
                    })
                )
                break;

            case '7':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/pipeConnectorBottom.png')
                    })
                )
                break;

            case '8':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j, 
                            y: Boundary.height * i
                        },
                        image: createImage('./imgs/pipeConnectorLeft.png')
                    })
                )
                break;

            case '.':
                pellets.push(
                    new Pellet({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2, 
                            y: i * Boundary.height + Boundary.height / 2
                        },
                    })
                )
                break;

            case 'p':
                powerUps.push(
                    new PowerUp({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2, 
                            y: i * Boundary.height + Boundary.height / 2
                        },
                    })
                )
                break;
        }
    });
});

function circleCollidesWithRectangle({ circle, rectangle }) {
    const padding = Boundary.width / 2 - circle.radius - 1;
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding
        && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
        && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding
        && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding
    );
}

let animationId;

function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (keys.w.pressed && lastkey === 'w') {
       for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollidesWithRectangle({
                circle: {
                    ...pacman, 
                    velocity: {
                        x: 0,
                        y: -2
                }},
                rectangle: boundary
            })) {
                pacman.velocity.y = 0;
                break;
            }
            else 
                pacman.velocity.y = -2;
       }
    }    

    else if (keys.a.pressed && lastkey === 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollidesWithRectangle({
                circle: {
                    ...pacman, 
                    velocity: {
                        x: -2,
                        y: 0
                }},
                rectangle: boundary
            })) {
                pacman.velocity.x = 0;
                break;
            }
            else 
                pacman.velocity.x = -2;
        }
    }

    else if (keys.s.pressed && lastkey === 's') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollidesWithRectangle({
                circle: {
                    ...pacman, 
                    velocity: {
                        x: 0,
                        y: 2
                }},
                rectangle: boundary
            })) {
                pacman.velocity.y = 0;
                break;
            }
            else 
                pacman.velocity.y = 2;
        }
    }   

    else if (keys.d.pressed && lastkey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollidesWithRectangle({
                circle: {
                    ...pacman, 
                    velocity: {
                        x: 2,
                        y: 0
                }},
                rectangle: boundary
            })) {
                pacman.velocity.x = 0;
                break;
            }
            else 
                pacman.velocity.x = 2;
        }
    }

    else if (keys.ArrowDown.pressed && lastkey === 'ArrowDown') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollidesWithRectangle({
                circle: {
                    ...pacman, 
                    velocity: {
                        x: 0,
                        y: 2
                }},
                rectangle: boundary
            })) {
                pacman.velocity.y = 0;
                break;
            }
            else 
                pacman.velocity.y = 2;
        }
    }   

    else if (keys.ArrowUp.pressed && lastkey === 'ArrowUp') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollidesWithRectangle({
                circle: {
                    ...pacman, 
                    velocity: {
                        x: 0,
                        y: -2
                }},
                rectangle: boundary
            })) {
                pacman.velocity.y = 0;
                break;
            }
            else 
                pacman.velocity.y = -2;
        }
    }    

    else if (keys.ArrowLeft.pressed && lastkey === 'ArrowLeft') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollidesWithRectangle({
                circle: {
                    ...pacman, 
                    velocity: {
                        x: -2,
                        y: 0
                }},
                rectangle: boundary
            })) {
                pacman.velocity.x = 0;
                break;
            }
            else 
                pacman.velocity.x = -2;
        }
    }    

    else if (keys.ArrowRight.pressed && lastkey === 'ArrowRight') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (circleCollidesWithRectangle({
                circle: {
                    ...pacman, 
                    velocity: {
                        x: 2,
                        y: 0
                }},
                rectangle: boundary
            })) {
                pacman.velocity.x = 0;
                break;
            }
            else 
                pacman.velocity.x = 2;
        }
    }

    // detect collision between ghost and pacman
    for (let i = ghosts.length - 1; 0 <= i; i--) {
        const ghost = ghosts[i];
        // Ghosts collide with pacman
        if (Math.hypot(ghost.position.x - pacman.position.x, ghost.position.y - pacman.position.y) < ghost.radius + pacman.radius) {
            if (ghost.scared) {
                ghosts.splice(i, 1)
            }
            else {
                alert('You Lose! Try Again!');
                cancelAnimationFrame(animationId);
                console.log('You Lose! Try Again!');
            }
        }
    }

    // Win condition
    if (pellets.length === 0) {
        console.log('You Win!');
        cancelAnimationFrame(animationId);
    }

    for (let i = powerUps.length - 1; 0 <= i; i--) {
        const powerUp = powerUps[i];
        powerUp.draw();

        // Pacman collides with powerup 
        if (Math.hypot(powerUp.position.x - pacman.position.x, powerUp.position.y - pacman.position.y) < powerUp.radius + pacman.radius) {
            powerUps.splice(i, 1);

            // Make ghosts scared 
            ghosts.forEach(ghost => {
                ghost.scared = true;
                
                setTimeout(() => {
                    ghost.scared = false;

                }, 5000)
            })
        }
    }

    for (let i = pellets.length - 1; 0 <= i; i--) {
        const pellet = pellets[i];

        // Drawing pellets
        pellet.draw();

        // Pacman collides with pellet detection as well as adding the score to the page
        if (Math.hypot(pellet.position.x - pacman.position.x, pellet.position.y - pacman.position.y) < pellet.radius + pacman.radius) {
            pellets.splice(i, 1);
            score += 10;
            scoreElement.innerHTML = score;
        }
    }

    boundaries.forEach(boundary => {
        boundary.draw();

        if (circleCollidesWithRectangle({
            circle: pacman,
            rectangle: boundary
        })) {
            pacman.velocity.x = 0; 
            pacman.velocity.y = 0;
        }
    });
    
    pacman.update();

    ghosts.forEach(ghost => {
        ghost.update();

        // Ghosts collide with pacman
        if (Math.hypot(ghost.position.x - pacman.position.x, ghost.position.y - pacman.position.y) < ghost.radius + pacman.radius && !ghost.scared) {
           cancelAnimationFrame(animationId);
           console.log('You lose');
        }

        const collisions = [];
        boundaries.forEach(boundary => {
            if (
                !collisions.includes('right') &&
                circleCollidesWithRectangle({
                circle: {
                    ...ghost, 
                    velocity: {
                        x: ghost.speed,
                        y: 0
                }},
                rectangle: boundary
            })) {
                collisions.push('right');
            }

            if (
                !collisions.includes('left') &&
                circleCollidesWithRectangle({
                circle: {
                    ...ghost, 
                    velocity: {
                        x: -ghost.speed,
                        y: 0
                }},
                rectangle: boundary
            })) {
                collisions.push('left');
            }

            if (
                !collisions.includes('up') &&
                circleCollidesWithRectangle({
                circle: {
                    ...ghost, 
                    velocity: {
                        x: 0,
                        y: -ghost.speed
                }},
                rectangle: boundary
            })) {
                collisions.push('up');
            }

            if (
                !collisions.includes('down') &&
                circleCollidesWithRectangle({
                circle: {
                    ...ghost, 
                    velocity: {
                        x: 0,
                        y: ghost.speed
                }},
                rectangle: boundary
            })) {
                collisions.push('down');
            }
        })

        if (collisions.length > ghost.prevCollisions.length)
                ghost.prevCollisions = collisions;

        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
            if (ghost.velocity.x > 0) 
                ghost.prevCollisions.push('right');
            else if (ghost.velocity.x < 0)
                ghost.prevCollisions.push('left');
            else if (ghost.velocity.y < 0)
                ghost.prevCollisions.push('up');
            else if (ghost.velocity.y > 0)
                ghost.prevCollisions.push('down');
            
            const pathways = ghost.prevCollisions.filter(collision => {
                return !collisions.includes(collision);
            })

            const direction = pathways[Math.floor(Math.random() * pathways.length)];

            switch (direction) {
                case 'down':
                    ghost.velocity.y = ghost.speed;
                    ghost.velocity.x = 0;
                    break;
                
                case 'up':
                    ghost.velocity.y = -ghost.speed;
                    ghost.velocity.x = 0;
                    break;

                case 'right':
                    ghost.velocity.y = 0;
                    ghost.velocity.x = ghost.speed;
                    break;

                case 'left':
                    ghost.velocity.y = 0;
                    ghost.velocity.x = -ghost.speed;
                    break;
            }

            // Resetting ghost collisions
            ghost.prevCollisions = [];
        }
        
    })

    // Logic for rotating pacman to face correct direction 
    if (pacman.velocity.x > 0) 
        pacman.rotation = 0;
    else if (pacman.velocity.x < 0) 
        pacman.rotation = Math.PI;
    else if (pacman.velocity.y > 0) 
        pacman.rotation = Math.PI / 2;
    else if (pacman.velocity.y < 0) 
        pacman.rotation = Math.PI * 1.5;
}
animate();



window.addEventListener("keydown", (event) => { 
    const keyName = event.key;
    switch (keyName) {
        case 'w':
            keys.w.pressed = true;
            lastkey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastkey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastkey = 's';
            break;
        case 'd':
            keys.d.pressed = true;
            lastkey = 'd';
            break;
        case 'ArrowDown':
            keys.ArrowDown.pressed = true;
            lastkey = 'ArrowDown';
            break;
        case 'ArrowUp':
            keys.ArrowUp.pressed = true;
            lastkey = 'ArrowUp';
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            lastkey = 'ArrowRight';
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            lastkey = 'ArrowLeft';
            break;
    }       
    event.preventDefault(); // prevents arrow keys from scrolling down the page                   
}, false);

// window.addEventListener("keyup", (event) => { 
//     const keyName = event.key;
//     switch (keyName) {
//         case 'w':
//             keys.w.pressed = false;
//             break;
//         case 'a':
//             keys.a.pressed = false;
//             break;
//         case 's':
//             keys.s.pressed = false;
//             break;
//         case 'd':
//             keys.d.pressed = false;
//             break;
//         case 'ArrowDown':
//             keys.ArrowDown.pressed = false;
//             break;
//         case 'ArrowUp':
//             keys.ArrowUp.pressed = false;
//             lastkey = 'ArrowUp';
//             break;
//         case 'ArrowRight':
//             keys.ArrowRight.pressed = false;
//             lastkey = 'ArrowRight';
//             break;
//         case 'ArrowLeft':
//             keys.ArrowLeft.pressed = false;
//             lastkey = 'ArrowLeft';
//             break;
//     }       
//     event.preventDefault(); // prevents arrow keys from scrolling down the page                  
// }, false);

