import Joi from "joi";

export const userSchema = Joi.object({
    username: Joi.string().required(),
    avtar: Joi.string().uri().required()
});