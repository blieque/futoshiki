import { addEventListeners } from './util';

/**
 * Class containing a cell's value and status, as well as methods for updating
 * its DOM representation.
 */
export default class Cell {
    constructor(options) {
        this.element = document.createElement('div');
        this.element.classList.add('cell');

        //if (typeof options.gtRight === 'boolean') {
        //    const equality = options.gtRight ? 'greater' : 'less';
        //    this.element.classList.add(`cell--${equality}-than-right`);
        //}
        //if (typeof options.gtBelow === 'boolean') {
        //    const equality = options.gtBelow ? 'greater' : 'less';
        //    this.element.classList.add(`cell--${equality}-than-below`);
        //}

        if (options.value) {
            this.value = options.value;
            this.element.classList.add('cell--given');
        } else {
            this._incumbentValue = 0;
            addEventListeners(this.element, Cell, this, [
                'onMouseDown',
                'onMouseUp',
                'onMouseWheel',
                ['DOMMouseScroll', 'onMouseWheel'],
                'onContextMenu',
            ]);
        }
    }

    /**
     * Setter for the value property.
     * Throws errors if the supplied value is of the wrong type or out of range.
     */
    set value(v) {
        this._value = v;
        Array.from(this.element.classList)
            .filter(c => c.startsWith('cell--value'))
            .forEach(c => this.element.classList.remove(c));
        if (v !== null) {
            this.element.classList
                .add('cell--value', `cell--value-${v}`);
            this.updateDOMValue();
        }
    }
    get value() {
        return this._value;
    }

    /**
     * When a cell's value is being changed, the cell will show the new value
     * for a short period without committing the change. The temporary value is
     * held in this property.
     */
    set incumbentValue(v) {
        if (typeof v === 'number') {
            if (v < 1) {
                v = board.sideLength;
            } else if (v > board.sideLength) {
                v = 1;
            }
            this._incumbentValue = v;

            clearTimeout(this._incumbentTimeout);
            this.element.classList.add('cell--incumbent');
            this._incumbentTimeout = setTimeout(() => {
                this.value = this._incumbentValue;
                this.element.classList.remove('cell--incumbent');
            }, 550);
        }
        this.updateDOMValue(v);
        if (v === '') {
            this.value = null;
            this._incumbentValue = 0;
        }
    }
    get incumbentValue() {
        return this._incumbentValue;
    }

    /**
     * Update the value shown in the Cell in the DOM to a given value, or the
     * object's stored value if one is not supplied.
     */
    updateDOMValue(value) {
        if (value == null) value = this._value;
        if (value != null) this.element.innerText = value;
    }

    /* EVENT HANDLERS */

    static onMouseUp(event) {
        //event.preventDefault();
        if (event.ctrlKey) {
            this.incumbentValue = '';
        } else if (event.shiftKey || event.button === 2) {
            this.incumbentValue--;
        } else {
            this.incumbentValue++;
        }
    }
    static onMouseDown(event) {
    }
    static onMouseWheel(event) {
    }
    static onContextMenu(event) {
        event.preventDefault();
    }
}
