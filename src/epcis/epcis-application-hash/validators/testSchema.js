module.exports =  authSchema = {
    type: "object",
    properties: {
      username: {
        type: "string",
        description: "Username of the user",
      },
      email: {
        type: "string",
        description: "Email of the user",
      },
      password: {
        type: "string",
        description: "Password of the user",
        minLength: 8,
        maxLength: 24,
      },
    },
    required: ["username", "email", "password"],
    additionalProperties: false,
  };