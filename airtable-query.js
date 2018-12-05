var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Airtable = require('airtable');
console.assert(process.env.AIRTABLE_KEY, 'need to define export AIRTABLE_KEY= <key>');
var base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base('appHfV3iolIVA2fq4');
var loadTable = function (tableName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var pages = [];
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
                })];
        });
    });
};
var main = function () {
    return __awaiter(this, void 0, void 0, function () {
        var benefitPoints, volList, volunteerMap, volPointsMap, _i, volList_1, v, _a, benefitPoints_1, b, points, vols, _b, vols_1, v, volId, points, name;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, loadTable('福利点数')];
                case 1:
                    benefitPoints = _c.sent();
                    return [4 /*yield*/, loadTable('志愿者名单')];
                case 2:
                    volList = _c.sent();
                    volunteerMap = {};
                    volPointsMap = {};
                    for (_i = 0, volList_1 = volList; _i < volList_1.length; _i++) {
                        v = volList_1[_i];
                        volunteerMap[v.id] = v;
                        volPointsMap[v.id] = 0;
                    }
                    for (_a = 0, benefitPoints_1 = benefitPoints; _a < benefitPoints_1.length; _a++) {
                        b = benefitPoints_1[_a];
                        points = b.fields['点数'];
                        vols = b.fields['接收人(sheet)'];
                        if (vols && points)
                            for (_b = 0, vols_1 = vols; _b < vols_1.length; _b++) {
                                v = vols_1[_b];
                                volPointsMap[v] = volPointsMap[v] + points;
                                if (v == 'recK0iofjPvcDa75u')
                                    console.log(v, points);
                            }
                        else {
                            console.log("Warning, '\u63A5\u6536\u4EBA(sheet)' does not exist for b", b.id, " or 点数 doesn't exist");
                        }
                        vols = null;
                    }
                    for (volId in volPointsMap) {
                        points = volPointsMap[volId];
                        name = volunteerMap[volId].fields['Name'];
                        console.log(name, points);
                    }
                    return [2 /*return*/];
            }
        });
    });
};
main()["catch"](function (e) {
    console.error(e);
});
