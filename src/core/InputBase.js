var Skinable = require('./Skinable'),
    InputController = require('../interaction/InputController');

function InputBase(theme, settings) {
    settings = settings || {};
    this.stage = null;
    this._useTab = this._usePrev = this._useNext = (settings.useTab || true);
    this._hasFocus = settings.hasFocus || false;
    this._mouseDown = false;
    this._tabIndex = settings.tabIndex || -1;
    this._focusGroup = settings.focusGroup || null;
    Skinable.call(this, theme);

    this.on("pointerdown", this.onDown, this);

    this.on("pointerupoutside", this.onMouseUpOutside, this);

    this.handleKeyDown = this.keyDownEvent.bind(this);

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
        return this._focusGroup;
    },
    set: function(focusGroup) {
        this._focusGroup = focusGroup;
    }
});

InputBase.prototype.setTabInfo = function (tabIndex, focusGroup) {
    if (this.focusGroup === focusGroup) return;
    if (focusGroup) {
        focusGroup.addItem(this, tabIndex);
    }
    this.focusGroup = focusGroup;
};

InputBase.prototype.stageMouseDown = function(e) {
    console.log("stageMouseDown", e);
    if(this._hasFocus && !this._mouseDown) {
        console.log("stageMouseDown blur");
        this.blur();
    }
};

InputBase.prototype.onMouseUpOutside = function(e) {
    console.log("onMouseUpOutside", this._hasFocus, this._mouseDown);
    this.onUp(e);
    if(this._hasFocus) {
        this.blur();
    }
};

InputBase.prototype.keyDownEvent = function (e) {

    if (e.which === 9) {
        if (this._useTab && this.focusGroup) {
            this.focusGroup.fireTab();
            e.preventDefault();
        }
    }
    else if (e.which === 38) {
        if (this._usePrev && this.focusGroup) {
            this.focusGroup.firePrev();
            e.preventDefault();
        }
    }
    else if (e.which === 40) {
        if (this._useNext && this.focusGroup) {
            this.focusGroup.fireNext();
            e.preventDefault();
        }
    }
};


InputBase.prototype.onDown = function(e) {
    this._mouseDown = true;
    console.log('onDown');
    //this._clearEvents();
    this.on("pointerup", this.onUp, this);
    this.on("pointermove", this.onMove, this);
    this.focus();

};

InputBase.prototype.onMove = function(e) {
};

InputBase.prototype.onUp = function(e) {
    console.log("onUp");
    this.off("pointerup", this.onUp, this);
    this.off("pointermove", this.onMove, this);
    this._mouseDown = false;
};

InputBase.prototype.focus = function () {
    if (!this._hasFocus) {
        this._hasFocus = true;
        this._bindEvents();
        if (this.focusGroup) this.focusGroup.set(this);
        this.emit(InputBase.FocusIn);
    }
};

InputBase.prototype.blur = function () {
    if (this._hasFocus) {
        if (this.focusGroup) this.focusGroup.clear();
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
    console.log("_bindEvents");
    if (!this.stage) {
        this.stage = this._rootStage();
    }
    if (this.stage !== null) {
        console.log("_bindEvents Ok");
        this.stage.interactive = true;
        this.stage.on("pointerdown", this.stageMouseDown, this);
        document.addEventListener("keydown", this.handleKeyDown);
    }
};

InputBase.prototype._clearEvents = function () {
    console.log("_clearEvents onUp");
    if (this.stage !== null) {
        console.log('remove event');
        this.stage.off("pointerdown", this.stageMouseDown, this);
        document.removeEventListener("keydown", this.handleKeyDown);
    }
};
