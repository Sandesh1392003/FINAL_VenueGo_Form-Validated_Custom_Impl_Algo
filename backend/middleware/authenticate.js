import jwt from 'jsonwebtoken';

export const authenticate =async (req, res, next) => {
    const token = req.cookies.authToken;
  
    if (token) {
      // console.log("token present")
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user to request
        // console.log(req.user)
      } catch (err) {
        console.log("Invalid Token")
      }
    }
    next() // Continue even if there's no token
}