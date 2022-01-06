import jwt from "jsonwebtoken";


export const createTokens = (user) => {
    const refreshToken = jwt.sign(
        { id: user.id, count: user.count },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    );
    const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d"
    });

    return { refreshToken, accessToken };
};