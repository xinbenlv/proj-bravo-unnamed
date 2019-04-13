import {ModelV2} from "./model-v2";

const Router = require("koa-router");

export class RouterV2 {
  public uiRouter;
  public model;

  public constructor() {
    this.uiRouter = new Router();
    this.model = new ModelV2();
    this.model.init().then(()=>{
      this.uiRouter.get(`/v2/`, async ctx => {
        let results = await this.model.mongoDb
            .collection(`Bravos`)
            .find()
            .sort({timestamp: -1})
            .limit(10).toArray();
        await ctx.render(`pages/dashboard`, {
          bravos: results.map(item => {
            item.timestamp_str = item.timestamp.toDateString();
            return item;
          })
        })
      });
    });

  }


}
