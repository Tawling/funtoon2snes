import { Blacklist } from "../utils";

const getDefaultSettingsObject = (def) => {
    if (!def) return {};
    return Object.keys(def).reduce((acc, val) => ({ ...acc, [val]: { ...def[val], value: def[val].default } }), {});
};

export default class MemoryModule {
    constructor(moduleName, displayName, defaultEnabled = true, hidden = false) {
        this.moduleName = moduleName;
        this.displayName = displayName;
        this.enabled = defaultEnabled;
        this.hidden = hidden;
        this.tooltip = null;
        this.description = null;
        this.events = {};
        this.__setReloadUnsafe = null;
        this.__shouldRunForGame = false;
    }

    get settings() {
        if (!this._settings) {
            this._settings = getDefaultSettingsObject(this.settingDefs);
        }
        return this._settings;
    }

    /**
     * @param {boolean} unsafe
     */
    set reloadUnsafe(unsafe) {
        if (this.__setReloadUnsafe) {
            this.__setReloadUnsafe(unsafe);
        }
    }

    /**
     * Determines whether this module should run or not based on the current game tags. This will be re-ran any time the
     * game tags change.
     * @param {object} gameTags A dictionary of game tag strings for the current game. The keys are the tags, and values are all `true`.
     * @returns {boolean} Whether to run this module or not based on the current game.
     */
    shouldRunForGame(gameTags) {
        throw Error("You must implement shouldRunForGame()");
    }

    /**
     * @returns {DataRead[]} Memory addresses to be read for the next memoryReadAvailable call
     */
    getMemoryReads(globalState) {
        throw Error("You must implement getMemoryReads()");
    }

    /**
     * Executes once all memory reads are ready.
     * @param {object} memory Dictionary of memory reads for the current loop
     * @param {function} sendEvent Function to use to send custom events to FUNtoon
     * @param {object} globalState A global state object passed to each module sequentially.
     * @param {function} setRefreshUnsafe A function used to set whether the module is in a state in which it is unsafe to reload the page.
     */
    memoryReadAvailable({ memory, sendEvent, globalState, setRefreshUnsafe }) {
        throw Error("You must implement memoryReadAvailable()");
    }

    /**
     * A helper function to detect whether a read has changed at all.
     * @param {DataRead} read The DataRead to test.
     * @returns {boolean} True if the value changed from the previous read.
     */
    checkChange(read) {
        return (
            (read.prevReadValue !== undefined && read.value != read.prevReadValue) ||
            (read.value !== undefined && read.prevReadValue === undefined)
        );
    }

    /**
     * A helper function to detect whether a read has changed to and/or from a specific value or values.
     * @param {DataRead} read The DataRead to test.
     * @param {any|Array[any]|Blacklist|undefined} from The value or array of values to expect in the previous read, or undefined if any value is acceptable.
     * @param {any|Array[any]|Blacklist|undefined} to The value or array of values to expect in the current read, or undefined if any value is acceptable.
     * @returns True if the value of the read changed from any of the expected `from` values to any of the expected `to` values.
     */
    checkTransition(read, from, to) {
        const fromTrue =
            from instanceof Blacklist
                ? !from.values.some((v) => v == read.prevReadValue)
                : Array.isArray(from)
                ? from.some((v) => v == read.prevReadValue)
                : read.prevReadValue == from;
        const toTrue =
            to instanceof Blacklist
                ? !to.values.some((v) => v == read.value)
                : Array.isArray(to)
                ? to.some((v) => v == read.value)
                : read.value == to;
        return this.checkChange(read) && (from === undefined || fromTrue) && (to === undefined || toTrue);
    }

    /**
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * @param {object} settingsObj Object containing setting changes. This value will be composed with the previous settings only at the top level of the object.
     */
    setSettings({ enabled = true, ...settings }) {
        const prevSettings = { ...this.settings };
        Object.keys(settings).forEach((setting) => {
            if (this.settings[setting]) {
                this.settings[setting].value = settings[setting].value;
            }
        });

        if (enabled !== this.enabled) {
            this.setEnabled(enabled);
        }
        this.handleSettingsChanged(prevSettings, this.settings);
    }

    /**
     * Callback when settings are changed in any way, including enabled/disabled status.
     * @param {object} prevSettings
     * @param {object} newSettings
     */
    handleSettingsChanged(prevSettings, newSettings) {}

    /**
     * @returns {object} Current settings object
     */
    getSettings() {
        return this.settings;
    }
}
