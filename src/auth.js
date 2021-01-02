const admin = require("./admin");

exports.handler = async (request) => {
  const { token, role } = request.queryStringParameters;
  let statusCode = 200;
  let headers = {
    "access-control-allow-origin": "*",
  };
  let response = {};

  try {
    admin.init();
    let { uid, customClaims } = await admin.getUserByToken(token);
    if (
      typeof customClaims.role === "undefined" ||
      customClaims.role !== role
    ) {
      await admin.setCustomUserClaims(uid, {
        role,
      });
      response.data = "User role has been changed to " + role;
    } else {
      var a = ["a", "e", "i", "o", "u"].includes(role.slice(0, 1)) ? "an" : "a";
      response.error = `User is already ${a} ${role}.`;
    }
  } catch (e) {
    statusCode = 500;
    response.error = e.message;
  }

  return {
    headers,
    statusCode,
    body: JSON.stringify(response),
  };
};
