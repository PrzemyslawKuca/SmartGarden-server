import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } from "./constants.js";

export const createTokens = (user) => {
    const refreshToken = jwt.sign(
        { userId: user.id, count: user.count },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    );
    const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, {
        expiresIn: "15min"
    });

    return { refreshToken, accessToken };
};