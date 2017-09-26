var Skinable = require('./Skinable'),
    InputController = require('../interaction/InputController');

function InputBase(isWeb, theme, settings) {
    settings = settings || {};
    this.stage = null;
    this.isWeb = isWeb;
    this._useTab = (settings.useTab || true);
    this._hasFocus = settings.hasFocus || false;
    this._mouseDown = false;
    this._tabIndex = settings.tabIndex || -1;
    this._tabGroup = settings._tabGroup || null;
    this._enterFunction = null;

    Skinable.call(this, theme);

    this.on("pointerup", this.onDown, this);

    this.on("pointerupoutside", this.onMouseUpOutside, this);

   // this.handleKeyDown = this.keyDownEvent.bind(this);

}


InputBase.prototype = Object.create( Skinable.prototype );
InputBase.prototype.constructor = InputBase;
module.exports = InputBase;

InputBase.FocusIn = 'focusIn';

InputBase.FocusOut = 'focusOut';

/**
 * @property focusGroup
 * @type FocusGroup
 */
Object.defineProperty(InputBase.prototype, 'focusGroup', {
    get: function() {
        return this._tabGroup;
    },
    set: function(focusGroup) {
        this._tabGroup = focusGroup;
    }
});

Object.defineProperty(InputBase.prototype, 'enterFunction', {
    get: function() {
        return this._enterFunction;
    },
    set: function(enterFunction) {
        this._enterFunction = enterFunction;
    }
});

InputBase.prototype.stageMouseDown = function(e) {
    console.log("stageMouseDown", e, 'this._hasFocus: ' + this._hasFocus, 'this._mouseDown: ' + this._mouseDown);

    if(this._hasFocus && this._mouseDown) {
        console.log("stageMouseDown blur");
        this.blur();
    }
};

InputBase.prototype.onMouseUpOutside = function(e) {
    console.log("onMouseUpOutside", this._hasFocus, this._mouseDown);
    this.onUp(e);
    if(this._hasFocus) {
        if(!this.isWeb) this.blur();
    }
};

// InputBase.prototype.keyDownEvent = function (e) {
//
//     if (e.which === 9) {
//         if (this._useTab && this.focusGroup) {
//             this.focusGroup.fireTab();
//             e.preventDefault();
//         }
//     }
//     else if (e.which === 38) {
//         if (this._usePrev && this.focusGroup) {
//             this.focusGroup.firePrev();
//             e.preventDefault();
//         }
//     }
//     else if (e.which === 40) {
//         if (this._useNext && this.focusGroup) {
//             this.focusGroup.fireNext();
//             e.preventDefault();
//         }
//     }
// };


InputBase.prototype.onDown = function(e) {
    this._mouseDown = true;
    console.log('onDown');
    // this.on("pointerup", this.onUp, this);
    // this.on("pointermove", this.onMove, this);
    this.focus();
    if (e) e.data.originalEvent.preventDefault();
};

InputBase.prototype.onMove = function(e) {
};

InputBase.prototype.onUp = function(e) {
    console.log("onUp");
    // this.off("pointerup", this.onUp, this);
    // this.off("pointermove", this.onMove, this);
    this._mouseDown = false;
};

InputBase.prototype.focus = function () {
    if (!this._hasFocus) {
        this._hasFocus = true;
        this._bindEvents();
        InputController.set(this);
        this.emit(InputBase.FocusIn);
    }
};

InputBase.prototype.blur = function () {
    if (this._hasFocus) {
        InputController.clear();
        this._hasFocus = false;
        this._clearEvents();
        this.emit(InputBase.FocusOut);
    }
};

/**
 * determine if the input has the focus
 *
 * @property hasFocus
 * @type Boolean
 */
Object.defineProperty(InputBase.prototype, 'hasFocus', {
    get: function() {
        return this._hasFocus;
    },
    set: function(focus) {
        this._hasFocus = focus;
    }
});

InputBase.prototype._rootStage = function () {
    var stage = this.stage || this;
    while(stage && (stage.stage || stage.parent)){
        if (stage.stage){
            stage = stage.stage;
        }else{
            stage = stage.parent;
        }
        if (stage && !stage.visible) return null;
    }
    return stage;
};

InputBase.prototype._bindEvents = function () {
    if (!this.stage) {
        this.stage = this._rootStage();
    }
    if (this.stage !== null) {
        this.stage.interactive = true;
        if(!this.isWeb) this.stage.on("pointerdown", this.stageMouseDown, this);
        //document.addEventListener("keydown", this.handleKeyDown);
    }
};

InputBase.prototype._clearEvents = function () {
    if (this.stage !== null) {
        if(!this.isWeb) this.stage.off("pointerdown", this.stageMouseDown, this);
        //document.removeEventListener("keydown", this.handleKeyDown);
    }
};
