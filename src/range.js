import { addEventListeners } from './util';

/**
 * Class to provide an interface to the range slider UI component.
 */
export default class Range {
    constructor(element) {
        // Get UI element objects.
        this.el = {};
        this.el.container = Range._findContainerElement(element);
        this.el.head = this.el.container.querySelector('.range__head');
        this.el.bar = this.el.container.querySelector('.range__bar');
        this.el.steps = this.el.container.querySelectorAll('.range__step');

        // Set some object properties based on the DOM.
        this.label = this.el.container.querySelector('.range__label').innerText;
        const elStepsArr = Array.from(this.el.steps);
        this.steps = elStepsArr.map(elStep => ({
            label: elStep.innerText,
            value: elStep.dataset.value,
        }));
        elStepsArr.some((elStep, i) => {
            if (elStep.dataset.default !== undefined) {
                this.index = i;
                return true;
            }
        });

        // Add event listeners and create references to other handlers that are
        // bound to the object for adding and removing by other code.
        this._onMouseMove = Range.onMouseMove.bind(this);
        this._onMouseUp = Range.onMouseUp.bind(this);
        addEventListeners(this.el.head, Range, this, [
            'onMouseDown',
        ]);
    }

    /**
     * Resolves the element given to the constructor to find the desired one
     * (`div.range__container').
     */
    static _findContainerElement(element) {
        if (element.classList.contains('range')) {
            return element.querySelector('.range__container');
        } else if (element.classList.contains('range__container')) {
            return element;
        } else if (element.classList.contains('range__subcontainer')) {
            return element.parentElement;
        }
    }

    /**
     * Wrapper around the `index' property to fetch the slider's current value.
     */
    get value() {
        return this.steps[this._index];
    }

    set index(i) {
        this._index = i;
        let percentage = i / (this.steps.length - 1);
        percentage = Math.round(10000 * percentage) / 100;
        this.el.head.style.left = `${percentage}%`;
    }
    get index() {
        return this._index;
    }

    /* EVENT HANDLERS */

    static onMouseDown(event) {
        this._dragData = {
            startX: event.clientX,
            startPercentage: this._index / (this.steps.length - 1),
            barWidth: this.el.bar.clientWidth,
            incumbentIndex: null,
        };
        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('mouseup', this._onMouseUp);
    }
    static onMouseUp(event) {
        delete this._dragData;
        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('mouseup', this._onMouseUp);
    }
    static onMouseMove(event) {
        const deltaX = event.clientX - this._dragData.startX;

        // `percentage' represents the change in the head's position as a
        // decimal, 1 being the width of the range bar. 1 is added to this so
        // that modulus operations can be performed when the value would be
        // negative. This is later subtracted again.
        let percentage = (deltaX / this._dragData.barWidth) + 1;
        const roundingMultiple = 1 / (this.steps.length - 1);
        const percentageMod = percentage % roundingMultiple;
        if (percentageMod < roundingMultiple / 2) {
            percentage -= percentageMod;
        } else {
            percentage += roundingMultiple - percentageMod;
        }
        // The starting `percentage' is added so that the head will move
        // relative to its starting position rather than the start of the bar. 1
        // is removed from the value as modulus operations are complete.
        percentage += this._dragData.startPercentage - 1;
        percentage = Math.max(Math.min(percentage, 1), 0);
        this._dragData.incumbentIndex =
            Math.round(percentage * (this.steps.length - 1));

        if (this._dragData.incumbentIndex !== this._index) {
            this.index = this._dragData.incumbentIndex;
        }
    }
}
