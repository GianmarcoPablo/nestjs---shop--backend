import { Request } from "express";
import { v4 as uuid } from "uuid";

export const fileNamer = (req: Request, file: Express.Multer.File, cb: Function) => {

    if (!file) return cb(new Error('No file provided'), false);
    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `${uuid()}.${fileExtension}`;
    return cb(null, fileName);
}
