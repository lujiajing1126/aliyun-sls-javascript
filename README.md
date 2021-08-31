# Aliyun SLS Client

> A modern impementation

## Install

```bash
$ npm install aliyun-sls-client
```

Or with yarn,

```bash
$ yarn add aliyun-sls-client
```

## Usage

```typescript
import { ClientBuilder } from 'aliyun-sls-client'

const c = new ClientBuilder().setProject("project")
    .setAccessKey("ak_id", "ak_secret")
    // https will be used for internet access while http will be used for intranet access
    .setEndpoint("cn-hangzhou.log.aliyuncs.com")
    .build()

c.getLog("logStore", "*").then((resp) => console.log(resp.data));
```

Please check https://help.aliyun.com/document_detail/29008.html for complete endpoint lists.

## Implemented APIs

- [x] `GetLogs`
- [x] `GetHistograms`

## License

MIT