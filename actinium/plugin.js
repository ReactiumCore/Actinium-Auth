const PLUGIN = require('./meta');
const PLUGIN_BLUEPRINTS = require('./blueprints');
const resetRequest = require('./utils/resetRequest');
const resetPassword = require('./utils/resetPassword');
const tokenGen = require('./utils/tokenGenerate');

const TokenSchema = {
    value: { type: 'String' },
    expireAt: { type: 'Date' },
    user: { type: 'Pointer', targetClass: '_User' },
};

const TokenActions = {
    addField: false,
    create: false,
    delete: false,
    retrieve: false,
    update: false,
};

Actinium.Plugin.register(PLUGIN, true);

const PLUGIN_ROUTES = require('./routes');
const saveRoutes = async () => {
    for (const route of PLUGIN_ROUTES) {
        await Actinium.Route.save(route);
    }
};

// Update routes on startup
Actinium.Hook.register('start', async () => {
    if (Actinium.Plugin.isActive(PLUGIN.ID)) {
        await saveRoutes();
    }
});

// Update routes on plugin activation
Actinium.Hook.register('activate', async ({ ID }) => {
    if (ID === PLUGIN.ID) {
        await saveRoutes();
    }
});

// Update routes on plugin update
Actinium.Hook.register('update', async ({ ID }) => {
    if (ID === PLUGIN.ID) {
        await saveRoutes();
    }
});

Actinium.Hook.register('activate', async ({ ID }) => {
    if (ID !== PLUGIN.ID) {
        return;
    }

    Object.keys(TokenActions).forEach(action =>
        Actinium.Capability.register(`Token.${action}`),
    );

    Actinium.Collection.register('Token', TokenActions, TokenSchema);
});

// BLUEPRINTS
const registerBlueprints = (reg = true) => ({ ID }) => {
    if (ID && ID !== PLUGIN.ID) return;
    if (reg === true) {
        PLUGIN_BLUEPRINTS.forEach(bp => Actinium.Blueprint.register(bp.ID, bp));
    } else if (reg === false) {
        PLUGIN_BLUEPRINTS.forEach(bp => Actinium.Blueprint.unregister(bp.ID));
    }
};
// Start: Blueprints
Actinium.Hook.register('start', registerBlueprints(true));
// Activate: Blueprints
Actinium.Hook.register('activate', registerBlueprints(true));
// Deactivate: Blueprints
Actinium.Hook.register('deactivate', registerBlueprints(false));

/**
 * @api {Cloud} password-reset password-reset
 * @apiVersion 3.1.1
 * @apiGroup Cloud
 * @apiName password-reset
 * @apiDescription Update a user password.
 * @apiParam {String} token The token generated by password-reset-request.
 * @apiParam {String} password The new password.
 * @apiExample Example Usage:
Actinium.Cloud.run('password-reset', { token: 'Ox3Nlojb', password: 'my.New-P455w0rd!' });
 */
Actinium.Cloud.define(PLUGIN.ID, 'password-reset', resetPassword);

/**
 * @api {Cloud} password-reset-request password-reset-request
 * @apiVersion 3.1.1
 * @apiGroup Cloud
 * @apiName password-reset-request
 * @apiDescription Send the password reset request email.
 * @apiParam {String} email The email address associated with the user account you wish to reset.
 * @apiExample Example Usage:
Actinium.Cloud.run('password-reset-request', { email: 'you@email.com' });
 */
Actinium.Cloud.define(PLUGIN.ID, 'password-reset-request', resetRequest);

/**
 * @api {Cloud} token-gen token-gen
 * @apiVersion 3.1.1
 * @apiGroup Cloud
 * @apiName token-gen
 * @apiDescription Generate a password reset token for the current user.
 * @apiExample Example Usage:
Actinium.Cloud.run('token-gen', {}, { sessionToken: 'VALID_SESSION_TOKEN' });
 */
Actinium.Cloud.define(PLUGIN.ID, 'token-gen', tokenGen);
Actinium.Cloud.define(PLUGIN.ID, 'token-generate', tokenGen);

/**
 * @api {Function} Actinium.User.resetRequest(user) User.resetRequest()
 * @apiVersion 3.1.2
 * @apiGroup Actinium
 * @apiName User.resetRequest
 * @apiDescription Request a password reset for a user. The user will be sent an email with a link to the password reset page. Returns a `{Promise}`.

_Note: You must have an email driver setup for this to work._
 * @apiParam {String} email The email address associated with the user.
 * @apiExample Example Usage:
Actinium.User.resetRequest('user@email.com');
 */
Actinium.User.resetRequest = email =>
    Actinium.Cloud.run(
        'password-reset-request',
        { email },
        { useMasterKey: true },
    );

/**
 * @api {Function} Actinium.User.resetPassword(token,password) User.resetPassword()
 * @apiVersion 3.1.2
 * @apiGroup Actinium
 * @apiName User.resetPassword
 * @apiDescription Reset a user password. The user will be sent an email after the password has been successfully changed. Returns `{Promise}`.

 _Note: You must have an email driver setup for this to work._
@apiParam {String} token Token generated by `Actinium.User.resetRequest()`.
@apiParam {String} password New password.
@apiExample Example Usage:
Actinium.User.resetPassword('dGasDdoYlh0s55cu4rpglgm6LJhuuNVg', 'sekrit');
 */
Actinium.User.resetPassword = (token, password) =>
    Actinium.Cloud.run(
        'password-reset',
        { token, password },
        { useMasterKey: true },
    );
