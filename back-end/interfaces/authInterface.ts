import { Request,Response } from "express";
interface authRequest extends Request {
    user? : {
        id? : string;
    }
}


interface ioResponse extends Response {
    io?: any;
}

export {authRequest,ioResponse}

// interface loginInterface {
//   email: string;
//   password: string;
// }
// interface registerInterface {
//   username: string;
//   email: string;
//   password: string;
// }
// export { loginInterface, registerInterface, authRequest };