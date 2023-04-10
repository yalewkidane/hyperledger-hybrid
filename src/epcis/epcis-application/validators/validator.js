import Ajv from "ajv";
import { inspect } from "util";

const ajv = new Ajv({ allErrors: true });

export const validatorFactory = (schema) => {
  const validate = ajv.compile(schema);

  const verify = (data) => {
    const isValid = validate(data);
    if (isValid) {
      return data;
    }
    throw new Error(
      ajv.errorsText(
        validate.errors?.filter((err) => err.keyword !== "if"),
        { dataVar: "schemaValidation" } + "\n\n" + inspect(data)
      )
    );
  };

  return { schema, verify };
};