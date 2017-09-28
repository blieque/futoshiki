const SIDE_LENGTH = 4;
const SHUFFLE_COUNT = 2;

/**
 * Float value to adjust difficulty. Lower is harder, to a point. Presets
 * correspond to:
 *  - Silly: 1
 *  - Easy: 0.75
 *  - Medium: 0.5
 *  - Hard: 0.25
 *  - (ironically) Disfunctionally easy: 0
 */
const DIFFICULTY = 0.5;

let board;

/**
 * Class to provide an interface to the range slider UI component.
 */
class Range {
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

/**
 * Class containing a cell's value and status, as well as methods for updating
 * its DOM representation.
 */
class Cell {
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

/**
 * Inserts a 2D array of Cell object elements into the DOM in the container
 * element.
 */
const insertBoardIntoDOM = function insertBoardIntoDOM(board) {
    // Remove any rows that might be left from a previous game.
    const elContainerOld = document.querySelector('.container__absolute');
    const elContainer = elContainerOld.cloneNode(false);
    elContainerOld.parentNode.replaceChild(elContainer, elContainerOld);

    // Insert the Cell object elements while wrapping them in row containers.
    board.forEach((row) => {
        const elRow = document.createElement('div');
        elRow.classList.add('container__row');
        row.forEach(cell => elRow.appendChild(cell.element));
        elContainer.appendChild(elRow);
    });
};

/**
 * Given an element, class, contect object, and an array of event handler
 * property names, this attaches event handlers to a DOM element. This is a
 * utility function useful when making UI components interactive.
 */
const addEventListeners =
    function addEventListeners(el, classObject, thisArg, handlers) {
    handlers.forEach((handlerName) => {
        let eventName;
        if (typeof handlerName === 'string') {
            eventName = handlerName.slice(2).toLowerCase();
        } else {
            eventName = handlerName[0];
            handlerName = handlerName[1];
        }
        const handler = classObject[handlerName].bind(thisArg);
        el.addEventListener(eventName, handler);
    });
};

/**
 * Generates an array containing `min', `max', and all integers between them, in
 * ascending order. If `max' < `min', an empty array is returned.
 */
const range = function range(min, max) {
    const arr = [];
    for (i = min; i <= max; i++) {
        arr.push(i);
    }
    return arr;
};

/**
 * Shuffles the items of an array by picking them at random and pushing them to
 * a new array which is returned.
 */
const shuffle = function shuffle(arr) {
    const newArr = arr.slice();
    for (let i = arr.length; i > 0; i--) {
        const index = Math.floor(Math.random() * i);
        newArr.push(...newArr.splice(index, 1));
    }
    return newArr;
};

/**
 * Mirror's a 2D array by effectively switching its axes. The first members of
 * each sub-array become members of a new first sub-array, and so on.
 */
const mirror = function mirror(cells) {
    return cells[0].map((j, i) => {
        return cells.map(k => k[i]);
    });
};

/**
 * Generates a new 2D array of values to become a puzzle.
 */
const generateGrid = function generateGrid(sideLength) {
    let cells = [];

    // Populate the table with boring but valid values.
    for (let y = 0; y < sideLength; y++) {
        const row = range(1, sideLength);
        row.push(...row.splice(0, y));
        cells.push(row);
    }

    // Shuffle the columns, mirror the grid, and repeat a few times.
    for (let i = 0; i < SHUFFLE_COUNT; i++) {
        cells = shuffle(cells);
        cells = mirror(cells);
    }

    return cells;
};

const createBoard = function createBoard(sideLength) {
    // Fall back to a default size puzzle if a valid size is not provided.
    if (typeof sideLength !== 'number' || sideLength < 1 || sideLength > 99) {
        sideLength = SIDE_LENGTH;
    }

    // Generate a board of values and create an array to hold Cell objects.
    const cells = generateGrid(sideLength);
    const board = [];
    board.sideLength = sideLength;

    // Set some quotas and specific IDs for the number of inequalities and
    // values to show.
    // Di = Esy, Med, Hrd
    // vQ = 24%, 18%, 12%
    // iQ = 24%, 18%, 12%
    const valueCount = sideLength ** 2;
    const ineqCount = 2 * sideLength * (sideLength - 1);
    const valueQuota = Math.round(valueCount * (0.06 + .24 * DIFFICULTY));
    const ineqQuota = Math.round(ineqCount * (0.06 + .24 * DIFFICULTY));
    const valueIDs = [];
    const ineqIDs = [];
    let ids = range(0, valueCount - 1);
    for (let i = 0; i < valueQuota; i++) {
        const index = Math.floor(Math.random() * ids.length);
        valueIDs.push(...ids.splice(index, 1));
    }
    ids = range(0, ineqCount - 1);
    for (let i = 0; i < ineqQuota; i++) {
        const index = Math.floor(Math.random() * ids.length);
        ineqIDs.push(...ids.splice(index, 1));
    }

    // Iterate over the grid and create Cell objects for each value, randomly
    // picking some to show their values and and equality indicators.
    const current = {
        value: 0,
        ineq: 0,
    };
    for (let y = 0; y < sideLength; y++) {
        board[y] = [];
        for (let x = 0; x < sideLength; x++) {
            const options = {};

            let gtRight;
            if (x < sideLength - 1) {
                if (ineqIDs.includes(current.ineq)) {
                    options.gtRight = cells[y][x] > cells[y][x + 1];
                }
                current.ineq++;
            }

            let gtBelow;
            if (y < sideLength - 1) {
                if (ineqIDs.includes(current.ineq)) {
                    options.gtBelow = cells[y][x] > cells[y + 1][x];
                }
                current.ineq++;
            }

            if (valueIDs.includes(current.value)) options.value = cells[y][x];
            current.value++;

            board[y][x] = new Cell(options);
        }
    }

    // Insert the game board into the DOM.
    insertBoardIntoDOM(board);

    return board;
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialise
    board = createBoard();

    // Create UI component class instances
    Array.from(document.querySelectorAll('.range'))
        .map(elRange => new Range(elRange.querySelector('.range__container')));
});
