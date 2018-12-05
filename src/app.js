"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const airtable_router_1 = require("./airtable-router");
const Koa = require('koa');
const Router = require("koa-router");
const app = new Koa();
const apiRouter = new Router();
const airTableHandler = new airtable_router_1.AirTableHandler();
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
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
            receivers: [`PeipeiWang`, `ZainanZhou`, `WilliamChen`],
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
app.meId = 'ZainanZhou'; // TODO(zzn): change to by session
const dataTypes = [`account`, 'tx', `bravo`];
dataTypes.forEach(d => {
    apiRouter.get(`/${d}`, (ctx) => __awaiter(this, void 0, void 0, function* () {
        ctx.body = `Entry point for ${d}.`;
    }));
    apiRouter.get(`/${d}/all`, (ctx) => __awaiter(this, void 0, void 0, function* () {
        ctx.body = ctx.app.db[d];
    }));
    apiRouter.get(`/${d}/:id`, (ctx) => __awaiter(this, void 0, void 0, function* () {
        let item = ctx.app.db[d][ctx.params.id];
        if (item) {
            ctx.body = item;
        }
        else {
            ctx.body = `404 not found`;
            ctx.status = 404;
        }
    }));
});
// TODO(zzn): Method Create Bravo
apiRouter.post(`/bravo/create`, (ctx) => __awaiter(this, void 0, void 0, function* () {
    let bravo = ctx.request.body; // TODO(zzn): validate.
    ctx.app.db.bravo[bravo.id] = bravo; // Adding the new bravo
}));
// TODO(zzn): Me Too!
apiRouter.post(`/bravo/meToo/:id`, (ctx) => __awaiter(this, void 0, void 0, function* () {
    let bravo = ctx.app.db.bravo[ctx.request.params.id];
    bravo.receivers.add(ctx.app.meId);
}));
// TODO(zzn): Like -> Trigger Approval and
apiRouter.post(`/bravo/like/:id`, (ctx) => __awaiter(this, void 0, void 0, function* () {
    let bravo = ctx.app.db.bravo[ctx.request.params.id];
    bravo.likers.add(ctx.app.meId);
}));
app.use(bodyParser());
app.use(serve('./src/client'));
app.use(apiRouter.routes()).use(apiRouter.allowedMethods());
app.use(airTableHandler.airTableRouter.routes()).use(airTableHandler.airTableRouter.allowedMethods());
let port = process.env.PORT || 8000;
app.listen(port);
logger.info(`Started app at port ${port}`);
//# sourceMappingURL=app.js.map