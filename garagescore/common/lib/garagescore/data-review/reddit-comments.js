/** Create a corpus from a reddit sub to train our gibberish detector  */
const rest = require('restler');
const async = require('async');
const gibberishDetector = require('./gibberish-detector');
const fs = require('fs');
const readline = require('readline');

/* eslint-disable no-unused-vars */

const sub = 'france';

// get articles from reddit api
function apiArticles(after, cb) {
  const url = `https://www.reddit.com/r/${sub}/best.json`;
  const u = after ? `${url}?limit=100&after=${after}` : `${url}?limit=100`;
  console.log(u);
  rest
    .get(u)
    .on('complete', (data) => {
      cb(null, data);
    })
    .on('error', (err) => {
      console.error(err);
      process.exit();
    });
}
// get article's comments from reddit api
function apiComments(articleId, cb) {
  const u = `https://www.reddit.com/comments/${articleId}.json`;
  console.log(u);
  rest
    .get(u)
    .on('complete', (data) => {
      const comments = [];
      const cc = (data.length > 0 && data[1].data && data[1].data.children) || [];
      cc.forEach((c) => {
        let txt = c.data && c.data.body;
        txt = txt.trim();
        if (txt && txt !== '[deleted]' && txt !== '[removed]') {
          comments.push(txt);
        }
      });
      cb(null, comments);
    })
    .on('error', (err) => {
      console.error(err);
      process.exit();
    });
}
/* Return a list of articles ids*/
function listArticles(cb) {
  // eslint-disable-next-line max-len
  // cb(null, ['85iar7', '85io0o', '85jvss', '85m36l', '85li94', '85j9bj', '85jkjr', '85k65i', '85j34l', '85g816', '85jtzi', '85hij8', '85jsfr', '85htyk', '85hzhf', '85hclj', '85ldn6', '85hy39', '85ipk1', '85m8cg', '85kax8', '85iaxd', '85k4xl', '85h6f0', '85hrxn', '85jrvd', '85k8up', '85lpbv', '85i9u7', '85l24u', '85mo5m', '85fn1i', '85ia1t', '85mk2f', '85mi9q', '85ma5n', '85i3e6', '85js2r', '85mt68', '85ky71', '85mr7r', '85mqeu', '85bkzh', '85llhg', '85mm55', '85kql1', '859w3d', '85mjt7', '85j2at', '85imwn', '85laan', '85ilf9', '85m7in', '85m2ng', '85eagp', '85k224', '85krzg', '85k16p', '85kn4z', '85h9fn', '85ex3w', '85j4yz', '85n5of', '85n2j4', '85n1em', '85n0yi', '85n09v', '85mzet', '85k25z', '85l10x', '85msdl', '85mren', '85cuuq', '85mnua', '85mm9x', '85knor', '85i6cy', '85h1nl', '85hriz', '85ga3w', '85b4qn', '85d37i', '85my9o', '85mr7b', '85j8rg', '85eytr', '85idsi', '85cdpr', '85kk4g', '85bo08', '85fauj', '85kbyi', '85ir79', '85k5bf', '85bqx8', '85ckb4', '85g7ph', '85jpz8', '85jnsy', '85jmka', '85anaf', '85hanh', '85exvp', '85e6qx', '85e1m3', '85m936', '85b7ls', '85dfm0', '85ms34', '85juit', '85ii0b', '85gcfg', '85apk5', '85icyl', '85bhcq', '85ib4m', '85dued', '85kd37', '85c2x8', '85d8j0', '85bmig', '85dnam', '85curv', '85ef6o', '85eew8', '85a6jc', '85a06q', '85bl93', '85d1o4', '85dk1m', '85hi0o', '85ivhz', '85ckuy', '85g0q5', '85avs7', '85alwd', '85duru', '85dubl', '85ah3t', '85jz4g', '85dbty', '85dacf', '8573m9', '85bhxj', '85b220', '85ax4g', '85bxby', '85agtf', '85bhwd', '85c7yl', '85aw2e', '85j7fi', '85a6ts', '85aczl', '85bqvd', '85amfh', '858w0e', '852jgm', '85fmja', '855wzr', '85aeou', '853iaq', '859hgl', '85b0jr', '85aynl', '85dlyc', '85hvdr', '85ab9z', '85amcb', '855cs6', '85cmza', '85cmrd', '85cj9k', '85fj0p', '85dc06', '85330g', '85f1op', '8558s6', '853ne1', '853892', '853y19', '855y92', '85591w', '855uji', '85b28o', '855ral', '854y4u', '85awxh', '857mkc', '856ylc', '85and5', '853ina', '85cx7e', '852ogt', '856dxq', '857k75', '856zrq', '853gvj', '85d07p', '853pm4', '855n1f', '8543mu', '855few', '857k1t', '85cfks', '85djkq', '853vir', '853e53', '8561hz', '859pw2', '852ya2', '85ck19', '855nol', '853x6f', '857onr', '855t5q', '85d32f', '853842', '852gdy', '85d5j9', '84wzvb', '856a58', '84yaod', '855vej', '8559zr', '8544ib', '8539q4', '8551ge', '8530pk', '8583tj', '852ys7', '84zkyx', '854osc', '852p2y', '8564jq', '8562xl', '84u4z4', '85368w', '854uhm', '855pq5', '851j2y', '853gut', '852877', '857rdm', '854sa0', '8525sq', '852ndn', '853mdh', '853lxr', '852n35', '85123z', '855hvp', '853bax', '84v8np', '853vdj', '852efb', '84z3ol', '84zahs', '852ssb', '852cr3', '84znyn', '84zd90', '85719g', '84yk21', '84wbp5', '84y4us', '84y4sy', '84zhd7', '852elr', '8559pa', '84u2c4', '853j1k', '84wzdn', '853fe9', '84zhjs', '84yf9h', '85368s', '84vw3e', '84vov4', '84vjal', '84uixi', '84uhdf', '84ylj6', '851dks', '852teg', '84u6pd', '850mar', '84wpzp', '84rqhq', '84wbpm', '852n42', '856i10', '84v78o', '84vrjb', '84vtdy', '84vh05', '852edu', '8529sd', '84tha8', '8546cb', '84wf02', '84yhwu', '850a47', '84zpgi', '84v71m', '84v164', '853vs1', '8568lz', '84tp2u', '84tyfz', '84upq0', '84usvg', '84uycz', '8557xr', '84wysc', '84tsnv', '84ujcd', '84xs7x', '85086u', '84wzpv', '84vdfk', '84xgpv', '84xgg5', '84xe99', '84w0kh', '84rdue', '84wiws', '84xcwn', '84l81a', '84uwng', '84v5dt', '84vqiq', '84u92b', '84wdko', '84u7on', '852fz7', '84u3i1', '84unbi', '84u1yl', '84x7lt', '84m5rb', '84wf93', '84u47f', '84vbjg', '84tc6i', '84vyvw', '84txb1', '84vqmy', '84tujp', '84uppb', '84w3tp', '84trnu', '84tn3l', '84u5v2', '84tz35', '84vs3i', '84vquf', '84thc6', '84pwaf', '84u4jt', '84th3r', '84vh56', '84ttyc', '84w865', '84onjc', '84vxx1', '84oo8k', '84ugwg', '84u4x4', '84tt1p', '84tk04', '84tc7d', '84vgdu', '84vf70', '84uket', '84wwft', '84u2ql', '84m6oy', '84y0le', '84w9kh', '84p54x', '84w6mv', '84lz80', '84vylp', '84zp73', '84tsps', '84ns9n', '84r2gt', '84p3wz', '84ppne', '84u1y4', '84m6io', '84n98d', '84w4fl', '84oxwl', '84q5c4', '84u8bk', '84l6gb', '84n0hi', '84pjbe', '84u323', '84la6w', '84u09p', '84mpg7', '84khs9', '84mlw5', '84qxbj', '84opvh', '84p48k', '84lhft', '84m7jz', '84whsr', '84qi54', '84udxy', '84qrnv', '84oewa', '84lkpm', '84q0xa', '84u21u', '84lya0', '84x1ya', '84mpz0', '84ovhc', '84gqm4', '84l4gk', '84w7ex', '84l5bl', '84myxn', '84k6k9', '84nfi4', '84pwff', '84lj8o', '84naqz', '84s9v8', '84mwi9', '84o933', '84kpwg', '84n9jr', '84lcyf', '84mcz2', '84oi8g', '84vtb8', '84nvtt', '84nd0o', '84l5u2', '84kb8u', '84nhph', '84ttxl', '84neng', '84kxx1', '84mpnw', '84kvxx', '84o8r6', '84hkno', '84m41r', '84jdlq', '84jo0k', '84qoob', '84luab', '84jb2n', '84lkny', '84qc69', '84kejf', '84lng5', '84kymi', '84laqr', '84lewq', '84fl9v', '84t5ed', '84ks3n', '84pkuj', '84lpeg', '84kytd', '84nlkh', '84mlh8', '84ke2k', '84mdgt', '84ko7z', '84mxvs', '84kr8z', '84q6zj', '84q4bv', '84l0l8', '84esb8', '84mcev', '84d1m9', '84ppfb', '84d9mm', '84brzg', '84np0d', '84dojn', '84lx5n', '84ahtq', '84rte2', '84hl39', '84l8lh', '84q2q8', '84q29c', '84k4xp', '84n24z', '84j4fp', '84i7dv', '84pf6z', '84ksdt', '84hu9u', '84e1vk', '84qyju', '84hql9', '84l5f6', '84k20m', '84evp3', '84gtmg', '84dl6w', '84lvmm', '84jdhj', '84bvsg', '84gpmt', '84lpm0', '84loqs', '84o08s', '84br74', '84bnmp', '84q465', '84glre', '84l3jr', '84d278', '84qt4l', '84ik3t', '84d9qt', '84mkxj', '84kraz', '84kpum', '84f9mu', '84mx4d', '84cc7c', '84c9kt', '84ckat', '84ctmj', '84c1c8', '84c2jo', '84ed17', '84f379', '847peu', '84fk99', '84mqib', '84d680', '84if0s', '84d4ss', '84la0g', '84bjng', '84fz9e', '84e5e3', '84l7kh', '84lwxh', '84g8a2', '84lf78', '84dz64', '84j9x6', '84dees', '84bojw', '84cy10', '84co0o', '84ld4g', '84iprc', '84cvl8', '84e60u', '84d5f0', '84c4hi', '846rru', '84c529', '8486j5', '84czf1', '84dkzb', '84gdch', '84d2s2', '84ckx2', '84ljoc', '84b69x', '84aa36', '84c9vd', '8493tm', '84coll', '84kft5', '84cteu', '84c116', '84boqx', '84gmsk', '84glms', '84b21h', '842lb1', '84dko9', '844yyv', '849e9r', '84g3qk', '84boeb', '84d7c0', '84byux', '8463ha', '84b6b0', '84fci4', '84cq4g', '84f9ea', '84c70r', '84ls5x', '84bt71', '84f0vw', '8454vg', '84ex54', '84ji9x', '8464y7', '84bvg4', '8475xp', '84ea1c', '846l8h', '84kzak', '84a2x8', '84e1rx', '847aic', '849p0d', '848yiw', '843ga4', '84dk1k', '84ex2n', '84d220', '84g5wj', '84clj7', '843qzs', '84imyf', '848z9w', '843aj0', '84dnca', '8441qg', '8490b5', '84c47q', '842ygr', '843nd2', '8442fv', '843k0a', '843v6y', '845pmn', '843ysl', '847g8u', '84g00k', '8448yd', '84g2t3', '842sr6', '845mf4', '847u48', '848dx5', '847ewr', '8452un', '843dkh', '846fu8', '84bu54', '843nfr', '84anl9', '847l5g', '84bmld', '843bri', '844sry', '844ypv', '84e9iz', '84c6jb', '8455r0', '841x4l', '8487kq', '845p25', '842e17', '844ijz', '845bv3', '842bur', '83zbc6', '84bls8', '843dwa', '8466fu', '842atp', '8434uc', '847130', '84328w', '83yxfm', '842y70', '843s2w', '841you', '84491y', '842pmc', '83zs3k', '840e49', '8435r5', '842cv8', '843p25', '847160', '842xd7', '8435v3', '842od9', '8483el', '842j74', '8464kh', '8430t5', '84386n', '84370b', '842eik', '83xra5', '848t6n', '83tw7p', '83xr87', '842hl6', '846qug', '847ooc', '844qml', '842lp4', '83xqhq', '83xrek', '83xyss', '845cm3', '843q4l', '83t0if', '841ypw', '83ugtr', '83ulce', '83wejs', '843hwq', '847o84', '8404fl', '83x4os', '83ycf9', '83xf0q', '8400x2', '8459h8', '8461hi', '840dr0', '8409lj', '83ztuz', '83u97x', '845hio', '8461h6', '847r14', '83uy0g', '83unzj', '83ppif', '83wufv', '83tgln', '83qehi', '8442l7', '83z6qr', '8427h6', '83rmp4', '845fs9', '83vy81', '845bak', '83stm1', '83tl8d', '83vtjh']);
  let count = 0;
  let after = null;
  const articles = [];
  const maxCount = 30;
  async.whilst(
    () => count < maxCount,
    (next) => {
      count++;
      apiArticles(after, (err, res) => {
        if (res.data && res.data.children) {
          after = res.data.after;
          if (!after) {
            count = maxCount;
          }
          res.data.children.forEach((post) => {
            const id = post.data.id;
            articles.push(id);
          });
        }
        setTimeout(next, 2000); // Make no more than thirty requests per minute.
      });
    },
    (err) => {
      if (err) {
        console.error(err);
        process.exit();
      }
      cb(null, articles);
    }
  );
}
/** download comment and save them to a file */
function saveCommentsIntoAFile(path) {
  listArticles((e, articles) => {
    console.log(JSON.stringify(articles));
    console.log(`${articles.length} articles`);
    const stream = fs.createWriteStream(path);
    async.forEachSeries(
      articles,
      (articleId, next) => {
        apiComments(articleId, (err, comments) => {
          comments.forEach((comment) => {
            stream.write(`${comment.replace(/\n/g, ' ').replace(/http[^ ]+[ /]/g, ' ')}\n`);
          });
          setTimeout(next, 2000); // Make no more than thirty requests per minute.
        });
      },
      (err) => {
        stream.end();
        if (err) {
          console.error(err);
          process.exit();
        }
        console.log('bye');
      }
    );
  });
}
/** Compute the transitions matrices from a comments file */
function computeMatrices(path) {
  const comments = [];
  const lineReader = readline.createInterface({
    input: fs.createReadStream(path),
  });
  lineReader.on('line', (line) => {
    comments.push(line);
  });
  lineReader.on('close', (line) => {
    gibberishDetector.computeTransitionMatrices(comments, 15, 25, (err, models) => {
      console.log(JSON.stringify(models));
    });
  });
}
// saveCommentsIntoAFile('./comments.txt');
computeMatrices('./comments.txt');
