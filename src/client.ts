import { Transport } from './transport';
import { Response, HistogramEntity, LogEntity } from './entity';

export interface GetLogsOptions {
    line: number;
    offset: number;
    reverse: boolean;
    powerSql: boolean;
}

export class Client extends Transport {
    constructor(builder: ClientBuilder) {
        super(builder.url, builder.accessKeyId, builder.accessKeySecret);
    }

    getHistograms(logstore: string, from: number, to: number, query: string = "*", topic: string = ""): Promise<Response<Array<HistogramEntity>>> {
        return this.get(`/logstores/${logstore}/index`, {
            query: query,
            topic: topic,
            from: `${from}`,
            to: `${to}`,
            type: "histogram",
        }).then((resp) => {
            return new Response(resp.status, resp.headers, resp.data);
        });
    }

    getLogs(logstore: string, from: number, to: number, query: string = "*", topic: string = "", getLogsOptions: GetLogsOptions = {
        line: 100,
        offset: 0,
        reverse: false,
        powerSql: false
    }): Promise<Response<Array<LogEntity>>> {
        return this.get(`/logstores/${logstore}/index`, {
            query: query,
            topic: topic,
            from: `${from}`,
            to: `${to}`,
            type: "log",
            line: `${getLogsOptions.line}`,
            offset: `${getLogsOptions.offset}`,
            reverse: `${getLogsOptions.reverse}`,
            powerSql: `${getLogsOptions.powerSql}`
        }).then((resp) => {
            return new Response(resp.status, resp.headers, resp.data);
        });
    }
}

export class ClientBuilder {
    private _endpoint: string;
    private _accessKeyId: string;
    private _accessKeySecret: string;
    private _project: string;

    constructor() {
        this._endpoint = "";
        this._accessKeyId = "";
        this._accessKeySecret = "";
        this._project = "";
    }

    setEndpoint(endpoint: string): ClientBuilder {
        this._endpoint = endpoint;
        return this;
    }

    setAccessKey(accessKeyId: string, accessKeySecret: string): ClientBuilder {
        this._accessKeyId = accessKeyId;
        this._accessKeySecret = accessKeySecret;
        return this;
    }

    setProject(project: string): ClientBuilder {
        this._project = project;
        return this;
    }

    get project(): string {
        return this._project;
    }

    get url(): string {
        return this._endpoint.indexOf("intranet") > -1 ? "http://": "https://" + this._project + "." + this._endpoint;
    }

    get accessKeyId(): string {
        return this._accessKeyId;
    }

    get accessKeySecret(): string {
        return this._accessKeySecret;
    }

    build(): Client {
        if (this._endpoint == "") {
            throw new Error("endpoint must not be empty")
        }
        if (this._accessKeyId == "") {
            throw new Error("AccessKey ID must not be empty")
        }
        if (this._accessKeySecret == "") {
            throw new Error("AccessKey Secret must not be empty")
        }
        return new Client(this);
    }

}