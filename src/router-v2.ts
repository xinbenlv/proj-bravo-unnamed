const Router = require("koa-router");


export class FakeModel {
  public getBravos() {
    return [
      {
        giver: "张三",
        receivers: ["李四", "王五", "赵六"],
        timestamp: "2019-01-02",
        reason: `打印海报`
      },
      {
        giver: "李四",
        receivers: ["王五", "赵六"],
        timestamp: "2019-01-04",
        reason: `制作视频`
      }, {
        giver: "王五",
        receivers: ["李四", "赵六"],
        timestamp: "2019-01-08",
        reason: `节目联络`
      }, {
        giver: "张三",
        receivers: ["李四", "王五", "赵六"],
        timestamp: "2019-02-01",
        reason: `拉赞助`
      }, {
        giver: "张三",
        receivers: ["李四", "王五", "赵六"],
        timestamp: "2019-02-02",
        reason: `制作网站`
      },
      {
        giver: "张三",
        receivers: ["李四", "王五", "赵六"],
        timestamp: "2019-01-02",
        reason: `打印海报`
      },
      {
        giver: "李四",
        receivers: ["王五", "赵六"],
        timestamp: "2019-01-04",
        reason: `制作视频`
      }, {
        giver: "王五",
        receivers: ["李四", "赵六"],
        timestamp: "2019-01-08",
        reason: `节目联络`
      }, {
        giver: "张三",
        receivers: ["李四", "王五", "赵六"],
        timestamp: "2019-02-01",
        reason: `拉赞助`
      }, {
        giver: "张三",
        receivers: ["李四", "王五", "赵六"],
        timestamp: "2019-02-02",
        reason: `制作网站`
      },
    ];

  }
}

export class RouterV2 {
  public uiRouter;
  public model;

  public constructor() {
    this.uiRouter = new Router();
    this.model = new FakeModel();
    this.uiRouter.get(`/v2/`, async ctx => {
      console.log(`GetBravos`, await this.model.getBravos());
      await ctx.render(`pages/dashboard`, {
        bravos: await this.model.getBravos()
      })
    });
  }


}