module.exports = (passedFunction) => (req, res, next) => {
   Promise.resolve(passedFunction(req, res, next)).catch(next);
 };
 