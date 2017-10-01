export default {
    /**
     * Initial puzzle side length when loading the game.
     */
    SIDE_LENGTH: 4,

    /**
     * Number of times to shuffle the columns and rotate the board. At least 2
     * is required in order to shuffle both axes, but above that I think is
     * actually pointless.
     */
    SHUFFLE_COUNT: 2,

    /**
     * Float value to adjust difficulty. Lower is harder, to a point. Presets
     * correspond to:
     *  - Silly: 1
     *  - Easy: 0.75
     *  - Medium: 0.5
     *  - Hard: 0.25
     *  - (ironically) Disfunctionally easy: 0
     */
    DIFFICULTY: 0.5,
};
