var _currentItem;
var tabGroups = {};

var InputController = {
    register: function (item, tabIndex, tabGroup) {
        var groupName = tabGroup || "default";

        var items = tabGroups[groupName];
        if (!items)
            items = tabGroups[groupName] = [];

        var i = items.indexOf(item);
        if (i === -1) {
            item._tabIndex = tabIndex !== undefined ? tabIndex : -1;
            item._tabGroup = tabGroup;
            items.push(item);
            items.sort(function (a, b) {
                if (a._tabIndex < b._tabIndex)
                    return -1;
                if (a._tabIndex > b._tabIndex)
                    return 1;
                return 0;
            });
        }
    },
    remove: function (groupName) {
        var items = tabGroups[groupName];
        if (!items) {
            if (_currentItem && items.indexOf(_currentItem) > 0){
                _currentItem = undefined;
            }
            delete tabGroups[groupName];
        }
    },
    set: function (item) {
        if (_currentItem && typeof _currentItem.blur === "function")
            _currentItem.blur();
        _currentItem = item;
    },
    items: function () {
        if (_currentItem && _currentItem._tabGroup){
            return tabGroups[_currentItem._tabGroup];
        }
        return [];
    },
    findNextItem: function () {
        if (_currentItem && _currentItem._tabGroup){
            var items = tabGroups[_currentItem._tabGroup];
            var count = 0, found = false;
            var i = items.indexOf(_currentItem);
            while (count < items.length && !found) {
                count ++;
                i++;
                if (i >= items.length) i = 0;
                if (items[i].enabled && items[i]._useTab && typeof items[i].focus === "function"){
                    found = true;
                }
            }
            if (found) {
                return tabGroups[_currentItem._tabGroup][i];
            }
        }
        return null;
    },
    findPrevItem: function () {
        if (_currentItem && _currentItem._tabGroup){
            var items = tabGroups[_currentItem._tabGroup];
            var count = 0, found = false;
            var i = items.indexOf(_currentItem);
            while (count < items.length && !found) {
                count ++;
                i--;
                if (i < 0) i = items.length - 1;
                if (items[i].enabled && items[i]._useTab && typeof items[i].focus === "function"){
                    found = true;
                }
            }
            if (found) {
                return tabGroups[_currentItem._tabGroup][i];
            }
        }
        return null;
    },
    clear: function () {
        _currentItem = undefined;
    },
    fireTab: function () {
        console.log('fireTab', _currentItem);
        if (_currentItem) {
            var item = InputController.findNextItem();
            if (item){
                item.focus(true);
                return true;
            }
        }
        return false;
    },
    fireNext: function () {
        console.log('fireNext', _currentItem);
        if (_currentItem) {
            var item = InputController.findNextItem();
            if (item){
                item.focus(true);
                return true;
            }
        }
        return false;
    },
    firePrev: function () {
        console.log('firePrev', _currentItem);
        if (_currentItem) {
            var item = InputController.findPrevItem();
            if (item){
                item.focus(true);
                return true;
            }
        }
        return false;
    },
    enter: function () {
        if (_currentItem && _currentItem.enterFunction !== null) {
            _currentItem.enterFunction();
            return true;
        }
        return false;
    },
    keyDownEvent: function (e) {
        if (e.which === 9) {
            if (InputController.fireTab()) {
                e.preventDefault();
            }
        }
        else if (e.which === 38) {
            if (InputController.firePrev()) {
                e.preventDefault();
            }
        }
        else if (e.which === 40) {
            if (InputController.fireNext()) {
                e.preventDefault();
            }
        }
        else if (e.which === 13){
            if (InputController.enter()) {
                e.preventDefault();
            }
        }
    }
};


module.exports = InputController;
