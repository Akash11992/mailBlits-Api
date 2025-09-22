const jwt = require("jsonwebtoken");


exports.verifyJwt = (req)=>{
  let token = null;
  let userDetails = null;

  if (!req.headers.authorization) {
    throw {message:'Authorization header not present!',code:401}
  }

  token = req.headers.authorization.split(" ")[1];

  try{
    userDetails = jwt.verify(token, process.env.SECRET_KEY);

    return userDetails
  }catch(error){
    // throw error
    throw {message:'Invalid token or token expired!. Please login again.',code:401}

  }
}



exports.checkTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      throw new Error('Invalid token');
    }

    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

      console.log("decoded.payload.exp",new Date(decoded.payload.exp*1000).toLocaleString())
      console.log("currentTime",new Date(currentTime*1000).toLocaleString())

    if ((new Date(decoded.payload.exp).getTime()) < (new Date(currentTime).getTime())) {
      return true; // Token is expired
    } else {
      return false; // Token is still valid
    }
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return true; // Treat as expired if there is an error
  }
};

