const Airtable = require('airtable');
console.assert(process.env.AIRTABLE_KEY, 'need to define export AIRTABLE_KEY= <key>');
const base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base(process.env.AIRTABLE_BASE);
const CACHE_LIFETIME_IN_SECONDS = 120000; // 2min
import {addSeconds, isBefore} from "date-fns";

export class ModelV2 {
  private benefitPointsEntries:Array<any>; // = await this.loadTableFunc('福利点数');
  private volListEntries:Array<any>; // = await this.loadTableFunc('志愿者名单');
  private volunteerMap = {};
  private volPointsMap = {};
  private cacheExpiredAt:Date = null;
  public async getBravosAll() {
    await this.maybeLoadZGZG();
    let pointsEntries = this.benefitPointsEntries
        .sort(
            (a, b) =>
                Date.parse(a.fields['时间日期'])
                - Date.parse(b.fields['时间日期']))
        .reverse();

    return pointsEntries.map(item => this.extractBravoForUI(item));
  }

  public extractBravoForUI(item) {
    return {
      发出人: (item.fields["发出人(sheet)"] || []).map(c => {
        return {
          name: this.volunteerMap[c].fields['Name'],
          id: this.volunteerMap[c].id
        };
      }),
      接收人: (item.fields["接收人(sheet)"] || []).map(c => {
        return {
          name: this.volunteerMap[c].fields['Name'],
          id: this.volunteerMap[c].id
        };
      }),
      分发原因: item.fields['分发原因'],
      时间日期: item.fields['时间日期'],
      类别: item.fields['类别'],
      点数: item.fields['点数']
    };
  }

  private getBonuses() {
    let pointsEntries = this.benefitPointsEntries
        .filter(item => ['Spot Bonus', 'Peer Bonus'].indexOf(item.fields.类别) >= 0)
        .sort(
            (a, b) =>
                Date.parse(a.fields['时间日期'])
                - Date.parse(b.fields['时间日期']))
        .reverse();

    return pointsEntries.map(item => this.extractBravoForUI(item));
  }

  private findTopTen():Array<any> {
    let ret = [];
    for (const volId in this.volPointsMap) {
      let points = this.volPointsMap[volId];
      let name = this.volunteerMap[volId].fields['Name'];
      ret.push({id:volId, name:name, points:points});
    }

    // console.log(`original 10`, ret);
    ret.sort((a,b) => {return a.points - b.points}).reverse();
    return ret.slice(0,80);
  }

  private findUser(searchRegEx:string) {
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
    return ret;
  }

  private maybeLoadZGZG = async () => {
    let now = new Date();
    if (this.cacheExpiredAt!=null && isBefore(now, this.cacheExpiredAt)) {
      console.log(`Cache still valid`);
    } else {
      console.log(`Cache expired, loading!`);
      await this.loadZGZG();
      this.cacheExpiredAt = addSeconds(now, CACHE_LIFETIME_IN_SECONDS);
    }
  };

  private loadZGZG = async () => {
    this.benefitPointsEntries = await this.loadTableFunc('福利点数');
    this.volListEntries= await this.loadTableFunc('志愿者名单');
    for (const v of this.volListEntries) {
      this.volunteerMap[v.id] = v;
      this.volPointsMap[v.id] = 0;
    }

    for (const b of this.benefitPointsEntries) {
      let points = b.fields["点数"];
      let vols:Array<string> = b.fields['接收人(sheet)'];
      if (vols && points) for (const v of vols) {
        this.volPointsMap[v] = this.volPointsMap[v] + points;
      }
      else {
        console.log(`Warning, '接收人(sheet)' does not exist for b`, b.id, " or 点数 doesn't exist");
      }
      vols = null;
    }


    for (const volId in this.volPointsMap) {
      let points = this.volPointsMap[volId];
      let name = this.volunteerMap[volId].fields['Name'];
    }
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

  private createBravo(bravo:object):Promise<any> {
    return new Promise<any>((resolve, reject) => {
      base('福利点数').create(bravo, function(err, record) {
        if (err) reject(err);
        else resolve(record);
      });
    });
  }
}


