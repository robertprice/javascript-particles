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
        canvas.onclick = function (e) {
            var hue = Math.random() * 255;  // create a random colour for the explosion
            for (var i = 0; i < 200; i++) {
                createParticle({
                    x: e.x,
                    y: e.y
                }, {
                }, hue);
            }
        };

        tick();
    }

    function tick() {
        clearCanvas();
        var len = particles.length;
        while (len--) {
            var particle = particles[len];
            if (particle.update()) {
                particles.splice(len, 1);
            }
            particle.render(ctx);
        }

        requestAnimationFrame(tick);    // draw the next frame when ready
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

        particles.push(
            new Particle(
                {
                    x: position.x || (windowSize.width / 2),
                    y: position.y || (windowSize.height / 2)
                },
                {
                    x: velocity.x || Math.random() * 10 - 5,
                    y: velocity.y || Math.random() * 10 - 5
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

        //this.velocity.y += 0.15; // fake gravity by increasing velocity downwards

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

window.onload = function () {
    Sparkler.init();
};