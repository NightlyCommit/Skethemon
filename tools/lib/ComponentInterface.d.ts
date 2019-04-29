import {State} from './State';

interface ComponentInterface extends IterableIterator {
    name: string;

    /**
     * @param {string|null} name
     * @return {Promise<State>}
     */
    initialState(name = null): Promise<State>;

    /**
     * @return {Promise<*>}
     */
    data(): Promise<any>;

    /**
     * @param {string} separator
     */
    fqn(separator?): string;
}
