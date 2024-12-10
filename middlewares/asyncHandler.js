const asyncHandler = (fn) => {
    console.log("Received argument for asyncHandler:", fn);
    if (typeof fn !== "function") {
      console.error("Error: Argument passed to asyncHandler is not a function", fn);
      throw new TypeError("Argument passed to asyncHandler must be a function");
    }
  
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
  
  module.exports = asyncHandler;