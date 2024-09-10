import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

// export function validateDto(dtoClass: any) {
//     return async (req, res, next) => {
//         const dtoObject = plainToClass(dtoClass, req.body);
//         const errors = await validate(dtoObject);
//         if (errors.length > 0) {
//             const errorMessages = errors.map(error => Object.values(error.constraints)).flat();
//             return res.status(400).json({ errors: errorMessages });
//         }
//         req.body = dtoObject;
//         next();
//     };
// }