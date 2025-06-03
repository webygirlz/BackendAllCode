import { Router } from "express";
import { logoutUser, registerUser ,loginUser} from "../controllers/user.controllers.js";
import { upload } from "../middlerwares/multer.middleware.js";
import { verifyJWT } from "../middlerwares/auth.middleware.js";
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

// secured routes
router.route("/logout").post(verifyJWT,logoutUser)


router.route('/login').post(loginUser)

export default router;