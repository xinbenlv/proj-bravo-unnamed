const Koa = require('koa');
const Router = require("koa-router");
const app = new Koa();
const rootRouter = new Router();

const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = 'debug';
// require("./mongo")(app);

// TODO(xinbenlv): change to use mongodb
let db = {
  account: {
    account0: {
      accountId: `account0`,
      accountName: '(System)',
    },
    account1: {
      accountId: `account1`,
      accountName: 'Zainan Zhou',
    },
    account2: {
      accountId: `account2`,
      accountName: 'Peipei Wang',
    },
    account3: {
      accountId: `account3`,
      accountName: 'William Chen',
    }
  },
  tx: {
    tx1: {
      txId: `tx1`,
      timestamp: `2018-11-01-20-15`,
      sender: `0`,
      receiver: `2`,
      amount: 100
    },
    tx2: {
      txId: `tx1`,
      timestamp: `2018-11-01-20-16`,
      sender: `1`,
      receiver: `2`,
      amount: 50
    },
    tx3: {
      txId: `tx1`,
      timestamp: `2018-11-01-20-17`,
      sender: `account0`,
      receiver: `account2`,
      amount: 100
    },
  },
  bravo: {
    bravo1: {
      recognitionId: `bravo1`,
      nominator: `account1`,
      receiver: `account2`,
      type: `AttendMeeting`,
      amount: 100,
      approvalId: `approval1`,
      reason: `设计组例会`
    },
    bravo2: {
      recognitionId: `bravo2`,
      nominator: `account1`,
      receiver: `account2`,
      type: `OrganizeMeeting`,
      amount: 100,
      approvalId: `approval1`,
      reason: `设计组例会`
    },
  },

};

app.db = db;

const dataTypes = [`account`, 'tx', `bravo`, `like`, `approval`];

dataTypes.forEach(d => {
  rootRouter.get(`/${d}`, async ctx => {
    ctx.body = `Entry point for ${d}.`;
  });

  rootRouter.get(`/${d}/all`, async ctx => {
    ctx.body = ctx.app.db[d];
  });

  rootRouter.get(`/${d}/:id`, async ctx => {
    let item = ctx.app.db[d][ctx.params.id];
    if (item) {
      ctx.body = item;
    } else {
      ctx.body = `404 not found`;
      ctx.status = 404;
    }
  });
});


app.use(rootRouter.routes()).use(rootRouter.allowedMethods());

let port = process.env.PORT || 8000;
app.listen(port);
logger.info(`Started app at port ${port}`);

