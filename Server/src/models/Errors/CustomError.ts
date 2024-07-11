export enum HttpStatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 500,
}

// Note: Our custom error extends from Error, so we can throw this error as an exception.
export class CustomError extends Error {
    message!: string;
    status!: number;
    additionalInfo!: any;
    isOperational: boolean;

    constructor(message: string, status: number = 500, additionalInfo: any = undefined, isOperational: boolean = true) {
        super(message);
        //Object.setPrototypeOf(this, new.target.prototype);

        this.status = status;
        this.additionalInfo = additionalInfo;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
};

export interface IResponseError {
    message: string;
    additionalInfo?: string;
}


class HTTP400Error extends CustomError {
    constructor(description = 'bad request') {
        super('NOT FOUND', HttpStatusCode.BAD_REQUEST, description, true);
    }
}