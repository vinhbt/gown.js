var InputWrapper = require('./InputWrapper'),
    InputControl = require('../controls/InputControl');

/**
 * Wrapper for InputControl to use the browser DOM Text Input.
 * this is the prefered input for Text in GOWN.
 *
 * We let the DOM object handle selection and text input!
 *
 * See KeyboardWrapper for text input outside of the browser (e.g. cocoon.js)
 *
 * based on PIXI.Input InputObject by Sebastian Nette,
 * see https://github.com/SebastianNette/PIXI.Input
 *
 * @class DOMInputWrapper
 * @memberof GOWN
 */
function DOMInputWrapper(manager) {
    // we do not need to handle selection and text content ourself -
    // there is a DOM element that stores text and selection for us.

    InputWrapper.call(this, manager, DOMInputWrapper.name);

    this.tagName = 'input';
    this.selectionStart = 0;
    this._maxChars = 0;
    this.eventsAdded = [];
}

DOMInputWrapper.prototype = Object.create(InputWrapper.prototype);
DOMInputWrapper.prototype.constructor = DOMInputWrapper;
module.exports = DOMInputWrapper;

DOMInputWrapper.name = 'dom_input';

/**
 * DOM input field.
 *
 * @property hiddenInput
 * @type Object
 * @static
 */
DOMInputWrapper.hiddenInput = {
    'input': null,
    'textarea': null
};

/**
 * create/return unique input field.
 * @param tagName used dom element (input or textarea)
 * @returns {DOMObject}
 */
DOMInputWrapper.prototype.createInput = function (tagName) {
    this.tagName = tagName;
    if (!DOMInputWrapper.hiddenInput[tagName]) {
        var domInput = document.createElement(tagName);
        domInput.setAttribute("type", "text");
        domInput.setAttribute("autocapitalize", "none");
        document.body.appendChild(domInput);
        this.hideInput(domInput);
        this.addEventListener(domInput);
        DOMInputWrapper.hiddenInput[tagName] = domInput;
    }
};

/**
 * use CSS style to hide DOM input or textarea
 */
DOMInputWrapper.prototype.hideInput = function (domInput) {
    domInput.tabindex = -1;
    domInput.style.position = 'fixed';
    domInput.style.opacity = 0;
    domInput.style.pointerEvents = 'none';
    domInput.style.left = '0px';
    domInput.style.bottom = '0px';
    domInput.style.left = '-100px';
    domInput.style.top = '-100px';
    domInput.style.zIndex = 10;

    // domInput.style.position = 'fixed';
    // domInput.style.zIndex = 99999999999999;
};

/**
 * add keyboard events for DOM elements
 */
DOMInputWrapper.prototype.addEventListener = function (domInput) {
    if (this.eventsAdded.indexOf(this.tagName) < 0) {
        this.eventsAdded.push(this.tagName);
        this._onKeyDown = this.onKeyDown.bind(this);
        this._onKeyUp = this.onKeyUp.bind(this);
        // add blur handler
        domInput.addEventListener('blur', this.onBlur, false);
        // on key up
        document.addEventListener('keyup', this._onKeyUp);
        document.addEventListener('keydown', this._onKeyDown);
    }
    //this.eventsAdded = true;
};

/**
 * remove keyboard events for DOM elements
 */
DOMInputWrapper.prototype.removeEventListener = function (domInput) {
    if (this.eventsAdded.indexOf(this.tagName) >= 0) {
        this.eventsAdded.splice(this.eventsAdded.indexOf(this.tagName), 1);
        // add blur handler
        domInput.removeEventListener('blur', this.onBlur, false);
        // on key up
        document.removeEventListener('keyup', this._onKeyUp);
        document.removeEventListener('keydown', this._onKeyDown);

        this._onKeyDown = null;
        this._onKeyUp = null;
    }
    //this.eventsAdded = false;
};

DOMInputWrapper.prototype.onBlur = function () {
    if (InputControl.currentInput) {
        InputControl.currentInput.onMouseUpOutside();
    }
};

DOMInputWrapper.prototype.onKeyUp = function (event) {
    this.manager._keyUpEvent(event);
};

DOMInputWrapper.prototype.onKeyDown = function (event) {
    this.manager._keyDownEvent(event);
};

/**
 * key to get text ('value' for default input field)
 * @type {string}
 * @static
 * @private
 */
DOMInputWrapper.textProp = 'value';

/**
 * set device for dom input
 */
DOMInputWrapper.platform = 'web';

/**
 * activate the dom text input / text area
 * if the InputControl receives the text or not is defined in the focus function
 * of the InputControl itself. There
 */
DOMInputWrapper.prototype.focus = function (tagName) {
    this.tagName = tagName;
    if (DOMInputWrapper.hiddenInput[this.tagName]) {
        var _this = this;
        setTimeout(function (args) {
            DOMInputWrapper.hiddenInput[_this.tagName].focus();
        }, 150)
    }
};


/**
 * deactivate the text input
 * blurs ALL hiddenInputs
 */
DOMInputWrapper.prototype.blur = function () {
    if (DOMInputWrapper.hiddenInput[this.tagName]) {
        DOMInputWrapper.hiddenInput[this.tagName].blur();
    }
};

/**
 * The text content
 *
 * @property text
 * @type String
 */
Object.defineProperty(DOMInputWrapper.prototype, 'text', {
    get: function () {
        var textProp = DOMInputWrapper.textProp;
        var txt = DOMInputWrapper.hiddenInput[this.tagName][textProp];
        return txt.replace(/\r/g, '');
    },
    set: function (value) {
        var textProp = DOMInputWrapper.textProp;
        DOMInputWrapper.hiddenInput[this.tagName][textProp] = value;
    }
});


DOMInputWrapper.prototype.updateSelection = function (start, end) {
    if (DOMInputWrapper.hiddenInput[this.tagName].selectionStart !== start ||
        DOMInputWrapper.hiddenInput[this.tagName].selectionEnd !== end) {
        if (start < end) {
            DOMInputWrapper.hiddenInput[this.tagName].selectionStart = start;
            DOMInputWrapper.hiddenInput[this.tagName].selectionEnd = end;
        } else {
            DOMInputWrapper.hiddenInput[this.tagName].selectionStart = end;
            DOMInputWrapper.hiddenInput[this.tagName].selectionEnd = start;
        }
        return true;
    } else {
        return false;
    }
};

Object.defineProperty(DOMInputWrapper.prototype, 'selection', {
    get: function () {
        return [
            DOMInputWrapper.hiddenInput[this.tagName].selectionStart,
            DOMInputWrapper.hiddenInput[this.tagName].selectionEnd
        ];
    }
});

/**
 * The input text type
 *
 * @property type
 * @type String
 */
Object.defineProperty(DOMInputWrapper.prototype, 'type', {
    get: function () {
        if (DOMInputWrapper.hiddenInput[this.tagName]) {
            return DOMInputWrapper.hiddenInput[this.tagName].getAttribute('type');
        }
        return 'text';
    },
    set: function (value) {
        if (DOMInputWrapper.hiddenInput[this.tagName]) {
            return DOMInputWrapper.hiddenInput[this.tagName].setAttribute('type', value);
        }
    }
});


/**
 * set max. length setting it to 0 will allow unlimited text input
 * @param length
 */
Object.defineProperty(DOMInputWrapper.prototype, 'maxChars', {
    get: function () {
        return this._maxChars;
    },
    set: function (value) {
        if (this._maxChars !== value && DOMInputWrapper.hiddenInput[this.tagName]) {
            this._maxChars = value;
            if (!value || value < 0) {
                DOMInputWrapper.hiddenInput[this.tagName].removeAttribute('maxlength');
            } else {
                DOMInputWrapper.hiddenInput[this.tagName].setAttribute('maxlength', value);
            }
        }
    }
});

/**
 * set cursor position of the hidden input
 */
DOMInputWrapper.prototype.setCursorPos = function (pos) {
    console.log('DOMInputWrapper->setCursorPos', pos);
    if (DOMInputWrapper.hiddenInput[this.tagName]) {
        var elem = DOMInputWrapper.hiddenInput[this.tagName];
        if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', pos);
            range.select();
        }
        else {
            if (elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(pos, pos);
            }
            else
                elem.focus();
        }
    }
};


