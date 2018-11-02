const Koa = require('koa');
const Router = require("koa-router");
const app = new Koa();
const rootRouter = new Router();
const txRouter = new Router(); // tx = transaction
const accountRouter = new Router();

const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = 'debug';
// require("./mongo")(app);

// TODO(xinbenlv): change to use mongodb
let db = {
  account: {
    1: {
      accountId: "1",
      name: 'Zainan Zhou',
    },
    2: {
      accountId: "2",
      name: 'Peipei Wang',
    },
    3: {
      accountId: "3",
      name: 'William Chen',
    }
  },
  tx: {
    1: {
      transactionId: `tx1`,
      timestamp: `2018-11-01-20-15`,
      sender: `0`,
      receiver: `2`,
      amount: 100
    },
    2: {
      transactionId: `tx1`,
      timestamp: `2018-11-01-20-16`,
      sender: `1`,
      receiver: `2`,
      amount: 50
    },
    3: {
      transactionId: `tx1`,
      timestamp: `2018-11-01-20-17`,
      sender: `0`,
      receiver: `2`,
      amount: 100
    },
  }
};

app.db = db;

txRouter.get(`/all`, async ctx => {
  ctx.body = ctx.app.db.tx
});
txRouter.get(`/`, async ctx => {
  ctx.body = `Entry point for tx.`
});
txRouter.get(`/:id`, async ctx => {
  let item = ctx.app.db.tx[ctx.params.id];
  if (item) {
    ctx.body = item;
  } else {
    ctx.body = `404 not found`;
    ctx.status = 404;
  }
});


accountRouter.get(`/all`, async ctx => {
  ctx.body = ctx.app.db.account
});
accountRouter.get(`/`, async ctx => {
  ctx.body = `Entry point for account.`
});
accountRouter.get(`/:id`, async ctx => {
  let item = ctx.app.db.account[ctx.params.id];
  if (item) {
    ctx.body = item;
  } else {
    ctx.body = `404 not found`;
    ctx.status = 404;
  }
});

rootRouter.use(`/tx`, txRouter.routes(), txRouter.allowedMethods());
rootRouter.use(`/account`, accountRouter.routes(), accountRouter.allowedMethods());
app.use(rootRouter.routes()).use(rootRouter.allowedMethods());

let port = process.env.PORT || 8000;
app.listen(port);
logger.info(`Started app at port ${port}`);

