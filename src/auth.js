import jwt from "jsonwebtoken";


export const createTokens = (user) => {
    const refreshToken = jwt.sign(
        { id: user.id, count: user.count },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    );

    let date = new Date();
    const accessToken = jwt.sign(
        { id: user.id, expire_in: date.setDate(date.getDate() + 1)}, 
        process.env.ACCESS_TOKEN_SECRET, 
        {
            expiresIn: "1d"
        }
    );

    return { refreshToken, accessToken };
};