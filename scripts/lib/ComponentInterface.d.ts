import {State} from './State';

interface ComponentInterface {
    initialState(): Promise<State>;
}
