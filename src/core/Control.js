var resizeScaling = require('../utils/resizeScaling');
var mixin = require('../utils/mixin');

/**
 * base for all UI controls (see ../controls/)
 *
 * based on pixi-DisplayContainer that supports adding children, so all
 * controls are container
 * @class Control
 * @extends PIXI.Container
 * @memberof GOWN
 * @constructor
 */
function Control() {
    PIXI.Container.call(this);
    this.enabled = this.enabled !== false;
    // assume all controls are interactive
    this.interactive = true;

    this.initResizeScaling();
}

Control.prototype = Object.create( PIXI.Container.prototype );
Control.prototype.constructor = Control;
module.exports = Control;

/**
 * change the theme (every control can have a theme, even if it does not
 * inherit Skinable, e.g. if there is only some color in the skin that will
 * be taken or if it has some skinable components as children)
 *
 * @method setTheme
 * @param theme the new theme {Theme}
 */
Control.prototype.setTheme = function(theme) {
    if (theme === this.theme && theme) {
        return;
    }

    this.theme = theme;
    this.invalidSkin = true;
};

Control.prototype.updateTransformContainer = PIXI.Container.prototype.updateTransform;
/**
 * PIXI method to update the object transform for rendering
 * Used to call redraw() before rendering
 *
 * @method updateTransform
 */
Control.prototype.updateTransform = function() {
    if (!this.parent) {
        return;
    }
    if (this.redraw) {
        this.redraw();
    }
    this.updateTransformContainer();
};

/**
 * get local mouse position from PIXI.InteractionData
 *
 * @method mousePos
 * @returns {PIXI.Point}
 */
Control.prototype.mousePos = function(e) {
    return e.data.getLocalPosition(this);
};

/**
 * Enables/Disables the control.
 * (not implemented yet)
 *
 * @property enabled
 * @type Boolean
 */
Object.defineProperty(Control.prototype, 'enabled', {
    get: function() {
        return this._enabled;
    },
    set: function(value) {
        this._enabled = value;
    }
});

mixin(Control.prototype, resizeScaling);
