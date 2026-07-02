import type { Request, Response } from "express";
export declare const registerHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const loginHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const refreshHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const logoutHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const meHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map