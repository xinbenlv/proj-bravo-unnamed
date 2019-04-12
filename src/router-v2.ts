import {ModelV2} from "./model-v2";

const Router = require("koa-router");


export class FakeModel {
  public getBravos() {
    return [
      {
        发出人: "张三",
        接收人: ["李四", "王五", "赵六"],
        日期时间: "2019-01-02",
        分发原因: `打印海报`
      },
      {
        发出人: "李四",
        接收人: ["王五", "赵六"],
        日期时间: "2019-01-04",
        分发原因: `制作视频`
      }, {
        发出人: "王五",
        接收人: ["李四", "赵六"],
        日期时间: "2019-01-08",
        分发原因: `节目联络`
      }, {
        发出人: "张三",
        接收人: ["李四", "王五", "赵六"],
        日期时间: "2019-02-01",
        分发原因: `拉赞助`
      }, {
        发出人: "张三",
        接收人: ["李四", "王五", "赵六"],
        日期时间: "2019-02-02",
        分发原因: `制作网站`
      },
      {
        发出人: "张三",
        接收人: ["李四", "王五", "赵六"],
        日期时间: "2019-01-02",
        分发原因: `打印海报`
      },
      {
        发出人: "李四",
        接收人: ["王五", "赵六"],
        日期时间: "2019-01-04",
        分发原因: `制作视频`
      }, {
        发出人: "王五",
        接收人: ["李四", "赵六"],
        日期时间: "2019-01-08",
        分发原因: `节目联络`
      }, {
        发出人: "张三",
        接收人: ["李四", "王五", "赵六"],
        日期时间: "2019-02-01",
        分发原因: `拉赞助`
      }, {
        发出人: "张三",
        接收人: ["李四", "王五", "赵六"],
        日期时间: "2019-02-02",
        分发原因: `制作网站`
      },
    ];

  }
}

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
