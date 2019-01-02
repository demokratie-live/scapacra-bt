import { DataType } from './Scraper';

export = Documents_Parser;

namespace Documents_Parser {
    /**
     * The parser extracts the data from a defined document.
     */
    export interface IParser<T extends DataType> {
        /**
         * Extracts the data as JSON from a given data format.
         */
        parse(content: T): Promise<JSON[]>;
    }
}