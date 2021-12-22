import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } from "./constants.js";

export const createTokens = (user) => {
    const refreshToken = jwt.sign(
        { id: user.id, count: user.count },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    );
    const accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
        expiresIn: "1d"
    });

    return { refreshToken, accessToken };
};