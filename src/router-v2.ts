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
    this.uiRouter.get(`/v2/`, async ctx => {
      let result = await this.model.getBravosAll();
      await ctx.render(`pages/dashboard`, {
        bravos: result.slice(0, 10)
      })
    });
  }


}