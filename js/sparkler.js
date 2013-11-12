var Sparkler = function () {

    var particles = [],     // where to store the particles
        windowSize = {},    // the dimensions of the current window
        canvas = null,      // the canvas element to draw particles onto
        ctx = null;         // the canvas 2d context (cached)


    function initialise() {
        getWindowSize();

        canvas = document.createElement('canvas');
        canvas.width = windowSize.width;
        canvas.height = windowSize.height;

        ctx = canvas.getContext('2d');

        document.body.appendChild(canvas);

        // fire off an explosion where the user clicks
        canvas.addEventListener("click", onClick);

        //tick();
        tickDuffsDevice();
    }

    function onClick(e) {
        var hue = Math.random() * 255;  // create a random colour for the explosion
        for (var i = 0; i < 300; i++) {
            createParticle({
                x: e.clientX,
                y: e.clientY
            }, {
            }, hue);
        }
    }


    // original tick method
    function tick() {
        clearCanvas();
        var len = particles.length;
        while (len--) {
            drawParticle(len);
        }

        requestAnimationFrame(tick);    // draw the next frame when ready
    }

    // replacement tick method using loop unrolling / duffs device
    function tickDuffsDevice() {
        clearCanvas();

        var len = particles.length;
        var i = len;
        var n = len % 8;
        while (n--) {
            drawParticle(--i);
        }

        n = parseInt(len / 8, 10);
        while (n--) {
            drawParticle(--i);
            drawParticle(--i);
            drawParticle(--i);
            drawParticle(--i);
            drawParticle(--i);
            drawParticle(--i);
            drawParticle(--i);
            drawParticle(--i);
        }

        requestAnimationFrame(tickDuffsDevice);
    }

    function drawParticle(i) {
        var particle = particles[i];
        if (particle.update()) {
            particles.splice(i, 1); // remove the particle if no longer visible.
        }
        particle.render(ctx);
    }

    function clearCanvas() {
        // Store the current transformation matrix
        ctx.save();

        // Use the identity matrix while clearing the canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Restore the transform
        ctx.restore();
    }

    function createParticle(position, velocity, hue) {
        position = position || {};
        velocity = velocity || {};
        hue = hue || 255;

        // choose a direction for this particle
        var angleRadians = Math.random() * 6.2831853;   // random number between 0 and 2pi 

        particles.push(
            new Particle(
                {
                    x: position.x || (windowSize.width / 2),
                    y: position.y || (windowSize.height / 2)
                },
                {
                    // x: velocity.x || Math.random() * 10 - 5,
                    // y: velocity.y || Math.random() * 10 - 5
                    x: velocity.x || Math.sin(angleRadians) * (Math.random() * 5),
                    y: velocity.y || Math.cos(angleRadians) * (Math.random() * 5)
                },
                hue
            )
        );
    }

    function getWindowSize() {
        windowSize.width = window.innerWidth;
        windowSize.height = window.innerHeight;
    }

    return {
        init : initialise
    };
}();

var Particle = function (position, velocity, hue) {
    this.alpha = 1;
    this.position = {
        x: position.x || 0,
        y: position.y || 0
    };
    this.lastPosition = {
        x: this.position.x,
        y: this.position.y
    };
    this.velocity = {
        x: velocity.x || 0,
        y: velocity.y || 0
    };
    this.hue = hue || 255;
};

Particle.prototype = {
    update: function () {
        this.lastPosition.x = this.position.x;
        this.lastPosition.y = this.position.y;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.velocity.y += 0.04; // fake gravity by increasing velocity downwards

        this.alpha -= 0.005;    // reduce the alpha to fade out the particle

        return (this.alpha < 0.005);
    },

    render: function (context) {
        var x = Math.round(this.position.x),
            y = Math.round(this.position.y),
            xVel = (x - this.lastPosition.x) * -5,
            yVel = (y - this.lastPosition.y) * -5;

        context.save();

        context.globalCompositeOperation = 'lighter';   // when colours overlay, they mix properly
        //context.globalAlpha = Math.random() * this.alpha;   // this gives a nice random sparkle effect by varying the alpha channel

        context.fillStyle = "hsla(" + this.hue + ", 100%, 80%, " + this.alpha + ")";
        context.beginPath();
        context.moveTo(this.position.x, this.position.y);
        context.lineTo(this.position.x + 1.5, this.position.y);
        context.lineTo(this.position.x + xVel, this.position.y + yVel);
        context.lineTo(this.position.x - 1.5, this.position.y);
        context.closePath();
        context.fill();

        context.restore();
    }
};

window.addEventListener("load", function () {
    Sparkler.init();
});
