import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import Reactium from 'reactium-core/sdk';
import Logo from 'components/common-ui/Logo';
import { Button, Spinner, WebForm } from '@atomic-reactor/reactium-ui';

import React, { useEffect, useRef, useState } from 'react';

const ENUMS = {
    DEBUG: false,
    STATUS: {
        ERROR: 'error',
        SUBMITTING: 'submitting',
        READY: 'ready',
        SUCCESS: 'success',
        COMPLETE: 'complete',
        COPYING: 'copying',
    },
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Auth
 * -----------------------------------------------------------------------------
 */
let Auth = (props, ref) => {
    // Refs
    const stateRef = useRef({
        ...props,
        error: {},
        form: {},
    });

    // State
    const [, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = (newState, caller) => {
        // Update the stateRef
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        if (ENUMS.DEBUG && caller) {
            console.log('setState()', caller, {
                state: stateRef.current,
            });
        }

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    const cname = () => {
        const { className, namespace } = stateRef.current;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    // Side Effects
    useEffect(
        () => setState(props, 'Auth -> useEffect()'),
        Object.values(props),
    );

    useEffect(() => {
        let { token, username } = stateRef.current;

        if (!token || !username) {
            const user = Reactium.User.current();
            token = user.sessionToken;
            username = user.username;
            setState({ token, username });
        }
    }, [Reactium.User.current().objectId]);

    const onChange = e => {
        const { name, value } = e.target;
        setState({ [name]: value });
    };

    const onSubmit = ({ value }) => {
        const { username, password } = value;
        const { status } = stateRef.current;
        if (status === ENUMS.STATUS.SUBMITTING) {
            return;
        }

        setState({
            username,
            password,
            error: {},
            status: ENUMS.STATUS.SUBMITTING,
        });

        return Reactium.User.auth(username, password)
            .then(user => {
                copy(user.sessionToken);

                setTimeout(
                    () => setState({ status: ENUMS.STATUS.COMPLETE, token: user.sessionToken }),
                    1000,
                );
            })
            .catch(err => {
                const error = {
                    field: 'password',
                    message: 'invalid username or password',
                };

                setState({ error, status: ENUMS.STATUS.ERROR });
            });
    };

    const onError = ({ value, errors }) => {
        const field = op.get(errors, 'fields.0');
        const message = op.get(errors, 'errors.0');

        setState({
            error: {
                field,
                message,
            },
            status: ENUMS.STATUS.ERROR,
        });

        if (field) {
            const elm = document.getElementById(field);
            if (elm) {
                elm.focus();
            }
        }
    };

    const onCopy = e => {
        const { token } = stateRef.current;

        copy(token);

        setState({ copyLabel: 'Copied Token!', status: ENUMS.STATUS.COPYING });

        setTimeout(
            () =>
                setState({
                    copyLabel: 'Copy Token',
                    status: ENUMS.STATUS.COMPLETE,
                }),
            2000,
        );
    };

    // Renderers
    const render = () => {
        const {
            copyLabel,
            error = {},
            form = {},
            status,
            token,
            username,
            password,
        } = stateRef.current;

        const disabled = [
            ENUMS.STATUS.SUBMITTING,
            ENUMS.STATUS.COPYING,
            ENUMS.STATUS.SUCCESS,
        ].includes(status);

        let complete = [ENUMS.STATUS.COMPLETE, ENUMS.STATUS.COPYING].includes(
            status,
        );

        complete = token ? true : complete;

        if (complete) {
            return (
                <section className={cname()}>
                    <div className='box'>
                        <div className='flex center mb-xs-40'>
                            <Logo width={80} height={80} />
                        </div>
                        <div className='fieldset'>
                            <div className='form-group centered'>
                                <label className='text-center'>
                                    Session Token
                                    <input
                                        type='text'
                                        readOnly
                                        className='text-center'
                                        value={token || ''}
                                        onFocus={e => e.target.select()}
                                    />
                                </label>
                            </div>
                        </div>
                        <div className='mt-xs-40'>
                            <Button
                                block
                                size='lg'
                                type='button'
                                onClick={onCopy}
                                appearance='pill'
                                color='secondary'
                                disabled={disabled}>
                                {copyLabel}
                            </Button>
                        </div>
                    </div>
                </section>
            );
        }

        return (
            <section className={cname()}>
                <WebForm
                    required={['username', 'password']}
                    onSubmit={onSubmit}
                    onError={onError}
                    showError={false}
                    className='box'
                    value={{ username, password }}>
                    <div className='flex center mb-xs-40'>
                        <Logo width={80} height={80} />
                    </div>
                    <div className='fieldset'>
                        <div
                            className={cn({
                                'form-group': true,
                                error: op.get(error, 'field') === 'username',
                            })}>
                            <input
                                type='text'
                                id='username'
                                name='username'
                                onChange={onChange}
                                disabled={disabled}
                                placeholder='Username'
                                value={username || ''}
                            />
                            {op.get(error, 'field') === 'username' && (
                                <small>Enter your username</small>
                            )}
                        </div>
                        <div
                            className={cn({
                                'form-group': true,
                                error: op.get(error, 'field') === 'password',
                            })}>
                            <input
                                id='password'
                                type='password'
                                name='password'
                                onChange={onChange}
                                disabled={disabled}
                                placeholder='Password'
                                value={password || ''}
                            />
                            {op.get(error, 'field') === 'password' && (
                                <small>{error.message}</small>
                            )}
                        </div>
                    </div>
                    <div className='mt-xs-40'>
                        <Button
                            block
                            size='lg'
                            type='submit'
                            appearance='pill'
                            color='secondary'
                            disabled={disabled}>
                            {disabled ? (
                                <>Authenticating...</>
                            ) : (
                                <>Authenticate</>
                            )}
                        </Button>
                    </div>
                </WebForm>
            </section>
        );
    };

    return render();
};

Auth.propTypes = {
    namespace: PropTypes.string,
};

Auth.defaultProps = {
    namespace: 'auth',
    copyLabel: 'Copy Token',
};

export { Auth as default };
