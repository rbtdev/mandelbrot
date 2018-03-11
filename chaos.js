var chaos

function init(canvasId) {
    chaos = new Chaos(canvasId);
}

function Chaos(canvasId) {

    this.canvas = document.getElementById(canvasId);
    this.canvas.height = window.innerHeight - 2;
    this.canvas.width = window.innerWidth-2;
    this.height = this.canvas.height
    this.width = this.canvas.width
    this.aspectRatio = this.width/this.height;

    this.startButton = document.getElementById('start');
    this.rectDiv = document.getElementById('rect');
    this.iterationDiv = document.getElementById('iterations');
    this.colorShiftDiv = document.getElementById('color-shift');
    this.colorOffsetDiv = document.getElementById('color-offset')
    this.colorSpreadDiv = document.getElementById('color-spread');
    this.movieButton = document.getElementById('movie');
    this.movieText = document.getElementById('movie-text');
    this.movieButton.onclick = this.playMovie.bind(this);
    this.colorSpreadDiv.onkeyup = this.showGradiant.bind(this);
    this.colorOffsetDiv.onkeyup = this.showGradiant.bind(this);
    this.colorShiftDiv.onkeyup = this.showGradiant.bind(this);
    this.iterationDiv.onkeyup = this.showGradiant.bind(this);
    this.speedDiv = document.getElementById('speed');
    this.gradientCanvas = document.getElementById('gradient');
    this.gradientWidth = this.gradientCanvas.width;
    this.gradientHeight = this.gradientCanvas.height;
    this.gradient = this.gradientCanvas.getContext("2d");
    this.ctx = canvas.getContext("2d");
    this.pointSize = 1;
    this.maxColors = Math.pow(2, 24) - 1;
    this.maxIterations = this.iterationDiv.value;
    this.drag = document.getElementById('drag');
    this.canvas.onmousewheel = this.mouseZoom.bind(this);
    this.speedDiv.value = this.canvas.width;

    this.showGradiant();
    this.start();



    this.scaleX = function (x) {
        return (x * this.scaledWidth / this.width) + this.rect.left;
    }.bind(this);

    this.unScaleX = function (x) {
        return ((x - this.rect.left) / (this.scaledWidth / this.width));
    }

    this.unScaleY = function (y) {
        return ((this.rect.top + y) / (this.scaledHeight / this.height));
    }

    this.scaleY = function (y) {
        return this.rect.top - (y * this.scaledHeight / this.height);
    }.bind(this);

    var _this = this;
    var centerX = -0.5;
    var width = 3 * this.aspectRatio;
    var left = centerX - (width/2);
    var right = centerX + (width/2);
    var height = 3;
    this.rect = {
        top: 1.5,
        left: left,
        bottom: -1.5,
        right: right
    }
    this.setScale();

    var _this = this;
    _this.canvas.onmousedown = function (e) {

        var clickY;
        var clickX;
        var clickY = e.clientY;
        var clickX = e.clientX;

        document.onmousemove = function (e) {
            _this.drawDrag({
                top: Math.min(clickY, e.clientY),
                left: Math.min(clickX, e.clientX),
                height: Math.abs(clickY - e.clientY),
                width: Math.abs(clickX - e.clientX)
            })
        }

        document.onmouseup = function (e) {
            var rect = _this.canvas.getBoundingClientRect();
            var newRect = {}
            newRect.left = _this.scaleX(clickX - rect.left);
            newRect.top = _this.scaleY(clickY - rect.top);
            newRect.right = _this.scaleX(e.clientX - rect.left);
            newRect.bottom = _this.scaleY(e.clientY - rect.top);
            _this.rect = newRect;
            _this.canvas.onmousemove = null;
            _this.drag.style.visibility = 'hidden';
            _this.setScale();
            _this.stop();
            _this.start();
        }
    };

}

Chaos.prototype.playMovie = function () {
    var _this = this;
    this.movieText.innerText = 'Click on the set to start the movie';
    this.canvas.onmousedown = null;
    this.canvas.onclick = function (e) {
        _this.canvas.onclick = null;
        _this.movie = true;
        _this.zoomCenterX = e.clientX;
        _this.zoomCenterY = e.clientY;
        _this.start();
    }
}

Chaos.prototype.setScale = function () {
    this.scaledWidth = Math.abs(this.rect.left - this.rect.right);
    this.scaledHeight = Math.abs(this.rect.top - this.rect.bottom);
    this.scaledCenterX = this.rect.right - (this.scaledWidth / 2);
    this.scaledCenterY = this.rect.top - (this.scaledHeight / 2);
    this.rectDiv.innerText = '';
    this.rectDiv.innerText = JSON.stringify(this.rect, null, 2).replace(/[{"}]/g, '') + '\n' +
        'width: ' + this.scaledWidth + '\n' + 'height: ' + this.scaledHeight;
}

Chaos.prototype.color = function (c) {
    var fill = '000000';
    //var color = ((((c << this.colorShift) * this.colorSpread) + this.colorOffset)).toString(16);
    var color = (Math.round(c) * this.colorSpread) << this.colorShift + this.colorOffset.toString(16);

    var hex = '#' + (fill + color).slice(-6);
    return hex;
}

Chaos.prototype.stop = function () {
    this.movie = false;
    cancelAnimationFrame(this.req);
    this.startButton.textContent = 'Start';
    this.startButton.onclick = this.start.bind(this);
}

Chaos.prototype.start = function () {
    document.onmouseup = null;
    document.onmousemove = null;
    this.run();
    this.startButton.textContent = 'Stop';
    this.startButton.onclick = this.stop.bind(this);
}
Chaos.prototype.mouseMove = function (e) {

}
Chaos.prototype.mouseZoom = function (e) {
    this.stop();
    var zoom = 1 + (Math.sign(e.wheelDelta) * .1);
    var xCenter = e.clientX;
    var yCenter = e.clientY;
    this.setZoom(zoom, xCenter, yCenter);

    this.start();
    return false;
}

Chaos.prototype.setZoom = function (zoom, xCenter, yCenter) {
    var scaledX = this.scaleX(xCenter);
    var scaledY = this.scaleY(yCenter);

    this.rect.top = scaledY + this.scaledHeight * zoom / 2
    this.rect.bottom = scaledY - this.scaledHeight * zoom / 2
    this.rect.left = scaledX - this.scaledWidth * zoom / 2
    this.rect.right = scaledX + this.scaledWidth * zoom / 2
    this.setScale();

    var moveX = this.scaledCenterX - this.scaleX(xCenter);
    var moveY = this.scaledCenterY - this.scaleY(yCenter);
    this.rect.top += moveY;
    this.rect.bottom += moveY;
    this.rect.left += moveX;
    this.rect.right += moveX;
    this.setScale();
}

Chaos.prototype.drawDrag = function (drag) {
    this.drag.style.visibility = 'visible';
    this.drag.style.top = drag.top + 'px';
    this.drag.style.left = drag.left + 'px';
    this.drag.style.height = drag.height + 'px';
    this.drag.style.width = drag.width + 'px';
}
Chaos.prototype.plot = function (x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, 1, 1);
}

Chaos.prototype.showGradiant = function () {
    this.colorShift = parseInt(this.colorShiftDiv.value);
    this.colorOffset = parseInt(this.colorOffsetDiv.value);
    this.colorSpread = parseInt(this.colorSpreadDiv.value);
    this.maxIterations = parseInt(this.iterationDiv.value);
    var step = this.maxIterations / this.gradientCanvas.width;
    for (var x = 0; x <= this.gradientCanvas.width; x++) {
        var c = x * step;
        var color = this.color(c);
        this.gradient.fillStyle = color;
        this.gradient.fillRect(x, 0, 1, this.gradientCanvas.height);
    }
}
Chaos.prototype.run = function () {
    // this.ctx.fillStyle = '#050505';
    // this.ctx.fillRect(0, 0, this.width, this.height);
    this.maxIterations = parseInt(this.iterationDiv.value);
    this.colorShift = parseInt(this.colorShiftDiv.value);
    this.colorOffset = parseInt(this.colorOffsetDiv.value);
    this.colorSpread = parseInt(this.colorSpreadDiv.value);
    this.speed = parseInt(this.speedDiv.value, 10);
    var Px = 0;
    var escape = 4;
    var zoom = 1;
    var current = 0;
    var total = this.width * this.height;
    this.req = requestAnimationFrame(compute.bind(this, Px));

    function compute(Px) {
        for (var col = 0; col < this.speed && Px < this.width; col++) {
            var x0 = this.scaleX(Px);

            for (var Py = 0; Py < this.height; Py++) {
                var y0 = this.scaleY(Py);
                var x = 0
                var y = 0
                var iteration = 0

                while (x * x + y * y <= escape && iteration < this.maxIterations) {
                    var xtemp = x * x - y * y + x0;
                    var y = 2 * x * y + y0;
                    x = xtemp
                    iteration = iteration + 1
                }

                var color = this.color(iteration)
                if (iteration === this.maxIterations) color = this.color(0);
                this.plot(Px, Py, color);
            }
            Px++;
        }
        if (Px < this.width) this.req = requestAnimationFrame(compute.bind(this, Px));
        else if (this.movie) {
            if (zoom > 0.0001) {
                zoom++
                this.setZoom(1 / Math.pow(zoom, 1 / zoom), this.zoomCenterX, this.zoomCenterY);
                Px = 0;
                this.req = requestAnimationFrame(compute.bind(this, Px))
            }
            else this.stop();
        }
        else {
            this.stop();
        }
    }
}



