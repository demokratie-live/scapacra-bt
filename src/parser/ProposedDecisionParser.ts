import { Pdf } from '../browser/ProposedDecisionBrowser';
import { IParser } from '../importer/Parser';
import * as fs from 'fs';

export = Documents_Parser;

namespace Documents_Parser {
    /**
     * This parser gets all potention fraction votings from a "Plenarprotokoll" of the german Bundestag.
     */
    export class ProposedDecisionParser implements IParser<Pdf>{
        public parse(content: Pdf, callback: (json: JSON[]) => void): void {
            let readableStream = content.openStream();
            
            // let pdfParse = require('pdf-parse');

            // this.streamToBuffer(readableStream).then(buffer => {
            //     pdfParse(buffer).then(function(data: any) {
            //         // console.log(data.numpages);
            //         // // number of rendered pages
            //         // console.log(data.numrender);
            //         // // PDF info
            //         // console.log(data.info);
            //         // // PDF metadata
            //         // console.log(data.metadata); 
            //         // PDF.js version
            //         // check https://mozilla.github.io/pdf.js/getting_started/
            //         console.log(data.version);
            //         // PDF text
            //         fs.writeFileSync(`out/${data.info.Title}`, data.text);
    
            //         let jsons: JSON[] = [];
            //         callback(jsons);
            //     });
            // });

            const pdfParser = require('pdf-parser');

            this.streamToBuffer(readableStream).then(buffer => {
                pdfParser.pdf2json(buffer, function (error: any, pdf: any) {
                    if(error != null){
                        console.log(error);
                    }else{
                       fs.writeFileSync(`out/test.json`, JSON.stringify(pdf));
                    }
                });
            });
        }
        
        /**
         * http://derpturkey.com/buffer-to-stream-in-node/
         */
        private streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {  
            return new Promise((resolve, reject) => {
              let buffers: Uint8Array[] = [];
              stream.on('error', reject);
              stream.on('data', (data) => buffers.push(data));
              stream.on('end', () => resolve(Buffer.concat(buffers)));
            });
          }   
    }
}