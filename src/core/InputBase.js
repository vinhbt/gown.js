var Skinable = require('./Skinable'),
    InputController = require('../interaction/InputController');

function InputBase(theme, settings) {
    settings = settings || {};
    this.stage = null;
    this._useTab = this._usePrev = this._useNext = (settings.useTab || false);
    this._hasFocus = settings.hasFocus || false;
    this._mouseDown = false;
    Skinable.call(this, theme);


    this.on("pointerdown", this.onDown, this);

    this.on("pointerupoutside", this.onMouseUpOutside, this);
    //var cancelFocusEvent = new ClickEvent(this.stage)
}


InputBase.prototype = Object.create( Skinable.prototype );
InputBase.prototype.constructor = InputBase;
module.exports = InputBase;

InputBase.prototype.setTabInfo = function (tabIndex, tabGroup) {
    InputController.registrer(this, tabIndex, tabGroup);
};

InputBase.prototype.documentMouseDown = function() {
    console.log('documentMouseDown', this._hasFocus, this._mouseDown);
    if(this._hasFocus && !this._mouseDown) {
        this.blur();
    }
};

InputBase.prototype.onMouseUpOutside = function() {
    console.log('onMouseUpOutside', this._hasFocus, this._mouseDown);
    this.documentMouseDown();
    this._mouseDown = false;
};

InputBase.prototype.keyDownEvent = function (e) {
    if (e.which === 9) {
        if (this._useTab) {
            InputController.fireTab();
            e.preventDefault();
        }
    }
    else if (e.which === 38) {
        if (this._usePrev) {
            InputController.firePrev();
            e.preventDefault();
        }
    }
    else if (e.which === 40) {
        if (this._useNext) {
            InputController.fireNext();
            e.preventDefault();
        }
    }
};


InputBase.prototype.onDown = function(e) {
    this._mouseDown = true;
    this.focus();
    console.log('onDown', this._hasFocus, this._mouseDown);
};

InputBase.prototype.onUp = function(e) {
    this._mouseDown = false;
    console.log('onUp', this._hasFocus, this._mouseDown);
};

InputBase.prototype.focus = function () {
    if (!this._hasFocus) {
        this._hasFocus = true;
        this._bindEvents();
        InputController.set(this);
        this.emit("focusIn");
    }
};

InputBase.prototype.blur = function () {
    if (this._hasFocus) {
        InputController.clear();
        this._hasFocus = false;
        this._clearEvents();
        this.emit("focusOut");
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
    }
    return stage;
};
InputBase.prototype._bindEvents = function () {
    this.on("pointerup", this.onUp);
    if (this.stage === null){
        this.stage = this._rootStage();
    }
    if (this.stage !== null) {
        this.stage.interactive = true;
        this.stage.on("pointerdown", this.documentMouseDown.bind(this), this);
        document.addEventListener("keydown", this.keyDownEvent, false);
    }
};

InputBase.prototype._clearEvents = function () {
    this.off("pointerup", this.onUp, this);

    if (this.stage !== null) {
        this.stage.off("pointerdown", this.documentMouseDown.bind(this), this);
        document.removeEventListener("keydown", this.keyDownEvent, false);
    }
};
