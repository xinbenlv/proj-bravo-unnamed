
const Router = require("koa-router");
const Airtable = require('airtable');
console.assert(process.env.AIRTABLE_KEY, 'need to define export AIRTABLE_KEY= <key>');
const base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base('appHfV3iolIVA2fq4');
const CACHE_LIFETIME_IN_SECONDS = 120000; // 2min
import {addSeconds, isBefore} from "date-fns";

export class AirTableHandler {
  public airTableRouter;
  private benefitPointsEntries:Array<any>; // = await this.loadTableFunc('福利点数');
  private volListEntries:Array<any>; // = await this.loadTableFunc('志愿者名单');
  private volunteerMap = {};
  private volPointsMap = {};
  private cacheExpiredAt:Date = null;
  public constructor() {
    this.airTableRouter = new Router();
    this.airTableRouter.get(`/airtable/points/all`, async ctx => {
      await this.maybeLoadZGZG();
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
      await this.maybeLoadZGZG();
      let volId = ctx.params.id;
      ctx.body = [
          {
            name: this.volunteerMap[volId].fields['Name'],
            points: this.volPointsMap[volId]
          }];
    });
    this.airTableRouter.get(`/airtable/find/:searchRegEx`, async ctx => {
      await this.maybeLoadZGZG();

      let searchRegEx = ctx.params.searchRegEx;
      let ret = this.findUser(searchRegEx);
      ctx.body = ret;
    });
    this.airTableRouter.get(`/ui/airtable/find/:searchRegEx` ,async ctx => {
      await this.maybeLoadZGZG();
      let searchRegEx = ctx.params.searchRegEx;
      let users = this.findUser(searchRegEx);
      console.log(`Rendering user`, users);
      await ctx.render('mvp/users', {users: users} );
    });
    this.airTableRouter.get(`/ui/airtable/points/:id` , async ctx => {
      await this.maybeLoadZGZG();
      let volId = ctx.params.id;
      if (this.volunteerMap[volId] &&  this.volPointsMap[volId]) {
        let user =
          {
            name: this.volunteerMap[volId].fields['Name'],
            points: this.volPointsMap[volId]
          };
        let receivedBravos = this.benefitPointsEntries
            .filter(item => (item.fields['接收人(sheet)'] || []).indexOf(volId) >= 0)
            .map(item => this.extractBravoForUI(item));
        let sentBravos = this.benefitPointsEntries
            .filter(item => (item.fields['发出人(sheet)'] || []).indexOf(volId) >= 0)
            .map(item => this.extractBravoForUI(item));
        await ctx.render('mvp/single-user', {
          user: user,
          receivedBravos: receivedBravos,
          sentBravos: sentBravos,
        } );
      } else {
        ctx.status = 404;
        ctx.body = "啥也没有找到";
      }
    });

    this.airTableRouter.post(`/airtable/bravo/create`, async ctx => {
      const bravo = ctx.request.body;
      // {
      //   "类别": "Peer Bonus",
      //   "时间日期": "2018-09-13", // TODO (update with today)
      //   "分发原因": "test peer bonus TODO REMOVE this",
      //   "点数": 200,
      //   "发出人(sheet)": [
      //     "rec0dTfD6RUDPTfVt" // 周载南
      //   ],
      //   "接收人(sheet)": [
      //     "reckfSTrEoxQBRuZP", // 李璐
      //   ]
      // };
      console.log(`Start creating bravo:`, bravo);
      await this.createBravo(bravo);
      console.log(`Finished creating bravo:`, bravo);
      ctx.body = `OK`;
    });

    this.airTableRouter.get(`/ui/airtable/bravo/create`, async ctx => {
      await this.maybeLoadZGZG();
      let ret = [];
      for (let vol of this.volListEntries) {
        ret.push({
          id: vol.id,
          displayName: vol.fields.DisplayName
        });
        // console.log(`vol.fields.DisplayName`, vol.fields.DisplayName);
      }
      // console.log(`ret`, ret);
      await ctx.render('mvp/create-bravo', {
        users: ret
      });
    });


    this.airTableRouter.get(`/ui/airtable/top10`, async ctx => {
      console.log(`XXXX /ui/airtable/top10`);
      await this.maybeLoadZGZG();
      let users =this.findTopTen();
      // console.log(`Top 10`, users);
      await ctx.render('mvp/users', {title: `Top 10`, users: this.findTopTen()} );
    });

    this.airTableRouter.get(`/ui/airtable/bravos/all`, async ctx => {
      await this.maybeLoadZGZG();
      let bravos = this.getBravosAll();
      await ctx.render('mvp/bravos', {bravos: bravos} );
    });

    this.airTableRouter.get(`/airtable/bravos/all`, async ctx => {
      await this.maybeLoadZGZG();
      let bravos = this.getBravosAll();
      ctx.body = bravos;
    });

    this.airTableRouter.get(`/airtable/bonuses`, async ctx => {
      await this.maybeLoadZGZG();
      let bravos = this.getBonuses().slice(0, 10);
      ctx.body = bravos;
    });

    this.airTableRouter.get(`/ui/airtable/bonuses`, async ctx => {
      await this.maybeLoadZGZG();
      let bravos = this.getBonuses().slice(0, 10);
      await ctx.render('mvp/bravos', {bravos: bravos} );
    });

  }
  private getBravosAll() {
    let pointsEntries = this.benefitPointsEntries
        .sort(
            (a, b) =>
                Date.parse(a.fields['时间日期'])
                - Date.parse(b.fields['时间日期']))
        .reverse();

    return pointsEntries.map(item => this.extractBravoForUI(item));
  }

  private extractBravoForUI(item) {
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
    console.log(`XXXX maybeLoadZGZG`);

    console.log(`XXXX maybeLoadZGZG cacheExpiredAt=${this.cacheExpiredAt}, now = ${now}, isBefore=${isBefore(now, this.cacheExpiredAt)}`);
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
      // console.log(volId, name, points);
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


