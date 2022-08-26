import { nanoid } from "nanoid";

import PouchDB from "pouchdb";

export class ChangeHistory {
  db = new PouchDB('dbname');

  constructor() {

  }

  id() {
    return nanoid();
  }

  last() {

  }

  limitHistorySize(size: number = 50) {
    this.db.allDocs().then((response: PouchDB.Core.AllDocsResponse<any>) => {
      if (response.total_rows <= size) {
        return;
      }

      console.log(response);

      this.db.allDocs({
        limit: response.total_rows - size
      }).then((response: PouchDB.Core.AllDocsResponse<any>) => {
        response.rows.forEach((row: any) => {
          this.db.remove(row.id, row.value.rev).then((response: any) => {
            // handle response
          }).catch((err: any) => {
            console.log(err);
          });
        })
      }).catch((err: any) => {
        console.log(err);
      });
    });
  }

  save(code: string) {
    this.limitHistorySize();
    this.db.put({
      _id: this.id(),
      title: 'local',
      content: code
    }).then((_response: any) => {
      // handle response
    }).catch((err: any) => {
      console.log(err);
    });
  }
}
