const uuid = require('uuid/v4');
const moment = require('moment');

const COLLECTION = 'Token';

module.exports = req => {
    const { user } = req;

    if (!user) {
        throw new Error('permission denied');
    }

    const token = uuid();

    // Set the token
    return new Parse.Object(COLLECTION)
        .save(
            {
                expireAt: moment()
                    .add(15, 'minutes')
                    .toDate(),
                value: token,
                user,
            },
            { useMasterKey: true },
        )
        .then(result => {
            return result.get('value');
        })
        .catch(err => {
            throw new Error(err);
        });
};
