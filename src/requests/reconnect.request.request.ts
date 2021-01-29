import Joi from '@hapi/joi'
export const Reconnectdata = Joi.object().keys({
    code: Joi.string().required().max(1600),
    state: Joi.string().required().max(1600),
    userId: Joi.date().required(),
    businessId: Joi.string().required(),

});