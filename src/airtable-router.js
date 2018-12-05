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
const Router = require("koa-router");
const Airtable = require('airtable');
console.assert(process.env.AIRTABLE_KEY, 'need to define export AIRTABLE_KEY= <key>');
const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base('appHfV3iolIVA2fq4');
class AirTableHandler {
    constructor() {
        this.isInit = false;
        this.volunteerMap = {};
        this.volPointsMap = {};
        this.loadZGZG = function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.benefitPoints = yield this.loadTableFunc('福利点数');
                this.volList = yield this.loadTableFunc('志愿者名单');
                for (const v of this.volList) {
                    this.volunteerMap[v.id] = v;
                    this.volPointsMap[v.id] = 0;
                }
                for (const b of this.benefitPoints) {
                    let points = b.fields["点数"];
                    let vols = b.fields['接收人(sheet)'];
                    if (vols && points)
                        for (const v of vols) {
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
            });
        };
        this.loadTableFunc = function (tableName) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    let pages = [];
                    base(tableName).select({
                        // Selecting the first 1000 records in Grid view:
                        maxRecords: 10000,
                        view: "Grid view"
                    }).eachPage(function page(records, fetchNextPage) {
                        // This function (`page`) will get called for each page of records.
                        pages = pages.concat(records);
                        // To fetch the next page of records, call `fetchNextPage`.
                        // If there are more records, `page` will get called again.
                        // If there are no more records, `done` will get called.
                        fetchNextPage();
                    }, function done(err) {
                        if (err)
                            reject(err);
                        else
                            resolve(pages);
                    });
                });
            });
        };
        this.airTableRouter = new Router();
        this.airTableRouter.get(`/airtable/points/all`, (ctx) => __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit)
                yield this.loadZGZG();
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
        }));
        this.airTableRouter.get(`/airtable/points/:id`, (ctx) => __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit)
                yield this.loadZGZG();
            let volId = ctx.params.id;
            ctx.body = [
                {
                    name: this.volunteerMap[volId].fields['Name'],
                    points: this.volPointsMap[volId]
                }
            ];
        }));
    }
}
exports.AirTableHandler = AirTableHandler;
//# sourceMappingURL=airtable-router.js.map