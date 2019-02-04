import { IDataPackage, IParser } from '@democracy-deutschland/scapacra';
var moment = require('moment');

import { NamedPoll } from '../browser/NamedPollBrowser';

export = Deputy_Parser;

namespace Deputy_Parser {
    /**
     * This parser gets all potention fraction votings from a "Plenarprotokoll" of the german Bundestag.
     */
    export class NamedPollParser implements IParser<NamedPoll>{
        private async readStream(stream: NodeJS.ReadableStream): Promise<string> {
            return new Promise((resolve) => {
                let string: string = '';
                stream.on('data', function (buffer) {
                    string += buffer.toString();
                }).on('end', () => {
                    resolve(string);
                });
            });
        }
        public async parse(data: IDataPackage<NamedPoll>): Promise<IDataPackage<any>[]> {
            const stream = data.data.openStream();

            const string = await this.readStream(stream);
            const base_url: string = 'https://www.bundestag.de'

            let m;

            //id
            let id: string | null = null;
            if (data.metadata.url) {
                const regex_id = /id=(.*)/gm;
                while ((m = regex_id.exec(data.metadata.url)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex_id.lastIndex) {
                        regex_id.lastIndex++;
                    }
                    // The result can be accessed through the `m`-variable.
                    m.forEach((match, group) => {
                        if (group === 1) {
                            id = match
                        }
                    });
                }
            }

            // date, titel, subtitel, documents, status
            let date: Date | null = null;
            let title: string = '';
            let description: string = '';
            let documents: string[] = [];
            const regex_dateTitleDescription = /<article [\s\S]*?>[\s\S]*?<h3>[\s\S]*?<span class="bt-dachzeile">([\s\S]*?)<\/span>[\s\S]*?<br\/>([\s\S]*?)<\/h3>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/article>/gm;
            const regex_documents = /href="(.*?)"/gm;
            while ((m = regex_dateTitleDescription.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_dateTitleDescription.lastIndex) {
                    regex_dateTitleDescription.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        date = moment(match, 'DD MMM YYYY', 'de').toDate();
                    }
                    if (group === 2) {
                        title = match;
                    }
                    if (group === 3) {
                        description = match;
                    }
                });
            }
            while ((m = regex_documents.exec(description)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_documents.lastIndex) {
                    regex_documents.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        documents.push(match);
                    }
                });
            }

            //deputy votes url
            let deputyVotesURL: string = '';
            const regex_deputyVotesURL = /data-dataloader-url="(.*?)"/gm;
            while ((m = regex_deputyVotesURL.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_deputyVotesURL.lastIndex) {
                    regex_deputyVotesURL.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        deputyVotesURL = base_url + match;
                    }
                });
            }

            // membersVoted, ResultAll
            let membersVoted: string = '';
            let resultAll: any = { yes: null, no: null, abstain: null, na: null };// TODO Typescript
            let resultAll_sel: string = '';
            const regex_membersVotedResultAll = /<h3>Gesamtergebnis, (.*?) Mitglieder<\/h3>[\s\S]*?<ul class="bt-chart-legend">([\s\S]*?)<\/ul>/gm;
            const regex_ResultAll = /<li class="bt-legend-ja"><span>(.*?)<\/span>[\s\S]*?<li class="bt-legend-nein"><span>(.*?)<\/span>[\s\S]*?<li class="bt-legend-enthalten"><span>(.*?)<\/span>[\s\S]*?<li class="bt-legend-na"><span>(.*?)<\/span>[\s\S]*?/gm;
            while ((m = regex_membersVotedResultAll.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_membersVotedResultAll.lastIndex) {
                    regex_membersVotedResultAll.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        membersVoted = match;
                    }
                    if (group === 2) {
                        resultAll_sel = match;
                    }
                });
            }
            while ((m = regex_ResultAll.exec(resultAll_sel)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_ResultAll.lastIndex) {
                    regex_ResultAll.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        resultAll.yes = match;
                    }
                    if (group === 2) {
                        resultAll.no = match;
                    }
                    if (group === 3) {
                        resultAll.abstain = match;
                    }
                    if (group === 4) {
                        resultAll.na = match;
                    }
                });
            }

            // Party Votes
            let partyVotes: any = []; // TODO Typescript
            const regex_partyVotes = /<div class="bt-teaser-chart-solo" data-value="(.*)?">[\s\S]*?<h4 class="bt-chart-fraktion">[\s\S]*?<span>(.*?)Mitglieder<\/span>[\s\S]*?<\/h4>[\s\S]*?<div class="bt-teaser-text-chart">[\s\S]*?<ul class="bt-chart-legend">([\s\S]*?)<\/ul>/gm;
            const regex_partyVoteResults = /<li class="bt-legend-ja">(.*?) .*?<\/li>[\s\S]*?<li class="bt-legend-nein">(.*?) .*?<\/li>[\s\S]*?<li class="bt-legend-enthalten">(.*?) .*?<\/li>[\s\S]*?<li class="bt-legend-na">(.*?) .*?<\/li>/gm;
            while ((m = regex_partyVotes.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_partyVotes.lastIndex) {
                    regex_partyVotes.lastIndex++;
                }
                let currentParty: { name: string | null, members: string | null, votes: { yes: string | null, no: string | null, abstain: string | null, na: string | null } } = { name: null, members: null, votes: { yes: null, no: null, abstain: null, na: null } };
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        currentParty.name = match;
                    }
                    if (group === 2) {
                        currentParty.members = match;
                    }
                    if (group === 3) {
                        let n;
                        while ((n = regex_partyVoteResults.exec(match)) !== null) {
                            // This is necessary to avoid infinite loops with zero-width matches
                            if (n.index === regex_partyVoteResults.lastIndex) {
                                regex_partyVoteResults.lastIndex++;
                            }
                            // The result can be accessed through the `n`-variable.
                            n.forEach((match2, group2) => {
                                if (group2 === 1) {
                                    currentParty.votes.yes = match2;
                                }
                                if (group2 === 2) {
                                    currentParty.votes.no = match2;
                                }
                                if (group2 === 3) {
                                    currentParty.votes.abstain = match2;
                                }
                                if (group2 === 4) {
                                    currentParty.votes.na = match2;
                                }
                            });
                        }
                        partyVotes.push(currentParty);
                    }
                });
            }

            //Plenarsaalprotokoll url
            let plenarProtocolURL: string = '';
            const regex_plenarProtocolURL = /data-url="(.*?)"[\s\S]*?><i class="icon-doc">[\s\S]*?Plenarprotokoll[\s\S]*?<\/a>/gm;
            while ((m = regex_plenarProtocolURL.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_plenarProtocolURL.lastIndex) {
                    regex_plenarProtocolURL.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        plenarProtocolURL = match;
                    }
                });
            }

            // Media
            let iTunesURL: string = '';
            let videoURLs: any = []; // TODO Typescript
            let mediathekURL: string = '';
            const regex_iTunesURL = /<a title="Dieses Video aus iTunes laden" href="(.*?)"/gm;
            const regex_videoURLs = /<input id="video.*?"[\s\S]*?data-url="(.*?)"[\s\S]*?>[\s\S]*?<label[\s\S]*?>(.*?)<\/label>/gm;
            const regex_mediathekURL = /<p><a[\s\S]*?><i class="icon-permalink"><\/i>(.*?)<\/a><\/p>/gm;
            while ((m = regex_iTunesURL.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_iTunesURL.lastIndex) {
                    regex_iTunesURL.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        iTunesURL = match;
                    }
                });
            }
            while ((m = regex_videoURLs.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_videoURLs.lastIndex) {
                    regex_videoURLs.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                let video: { URL: string | null, type: string | null } = { URL: null, type: null };
                m.forEach((match, group) => {
                    if (group === 1) {
                        video.URL = match;
                    }
                    if (group === 2) {
                        video.type = match;
                    }
                });
                videoURLs.push(video);
            }
            while ((m = regex_mediathekURL.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_mediathekURL.lastIndex) {
                    regex_mediathekURL.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        mediathekURL = match;
                    }
                });
            }

            // Detailed description
            let detailedDescription: string = '';
            const regex_detailedDescription = /<i class="icon-docs"><\/i><\/button>[\s\S]*?<\/div>[\s\S]*?<\/fieldset>[\s\S]*?<\/form>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<h4>([\s\S]*?)<\/h4>[\s\S]*?<p>[\s\S]*?<\/p>/gm;
            while ((m = regex_detailedDescription.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_detailedDescription.lastIndex) {
                    regex_detailedDescription.lastIndex++;
                }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        detailedDescription = match;
                    }
                });
            }

            let speeches: any = []; // TODO Typescript
            const regex_speeches = /<div class="col-xs-4 col-sm-3 col-md-6 bt-teaser">[\s\S]*?<a title="(.*?)" href="(.*?)"[\s\S]*?<img[\s\S]*?data-img-md-normal="(.*?)"[\s\S]*?class="img-responsive"\/>[\s\S]*?<h3>(.*?)<\/h3>[\s\S]*?<p class="bt-person-fraktion">(.*?)<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/a>[\s\S]*?<\/div>/gm;
            while ((m = regex_speeches.exec(string)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex_speeches.lastIndex) {
                    regex_speeches.lastIndex++;
                }
                let speech = { deputy: '', mediathekURL: '', deputyImgURL: '', party: '' }
                // The result can be accessed through the `m`-variable.
                m.forEach((match, group) => {
                    if (group === 1) {
                        speech.deputy = match;
                    }
                    if (group === 2) {
                        speech.mediathekURL = base_url + match;
                    }
                    if (group === 3) {
                        speech.deputyImgURL = base_url + match;
                    }
                    if (group === 5) {
                        speech.party = match;
                    }
                });
                speeches.push(speech);
            }

            return [{
                metadata: data.metadata,
                data: { id, date, title, description, detailedDescription, documents, deputyVotesURL, membersVoted, resultAll, partyVotes, plenarProtocolURL, media: { iTunesURL, mediathekURL, videoURLs }, speeches }
            }];
        }
    }
}