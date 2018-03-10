var chaos

function init(canvasId) {
    chaos = new Chaos(canvasId);
}

function Chaos(canvasId) {

    this.canvas = document.getElementById(canvasId);
    this.canvas.height = window.innerHeight - 2;
    this.canvas.width = this.canvas.height;
    this.startButton = document.getElementById('start');
    this.rectDiv = document.getElementById('rect');
    this.iterationDiv = document.getElementById('iterations');
    this.escapeDiv = document.getElementById('escape');
    this.colorShiftDiv = document.getElementById('color-shift');
    this.colorOffsetDiv = document.getElementById('color-offset')
    this.colorSpreadDiv = document.getElementById('color-spread');
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
    this.height = this.canvas.height
    this.width = this.canvas.width
    this.maxColors = Math.pow(2, 24) - 1;
    this.maxIterations = this.iterationDiv.value;
    this.drag = document.getElementById('drag');

    this.showGradiant();



    this.scaleX = function (x) {
        return (x * this.scaledWidth / this.width) + this.rect.left;
    }.bind(this);

    this.unScaleX = function (x) {
        return ((x - this.rect.left) / (this.scaledWidth/this.width));
    }

    this.unScaleY = function (y) {
        return ((this.rect.top + y) / (this.scaledHeight/this.height));
    }

    this.scaleY = function (y) {
        return this.rect.top - (y * this.scaledHeight / this.height);
    }.bind(this);

    var _this = this;
    this.rect = {
        top: 1.5,
        left: -2,
        bottom: -1.5,
        right: 1
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

Chaos.prototype.setScale = function () {
    this.scaledWidth = Math.abs(this.rect.left - this.rect.right);
    this.scaledHeight = Math.abs(this.rect.top - this.rect.bottom);
    this.rectDiv.innerText = '';
    this.rectDiv.innerText = JSON.stringify(this.rect, null, 2).replace(/[{"}]/g, '') + '\n' +
        'width: ' + this.scaledWidth + '\n' + 'height: ' + this.scaledHeight;
}

Chaos.prototype.color = function (c) {
    var fill = '000000';
    //var color = ((((c << this.colorShift) * this.colorSpread) + this.colorOffset)).toString(16);
    var color = (Math.round(c) * this.colorSpread)  << this.colorShift + this.colorOffset.toString(16);

    var hex = '#' + (fill + color).slice(-6);
    return hex;
}

Chaos.prototype.stop = function () {
    cancelAnimationFrame(this.req);
    this.startButton.textContent = 'Start';
    this.startButton.onclick = this.start.bind(this);
    //this.canvas.onmousewheel = this.mouseZoom.bind(this);
}

Chaos.prototype.start = function () {
    document.onmouseup = null;
    document.onmousemove = null;
    this.run();
    this.startButton.textContent = 'Stop';
    this.startButton.onclick = this.stop.bind(this);
}

Chaos.prototype.mouseZoom = function (e) {
    var xZoom = 1 + e.wheelDelta/this.width;
    var yZoom = 1 + e.wheelDelta/this.height;
    console.log(e.wheelDelta, xZoom, yZoom);
    var centerX = this.scaleX(e.clientX);
    var centerY = this.scaleY(e.clientY);
    this.rect.top  = (this.rect.top*yZoom) + centerX;
    this.rect.bottom = (this.rect.bottom*yZoom) + centerY;
    this.rect.left = (this.rect.left*xZoom) + centerX;
    this.rect.right = (this.rect.right*xZoom) + centerY;
    this.drawDrag({
        top: this.unScaleY(this.rect.top),
        left: this.unScaleX(this.rect.left),
        width: Math.abs(this.unScaleX(this.rect.left) - this.unScaleX(this.rect.right)),
        height: Math.abs(this.unScaleY(this.rect.top) - this.unScaleY(this.rect.bottom)),
    })
    this.setScale();

    return false;

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
    this.maxIterations= parseInt(this.iterationDiv.value);
    var step = this.maxIterations/this.gradientCanvas.width;
    for (var x = 0; x <= this.gradientCanvas.width; x++) {
        var c = x * step;
        var color = this.color(c);
        this.gradient.fillStyle = color;
        this.gradient.fillRect(x, 0, 1, this.gradientCanvas.height);
    }
}
Chaos.prototype.run = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.maxIterations = parseInt(this.iterationDiv.value);
    this.escape = parseFloat(this.escapeDiv.value);
    this.colorShift = parseInt(this.colorShiftDiv.value);
    this.colorOffset = parseInt(this.colorOffsetDiv.value);
    this.colorSpread = parseInt(this.colorSpreadDiv.value);
    this.speed = parseInt(this.speedDiv.value, 10);
    var Px = 0;
    var escape = this.escape;
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
                this.plot(Px, Py, color)
            }
            Px++;
        }
        if (Px < this.width) this.req = requestAnimationFrame(compute.bind(this, Px));
        else this.stop();
    }
}



