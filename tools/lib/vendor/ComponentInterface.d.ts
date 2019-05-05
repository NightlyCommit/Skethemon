import {State} from './State';

interface ComponentInterface {
    name: string;

    /**
     * @param {string} name
     * @param {Function} addDependency
     * @return {Promise<State>}
     */
    initialState(name?: string, addDependency?: Function): Promise<State>;

    /**
     * @param {string} name
     * @param {Function} addDependency
     * @return {Promise<*>}
     */
    data(name?: string, addDependency?: Function): Promise<any>;
}
