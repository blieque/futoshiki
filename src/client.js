import './styles/main.scss';

import config from './config';
import Cell from './cell';
import Range from './range';

import { range } from './util';

let board;

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
    for (let i = 0; i < config.SHUFFLE_COUNT; i++) {
        cells = shuffle(cells);
        cells = mirror(cells);
    }

    return cells;
};

const createBoard = function createBoard(sideLength) {
    // Fall back to a default size puzzle if a valid size is not provided.
    if (typeof sideLength !== 'number' || sideLength < 1 || sideLength > 99) {
        sideLength = config.SIDE_LENGTH;
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
    const valueQuota = Math.round(valueCount * (0.06 + .24 * config.DIFFICULTY));
    const ineqQuota = Math.round(ineqCount * (0.06 + .24 * config.DIFFICULTY));
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
