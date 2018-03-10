var chaos

function init(canvasId) {
    chaos = new Chaos(canvasId);
}

function Chaos(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.startButton = document.getElementById('start');
    this.rectDiv = document.getElementById('rect');
    this.iterationDiv = document.getElementById('iterations');
    this.escapeDiv = document.getElementById('escape');
    this.colorShiftDiv = document.getElementById('color-shift');
    this.colorOffsetDiv = document.getElementById('color-offset')
    this.colorSpreadDiv = document.getElementById('color-spread')
    this.speedDiv = document.getElementById('speed');
    this.ctx = canvas.getContext("2d");
    this.pointSize = 1;
    this.height = this.canvas.height
    this.width = this.canvas.width
    this.maxColors = Math.pow(2, 24) - 1;
    this.drag = document.getElementById('drag');


    this.scaleX = function (x) {
        return (x * this.scaledWidth / this.width) + this.rect.left;
    }.bind(this);

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
        _this.drag.style.visibility = 'visible';
        var clickY = e.clientY;
        var clickX = e.clientX;

        document.onmousemove = function (e) {
            _this.drag.style.top = Math.min(clickY, e.clientY) + 'px';
            _this.drag.style.left = Math.min(clickX, e.clientX) + 'px';
            _this.drag.style.height = Math.abs(clickY - e.clientY) + 'px';
            _this.drag.style.width = Math.abs(clickX - e.clientX) + 'px';
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
    var color = (((c << this.colorShift) * this.colorSpread) + this.colorOffset).toString(16);

    var hex = '#' + (fill + color).slice(-6);

    return hex;
}

Chaos.prototype.stop = function () {
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


Chaos.prototype.plot = function (x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, 1, 1);
}

Chaos.prototype.run = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.maxIterations = parseFloat(this.iterationDiv.value);
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



