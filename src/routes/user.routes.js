import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlerwares/multer.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"converImage",
            maxCount:1
        }
    ]),
    registerUser
)


// router.route('/login').post(login)

export default router;