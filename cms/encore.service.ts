import { Service } from "encore.dev/service";
import { accessMiddleware } from "../shared/middleware/access-middleware";

export default new Service("cms", {
    middlewares: [accessMiddleware],
});