import {State} from './State';

interface ComponentInterface {
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
}
