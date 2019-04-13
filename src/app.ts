require('dotenv').config();
import {AirTableHandler} from "./airtable-router";
import {RouterV2} from "./router-v2";

const main = async function () {

  const Koa = require('koa');
  const Router = require("koa-router");
  const app = new Koa();
  const apiRouter = new Router();
  const airTableHandler = new AirTableHandler();
  const routerV2 = new RouterV2();
  const MongoClient = require('mongodb').MongoClient;

  const bodyParser = require('koa-bodyparser');
  const serve = require('koa-static');
  const mount = require('koa-mount');
  const render = require('koa-ejs');
  const path = require('path');
  render(app, {
    root: path.join(__dirname, 'client-v2'),
    layout: 'layout',
    viewExt: 'ejs',
    cache: true,
    debug: false
  });

  const log4js = require('log4js');
  const logger = log4js.getLogger();
  logger.level = 'debug';
// require("./mongo")(app);

// TODO(xinbenlv): change to use mongodb
  let db = {
    account: {
      account0: {
        id: `(System)`,
      },
      account1: {
        id: `ZainanZhou`,
      },
      account2: {
        id: `PeipeiWang`,
      },
      account3: {
        id: `WilliamChen`,
      }
    },
    tx: {
      tx1: {
        txId: `tx1`,
        timestamp: `2018-11-01-20-15`,
        sender: `(System)`,
        receiver: `ZainanZhou`,
        amount: 100
      },
      tx2: {
        txId: `tx1`,
        timestamp: `2018-11-01-20-16`,
        sender: `ZainanZhou`,
        receiver: `PeipeiWang`,
        amount: 50
      },
      tx3: {
        txId: `tx1`,
        timestamp: `2018-11-01-20-17`,
        sender: `(System)`,
        receiver: `PeipeiWang`,
        amount: 100
      },
    },
    bravo: {
      bravo1: {
        recognitionId: `bravo1`,
        giver: `ZainanZhou`,
        receivers: [`PeipeiWang`, `ZainanZhou`, `WilliamChen`], // as a set
        type: `AttendMeeting`,
        amount: 100,
        approvalId: `approval1`,
        reason: `zgThx例会`,
        likers: new Set([`ZainanZhou`, `PeipeiWang`]),
        isApproved: true,
      },
      bravo2: {
        recognitionId: `bravo2`,
        giver: `ZainanZhou`,
        receivers: [`WilliamChen`],
        type: `OrganizeMeeting`,
        amount: 100,
        approvalId: `approval1`,
        reason: `设计组例会`,
        likers: new Set([`WilliamChen`]),
        isApproved: false
      },
    },

  };

  app.db = db;

  app.meId = 'ZainanZhou';  // TODO(zzn): change to by session

  const dataTypes = [`account`, 'tx', `bravo`];

  dataTypes.forEach(d => {
    apiRouter.get(`/`, async ctx => {
      ctx.redirect('/v2');
    });
    apiRouter.get(`/${d}`, async ctx => {
      ctx.body = `Entry point for ${d}.`;
    });

    apiRouter.get(`/${d}/all`, async ctx => {
      ctx.body = ctx.app.db[d];
    });

    apiRouter.get(`/${d}/:id`, async ctx => {
      let item = ctx.app.db[d][ctx.params.id];
      if (item) {
        ctx.body = item;
      } else {
        ctx.body = `404 not found`;
        ctx.status = 404;
      }
    });
  });


  // TODO(zzn): Api to receive BRAVO

  let mongoDb = (await MongoClient.connect(process.env.MONGODB_URI)).db(process.env.MONGODB_DB);
  const tokenizer = require('string-tokenizer');
  apiRouter.post(`/api/bravobot`, async ctx => {
    // https://api.slack.com/slash-commands
    console.log(ctx.request.body);


    var tokens =
        tokenizer()
            .input(ctx.request.body.text)
            .token('users', /@([\w.]{2,22})\W/)
            .token('reason', /for (.+)/)
            .resolve();
    let from = ctx.request.body.user_name;
    let to = Array.isArray(tokens.users) ? tokens.users : [tokens.users] ;
    let reason = tokens.reason;
    let now = new Date();

    console.log(`tokens`, tokens);

    await mongoDb.collection(`Bravos`).insertOne({
      timestamp: now,
      from: from,
      from_id_type: `slack_user_name`,
      to: to,
      to_id_type: `slack_user_name`,
      reason: reason,
      raw: ctx.request.body,
      raw_data_type: `slack_slash_command`
    });

    ctx.body = {
      "response_type": "in_channel",
      "text": `用户 @${from} 在 载歌在谷感谢墙 写下：`,
      "attachments": [
        {
          "color": "#2eb886",
          "title": "载歌在谷感谢墙",
          "title_link": "https://thx.zgzggala.org/v2",
          "fields": [
            {
              "title": "来自",
              "value": from,
              "short": true
            },
            {
              "title": "发给",
              "value": to.join(`, `),
              "short": true
            },
            {
              "title": "理由",
              "value": reason,
              "short": false
            }
          ],
          "text": "感谢 " + ctx.request.body.text,
          "actions": [
            {
              "type": "button",
              "text": "查看之前的感谢",
              "url": "https://thx.zgzggala.org/v2"
            }
          ],
          "ts": Math.floor(now.getTime()/1000)
        }
      ]
    };
  });

// TODO(zzn): Method Create Bravo
  apiRouter.post(`/bravo/create`, async ctx => {
    let bravo = ctx.request.body; // TODO(zzn): validate.
    ctx.app.db.bravo[bravo.id] = bravo; // Adding the new bravo
  });

  // TODO(zzn): Me Too!
  apiRouter.post(`/bravo/meToo/:id`, async ctx => {
    let bravo = ctx.app.db.bravo[ctx.request.params.id];
    bravo.receivers.add(ctx.app.meId);
  });

  // TODO(zzn): Like -> Trigger Approval and
  apiRouter.post(`/bravo/like/:id`, async ctx => {
    let bravo = ctx.app.db.bravo[ctx.request.params.id];
    bravo.likers.add(ctx.app.meId);
  });


  app.use(bodyParser());
  app.use(apiRouter.routes()).use(apiRouter.allowedMethods());
  app.use(airTableHandler.airTableRouter.routes()).use(airTableHandler.airTableRouter.allowedMethods());
  app.use(routerV2.uiRouter.routes()).use(routerV2.uiRouter.allowedMethods());
  app.use(mount('/assets/', serve('./public')));
  let port = process.env.PORT || 8000;
  app.listen(port);
  logger.info(`Started app at port ${port}`);

};

main().then()
    .catch(e => console.error(e));

