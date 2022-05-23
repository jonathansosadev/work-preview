/** A way to compress an unordered subset of all our garages ids
 * Instead of storing a big list of ids in db, we can only store a compressed list
 * Usage:
 *
 * <>COMPRESSING<>
 * const gil = new GarageIdsList(garageIds); // garageIds is the liste of all our garage Ids (as string)
 * gil.set('583c452e5c2f5519000bba87');
 * gil.set('587509db89f3311a00b740f8');
 * gil.set('585ce672a993691a00f9e6cb');
 * gil.set('586cc5c6d3e89b1a00a1f25d');
 * const compressed = gil.getEncodedSubset();
 * console.log(compressed);
 * > 023011101j11201k11102bl
 *
 *
 * <>DECOMPRESSING<>
 * const subset = GarageIdsList.decodeSubset(garageIds, '023011101j11201k11102b');
 * console.log(subset);process.exit()
 * [ '583c452e5c2f5519000bba87',
 * '585ce672a993691a00f9e6cb',
 * '586cc5c6d3e89b1a00a1f25d',
 * '587509db89f3311a00b740f8' ]
 */
/* eslint-disable no-console */

class GarageIdsList {
  // the subset begins empty but we need first a list of all the garageIds
  constructor(allGarageIds) {
    this.allGarageIds = JSON.parse(JSON.stringify(allGarageIds));
    this.idToIndex = {};
    let index = 0;
    allGarageIds.forEach((id) => {
      this.idToIndex[id] = index++;
    });
    this.bitset = []; // TODO use a library to do something more memory efficient
    for (let i = 0; i < this.allGarageIds.length; i++) {
      this.bitset[i] = 0;
    }
  }
  // add a garageId to the subset
  set(garageId) {
    const index = this.idToIndex[garageId];
    if (index === null) {
      throw new Error(
        `GarageId ${garageId} not supported, check if the GarageIdsList was initialized with all the garageIds (as string) possible`
      );
    } // eslint-disable-line
    this.bitset[index] = 1;
  }
  // return all the garageIds
  getAllGarageIds() {
    return JSON.parse(JSON.stringify(this.allGarageIds));
  }
  // lets write a block to say we have 53 0s in a row
  // first char tells us if it 0s or 1s => [0xxx]
  // second char tells us of many chars we need to encode the value (24) in base 36 => [02x]
  // last chars encode the value in b26 (53) => [021h]
  _encode(bit, count) {
    // DEBUG console.log(`_encode(${bit}, ${count})`);
    const tail = count.toString(36);
    const size = bit ? 'ABCDEFGHI'.charAt(tail.length - 1) : tail.length;
    return `${size}${tail}`;
  }
  // return the compressed subset of garages added with `set`
  getEncodedSubset() {
    // USE a simple RLE
    // returns a string
    // the string is made of blocks
    // one block is at least 3 chars, eg [xxx] or [xxxx] and encode the repetition of 0s or 1s (see _encode)
    let code = '';
    let bit = this.bitset[0];
    let count = 1;
    for (let i = 1; i < this.allGarageIds.length; i++) {
      const b = this.bitset[i];
      if (b === bit) {
        count++;
      } else {
        const block = this._encode(bit, count);
        code += block;
        bit = b;
        count = 1;
      }
    }
    const block = this._encode(bit, count);
    code += block;
    return code;
  }

  // return a list of garageIds from an encoded subset
  static decodeSubset(allGarageIds, encodedSubset) {
    if (typeof allGarageIds === 'string') {
      allGarageIds = allGarageIds.match(/.{1,24}/g); // eslint-disable-line no-param-reassign
    }
    const subset = [];
    let MODE = 0; // mode 0 => get the bit, 1 => get the number of chars used to encode the number, 2 => get the number
    let bit = 0;
    let size = 0;
    let index = 0;
    for (let i = 0; i < encodedSubset.length; i++) {
      const c = encodedSubset.charAt(i);
      if (MODE === 2) {
        let n = c;
        size--;
        while (size > 0) {
          i++;
          n += encodedSubset.charAt(i);
          size--;
        }
        const count = parseInt(n, 36);
        // DEBUG console.log(`_decode(${bit}, ${count})`);
        if (bit) {
          for (let j = 0; j < count; j++) {
            subset.push(allGarageIds[index + j]);
          }
        }
        index += count;
        MODE = 0;
      } else if (MODE === 1) {
        size = parseInt(c, 10);
        MODE = 2;
      } else if (MODE === 0) {
        bit = 'ABCDEFGHI'.indexOf(c.toString()) >= 0 ? 1 : 0;
        size = 'ABCDEFGHI'.indexOf(c.toString()) >= 0 ? 'ABCDEFGHI'.indexOf(c.toString()) + 1 : parseInt(c, 10);
        // bit = parseInt(c, 10);
        MODE = 2;
      }
    }
    return subset;
  }
}

/** * TESTS */
/* eslint-disable */
/* console.log('Testing compression...');
const garageIds = [
  "577a30d774616c1a0056c263", "559a9b04d4434d1900014ac9", "559d5d64c10cec19000227b2", "5609171770ad25190055d4fc", "5609173770ad25190055d4fd", "5609174f70ad25190055d4fe", "5609175e70ad25190055d4ff", "5609177770ad25190055d500", "5609178370ad25190055d501", "5609178c70ad25190055d502", "5665922cd6c403604b655e45", "5666d7b0d6c403604b655e48", "5666d903d6c403604b655e4b", "56f179f82e9e671a00162e71", "56f17a0b2e9e671a00162e72", "56fc47f75e42f41a00200f04", "570ec7213bbdaa1a004edcc0", "570ec73e3bbdaa1a004edcc1", "570f8947e672d71a00cbd666", "5723d39e897c581a000ae7e2", "5723d5b2897c581a000ae7e3", "57308e1d198cee1a00ee7b0a", "5730b3ac5a3d4a1a00b44d86", "5730b6525a3d4a1a00b44d88", "5730bab25a3d4a1a00b44d90", "5730bbc05a3d4a1a00b44d9c", "5732ffa438c0161a00830304", "573c40875e0d041a006e094f", "573c42f05e0d041a006e0950", "573d96921595331a000ebb16", "5745ba2ca5acd11a004cb748", "5745bd1da5acd11a004cb767", "5745bebba5acd11a004cb76c", "574c396268c28e1a0099ab74", "574eb29a54a5851a00970850", "574eb3b854a5851a00970851", "5763bbc64b2ce01a006ed35b", "5763ca6e4b2ce01a006ed37c", "5767c1bff0862f1a0023fee2", "5767c48df0862f1a0023fee4", "576ac1482838471a002c6c0b", "577b6d7305bcba1a00a945f2", "5785f3d640e0dc1a006b24d0", "578c999b7213261a00b1c08a", "578c9ac67213261a00b1c08b", "578c9b897213261a00b1c08c", "5791f30e38c2fa19007421ad", "5791f56738c2fa19007421c3", "5798e96cd237af1900fe26f0", "5799cc105e5f991900afeef1", "57c7ebc5ac9124190007835c", "57dbc53ba0c73f19007d2f89", "57ea77ad125cf3190052afa2", "57ea8083125cf3190052b223", "57f3b5854566381900623c7d", "57f3b7594566381900623c8b", "57f3b7e54566381900623c91", "57f3b8454566381900623c92", "57f3b8f04566381900623c9c", "57fcb7fc6edd8519001fbd85", "57fcb8fd6edd8519001fbd8a", "57fcba3e6edd8519001fbd8e", "57fcbaef6edd8519001fbd93", "58009898227404190028a8f4", "5800af18227404190028af70", "5800b160227404190028af7c", "5800b21b227404190028af7e", "5800b680227404190028af89", "5800b7e4227404190028b033", "5800b995227404190028b8be", "5804f17fcd6e011900c80cc5", "5804f21fcd6e011900c80cd3", "5809e52fc87279190075925a", "580a39a3c872791900761740", "580a3ab5c8727919007617a3", "580a3b3cc8727919007617ca", "580f7949128b2e1900144d93", "58107b7cbab51f1900259e71", "58107ce2bab51f1900259e8a", "58107dcabab51f1900259e92", "58107e6ebab51f1900259ea2", "58107f24bab51f1900259eb8", "5810a9c027620119008ddea3", "5810ab0b27620119008de187", "5810ad0027620119008de42c", "5810b39127620119008de753", "5812285000e033190059512f", "58170408ac48541900cf0a25", "581704faac48541900cf0a2d", "58170686ac48541900cf0a40", "581b39779a66dd1900212dfa", "5824902fc15c611a00d53dd3", "582491d0c15c611a00d53e08", "58249219c15c611a00d53e09", "582494ebc15c611a00d53e3e", "58249584cd1b991a00936b95", "58249602cd1b991a00936b96", "582ac33146b84a1a00752319", "583c3f585c2f5519000bba6b", "583c3ff05c2f5519000bba6d", "583c407f5c2f5519000bba73", "583c41115c2f5519000bba77", "583c41bb5c2f5519000bba7a", "583c42b25c2f5519000bba7b", "583c43315c2f5519000bba7e", "583c43d05c2f5519000bba80", "583c445d5c2f5519000bba81", "583c44ca5c2f5519000bba84", "583c452e5c2f5519000bba87", "583c45b35c2f5519000bba92", "583c46225c2f5519000bba95", "583c468e5c2f5519000bba9f", "583c48ff5c2f5519000bbab3", "583c717c6aa18c1900299872", "583c72466aa18c190029987f", "583c72a96aa18c1900299882", "583c73146aa18c1900299892", "583c736d6aa18c19002998a3", "583c73e26aa18c19002998c7", "58457f4b7b43441a00d7d793", "584678e9bd90ec1a00f8dc54", "58467a6abd90ec1a00f8dc5a", "584991807ba3321a00a4b230", "585017d008263a1a0074040b", "58516a3baa46a21a0007498c", "585abaeacf50e21a00caba86", "585bb3d28948591a00dedb4b", "585ce4ffa993691a00f9e6a5", "585ce672a993691a00f9e6cb", "586cc5c6d3e89b1a00a1f25d", "586cc5d4d3e89b1a00a1f25e", "586cc8cdd3e89b1a00a1f30a", "586cc9d2d3e89b1a00a1f327", "586ccacad3e89b1a00a1f356", "586ccbc1d3e89b1a00a1f37a", "586ccccad3e89b1a00a1f3ad", "586ccdffd3e89b1a00a1f3cd", "586ccedfd3e89b1a00a1f3e7", "586ccffad3e89b1a00a1f3fe", "586cd0f3d3e89b1a00a1f418", "586cd18bd3e89b1a00a1f434", "586cd235d3e89b1a00a1f449", "586cd39fd3e89b1a00a1f457", "586cd447d3e89b1a00a1f472", "586cd548d3e89b1a00a1f481", "586cd699d3e89b1a00a1f4b4", "586cd822d3e89b1a00a1f4dc", "586cd951d3e89b1a00a1f4ff", "587508f489f3311a00b740ef", "5875099c89f3311a00b740f2", "587509db89f3311a00b740f8", "5878a552a4121b1a00bcdb7b", "5878a558a4121b1a00bcdb7c", "5878a8b6a4121b1a00bcdbae", "5878abb2a4121b1a00bcdbbf", "5878ad63a4121b1a00bcdbcb", "5878ae44a4121b1a00bcdbda", "5878af01a4121b1a00bcdbed", "5878af18a4121b1a00bcdbee", "5878b031a4121b1a00bcdbf0", "5878b0e0a4121b1a00bcdbf3", "5878b17ba4121b1a00bcdbf7", "5878b273a4121b1a00bcdbfb", "5878b302a4121b1a00bcdbfe", "5878b39aa4121b1a00bcdbff", "58790193a4121b1a00bd0e0e", "58790442a4121b1a00bd0e5d", "58790540a4121b1a00bd0e87", "587905eba4121b1a00bd0e9a", "58790688a4121b1a00bd0ea8", "58790728a4121b1a00bd0eb7", "58790dd2a4121b1a00bd1025", "58790ee2a4121b1a00bd103c", "587e4ae3c558d31a0019beb2", "587e5095b654761a00d5cd17", "5880d73e4fe97e1a002255cd", "58871d14ec23f91a00fcbb7d", "58871e4dec23f91a00fcbbcd", "58871f5fec23f91a00fcbbe7", "58872b0eec23f91a00fcbd67", "58872c0eec23f91a00fcbd73", "58872d3dec23f91a00fcbd87", "5887752d83a2871a002da638", "5887769e83a2871a002da65a", "588794e73b74d41a0015c760", "5887962f3b74d41a0015c7d7", "588a28fce1d98a1a0004d4d3", "588a38a56f47f21a00dd5bae", "588b2e48d6a8961a00094be0", "588b2e8ed6a8961a00094be1", "58944f50b6df871a006c34dc", "5894b83bcffbb01a009d5d42", "5894b90dcffbb01a009d5d66", "5894b9adcffbb01a009d5d73", "5894b9f1cffbb01a009d5d77", "58988ab26d32f31a007c6728", "5898a4a02f22a61a00516b38", "5898a71c2f22a61a00516c12", "5898b2b02f22a61a00516f64", "5898bb642f22a61a005171ec", "589991a27c1d911a004327f8", "58ad5448e1b38d1a0073c908", "58ad559ae1b38d1a0073c94b", "58ad5a53e1b38d1a0073ca6d", "58ad5b97e1b38d1a0073caa6", "58ad5d9ee1b38d1a0073caec", "58ad5f5ce1b38d1a0073cb10", "58ad6196e1b38d1a0073cb81", "58ad62eee1b38d1a0073cbe5", "58ad6440e1b38d1a0073cc59", "58ad653ae1b38d1a0073cc6b", "58ad65a2e1b38d1a0073cc7e", "58ad6defe1b38d1a0073cdd3", "58ad726ae1b38d1a0073cead", "58ad7392e1b38d1a0073cecc", "58ad7452e1b38d1a0073cecf", "58ad782be1b38d1a0073d6d5", "58ad7914e1b38d1a0073d952", "58ad7a63e1b38d1a0073dcb8", "58ad7be4e1b38d1a0073e08c", "58b150860d30781a0097a96a", "58b1558d0d30781a0097aa1e", "58b156800d30781a0097aa36", "58b157fc0d30781a0097aa44", "58b2a29069390b1a00c83f97", "58b2a6bf69390b1a00c84091", "58b2a82469390b1a00c840b2", "58b2a94669390b1a00c840db", "58b2aa5269390b1a00c840f6", "58b2ab3369390b1a00c8410c", "58b3307491e5851a002296f6", "58b3315f91e5851a00229710", "58b337d591e5851a002297e0", "58b338de91e5851a002297ea", "58b33f1a91e5851a002298d5", "58b69393f5b5d71a00efc8f3", "58b699c8f5b5d71a00efc9a4", "58b81a809c26591a0091058e", "58bebbc97643261a004e48a4", "58bebdbb7643261a004e4a5d", "58bec2347643261a004e4ca5", "58bec38f7643261a004e4d86", "58bec49d7643261a004e4e53", "58c12186e8574a1a00efcdff", "58c79b912eeceb1a00f21109", "58c7b5fe2eeceb1a00f220be", "58c7b8fd2eeceb1a00f220bf", "58c96f16627a5f1a00c4dd1a", "58c9705c627a5f1a00c4dec7", "58cba89cdaa35d1a00667ff3", "58cbabafdaa35d1a0066809b", "58cbad20daa35d1a006680fa", "58d15a69d02ee01a00b1f6f7", "58d15c1ed02ee01a00b1f7fb", "58d16066d02ee01a00b1fa89", "58d160ddd02ee01a00b1fa92", "58da3f116a2ec51a00c10170", "58da40ff6a2ec51a00c10450", "58da43f06a2ec51a00c106d6", "58da46236a2ec51a00c10ab0", "58da5b677d4c761a00d237a9", "58da5cf87d4c761a00d239b7", "58da65277d4c761a00d23f65", "58da69ae7d4c761a00d242b4", "58da6bd67d4c761a00d24406", "58da6cb67d4c761a00d244a8", "58da6dc37d4c761a00d24510", "58de083f66146e1a00376ccb", "58de0a5b66146e1a00376d53", "58de0ee7d6018e1a004e24fb", "58de107cd6018e1a004e2550", "58e66ba377164e1a00917ac9", "58ebba9672c2051a00bf0326", "58ec87428a1c8e1a008a5bbc", "58ee95b5c587891a0017b720", "58ee97cf619c051a00722d5f", "58f8650726bd621b006d4cc4", "58fdf63dc4843c1a004441b7", "58fe001cc4843c1a0044452d", "5901b77d76dd721900b868de", "5901e3640323d7190051bbcd", "5901e64fb44dd61900017d11", "5901e876b44dd619000182fe", "5901e97bb44dd6190001861b", "5901eb3102ae701900c7be3e", "5901ebf002ae701900c7c071", "5901ec9b02ae701900c7c1f6", "5901f4568ef56f19001f76a6", "5901f6cc1f9be31900fc1810", "5901f7db1f9be31900fc1a63", "59021025f55a701900c9240a", "5902162397a625190098987d", "590217e097a6251900989cc0", "59021a823ae25e19005a490e", "59021b0c3ae25e19005a4a46", "59021b933ae25e19005a4b83", "59021bf33ae25e19005a4c4f", "59021c7d3ae25e19005a4dba", "59021cd13e25c51900c81053", "59021db63e25c51900c812db", "5902f5cd2e8d8e1900c70111", "5902f6fb2e8d8e1900c70370", "590312f9e02bd11900a20ec5", "590338825b6ecd190032d5a1", "590358403235a9190089ecab", "59035adba50f4019006c3124", "59035be0a50f4019006c3467", "59035d1da50f4019006c3868", "59035de0a50f4019006c3adc", "59035e1fa50f4019006c3bb1", "59035f2e50974b1900931b25", "59035fc050974b1900931d03", "590837b0c0981219006aea90", "59084bac5f830f1900f6d6de", "59084e6c480e21190009af5a", "59085073480e21190009b40f", "590851d3480e21190009b71c", "59085279aa345e1900d5cf3c", "5908534bf05046190057e344", "59088d56f9d62d1900ba0a93", "5908913e30cf5d1900ebffdd", "590992e6aa96991900c22736", "590994b1aa96991900c22751", "590995fbaa96991900c2277b", "59099777aa96991900c227c3", "59099818aa96991900c227df", "59099f01aa96991900c228e6", "5909a1afaa96991900c2293d", "5909d5fb8cff19190069d4c3", "590ae4a78cff1919006a31f7", "590ae6a98cff1919006a3231", "590ae72d8cff1919006a323c", "590ae8108cff1919006a3279", "590ae8b68cff1919006a328d", "590ae98f8cff1919006a32c4", "590aebd68cff1919006a330e", "590aebef8cff1919006a330f", "590aecc68cff1919006a334c", "590af6878cff1919006a3887", "590b1c7433c3b51900b64999", "590b1e2c33c3b51900b64d45", "590b1ea533c3b51900b64dda", "590b1f2d33c3b51900b64ea1", "590b1fc233c3b51900b64eec", "590b3b3e33c3b51900b66e0f", "590b3f3533c3b51900b66ff8", "590b411633c3b51900b67102", "590b427c33c3b51900b671c0", "590b441033c3b51900b67291", "590c7423592473190089560d", "590c7a11592473190089801f", "590c7aad59247319008980f5", "590c7b18592473190089819b", "590c7c1d592473190089831d", "590c7d4359247319008984b1", "590c7e095924731900898666", "590c7e7459247319008986e8", "590c7e7459247319008986e9", "590c7f505924731900898856", "590c800e5924731900898979", "590c80e75924731900898a83", "590c86a659247319008993d4", "590c87b959247319008995c2", "590c8835592473190089965b", "590c88cf59247319008997ac", "590c89a459247319008998a0", "590c8a465924731900899957", "590c93f2592473190089a045", "590ca2c7592473190089b0cb", "59119e82fb2da119004afdb1", "5911b6fefb2da119004b12cf", "5911b83dfb2da119004b13ba", "5911b9a5fb2da119004b146b", "5911bc09fb2da119004b1546", "5911bdc1fb2da119004b15d1", "5911bec8fb2da119004b1662", "5911bf5efb2da119004b16ae", "5911d478fb2da119004b1ec4", "5911d598fb2da119004b1ef9", "5911da79fb2da119004b2041", "5911db06fb2da119004b207e", "5911db82fb2da119004b2090", "5912deec7b17081900209b1b", "5912e0287b17081900209b4a", "5912e2007b17081900209b7b", "5912e2737b17081900209b8a", "5912e3447b17081900209bab", "5912e34d7b17081900209bb3", "5912e4937b17081900209be8", "5912e6967b17081900209c49", "5912e7617b17081900209c94", "5912e9177b17081900209cba", "5912fe227b1708190020c4e3", "5912fe917b1708190020c5bd", "5912ff0f7b1708190020c61e", "591300637b1708190020c8e4", "59131cd58176af1900eea66b", "59131d028176af1900eea67e", "59131d168176af1900eea688", "59131d7a8176af1900eea6d4", "59131db98176af1900eea70f", "5914616e8706791900e3d39f", "591461e38706791900e3d41a", "591464048706791900e3d5e8", "591465f78706791900e3d789", "591467628706791900e3d97e", "5914692c8706791900e3da71", "59146c0e8706791900e3dca0", "59146cb68706791900e3dd06", "59146da28706791900e3ddaf", "59146e508706791900e3de23", "59146f188706791900e3dea4", "591470048706791900e3df4d", "591470ab8706791900e3dfc2", "591471178706791900e3e040", "591471c48706791900e3e0b9", "5914723f8706791900e3e11c", "591473868706791900e3e1c1", "591474648706791900e3e259", "591481ae8706791900e3eb95", "591482778706791900e3ec0c", "591483848706791900e3ed21", "591483fd8706791900e3ed99", "591484a68706791900e3ee2d", "5914863a8706791900e3ef7c", "591486e78706791900e3effc", "591487d18706791900e3f10e", "591487f98706791900e3f12b", "591488cc8706791900e3f1b7", "591489408706791900e3f1eb", "59148a2f8706791900e3f298", "59148b0f8706791900e3f301", "59148ba98706791900e3f32b", "59148e8e8706791900e3f40a", "59148f408706791900e3f46e", "5914901c8706791900e3f4f3", "5915aa8ad8f0041a00a8ca8a", "5915aaf4d8f0041a00a8cbbd", "5915ab56d8f0041a00a8ccf9", "5915afd1d8f0041a00a8d37d", "5915b075d8f0041a00a8d416", "5915b116d8f0041a00a8d4a2", "5915b120d8f0041a00a8d4a8", "5915b1f3d8f0041a00a8d561", "5915b3c6d8f0041a00a8d76a", "5915b4c7d8f0041a00a8d88c", "5915b55ad8f0041a00a8d8ee", "5915b5c3d8f0041a00a8d957", "5915b62dd8f0041a00a8d995", "5915b818d8f0041a00a8dbdf", "5915b8c8d8f0041a00a8dd20", "5915b9a7d8f0041a00a8ddcf", "5915bcf8d8f0041a00a8e04b", "5915bd8fd8f0041a00a8e08a", "5915be67d8f0041a00a8e10b", "5915becfd8f0041a00a8e14b", "5915c046d8f0041a00a8e1fa", "5915c0d9d8f0041a00a8e280", "5915c155d8f0041a00a8e313", "5915c1ecd8f0041a00a8e3bb", "5915c465d8f0041a00a8e56a", "5915c565d8f0041a00a8e655", "5915c5f7d8f0041a00a8e6dc", "5915c7aad8f0041a00a8e7ff", "5915c8b7d8f0041a00a8e8d5", "5915c91bd8f0041a00a8e923", "5915ccefd8f0041a00a8ebd8", "5915ce6ed8f0041a00a8ed62", "5915cf45d8f0041a00a8ee58", "5915cfedd8f0041a00a8eeda", "5915d088d8f0041a00a8ef82", "5915d12ed8f0041a00a8f019", "5915d1abd8f0041a00a8f0ab", "5915d216d8f0041a00a8f0fb", "5915d27cd8f0041a00a8f147", "5915d321d8f0041a00a8f196", "5915d3bcd8f0041a00a8f21f", "5915d489d8f0041a00a8f2fe", "5915d52dd8f0041a00a8f34f", "5915d5d2d8f0041a00a8f3d0", "5915d640d8f0041a00a8f444", "5915d694d8f0041a00a8f486", "5915d716d8f0041a00a8f4e7", "5915d78cd8f0041a00a8f56c", "5915d7e3d8f0041a00a8f5dd", "5915d873d8f0041a00a8f638", "5919c1ddf06c541a00f81dbb", "5919c230f06c541a00f81dea", "5919c2c2f06c541a00f81e11", "5919c305f06c541a00f81e1b", "591c436c0261751a00130d93", "591c44880261751a00130fd1", "591c467f0261751a001311dc", "591c473c0261751a00131294", "591c47dd0261751a00131317", "591c48990261751a001313b3", "591c49420261751a00131448", "591c4ace0261751a00131559", "591c4bb80261751a001315dd", "591c4c660261751a00131626", "591c4d110261751a0013165a", "591c4dbf0261751a001316a8", "591da6702ec0da1a00fb5d52", "5922a2c2ba8e6a1a0057fc03", "592547da0292211a002ea143", "592848d99ab17c1a0024c489", "592c2da658de681a00a95470", "592c3b0258de681a00a95a0f", "592c3cc958de681a00a95b1c", "592c3eb758de681a00a95bbe", "592c409b58de681a00a95d06", "59300c420a83931a004f2705", "593032230a83931a004f595b", "59303828a5917d1a00f7fabb", "593039c1a5917d1a00f7fce4", "59316ba75adcf71a00a033c0", "593806a5dc2eff1900e2f132", "593807e1dc2eff1900e2f1e2", "59380881dc2eff1900e2f253", "593809f9dc2eff1900e2f2f2", "59397ebf9b90721900cc1f7b", "59397ef89b90721900cc1fa4", "593a98cd61b3e91900fc72b2", "593a9afd61b3e91900fc7541", "593a9cb161b3e91900fc769c", "593a9d3d61b3e91900fc7783", "593a9e3c61b3e91900fc78cc", "593aa02f61b3e91900fc7aa9", "593aa1c661b3e91900fc7cc5", "593aa33861b3e91900fc7e9c", "593abddf61b3e91900fcb151", "593abfcb61b3e91900fcb2bf", "593eb6639723d11a0001cff3", "5948f44cbb9b861900180ff4", "594bcb7ad765211900013309", "5950c4367f97471900baf269", "5950c5617f97471900baf364", "5950c65b7f97471900baf426", "5950fee6d401be1900a17500", "59564b347f711c1a0066053c", "59564c167f711c1a006606ba", "59564d477f711c1a006608cd", "59564dd37f711c1a00660979", "59564ec47f711c1a00660cb7", "595a18a2e690e01a002633df", "595ce85fa917841a00dfd069", "595ce9c8a917841a00dfd2cf", "595ceab6a917841a00dfd48b", "595d0ca0a917841a00dffea5", "595d0dffa917841a00dfffb2", "59633ccdc255f61a000a3490", "59633e64c255f61a000a35ef", "596c6ee458b9e31a00f6e2ad", "596c6fdf58b9e31a00f6e355", "596ddcd9acb5bc1a00278f4c", "596df69d9678691a0055d7e9", "596df7649678691a0055d9e8", "596df7c89678691a0055db5e", "5970bf52354bc31a00003083", "5975aa7c9afef21a00ae989e", "5975aad09afef21a00ae98de", "599eae6ceb5b811a00bff72b", "599eae6eeb5b811a00bff730", "599ec3b4eb5b811a00c045c1", "599ec4ceeb5b811a00c04867", "59a045b6b319ce1a004cb985", "59a046a6b319ce1a004cba0a", "59a55ec91cc9e91a00740e39"]; // eslint-disable-line

// pick n random garageIds, one line for the lulz (thx stackoverflow)
function randomIds(ids, n) {
  return JSON.parse(JSON.stringify(ids)).sort(() => 0.5 - Math.random()).slice(0, n);
}
// check if to arrays are the same, destructive but funny
function arraysEqual(a1, a2) {
  return JSON.stringify(a1.sort()) === JSON.stringify(a2.sort());
}
[5, 10, 20, 50, 100, 200, 500].forEach((n) => {
  console.log('------------------------------------------------------------------------');
  const l = new GarageIdsList(garageIds);
  const list1 = randomIds(garageIds, n);
  list1.forEach(id => l.set(id));
  const compressed = l.getEncodedSubset();
  console.log(`Compressinf a subset of ${n} garages`);
  console.log(`Uncompressed size: ${garageIds[0].length * n}`);
  console.log(`Compressed size: ${compressed.length} (${Math.round((100 * compressed.length) / (garageIds[0].length * n))}%)`);
  console.log(compressed);
  const list2 = GarageIdsList.decodeSubset(garageIds, compressed);
  if (!arraysEqual(list2, list1)) {
    console.log('Problem with the following output:');
    console.log(list1);
    process.exit();
  }
});

console.log('\n=>\nSuccess!');*/

module.exports = GarageIdsList;