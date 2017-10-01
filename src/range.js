import { addEventListeners } from './util';

/**
 * Class to provide an interface to the range slider UI component.
 */
export default class Range {
    constructor(element) {
        this.el = {};
        this.el.container = Range._findContainerElement(element);
        this.el.head = this.el.container.querySelector('.range__head');
        this.el.bar = this.el.container.querySelector('.range__bar');
        this.el.steps = this.el.container.querySelectorAll('.range__step');

        this.label = this.el.container.querySelector('.range__label').innerText;
        this.steps = Array.from(this.el.steps).map(elStep => ({
            label: elStep.innerText,
            value: elStep.dataset.value,
        }));

        this._onMouseMove = Range.onMouseMove.bind(this);
        this._onMouseUp = Range.onMouseUp.bind(this);
        addEventListeners(this.el.head, Range, this, [
            'onMouseDown',
            //'onMouseMove',
            //'onMouseUp',
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
        console.log(this.value);
    }
    get index() {
        return this._index;
    }

    /* EVENT HANDLERS */

    static onMouseDown(event) {
        this.dragData = {
            startX: event.clientX,
            barWidth: this.el.bar.clientWidth,
            incumbentIndex: null,
        };
        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('mouseup', this._onMouseUp);
    }
    static onMouseUp(event) {
        delete this.dragData;
        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('mouseup', this._onMouseUp);
    }
    static onMouseMove(event) {
        const deltaX = event.clientX - this.dragData.startX;

        let percentage = deltaX / this.dragData.barWidth;
        const roundingMultiple = 1 / (this.steps.length - 1);
        const percentageMod = percentage % roundingMultiple;
        if (percentageMod < roundingMultiple / 2) {
            percentage -= percentageMod;
        } else {
            percentage += roundingMultiple - percentageMod;
        }
        percentage = Math.max(Math.min(percentage, 1), 0);
        this.dragData.incumbentIndex =
            Math.round(percentage * (this.steps.length - 1));

        if (this.dragData.incumbentIndex !== this._index) {
            this.index = this.dragData.incumbentIndex;
        }
    }
}
