const dateFns =  require('date-fns');
function top(allThx, toOrFrom) {
  let countMap = {};
  let plusOneCountMap = {};
  allThx.forEach(item => {
    let itemPlusOne = item.plus_one_set ? item.plus_one_set.length : 0;
    (Array.isArray(item[toOrFrom]) ? item[toOrFrom] :[item[toOrFrom]]).forEach(user => {
      let count = countMap[user] ? countMap[user] : 0;
      count++;
      countMap[user] = count;
      let plusOneSize = plusOneCountMap[user] ? plusOneCountMap[user] : 0;
      plusOneSize += itemPlusOne;
      plusOneCountMap[user] = plusOneSize;
    });
  });
  let topKeys = Object.keys(countMap).sort((a,b) => {
    return (countMap[b] + plusOneCountMap[b]) - (countMap[a] + plusOneCountMap[a]);
  }).slice(0, 5);
  let ret = topKeys.map(user => {
    return [user, countMap[user], plusOneCountMap[user]];
  });
  return ret;
}

function getMedal(i) {
  switch(i) {
    case 0: return `:first_place_medal:`;
    case 1: return `:second_place_medal:`;
    case 2: return `:third_place_medal:`;
    default: return `:clap:`;
  }
}

let countTopChannel = function(allThx) {
  let bravoMap = {};
  let plusOneMap = {};
  allThx.forEach(item => {
    let bravoCount = bravoMap[item.raw.channel_name] > 0 ? bravoMap[item.raw.channel_name] : 0;
    let plusOneCount = plusOneMap[item.raw.channel_name] > 0 ? bravoMap[item.raw.channel_name] : 0;
    let toSize = Array.isArray(item.to) ? item.to.length : 1;
    let fromSize = Array.isArray(item.from) ? item.from.length : 1;
    let plusOneSize = item.plus_one_set ? item.plus_one_set.length : 0;
    bravoCount += toSize * fromSize;
    plusOneCount += toSize * fromSize * plusOneSize;
    bravoMap[item.raw.channel_name] = bravoCount;
    plusOneMap[item.raw.channel_name] = plusOneCount;
  });
  return Object.keys(bravoMap)
    .sort((a,b) => { return bravoMap[b] + plusOneMap[b] - bravoMap[a] - plusOneMap[a] })
    //.slice(0, 5)
    .map(key => {
      return [key, bravoMap[key], plusOneMap[key]];
    });
};


let notify = async () => {
  const { WebClient } = require('@slack/web-api');

  const web = new WebClient(process.env.SLACK_TOKEN);

  // This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
  const conversationId = process.env.NOTIFY_CHANNEL;

  const MongoClient = require('mongodb').MongoClient;
  let mongoClient = await MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
  let mongoDb = mongoClient.db(process.env.MONGODB_DB);

  // Simple raw query TODO optimize mongoDB
  let allThx = (await mongoDb.collection("Bravos").find({
    "raw.team_domain": process.env.SLACK_NAMESPACE
  }).toArray());
  let last7DaysThx = (await mongoDb.collection("Bravos").find({
    "raw.team_domain": process.env.SLACK_NAMESPACE,
    timestamp: {
      $gt: dateFns.subDays(new Date(), 7)
    }
  }).toArray());
  let topTo = top(allThx, `to`);
  let topFrom = top(allThx, `from`);
  let topToLast7Day = top(last7DaysThx, `to`);
  let topFromLast7Day = top(last7DaysThx, `from`);
  let topChannel = countTopChannel(allThx);


  (async () => {
    // See: https://api.slack.com/methods/chat.postMessage

    const res = await web.chat.postMessage(
      {
        channel: conversationId,
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": ":medal: *好人墙* :medal:"
            },
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*最近7天排行榜*"
            },
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": topFromLast7Day.map((item, i) => `${getMedal(i)} *${item[0]}* 发出 *${item[1]}* 张好人卡 (+${item[2]}赞)`).join(`\n`)
            },
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": topToLast7Day.map((item, i) => `${getMedal(i)} *${item[0]}* 收到 *${item[1]}* 张好人卡 (+${item[2]}赞)`).join(`\n`)
            },
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*总排行榜*"
            },
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": topFrom.map((item, i) => `${getMedal(i)} *${item[0]}* 发出 *${item[1]}* 张好人卡 (+${item[2]}赞)`).join(`\n`)
            },
          },

          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": topTo.map((item, i) => `${getMedal(i)} *${item[0]}* 收到 *${item[1]}* 张好人卡 (+${item[2]}赞)`).join(`\n`)
            },
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*最暖心频道*"
            },
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": topChannel.map((item, i) => `${getMedal(i)} *${item[0]}* 一共有 *${item[1]}* 张好人卡 (+${item[2]}赞)`).join(`\n`)
            },
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `<http://thx.zgzggala.org|查看好人墙> <http://thx.zgzggala.org|查看排行榜>`
            },
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
        ]
      });

    // `res` contains information about the posted message
    console.log('Message sent: ', res.ts);
  })();
};
let main = async  function() {
  require(`dotenv`).config();
  console.log(`start`);
  await notify();
  console.log(`done`);
};

if (require.main === module) {
  main();
}
module.exports = {
  notify: notify
};
