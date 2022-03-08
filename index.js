const crypto = require('crypto');


/** 声明加密解密类 */
class WeCrypto {
  state;

  /**
   * @param {{token:string, encodingAESKey:string, query:{timestamp:string, nonce:string, echostr:string}}} state 配置内容
   */
  constructor(state) {
    this.state = state;
  }

  /**
   * 生成校验签名
   * @returns {string}
   */
  getSignature() {
    const { token, query } = this.state;
    let arr = [token, query.timestamp, query.nonce, query.echostr];
    arr = arr.sort();

    let hash = crypto.createHash('sha1')
    hash.update(arr.join(''))
    const sha1Res = hash.digest("hex");
    return sha1Res;
  }

  /**
   * 解密消息
   * @returns {{message:string, id:string, random:Buffer}}
   */
  decryptMsg() {
    const { query, encodingAESKey } = this.state;
    const { key, iv } = this.parseEncodingAESKey(encodingAESKey);

    // asekey 解密
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(false);

    const deciphered = this.pkcs7Unpad(Buffer.concat([
      decipher.update(query.echostr, 'base64'),
      decipher.final(),
    ]));
    const length = deciphered.readUInt32BE(16);

    return {
      message: deciphered.slice(20, length + 20).toString(),
      id: deciphered.slice(length + 20).toString(),
      random: deciphered.slice(0, 16),
    };
  }

  /**
   * @param {Buffer} data 
   * @returns 
   */
  pkcs7Unpad(data) {
    const padLength = data[data.length - 1];
    /* istanbul ignore if */
    if (padLength < 1 || padLength > 32) {
      return data;
    }
    return data.slice(0, data.length - padLength);
  }

  /**
   * 解码并校验 encodingAESKey
   * @param {string} encodingAESKey 
   * @returns { {key: Buffer, iv: Buffer} }
   */
  parseEncodingAESKey(encodingAESKey) {
    const key = Buffer.from(`${encodingAESKey}=`, 'base64');
    if (key.length !== 32) {
      throw new Error('invalid encodingAESKey');
    }
    const iv = key.slice(0, 16);
    return { key, iv };
  }
}

module.exports = WeCrypto