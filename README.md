### 使用说明

#### 安装

```node
# npm
npm install we-crypto -S

# yarn
yarn add we-crypto -S
```

#### 使用方式

```js
import WeCrypto from "we-crypto";

const we = new WeCrypto({
  token: "QDG6eK",
  encodingAESKey: "jWmYm7qr5nMoAUwZRjGtBxmz3KA1tkAj3ykkR6q2B2C",
	
  // 请求query参数中的内容
  query: {
    timestamp: "",
    nonce: "",
    echostr: ""
  }
});


// 1. 验证消息是否被篡改
let devSign = we.getSignature();
console.log(devSign === msg_signature);


// 2.解密消息内容
let xml = we.decryptMsg();
console.log(xml);
```

