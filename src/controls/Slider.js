var Scrollable = require('./Scrollable'),
    SliderData = require('../utils/SliderData');
/**
 * Simple slider with min. and max. value
 *
 * @class Slider
 * @extends GOWN.Scrollable
 * @memberof GOWN
 * @constructor
 */
// TODO: move stuff from Scrollable back here?
function Slider(theme) {
    this._skinName = this._skinName || Slider.SKIN_NAME;

    Scrollable.call(this, theme);
}

Slider.prototype = Object.create( Scrollable.prototype );
Slider.prototype.constructor = Slider;
module.exports = Slider;

Slider.SKIN_NAME = 'slider';

/**
 * set value (between minimum and maximum)
 *
 * @property value
 * @type Number
 * @default 0
 */
Object.defineProperty(Slider.prototype, 'value', {
    get: function() {
        return this._value;
    },
    set: function(value) {
        if (isNaN(value)) {
            return;
        }
        value = Math.min(value, this.maximum);
        value = Math.max(value, this.minimum);
        if (this._value === value) {
            return;
        }
        var pos = Math.round(value);
        var posNext = pos + this.step;
        var posPrev = pos - this.step;

        // inform system that value has been changed
        var sliderData = new SliderData();
        if(pos === posNext){
            sliderData.value = posNext;
        }else if(pos === posPrev){
            sliderData.value = posPrev;
        }else if(pos < posNext && pos > posPrev){
            sliderData.value = pos;
        }
        sliderData.target = this;
        if (this.change) {
            this.change(sliderData);
        }
        this.emit('change', sliderData, this);

        // move thumb
        this.positionThumb(value);

        this._value = value;
    }
});

/**
 * handle mouse move: move thumb
 *
 * @method handleMove
 * @param mouseData mousedata provided by pixi
 */
Slider.prototype.handleMove = function(mouseData) {
    if (this._start) {
        var local = mouseData.data.getLocalPosition(this);
        var xS, yS;
        if(this.direction === Scrollable.HORIZONTAL){
            xS = this.valueToPixel(this.pixToValue(local.x));
        }else {
            yS = this.valueToPixel(this.pixToValue(local.y));
        }
        if (this.moveThumb(xS, yS)) {
            // do not override localX/localY in start
            // if we do not move the thumb
            this.thumbMoved(xS, yS);
            this._start[0] = local.x;
            this._start[1] = local.y;
        }
    }
};

/**
 * handle mouse down/touch start
 * move scroll thumb clicking somewhere on the scroll bar (outside the thumb)
 *
 * @method handleDown
 * @param mouseData mousedata provided by pixi
 */
Slider.prototype.handleDown = function(mouseData) {
    var local = mouseData.data.getLocalPosition(this);
    var xS, yS;
    if(this.direction === Scrollable.HORIZONTAL){
        xS = this.valueToPixel(this.pixToValue(local.x));
    }else {
        yS = this.valueToPixel(this.pixToValue(local.y));
    }
    if (mouseData.target === this && this.moveThumb(xS, yS)) {
        this._start = [local.x, local.y];
        this.thumbMoved(xS, yS);
    }
};

Scrollable.prototype.pixToValue = function(value) {
    var max = 0;
    if (this.direction === Scrollable.HORIZONTAL) {
        max = this.maxWidth();
    } else {
        max = this.maxHeight();
    }
    var position = value / max * (this.maximum - this.minimum);
    var valueScroll = position + this.minimum;
    if (this._inverse) {
        valueScroll = max - valueScroll;
    }
    var pos = Math.floor(valueScroll);
    var posNext = pos + this.step;
    var posPrev = pos - this.step;

    if(pos === posNext){
        valueScroll = posNext;
    }else if(pos === posPrev){
        valueScroll = posPrev;
    }else if(pos < posNext && pos > posPrev){
        valueScroll = pos;
    }
    return valueScroll;
};
