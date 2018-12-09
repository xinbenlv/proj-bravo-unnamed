
const Router = require("koa-router");
const Airtable = require('airtable');
console.assert(process.env.AIRTABLE_KEY, 'need to define export AIRTABLE_KEY= <key>');
const base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base('appHfV3iolIVA2fq4');


export class AirTableHandler {
  public airTableRouter;
  private isInit = false;
  private benefitPointsEntries:Array<any>; // = await this.loadTableFunc('福利点数');
  private volListEntries:Array<any>; // = await this.loadTableFunc('志愿者名单');
  private volunteerMap = {};
  private volPointsMap = {};
  private cacheExpiredAt:Date = null;
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
      let ret = this.findUser(searchRegEx);
      ctx.body = ret;
    });
    this.airTableRouter.get(`/ui/airtable/find/:searchRegEx` ,async ctx => {
      if (!this.isInit) await this.loadZGZG();
      let searchRegEx = ctx.params.searchRegEx;
      let users = this.findUser(searchRegEx);
      console.log(`Rendering user`, users);
      await ctx.render('mvp/users', {users: users} );
    });
    this.airTableRouter.get(`/ui/airtable/points/:id` ,async ctx => {
      if (!this.isInit) await this.loadZGZG();
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


    this.airTableRouter.get(`/ui/airtable/top10`, async ctx => {
      if (!this.isInit) await this.loadZGZG();
      let users =this.findTopTen();
      console.log(`Top 10`, users);
      await ctx.render('mvp/users', {title: `Top 10`, users: this.findTopTen()} );
    });

    this.airTableRouter.get(`/ui/airtable/bravos/all`, async ctx => {
      if (!this.isInit) await this.loadZGZG();
      let bravos = this.getBravosAll();
      await ctx.render('mvp/bravos', {bravos: bravos} );
    });

    this.airTableRouter.get(`/airtable/bravos/all`, async ctx => {
      if (!this.isInit) await this.loadZGZG();
      let bravos = this.getBravosAll();
      ctx.body = bravos;
    });

    this.airTableRouter.get(`/airtable/bonuses`, async ctx => {
      if (!this.isInit) await this.loadZGZG();
      let bravos = this.getBonuses().slice(0, 10);
      ctx.body = bravos;
    });

    this.airTableRouter.get(`/ui/airtable/bonuses`, async ctx => {
      if (!this.isInit) await this.loadZGZG();
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

    let ret = pointsEntries.map(item => {
      return this.extractBravoForUI(item);
    });
    return ret;
  }

  private extractBravoForUI(item) {
    return {
      发出人: (item.fields['发出人(sheet)'] || []).map(c => this.volunteerMap[c].fields['Name']),
      接收人: (item.fields['接收人(sheet)'] || []).map(c => this.volunteerMap[c].fields['Name']),
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

    let ret = pointsEntries.map(item => {
      return {
        发出人: (item.fields['发出人(sheet)'] || []).map(c => {
          return {
            name: this.volunteerMap[c].fields['Name'],
            id: this.volunteerMap[c].id
          };
        }),
        接收人: (item.fields['接收人(sheet)'] || []).map(c => {
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
    });
    return ret;
  }

  private findTopTen():Array<any> {
    let ret = [];
    for (const volId in this.volPointsMap) {
      let points = this.volPointsMap[volId];
      let name = this.volunteerMap[volId].fields['Name'];
      ret.push({id:volId, name:name, points:points});
    }

    console.log(`original 10`, ret);
    ret.sort((a,b) => {return a.points - b.points}).reverse();
    return ret.slice(0,10);
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

  private loadZGZG = async function() {
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


