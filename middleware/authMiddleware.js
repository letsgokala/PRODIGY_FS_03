export function isAuthenticated(req, res, next){
    if(!req.session.userID){
        return res.redirect("/login");
    }
    next();
}
export const ensureAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") {
      return next();
    } else {
      return res.redirect("/login");
    }
  };
  


export default isAuthenticated;