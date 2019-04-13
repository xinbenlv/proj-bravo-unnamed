require(`dotenv`).config();
import {ObjectId} from "bson";

const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = 'debug';

const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(router);

// parse application/json
app.use(bodyParser.json());
const MongoClient = require('mongodb').MongoClient;
const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next);

MongoClient.connect(process.env.MONGODB_URI)
  .then((mongoClient) => {
    let mongoDb = mongoClient.db(process.env.MONGODB_DB);
    const tokenizer = require('string-tokenizer');
    router.post(`/bravobot/interact`, asyncHandler(async (req, res) => {
      console.log(`1111`, req.body);
      let payload = req.body.payload;
      let data = JSON.parse(payload);
      logger.debug(`Received a request`, JSON.stringify(data, null, 2));

      let bravo = (await mongoDb.collection(`Bravos`).findOneAndUpdate(
        {_id: new ObjectId(data.callback_id)},
        {
          // $push: {plus_one_raw_array: data},
          $addToSet: {plus_one_set: data.user.name}
        },
        {
          returnOriginal: false
        }
      ));

      let retMessage = data.original_message;
      if (data.actions.length === 1) {
        if (data.actions[0].value === "plus_one") {
          retMessage.attachments[0].actions[0].text = `+1 (${bravo.value.plus_one_set.length})`;
        } else if (data.actions[0].value === "teach_me") {
          retMessage.attachments[0].fields.push({
            "title": "分发方法",
            "type": "markdown",
            "value": "`/thank [@user] for [reason].`",
            "short": false
          })
        }
      }

      res.send(retMessage);

    }));

    router.get(`/bravos/list`, asyncHandler(async (req, res) => {
      let q = req.query;
      let filter = {};
      if (q['team_domain']) {
        filter['raw.team_domain'] = q['team_domain']
      }
      let ret = await mongoDb.collection(`Bravos`)
        .find(filter)
        .sort({timestamp: -1})
        .limit(20).toArray();
      res.send(ret);
    }));

    router.post(`/bravobot/slash/thank`, asyncHandler(async (req, res) => {

      // https://api.slack.com/slash-commands
      logger.debug(`Received a request`, JSON.stringify(req.body, null, 2));

      var tokens =
        tokenizer()
          .input(req.body.text)
          .token('users', /@([\w.]{2,22})\W/)
          .token('reason', /for (.+)/)
          .resolve();


      let from = req.body.user_name;
      let to = Array.isArray(tokens.users) ? tokens.users : [tokens.users] ;
      let reason = tokens.reason;
      if (!from || to.length === 0 || !reason) {
        res.send({
          "text": "Format is incorrect. Example: /thank [@user] for [reason]"
        });
        return;
      }
      let now = new Date();

      logger.debug(`tokens`, tokens);


      let bravo = await mongoDb.collection(`Bravos`).insert({
        timestamp: now,
        from: from,
        from_id_type: `slack_user_name`,
        to: to,
        to_id_type: `slack_user_name`,
        reason: reason,
        raw: req.body,
        raw_data_type: `slack_slash_command`
      });


      res.send({
        "response_type": "in_channel",
        "text": `群友 @${from} 诚心诚意地 载歌在谷感谢墙 写下：`,
        "attachments": [
          {
            "color": "#2eb886",
            "title": "载歌在谷感谢墙",
            "title_link": "https://thx.zgzggala.org/v2?utm_source=slack_slash&utm_campaign=slack_slash_title",
            "callback_id": `${bravo.ops[0]._id}`,
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
            "text": "感谢 " + req.body.text,
            "actions": [
              {
                "name": "plus_one",
                "text": "+1",
                "style": "primary",
                "type": "button",
                "value": "plus_one"
              },
              {
                "type": "button",
                "text": "查看更多",
                "url": "https://thx.zgzggala.org/v2?utm_source=slack_slash&utm_campaign=slack_slash_view_more_button",
                "value": "view_more"
              },
              {
                "name": "teach_me",
                "text": "我也来",
                "type": "button",
                "value": "teach_me"
              },
            ],
            "ts": now.getTime()/1000.0
          }
        ]
      });
    }));
  }).catch(e=>logger.error(e));


// export the server middleware
module.exports = {
  path: '/api',
  handler: app
};
