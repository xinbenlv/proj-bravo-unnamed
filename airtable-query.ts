var Airtable = require('airtable');
console.assert(process.env.AIRTABLE_KEY, 'need to define export AIRTABLE_KEY= <key>');
var base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base('appHfV3iolIVA2fq4');

let loadTable = async function(tableName):Promise<Array<any>> {
  return new Promise<Array<any>>((resolve, reject) => {
    let pages = [];
    base(tableName).select({
      // Selecting the first 1000 records in Grid view:
      maxRecords: 10000,
      view: "Grid view"
    }).eachPage(function page(records:Array<any>, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      pages = pages.concat(records);
      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();

    }, function done(err) {
      if (err) reject(err);
      else resolve(pages);
    });
  });
};

let main = async function() {
  let benefitPoints = await loadTable('福利点数');
  let volList = await loadTable('志愿者名单');
  //console.log(benefitPoints);
  // console.log(volList);
  let volunteerMap = {};
  let volPointsMap = {};
  for (const v of volList) {
    volunteerMap[v.id] = v;
    volPointsMap[v.id] = 0;
  }

  for (const b of benefitPoints) {
    let points = b.fields['点数'];
    let vols:Array<string> = b.fields['接收人(sheet)'];
    if (vols && points) for (const v of vols) {
      volPointsMap[v] = volPointsMap[v] + points;
      if (v == 'recK0iofjPvcDa75u')
        console.log(v, points);
    }
    else {
      console.log(`Warning, '接收人(sheet)' does not exist for b`, b.id, " or 点数 doesn't exist");
    }
    vols = null;
  }

  for (const volId in volPointsMap) {
    let points = volPointsMap[volId];
    let name = volunteerMap[volId].fields['Name'];
    console.log(name, points);
  }

};

main().catch(e => {
  console.error(e);
});

