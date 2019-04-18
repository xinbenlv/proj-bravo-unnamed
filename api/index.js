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
      console.log(`11111`);
      let payload = req.body.payload;
      console.log(`222`);
      let data = JSON.parse(payload);
      console.log(`333`);
      logger.debug(`Received a request`, JSON.stringify(data, null, 2));
      console.log(`444`);
      let objectId = data.actions[0].action_id;
      console.log(`555 ${objectId}`);
      let bravo = (await mongoDb.collection(`Bravos`).findOneAndUpdate(
        {_id: new ObjectId(objectId)},
        {
          // $push: {plus_one_raw_array: data},
          $addToSet: {plus_one_set: data.user.name}
        },
        {
          returnOriginal: false
        }
      ));
      console.log(`666`, bravo);
      let retMessage = data.message;
      retMessage.replace_original = true;
      console.log(`777 retMessage`, JSON.stringify(retMessage, null, 2));
      console.log(`777 1 retMessage.blocks[1]`, JSON.stringify(retMessage.blocks[1], null, 2));
      console.log(`777 2 retMessage.blocks[1].elements`, JSON.stringify(retMessage.blocks[1].elements[0], null, 2));
      console.log(`777 2 retMessage.blocks[1].elements.text`, JSON.stringify(retMessage.blocks[1].elements[0].text, null, 2));
      try {
        retMessage.blocks[1].elements[0].text.text = `:thumbsup: +1 (${bravo.value.plus_one_set.length})`;
      } catch(e) {
        console.error(e);
      }
      console.log(`888 retMessage`, JSON.stringify(retMessage, null, 2));
      res.send(retMessage);

    }));
    console.log(`999`);
    router.get(`/bravos/list`, asyncHandler(async (req, res) => {
      console.log(`10 XXX`);
      let q = req.query;
      let filter = {};
      if (q['team_domain']) {
        filter['raw.team_domain'] = q['team_domain']
      }
      console.log(`11 XXX`);
      console.log(filter);
      let ret = await mongoDb.collection(`Bravos`)
        .find(filter)
        .sort({timestamp: -1})
        .limit(20).toArray();
      console.log(`12 XXX`);
      res.send(ret);
      console.log(`13 XXX`);
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
        // "text": `群友 @${from} 诚心诚意地 载歌在谷感谢墙 写下：`,
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*@${from}* 给 *${to.join(', ')}* 发送了一个bravo :clap: :\nthanks @${to.join(', ')} for ${reason}\n\n <https://thx.zgzggala.org|查看感谢墙>`,
            },
            "accessory": {
              "type": "image",
              "image_url": "https://cdn.dribbble.com/users/791680/screenshots/5421599/wintercamp-03_4x.png",
              "alt_text": "computer thumbnail"
            }
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "action_id": `${bravo.ops[0]._id}`,
                "text": {
                  "type": "plain_text",
                  "text": ":thumbsup: +1",
                  "emoji": true
                },
                "value": "click_me_123",
                "style": "primary"
              }
            ]
          },
          {
            "type": "divider"
          },
          {
            "type": "context",
            "elements": [
              {
                "type": "mrkdwn",
                "text": "/thanks @name for [reason] 发送感谢  |  *Author:* Zainan Zhou, Peipei Wang"
              }
            ]
          }
        ],
        "ts": now.getTime()/1000.0
      });
    }));
  }).catch(e=>logger.error(e));


// export the server middleware
module.exports = {
  path: '/api',
  handler: app
};
