
const Router = require("koa-router");
const Airtable = require('airtable');
console.assert(process.env.AIRTABLE_KEY, 'need to define export AIRTABLE_KEY= <key>');
const base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base('appHfV3iolIVA2fq4');

export class AirTableHandler {
  public airTableRouter;
  private isInit = false;
  private benefitPoints; // = await this.loadTableFunc('福利点数');
  private volList; // = await this.loadTableFunc('志愿者名单');
  private volunteerMap = {};
  private volPointsMap = {};
  public constructor() {
    this.airTableRouter = new Router();
    this.airTableRouter.get(`/airtable/points/all`, async ctx => {
      if (!this.isInit) await this.loadZGZG();
      let ret = [];
      for (const volId in this.volPointsMap) {
        let points = this.volPointsMap[volId];
        let name = this.volunteerMap[volId].fields['Name'];
        ret.push({
          id: volId,
          points: points,
          name: name
        });
        console.log(volId, name, points);
      }
      ctx.body = ret;
    });
    this.airTableRouter.get(`/airtable/points/:id`, async ctx => {
      if (!this.isInit) await this.loadZGZG();
      let volId = ctx.params.id;
      ctx.body = [
          {
            name: this.volunteerMap[volId].fields['Name'],
            points: this.volPointsMap[volId]
          }];
    });
    this.airTableRouter.get(`/airtable/find/:searchRegEx`, async ctx => {
      if (!this.isInit) await this.loadZGZG();
      let searchRegEx = ctx.params.searchRegEx;
      let regex = new RegExp(searchRegEx);
      let ret = [];
      for (const volId in this.volPointsMap) {
        let points = this.volPointsMap[volId];
        let name = this.volunteerMap[volId].fields['Name'];
        let email = this.volunteerMap[volId].fields['Email Original'];
        if (regex.test(name) || regex.test(email))
        ret.push({
          id: volId,
          points: points,
          name: name
        });
      }
      ctx.body = ret;
    });
  }

  private loadZGZG = async function() {
    this.benefitPoints= await this.loadTableFunc('福利点数');
    this.volList= await this.loadTableFunc('志愿者名单');
    for (const v of this.volList) {
      this.volunteerMap[v.id] = v;
      this.volPointsMap[v.id] = 0;
    }

    for (const b of this.benefitPoints) {
      let points = b.fields["点数"];
      let vols:Array<string> = b.fields['接收人(sheet)'];
      if (vols && points) for (const v of vols) {
        this.volPointsMap[v] = this.volPointsMap[v] + points;
        if (v == 'recK0iofjPvcDa75u')
          console.log(v, points);
      }
      else {
        console.log(`Warning, '接收人(sheet)' does not exist for b`, b.id, " or 点数 doesn't exist");
      }
      vols = null;
    }


    for (const volId in this.volPointsMap) {
      let points = this.volPointsMap[volId];
      let name = this.volunteerMap[volId].fields['Name'];
      console.log(volId, name, points);
    }
    this.isInit = true;
    console.log(`Done init airtable`);
  };


  private loadTableFunc = async function(tableName):Promise<Array<any>> {
    return new Promise<Array<any>>((resolve, reject) => {
      let pages = [];
      base(tableName).select({
        // Selecting the first 1000 records in Grid view:
        maxRecords: 10000,
        view: "Grid view"
      }).eachPage(function page(records:Array<any>, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        pages = pages.concat(records);
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();

      }, function done(err) {
        if (err) reject(err);
        else resolve(pages);
      });
    });
  };

}


