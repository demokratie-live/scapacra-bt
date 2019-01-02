import { IScraperConfiguration } from '../importer/Scraper';
import { IBrowser } from '../importer/Browser';
import { IParser } from '../importer/Parser';
import { URL } from 'url';
import { Pdf, ProposedDecisionBrowser } from '../browser/ProposedDecisionBrowser';
import { ProposedDecisionParser } from '../parser/ProposedDecisionParser';

export = Documents_Config;

namespace Documents_Config {
    export interface IProposedDecisionScraperConfigurationOptions {
        maxCount: number;
    }

    export class ProposedDecisionScraperConfiguration implements IScraperConfiguration<Pdf> {
        private options: IProposedDecisionScraperConfigurationOptions;

        constructor(options: IProposedDecisionScraperConfigurationOptions) {
            this.options = options;
        }

        public getURL(): URL {
            return new URL("https://www.bundestag.de");
        }
        public getBrowser(): IBrowser<Pdf> {
            return new ProposedDecisionBrowser({
                maxCount: this.options.maxCount
            });
        }
        public getParser(): IParser<Pdf> {
            return new ProposedDecisionParser();
        }
    }
}