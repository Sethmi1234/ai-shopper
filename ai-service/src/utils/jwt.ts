import jwt from "jsonwebtoken";

export interface AccessTokenPayload {
  id: string;
}


export const generateAccessToken = (
userId:string
)=>{

return jwt.sign(
{
 id:userId
},
process.env.ACCESS_TOKEN_SECRET!,
{
 expiresIn:"15m"
}
);

};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET!
  ) as AccessTokenPayload;
};



export const generateRefreshToken = (
userId:string
)=>{

return jwt.sign(
{
 id:userId
},
process.env.REFRESH_TOKEN_SECRET!,
{
 expiresIn:"7d"
}
);

};
