export type ResponseProgress = 'Complete' | 'Incomplete'

export class Response<Type> {
    readonly _statusCode: number;
    readonly _headers: { [key: string]: string };
    readonly _data: Type;

    constructor(statusCode: number, headers: { [key: string]: string }, data: Type) {
        this._statusCode = statusCode;
        this._headers = headers;
        this._data = data;
    }

    get data(): Type {
        return this._data;
    }

    get statusCode(): number {
        return this._statusCode;
    }

    get count(): number {
        return parseInt(this._headers['x-log-count']);
    }

    get process(): ResponseProgress {
        if (this._headers['x-log-progress'] === 'Complete') {
            return 'Complete';
        } else {
            return 'Incomplete';
        }
    }
    
    get requestId(): string {
        return this._headers['x-log-requestid'];
    }
}

export type LogEntity = {
    __topic__: string
    __source__: string
    __time__: string
} & {[key: string]: string};

export interface HistogramEntity {
    from: number;
    to: number;
    count: number;
    progress: 'Complete' | 'Incomplete';
}