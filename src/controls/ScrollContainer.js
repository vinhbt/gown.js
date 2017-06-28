var Scroller = require('./Scroller');

/**
 * @class ScrollContainer
 * @extends GOWN.Scroller
 * @memberof GOWN
 * @constructor
 */
function ScrollContainer(theme) {
    Scroller.call(this, theme);
    this.sdScrollBar = undefined;
}

ScrollContainer.prototype = Object.create( Scroller.prototype );
ScrollContainer.prototype.constructor = ScrollContainer;
module.exports = ScrollContainer;

ScrollContainer.prototype.updateScrollBar = function() {
    this.sdScrollBar.moveThumb(
        Math.floor(
            -this.viewPort.x / (this.viewPort.width - this.width) * (this.sdScrollBar.width - this.sdScrollBar.thumb.width)
        ),
        Math.floor(
            -this.viewPort.y / (this.viewPort.height - this.height) * (this.sdScrollBar.height - this.sdScrollBar.thumb.height)
        )
    );
};

ScrollContainer.prototype.scrollContainerCheckForDrag = Scroller.prototype.checkForDrag;

ScrollContainer.prototype.checkForDrag = function (currentTouch) {
    this.scrollContainerCheckForDrag(currentTouch);
    if(this.sdScrollBar && this.sdScrollBar.thumb && this.viewPort){
        if (this._isScrollingStopped) {
            return;
        }
        this.updateScrollBar();
    }
};

ScrollContainer.prototype.updateVerticalScrollFromTouchPosition = function (touchY, isScrollBar) {
    var offset, position;
    if (isScrollBar) {
        offset = touchY;
    } else {
        offset = touchY - this._startTouch.y;
    }
    if(isScrollBar) {
        position = offset;
    }else {
        position = this._startScrollPosition.y + offset;
    }
    if (this.viewPort.height > this.height) {
        position = Math.min(position, 0);
        if (this.viewPort.height && this.viewPort.y < 0) {
            position = Math.max(position, -(this.viewPort.height - this.height));
        }
        this.viewPort.y = Math.floor(position);
    }
    this.verticalScrollPosition = position;
};
