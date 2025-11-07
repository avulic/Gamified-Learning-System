import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export const validateDto = (dtoClass: any) => {
    return (req: any, res: any, next: any) => {
        const object = plainToInstance(dtoClass, req.body);
        validate(object).then(errors => {
            if (errors.length > 0) {
                const validationErrors = errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints
                }));
                res.status(400).json({
                    message: 'Validation failed',
                    errors: validationErrors
                });
            } else {
                req.body = object;
                next();
            }
        });
    };
};