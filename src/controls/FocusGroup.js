/**
 * Controls Focus of group.
 *
 * @class FocusGroup
 * @memberof GOWN
 * @constructor
 */
function FocusGroup(){
	this._currentItem = undefined;
    this._items = [];
}

FocusGroup.prototype = Object.create(Object.prototype);
FocusGroup.prototype.constructor = FocusGroup;
module.exports = FocusGroup;


// add focus able item with tabIndex
FocusGroup.prototype.addItem = function (item, tabIndex) {

    var i = this._items.indexOf(item);
    if (i === -1) {
        item._tabIndex = tabIndex !== undefined ? tabIndex : -1;
        this._items.push(item);
        this._items.sort(function (a, b) {
            if (a._tabIndex < b._tabIndex)
                return -1;
            if (a._tabIndex > b._tabIndex)
                return 1;
            return 0;
        });
    }
};

FocusGroup.prototype.set = function (item) {
    if (this._currentItem && this._currentItem !== item && typeof this._currentItem.blur === "function")
        this._currentItem.blur();
    this._currentItem = item;
};

FocusGroup.prototype.clear = function () {
    this._currentItem = undefined;
};

FocusGroup.prototype.fireTab = function () {
    if (this._currentItem) {
        var i = this._items.indexOf(this._currentItem) + 1;
        if (i >= this._items.length) i = 0;
        var item = this._items[i];
        if (item && this._currentItem !== item && typeof item.focus === "function") item.focus();
    }
};

FocusGroup.prototype.fireNext = function () {
    if (this._currentItem) {
        var i = this._items.indexOf(this._currentItem) + 1;
        if (i >= this._items.length) i = this._items.length - 1;
        var item = this._items[i];
        if (item && this._currentItem !== item && typeof item.focus === "function") item.focus();
    }
};

FocusGroup.prototype.firePrev = function () {
    if (this._currentItem) {
        var i = this._items.indexOf(this._currentItem) - 1;
        if (i < 0) i = 0;
        var item = this._items[i];
        if (item && this._currentItem !== item && typeof item.focus === "function") item.focus();
    }
};
