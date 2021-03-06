var chaos

function init(canvasId) {
    chaos = new Chaos(canvasId);
}

function Chaos(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.initCanvas();

    this.startButton = document.getElementById('start');
    this.rectDiv = document.getElementById('rect');
    this.iterationDiv = document.getElementById('iterations');
    this.colorShiftDiv = document.getElementById('color-shift');
    this.colorOffsetDiv = document.getElementById('color-offset')
    this.colorSpreadDiv = document.getElementById('color-spread');
    this.speedDiv = document.getElementById('speed');
    this.drag = document.getElementById('drag');
    this.progressive = document.getElementById('progressive');

    this.colorSpreadDiv.onkeyup = this.showGradiant.bind(this);
    this.colorOffsetDiv.onkeyup = this.showGradiant.bind(this);
    this.colorShiftDiv.onkeyup = this.showGradiant.bind(this);
    this.iterationDiv.onkeyup = this.showGradiant.bind(this);
    this.progressive.onclick = this.setSpeed.bind(this);


    this.gradientCanvas = document.getElementById('gradient');
    this.gradient = this.gradientCanvas.getContext("2d");

    document.getElementById('zoom-in').onclick = this.zoomIn.bind(this);
    document.getElementById('zoom-out').onclick = this.zoomOut.bind(this);

    this.canvas.onmousewheel = this.mouseZoom.bind(this);
    window.onresize = function () {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(function () {
            this.initCanvas();
            this.setScale();
            this.start();
        }.bind(this), 100);
    }.bind(this);

    this.maxIterations = this.iterationDiv.value;
    this.colors = [];
    this.progressiveValue = 20;
    this.speedDiv.value = this.progressive.checked?this.progressiveValue:this.width;

    var centerX = -0.5;
    var centerY = 0;
    var height = 3;
    var width = height * this.aspectRatio;
    var top = centerY + (height/2);
    var bottom = centerY - (height/2);
    var left = centerX - (width / 2);
    var right = centerX + (width / 2);
    this.rect = {
        top: top,
        left: left,
        bottom: bottom,
        right: right
    }
    this.setScale();
    this.showGradiant();
    this.start();
}

Chaos.prototype.initCanvas = function () {
    this.canvas.height = window.innerHeight - 2;
    this.canvas.width = window.innerWidth - 2;
    this.height = this.canvas.height
    this.width = this.canvas.width
    this.aspectRatio = this.width / this.height;
    this.ctx = canvas.getContext("2d");
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.width, this.height);
}
Chaos.prototype.scaleX = function (x) {
    return (x * this.scaledWidth / this.width) + this.rect.left;
}

Chaos.prototype.scaleY = function (y) {
    return this.rect.top - (y * this.scaledHeight / this.height);
}

Chaos.prototype.setSpeed = function () {
    this.speed = this.progressive.checked?this.progressiveValue: this.width;
    this.speedDiv.value = this.speed;
}
Chaos.prototype.deactivateDragZoom = function () {
    this.canvas.onmousedown = null;
    document.onmousemove = null;
    document.onmouseup = null;
}
Chaos.prototype.activateDragZoom = function () {
    var _this = this;
    _this.canvas.onmousedown = function (e) {
        var clickY;
        var clickX;
        var clickY = e.clientY;
        var clickX = e.clientX;
        var drag = {};

        document.onmousemove = function (e) {
            var width = Math.abs(clickX - e.clientX);
            var height = width / _this.aspectRatio;

            drag = {
                top: Math.min(clickY, e.clientY),
                left: Math.min(clickX, e.clientX),
                height: height,
                width: width
            }

            _this.drag.style.visibility = 'visible';
            _this.drag.style.top = drag.top + 'px';
            _this.drag.style.left = drag.left + 'px';
            _this.drag.style.height = drag.height + 'px';
            _this.drag.style.width = drag.width + 'px';
        }

        document.onmouseup = function (e) {
            document.onmousemove = null;
            var width = Math.abs(_this.scaleX(drag.left) - _this.scaleX(drag.left + drag.width));
            var height = width / _this.aspectRatio;
            var newRect = {}
            newRect.left = _this.scaleX(drag.left);
            newRect.top = _this.scaleY(drag.top);
            newRect.right = newRect.left + width;
            newRect.bottom = newRect.top - height;
            _this.rect = newRect;
            if (width > 1e-16) {
                _this.drag.style.visibility = 'hidden';
                _this.deactivateDragZoom();
                _this.stop();
                _this.setScale();
                _this.start();
            }

        }
    };
}
Chaos.prototype.zoomIn = function () {
    this.setZoom(.9, this.width / 2, this.height / 2);
    this.start();
}

Chaos.prototype.zoomOut = function () {
    this.setZoom(1.1, this.width / 2, this.height / 2);
    this.start();
}

Chaos.prototype.setScale = function () {
    this.scaledWidth = Math.abs(this.rect.left - this.rect.right);
    this.scaledHeight = Math.abs(this.rect.top - this.rect.bottom);
    this.scaledCenterX = this.rect.right - (this.scaledWidth / 2);
    this.scaledCenterY = this.rect.top - (this.scaledHeight / 2);
    this.rectDiv.innerText = '';
    this.rectDiv.innerText = 'top:    ' + (Math.sign(this.rect.top) > 0 ? ' ' : '') + this.rect.top + '\n' +
        'left:   ' + (Math.sign(this.rect.left) > 0 ? ' ' : '') + this.rect.left + '\n' +
        'bottom: ' + (Math.sign(this.rect.bottom) > 0 ? ' ' : '') + this.rect.bottom + '\n' +
        'right:  ' + (Math.sign(this.rect.right) > 0 ? ' ' : '') + this.rect.right + '\n' +
        'width:   ' + this.scaledWidth + '\n' +
        'height:  ' + this.scaledHeight + '\n';
}

Chaos.prototype.color = function (c) {
    var fill = '000000';
    //var color = ((((c << this.colorShift) * this.colorSpread) + this.colorOffset)).toString(16);
    var color = (((Math.round(c) * this.colorSpread) << this.colorShift) + this.colorOffset).toString(16);

    var hex = '#' + (fill + color).slice(-6);
    return hex;
}

Chaos.prototype.stop = function () {
    clearTimeout(this.req);
    this.startButton.textContent = 'Start';
    this.startButton.onclick = this.start.bind(this);
}

Chaos.prototype.start = function () {
    this.stop()
    this.activateDragZoom();
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

Chaos.prototype.plot = function (x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, 1, 1);
}

Chaos.prototype.showGradiant = function () {
    this.colorShift = parseInt(this.colorShiftDiv.value);
    this.colorOffset = parseInt(this.colorOffsetDiv.value);
    this.colorSpread = parseInt(this.colorSpreadDiv.value) || 1;
    this.maxIterations = parseInt(this.iterationDiv.value);
    var step = this.maxIterations / this.gradientCanvas.width;
    this.colors = [];
    for (var i = 0; i <= this.maxIterations; i++) {
        var color = this.color(i);
        this.colors.push(color);
    }
    for (var x = 0; x <= this.gradientCanvas.width; x++) {
        var c = Math.floor(x * step);
        this.gradient.fillStyle = this.colors[x];
        this.gradient.fillRect(x, 0, 1, this.gradientCanvas.height);
    }
}

Chaos.prototype.run = function () {
    this.maxIterations = parseInt(this.iterationDiv.value);
    this.colorShift = parseInt(this.colorShiftDiv.value);
    this.colorOffset = parseInt(this.colorOffsetDiv.value);
    this.colorSpread = parseInt(this.colorSpreadDiv.value);
    this.speed = parseInt(this.speedDiv.value, 10);
    var Px = 0;
    var escape = 4;
    var zoom = 1;
    this.req = setTimeout(compute.bind(this, Px), 0);

    function compute(Px) {
        var scaledY = [];
        for (var col = 0; col < this.speed && Px < this.width; col++) {
            var x0 = this.scaleX(Px);
            for (var Py = 0; Py < this.height; Py++) {
                scaledY[Py] = scaledY[Py] || this.scaleY(Py);
                var y0 = scaledY[Py];
                var x = 0
                var y = 0
                var x2 = 0;
                var y2 = 0;
                var iteration = 0
                while (x2 + y2 <= escape && iteration < this.maxIterations) {
                    var xtemp = x2 - y2 + x0;
                    var y = 2 * x * y + y0;
                    x = xtemp
                    iteration = iteration + 1;
                    x2 = x * x;
                    y2 = y * y;
                }
                var color = this.colors[iteration]
                if (iteration === this.maxIterations) color = this.colors[0];
                this.plot(Px, Py, color);
            }
            Px++;
        }
        if (Px >= this.width) this.stop();
        else this.req = setTimeout(compute.bind(this, Px), 0);
    }
}



