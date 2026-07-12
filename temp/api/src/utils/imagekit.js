import ImageKit from "imagekit";
import { ENVS } from "../config/constants.js";

const imagekit = new ImageKit({
    publicKey: ENVS.IK_PUBLIC_KEY,
    privateKey: ENVS.IK_PRIVATE_KEY,
    urlEndpoint: ENVS.IK_URL_ENDPOINT,
});

export default imagekit;
