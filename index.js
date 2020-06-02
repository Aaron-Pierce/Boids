function setup() {
    createCanvas(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", () => {
        resizeCanvas(window.innerWidth, window.innerHeight);
    })
}



const lineLength = 250;

const DISPLAY_DEBUG_FLOCKING = false;

let desiredX = window.innerWidth / 2;
let desiredY = window.innerHeight / 2;

let number = 0;

const WANDER = true;
const ALIGNMENT = true;
const COHESION = true;
const AVOIDANCE = true;
const WALLSCARE = false;

const FLEE_DISTANCE = 100;

let FLOCK_OR_FLEE = -50;

class Boid {
    constructor(x = null, y = null, angle = null) {
        this.position = new p5.Vector(x || randX(), y || randY())
        // this.angle = angle || Math.random() * 2 * Math.PI;
        this.angle = Math.random() * 2 * 3.14;
        this.velocity = new p5.Vector(Math.random() * 4, Math.random() * 4);
        this.acceleration = new p5.Vector(0, 0);
        this.terminalVelocity = 5;
        this.maxForce = 10;
        // this.angle = 0;
        this.size = 10;
    }


    update() {

        let lookDistance = 50;

        let choiceTheta = Math.PI * 0.75;
        let randomAngleOffset = (Math.random() - 0.5) * 2 * choiceTheta;

        let angleOnCircle = this.angle + randomAngleOffset;


        let desiredVelocity = new p5.Vector(lookDistance * Math.cos(angleOnCircle), lookDistance * Math.sin(angleOnCircle));
        if (!WANDER) {
            desiredVelocity.mult(0);
            this.velocity.mult(0);
        }



        let nearest = this;
        let nearestDist = Infinity;
        let neighbors = [];
        for (let n of boids) {
            let dist = Math.abs(this.position.dist(n.position));
            let i = 0;
            while (i < neighbors.length && neighbors[i].dist < dist) {
                i++
            }
            if (i < neighbors.length || neighbors.length <= 5) neighbors[i] = {
                root: n,
                dist: dist
            }

            if (dist < FLEE_DISTANCE) {
                if (dist < nearestDist) {
                    nearest = n;
                    nearestDist = dist;
                }
                // console.log(p5.Vector.dist)
                let angle = Math.atan2(-this.position.y + n.position.y, -this.position.x + n.position.x)
                if (angle > 0.1) {
                    stroke(255)
                    if (DISPLAY_DEBUG_FLOCKING)
                        line(this.position.x, this.position.y, this.position.x + 5000 * cos(angle), this.position.y + 5000 * sin(angle))
                    // console.log(angle)
                    if (AVOIDANCE) {
                        desiredVelocity.add(new p5.Vector(FLOCK_OR_FLEE * Math.cos(angle), FLOCK_OR_FLEE * Math.sin(angle)).mult(10000))
                    }
                }
            }
        }

        if (ALIGNMENT) {
            desiredVelocity.add(new p5.Vector(Math.cos(nearest.angle)), new p5.Vector(Math.sin(nearest.angle)).normalize().mult(50));
        }

        let cX = 0;
        let cY = 0;

        for (let n of neighbors) {
            cX += n.root.position.x;
            cY += n.root.position.y;
        }

        cX /= neighbors.length;
        cY /= neighbors.length;

        if (COHESION) {
            desiredVelocity.add(new p5.Vector(cX, cY).mult(10000));
        }


        if (WALLSCARE) {
            const wallScare = 10;

            if (this.position.x > window.innerWidth - 150) {
                desiredVelocity.add(new p5.Vector(-desiredVelocity.x, 0).mult(wallScare))
            }

            if (this.position.x < 150) {
                desiredVelocity.add(new p5.Vector(-desiredVelocity.x, 0).mult(wallScare))
            }


            if (this.position.y > window.innerHeight - 150) {
                desiredVelocity.add(new p5.Vector(0, -desiredVelocity.y).mult(wallScare))
            }


            if (this.position.y < 150) {
                desiredVelocity.add(new p5.Vector(0, -desiredVelocity.y).mult(wallScare))
            }

        }



        let steeringForce = p5.Vector.sub(desiredVelocity, this.velocity).normalize();

        if (frameCount % 3 == 0) {

            this.acceleration.add(steeringForce).limit(this.maxForce);

            this.velocity.add(this.acceleration).limit(this.terminalVelocity);

        }

        this.angle = this.velocity.heading();

        this.position.add(this.velocity);

        if (this.position.x < 0) this.position.x = window.innerWidth;
        if (this.position.x > window.innerWidth) this.position.x = 0;
        if (this.position.y < 0) this.position.y = window.innerHeight;
        if (this.position.y > window.innerHeight) this.position.y = 0;





        this.draw();
    }


    draw() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        beginShape()
        vertex(this.size * 2, 0)
        vertex(-this.size, -this.size)
        vertex(-this.size, this.size);
        endShape("CLOSE");
        fill(0, 0, 0, 0);
        stroke(255)
        if (DISPLAY_DEBUG_FLOCKING)
            ellipse(0, 0, FLEE_DISTANCE)
        pop();
    }
}


let boids = [];

const MAGIC_BIRD_COUNT_CONSTANT = 41472; //specifically chosen such that 1920 * 1080 / M_B_C_C = 50
                                        //because 50 is way too many boids for a phone

for (let i = 0; i < window.innerWidth * window.innerHeight / MAGIC_BIRD_COUNT_CONSTANT; i++) {
    boids.push(new Boid());
}

function randX() {
    return Math.floor(Math.random() * window.innerWidth);
}

function randY() {
    return Math.floor(Math.random() * window.innerHeight);
}

function mouseClicked() {
    desiredX = mouseX;
    desiredY = mouseY;
}

function draw() {
    frameRate(60)
    background(33, 33, 33);
    for (let b of boids) {
        if (frameCount == 1) console.log(b.angle);
        b.update();
    }

    number = 0;
}