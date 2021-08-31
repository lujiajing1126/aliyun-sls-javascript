import { default as md5 } from 'crypto-js/md5';
import { default as hmacSHA1 } from 'crypto-js/hmac-sha1';
import { default as Base64 } from 'crypto-js/enc-base64';
import { Map } from 'immutable';
import { default as axios, AxiosTransformer } from 'axios';

// the only content-type supported by SLS
const ContentType = "application/x-protobuf";

const alphabeticOrder = (a: string, b: string) => {
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    } else {
        return 0;
    }
}

interface RequestParams {
    httpMethod: string;
    path: string;
    query: {[key: string]: string};
    body?: string;
    headers: {[key: string]: string};
}

export class Transport {
    protected readonly host: string;
    protected readonly accessKeyId: string;
    protected readonly accessKeySecret: string;

    constructor(host: string, accessKeyId: string, accessKeySecret: string) {
        this.host = host;
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
    }

    protected get(path: string, query: {[key: string]: string}) {
        const signatureTransformer: AxiosTransformer = (_data, headers) => {
            // Do whatever you want to transform the data
            headers['Authorization'] = "LOG " + this.accessKeyId + ":" + this.generateSignature({
                httpMethod: 'GET',
                path: path,
                query: query,
                headers: headers,
                body: undefined
            });
        };
        return axios.request({
            url: path,
            method: 'GET',
            baseURL: this.host,
            transformRequest: [signatureTransformer],
            headers: {
                'Accept': 'application/json',
                'Date': new Date().toUTCString(),
                'x-log-apiversion': '0.6.0',
                'x-log-signaturemethod': 'hmac-sha1'
            },
            params: query
        });
    }

    /**
     * SignString = VERB + "\n"
     *        + CONTENT-MD5 + "\n"
     *        + CONTENT-TYPE + "\n"
     *        + DATE + "\n"
     *        + CanonicalizedLOGHeaders + "\n"
     *        + CanonicalizedResource
     * @param httpMethod Http Method Verb
     * @param path path part of the Http URI
     * @param body Http Body in string
     * @param contentType `Content-Type` in the Http Headers
     */
    generateSignature(requestParams: RequestParams): string {
        const signatureArray: Array<string> = [];
        signatureArray.push(requestParams.httpMethod);
        if (requestParams.body) {
            signatureArray.push(md5(requestParams.body).toString().toUpperCase());
            signatureArray.push(requestParams.headers['Content-Type']);
        } else {
            signatureArray.push("");
            signatureArray.push("");
        }
        // TODO: support x-log-date
        signatureArray.push(requestParams.headers['Date']);
        // headers MUST not be empty, since we always have the following,
        // 1) x-log-apiversion: 0.6.0
        // 2) x-log-signaturemethod: hmac-sha1
        signatureArray.push(Map(requestParams.headers)
            // map all keys to lower case
            .mapKeys((k) => k.toLowerCase())
            // filter headers with `x-log-*` and `x-acs-*` as key
            .filter((_, k) => k.startsWith("x-log") || k.startsWith("x-acs"))
            // transform to Map.Entry<string,string> and sort key in natural order
            .entrySeq().sort(([k1, _v1], [k2, _v2]) => alphabeticOrder(k1, k2))
            .map(([k, v]) => k + ":" + v).join('\n'));
        let canonicalizedResource = "";
        canonicalizedResource += requestParams.path;
        if (Object.keys(requestParams.query).length > 0) {
            canonicalizedResource += "?";
            canonicalizedResource += Map(requestParams.query).entrySeq().sort(([k1, _v1], [k2, _v2]) => alphabeticOrder(k1, k2)).map(([k, v]) => k + "=" + v).join("&");
        }
        signatureArray.push(canonicalizedResource);
        return Base64.stringify(hmacSHA1(signatureArray.join('\n'), this.accessKeySecret));
    }
}