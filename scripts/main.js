(function() {

/*global Ember */

var App = window.App = Ember.Application.create({
    rootElement: window.TESTING ? '#mocha' : '#app',
    LOG_TRANSITIONS: true
});

/* Order and include as you please. */


})();

(function() {

App.ApplicationController = Ember.Controller.extend({
    actions: {
        signout: function() {
            App.session.service.clearCredentials(App.user);
            this.transitionToRoute('user.login');
            App.set('session', null);
        }        
    }
});


})();

(function() {

App.UserLoginController = Ember.Controller.extend({
    mode: 'signin',

    createMode:             function() { return this.get('mode') === 'create';   }.property('mode'),
    resetPasswordMode:      function() { return this.get('mode') === 'reset';   }.property('mode'),
    notResetPasswordMode:   function() { return !this.get('resetPasswordMode'); }.property('resetPasswordMode'),
    signInMode:             function() { return this.get('mode') === 'signin';   }.property('mode'),

    modeTitle: function() {
        var mode = this.get('mode');

        if (mode === 'create') return "CREATE ACCOUNT";
        if (mode === 'signin') return "SIGN IN";
        if (mode === 'reset') return "RESET PASSWORD";
    }.property('mode'),

    actions: {

        create: function() {
            var user = new nitrogen.User({
                name: this.get('name'),
                email: this.get('email'),
                password: this.get('password'),
                nickname: 'current'
            });

            App.service.create(user, App.sessionHandler);
        },

        login: function() {
            var user = new nitrogen.User({
                email: this.get('email'),
                password: this.get('password'),
                nickname: 'current' 
            });

            App.service.authenticate(user, App.sessionHandler);
        },

        resetPassword: function() {
            // App.service.resetPassword(this.get('email'), function(err) {
            //     var msg = err || "Your password has been reset.  We'll email you a link to reset your password shortly."
            //     App.set('flash', msg);
            //
            //     this.switchToSignIn();
            // });
        },

        switchToCreate:         function() { this.set('mode', 'create'); },
        switchToResetPassword:  function() { this.set('mode', 'reset'); },
        switchToSignIn:         function() { this.set('mode', 'signin'); }
    }
});


})();

(function() {

App.UserPasswordController = Ember.Controller.extend({
    actions: {
        changePassword: function() {
            var currentPassword = this.get('currentPassword');
            var newPassword = this.get('newPassword');
            var repeatNewPassword = this.get('repeatNewPassword');
            var email = App.get('user.email');

            if (!currentPassword || currentPassword.length === 0) {
                App.set('flash', "Please enter your current password.");
            } else if (!currentPassword || newPassword.length === 0) {
                App.set('flash', "Please enter a new password.");
            } else if (!repeatNewPassword || newPassword !== repeatNewPassword) {
                App.set('flash', "The new passwords you entered do not match.");
            } else {
                var user = App.get('user');

                user.changePassword(App.session, currentPassword, newPassword, function(err) {
                    if (err) return App.set('flash', err.message || "Failed to change password, please try again.");

                    App.set('session', null);

                    var user = new nitrogen.User({
                        email: email,
                        password: newPassword,
                        nickname: 'current' 
                    });

                    App.service.authenticate(user, App.sessionHandler);
                });
            }
        }
    }
});


})();

(function() {

App.findWithAdapter = function(query, options, nitrogenClass, emberModel) {
    var promise = $.Deferred();
    nitrogenClass.find(App.session, query, options, function(err, nitrogenModels) {
        if (err) return promise.reject(err);

        var emberModels = nitrogenModels.map(function(nitrogenModel) {
            return emberModel.create(nitrogenModel);
        });

        promise.resolve(emberModels);
    });

    return promise;
};

App.findByIdWithAdapter = function(id, nitrogenClass, emberModel) {
    var promise = $.Deferred();
    nitrogenClass.findById(App.session, id, function(err, nitrogenModel) {
        if (err) return promise.reject(err);

        promise.resolve(emberModel.create(nitrogenModel));
    });

    return promise;
};

App.saveWithDeferred = function(nitrogenModel) {
    var promise = $.Deferred();
    nitrogenModel.save(App.session, function (err, nitrogenModel) {
        if (err) return promise.reject(err);

        promise.resolve(nitrogenModel);
    });

    return promise;
};

App.sendWithDeferred = function(nitrogenModel) {
    var promise = $.Deferred();
    nitrogenModel.send(App.session, function (err, nitrogenModel) {
        if (err) return promise.reject(err);

        promise.resolve(nitrogenModel);
    });

    return promise;
};



})();

(function() {

App.Agent = Ember.Object.extend(nitrogen.Agent.prototype);
App.Agent.reopen({
    enabledString: function() {
        return this.get('enabled') ? "true" : "false";
    }.property('enabled'),

    save: function() {
        return App.saveWithDeferred(new nitrogen.Agent(this));
    }
});

App.Agent.reopenClass({
    find: function(query, options) {
        return App.findWithAdapter(query, options, nitrogen.Agent, App.Agent);
    }
});


})();

(function() {

App.Message = Ember.Object.extend(nitrogen.Message.prototype);

App.Message.reopen({

    bodyJSON: function() {
        return JSON.stringify(this.get('body'));
    }.property('body'),

    bodyUrlWithAccessToken: function() {
        if (!this.get('body') || !this.get('body.url')) return null;

        return this.get('body.url') + "?access_token=" + encodeURIComponent(App.get('session.accessToken.token'));
    }.property('body.url'),

    createdAtString: function() {
        var date = new Date(Date.parse(this.get('created_at')));
        return date.toLocaleString();
    }.property('created_at'),

    fromPrincipal: function() {
        if (!this.get('from')) return;
        var self = this;

        App.Principal.findById(this.get('from')).then(function(value) {
             self.set('fromPrincipal', value);
        });
    }.property('from'),

    fromName: function() {
        return this.get('fromPrincipal.name');
    }.property('from', 'fromPrincipal'),

    toPrincipal: function() {
        if (!this.get('to')) return;

        var self = this;

        App.Principal.findById(this.get('to')).then(function(value) {
            self.set('toPrincipal', value);
        });
    }.property('to'),

    toName: function() {
        return this.get('toPrincipal.name');
    }.property('to', 'toPrincipal'),

    isCameraCommand: function() { return this.is('cameraCommand'); }.property('type'),
    isHeartbeat: function() { return this.is('heartbeat'); }.property('type'),
    isImage: function() { return this.is('image'); }.property('type'),
    isLog: function() { return this.is('log'); }.property('type'),
    isIP: function() { return this.is('ip'); }.property('type'),
    isIPMatch: function() { return this.is('ip_match'); }.property('type'),
    isNotHeartbeat: function() { return !this.is('heartbeat'); }.property('type'),

    send: function() {
        return App.sendWithDeferred(new nitrogen.Message(this));
    },

    timestampString: function() {
        var date = new Date(Date.parse(this.get('ts')));
        var hundredths = Math.floor(this.get('ts').getMilliseconds() / 10);
        if (hundredths < 10)
            hundredths = "0" + hundredths;

        return date.toLocaleString(navigator.language, {hour12: false}) + '.' + hundredths;
    }.property('ts')
});

App.Message.reopenClass({
    find: function(query, options) {
        return App.findWithAdapter(query, options, nitrogen.Message, App.Message);
    }
});


})();

(function() {

App.Permission = Ember.Object.extend(nitrogen.Permission.prototype);
App.Permission.reopen({
    issuedToPrincipal: function() {
        if (!this.get('issued_to')) return;
        var self = this;

        App.Principal.findById(this.get('issued_to')).then(function(value) {
             self.set('issuedToPrincipal', value);
        });
    }.property('issued_to'),

    issuedToName: function() {
        return this.get('issuedToPrincipal.name');
    }.property('issued_to', 'issuedToPrincipal'),

    principalForPrincipal: function() {
        if (!this.get('principal_for')) return;
        var self = this;

        App.Principal.findById(this.get('principal_for')).then(function(value) {
             self.set('principalForPrincipal', value);
        });
    }.property('principal_for'),

    principalForName: function() {
        return this.get('principalForPrincipal.name');
    }.property('principal_for', 'principalForPrincipal'),

    actionString: function() {
        if (!this.get('action')) {
            return 'all';
        } else {
            return this.get('action');
        }
    }.property('action'),

    expiresString: function() {
        if (!this.get('expires')) {
            return 'never';
        } else {
            return this.get('expires')
        }
    }.property('expires')
});

App.Permission.reopenClass({
    find: function(query, options) {
        return App.findWithAdapter(query, options, nitrogen.Permission, App.Permission);
    }
});


})();

(function() {

App.Principal = Ember.Object.extend(nitrogen.Principal.prototype);
App.Principal.reopen({
    hasCapability: function(capability) {
        return this.get('capabilities').indexOf(capability) !== -1;
    },

    hasCamera: function() {
        return this.hasCapability('cameraCommand');
    }.property('capabilities'),

    hasSwitch: function() {
        return this.hasCapability('switchCommand');
    }.property('capabilities'),

    isDevice: function() {
        return this.is('device');
    }.property('type'),

    isUser: function() {
        return this.is('user');
    }.property('type'),

    lastConnectionString: function() {
        var date = new Date(Date.parse(this.get('last_connection')));
        return date.toLocaleString();
    }.property('last_connection'),

    nameOrId: function() {
        return this.get('name') || this.get('id');
    }.property('id','name'),

    save: function() {
        return App.saveWithDeferred(new nitrogen.Principal(this));
    }
});

App.Principal.reopenClass({
    find: function(query, options) {
        return App.findWithAdapter(query, options, nitrogen.Principal, App.Principal);
    },

    findById: function(id) {
        if (!id) return;

        return App.findByIdWithAdapter(id, nitrogen.Principal, App.Principal);
    }
});


})();

(function() {

App.AuthenticatedRoute = Ember.Route.extend({
    beforeModel: function() {
        if (!App.session) {
            return Ember.RSVP.reject();
        }
    },

    actions: {
        error: function(reason, transition) {
            App.set('attempedTransition', transition);
            this.transitionTo('user.login');
        }
    }
});

})();

(function() {

App.AgentsRoute = App.AuthenticatedRoute.extend({
    model: function() {
        return App.Agent.find();
    }
});


})();

(function() {

App.MessagePagingRoute = App.AuthenticatedRoute.extend({
    buildPageUrl: function(params) {
        return this.get('baseUrl') + "/skip/" + params.skip + "/sort/" + params.sort + "/direction/" + params.direction;
    },

    changePage: function(dir) {
        return {
            skip: parseInt(this.get('params.skip')) + dir * parseInt(this.get('messagePageLimit')),
            direction: this.get('params.direction'),
            sort: this.get('params.sort')
        };
    },

    fullPage: function() {
        return this.get('controller.content.length') >= this.get('messagePageLimit');
    }.property('controller.content.length', 'messagesPerPage'),

    hasPreviousPage: function() {
        return parseInt(this.get('params.skip')) !== 0;
    }.property('params.skip'),

    nextPage: function() {
        return this.changePage(1);
    }.property('params.skip', 'params.direction', 'params.sort'),

    nextPageUrl: function() {
        return this.buildPageUrl(this.get('nextPage'));
    }.property('nextPage'),

    previousPage: function() {
        return this.changePage(-1);
    }.property('params.skip', 'params.direction', 'params.sort'),

    previousPageUrl: function() {
        return this.buildPageUrl(this.get('previousPage'));
    }.property('previousPage')
});

})();

(function() {

App.MessagesRoute = App.MessagePagingRoute.extend({
    messagePageLimit: 50,
    baseUrl: "/#/messages",

    activate: function() {
        setTimeout(function() { $('#messagesTab').addClass('active'); }, 0);
    },

    deactivate: function() {
        setTimeout(function() { $('#messagesTab').removeClass('active'); }, 0);
    },

    model: function(params) {
        this.set('params', params);

        return this.query();
    },

    query: function() {
        var sort = {};
        sort[this.get('params').sort] = parseInt(this.get('params').direction);

        return App.Message.find({ type: { $ne: 'heartbeat' } }, {
            skip: parseInt(this.get('params').skip),
            limit: parseInt(this.get('messagePageLimit')),
            sort: sort
        });
    },

    serialize: function(params) {
        return {
            skip: params.skip,
            sort: params.sort,
            direction: params.direction
        };
    },

    setupController: function(controller, model) {
        this._super(controller, model);

        this.controller.set('router', this);

        var self = this;

        console.log("STARTING SUBSCRIPTION");
        this.subscription = App.session.onMessage(function(nitrogenMessage) {
            self.query().then(function(messages) {
                self.controller.set('content', messages);
            });
        });
    },

    actions: {
        willTransition: function(transition) {
            if (this.subscription) {
                console.log("CLEARING SUBSCRIPTION");
                App.get('session').disconnectSubscription(this.subscription);
                this.subscription = null;
            }
        }        
    }
});


})();

(function() {

App.PrincipalRoute = App.AuthenticatedRoute.extend({
    actions : {
        delete: function(principal) {
            var self = this;
            principal.remove(App.session, function(err) {
                self.transitionTo('principals');
            });
        }
    },

    activate: function() {
        setTimeout(function() { $('#principalsTab').addClass('active'); }, 0);
    },

    deactivate: function() {
        setTimeout(function() { $('#principalsTab').removeClass('active'); }, 0);
    },

    model: function(params) {
        this.set('params', params);
        return this.query();
    },

    query: function() {
        return App.Principal.findById(this.get('params.id'));
    },

    serialize: function(model, params) {
        return { id: model.get('id') };
    }/*,

    setupController: function(controller, principal) {
        this._super(controller, principal);

        this.controller.set('router', this);


        TODO: principals_realtime: disabled until we work out rate limiting to prevent update storms.

        this.subscription = App.session.onPrincipal({ id: this.get('controller.content.id') }, function(nitrogenPrincipal) {
            var updatedPrincipal = App.Principal.create(nitrogenPrincipal);
            self.controller.set('content', updatedPrincipal);
        });
    },

    actions: {
        willTransition: function(transition) {
            if (this.subscription) {
                App.session.disconnectSubscription(this.subscription);
                this.subscription = null;
            }
        }        
    }
    */

});

})();

(function() {

App.PrincipalAccountRoute = App.AuthenticatedRoute.extend({
    activate: function() {
        setTimeout(function() { $('#principalAccountTab').addClass('active'); }, 0);
    },

    deactivate: function() {
        setTimeout(function() { $('#principalAccountTab').removeClass('active'); }, 0);
    },

    model: function() {
        return this.modelFor("principal");
    }
});

})();

(function() {

App.PrincipalCommandsRoute = App.AuthenticatedRoute.extend({
    activate: function() {
        setTimeout(function() { $('#commandsTab').addClass('active'); }, 0);
    },

    deactivate: function() {
        setTimeout(function() { $('#commandsTab').removeClass('active'); }, 0);
    },

    model: function() {
        return this.modelFor("principal");
    }
});

})();

(function() {

App.PrincipalLogsRoute = App.MessagePagingRoute.extend({
    messagePageLimit: 50,

    baseUrl: function() {
        var base = "/#/principal/" + this.modelFor('principal').id  + "/logs";
        console.log(base);
        return base;
    }.property(),

    activate: function() {
        setTimeout(function() { $('#principalLogsTab').addClass('active'); }, 0);
    },

    deactivate: function() {
        setTimeout(function() { $('#principalLogsTab').removeClass('active'); }, 0);
    },

    model: function(params) {
        params = {
          sort: 'ts',
          skip: 0,
          direction: -1
        };

        var principal = this.modelFor("principal");

        console.log('skip: ' + params.skip);
        console.log('direction: ' + params.direction);
        console.log('sort: ' + params.sort);

        this.set('params', params);

        var sort = {};
        sort[params.sort] = parseInt(params.direction);

        return App.Message.find({
            $and: [ 
              { type: 'log' },
              { 
                  $or: [ 
                      { to: principal.id }, 
                      { from: principal.id } 
                  ] 
              }
            ] 
        }, {
            skip: parseInt(this.get('params').skip),
            limit: parseInt(this.get('messagePageLimit')),
            sort: sort
        });
    }/*,

    serialize: function() {
        var params = this.get('params');
        
        if (!params) {
            params = {                
                skip: '0',
                sort: 'ts',
                direction: '1'
            }
        }

        return params;
    } */
});

})();

(function() {

App.PrincipalMessagesRoute = App.MessagePagingRoute.extend({
    messagePageLimit: 50,
    baseUrl: function() {
        return "/#/principal/" + this.modelFor('principal').id  + "/messages";
    }.property(),

    activate: function() {
        setTimeout(function() { $('#principalMessagesTab').addClass('active'); }, 0);
    },

    deactivate: function() {
        setTimeout(function() { $('#principalMessagesTab').removeClass('active'); }, 0);
    },

    model: function(params) {
        console.log('messages model called.');
        var principal = this.modelFor("principal");

        params = {
          sort: 'ts',
          skip: 0,
          direction: -1
        };

        var sort = {};
        sort[params.sort] = parseInt(params.direction);

        return App.Message.find({
            $and: [ 
              { 
                  $and: [ 
                      { type: { $ne: 'heartbeat' } }, 
                      { type: { $ne: 'log' } } 
                  ] 
              },
              { 
                  $or: [ 
                      { to: principal.id }, 
                      { from: principal.id } 
                  ] 
              }
            ] 
        }, {
            skip: parseInt(params.skip),
            limit: parseInt(this.get('messagePageLimit')),
            sort: sort
        });
    }/*,

    serialize: function() {
        var params = this.get('params');
        
        if (!params) {
            params = {                
                skip: '0',
                sort: 'ts',
                direction: '1'
            }
        }

        return params;
    },

    setupController: function(controller, principal) {
        this._super(controller, principal);

        this.controller.set('router', this);

        var self = this;
        this.subscription = App.session.onMessage({$or: [ { to: this.get('controller.content.id') }, 
                                                          { from: this.get('controller.content.id') } ]}, function(nitrogenMessage) {
            self.queryMessages(principal);
        });

    }
    */
});

})();

(function() {

App.PrincipalPermissionsRoute = App.AuthenticatedRoute.extend({
    messagePageLimit: 50,

    activate: function() {
        setTimeout(function() { $('#principalPermissionsTab').addClass('active'); }, 0);
    },

    deactivate: function() {
        setTimeout(function() { $('#principalPermissionsTab').removeClass('active'); }, 0);
    },

    model: function(params) {
        console.log('in permissions model');
        var principal = this.modelFor('principal');
        return App.Permission.find({ 
            $or: [ 
                { issued_to: principal.id }, 
                { principal_for: principal.id } 
            ] 
        }, {});
    }
});

})();

(function() {

App.PrincipalsRoute = App.AuthenticatedRoute.extend({
    pageLimit: 50,
    maxUpdateRate: 10000,
    timeoutSet: false,
    nextUpdate: new Date(),

    activate: function() {
        setTimeout(function() { $('#principalsTab').addClass('active'); }, 0);
    },

    deactivate: function() {
        setTimeout(function() { $('#principalsTab').removeClass('active'); }, 0);
    },

    model: function(params) {
        params = {
            sort: 'last_connection',
            direction: -1,
            skip: 0
        };

        this.set('params', params);
        return this.query();
    },

    query: function() {
        var sort = {};
        sort[this.get('params').sort] = parseInt(this.get('params').direction);

        if (!App.session) return;

        return App.Principal.find({ }, {
            skip: parseInt(this.get('params').skip),
            limit: parseInt(this.get('pageLimit')),
            sort: sort
        });
    },

    setupController: function(controller, model) {
        this._super(controller, model);

        this.controller.set('router', this);

//        var self = this;
//        setInterval(function() {
//            self.query().then(function(principals) {
//                self.controller.set('content', principals);
//            });
//        }, 10000);
    },

/*
    actions: {
        willTransition: function(transition) {
            if (this.subscription) {
                App.session.disconnectSubscription(this.subscription);
                this.subscription = null;
            }
        }        
    }
*/
});

})();

(function() {

App.Router.map(function() {
    this.resource('agents');
    this.resource('messages', { path: '/messages/skip/:skip/sort/:sort/direction/:direction' });
    this.resource('principals');

    this.resource('principal', { path: 'principal/:id' }, function() {
        this.route('commands');
        this.route('logs'/*, { path: 'logs/skip/:skip/sort/:sort/direction/:direction'}*/);
        this.route('messages'/*, { path: 'messages/skip/:skip/sort/:sort/direction/:direction'}*/);
        this.route('permissions');
    });

    this.resource('user', function() {
        this.route('password');
        this.route('login');
    });
});

App.IndexRoute = Ember.Route.extend({
    redirect: function() {
      this.transitionTo('principals');
    }
});

})();

(function() {

App.AgentView = Em.View.extend({
    templateName: 'agents/agent',

    editing: false,

    notEditing: function() {
        return !this.get('editing');
    }.property('editing'),

    edit: function() {
        this.set('editing', true);
    },

    save: function(agent) {
        this.set('editing', false);
        this.set('agent', agent.save());
    }
});


})();

(function() {

App.CameraCapabilityView = Em.View.extend({
    templateName: 'capabilities/camera',

    actions: {
        sendSnapshot: function() { this.sendCommand('snapshot'); },
        sendMotion: function() { this.sendCommand('motion'); }
    },

    commands: function() {

        var ret = Em.A();
        if (!this.cameraManager) return Em.A([]);

        this.cameraManager.messageQueue.forEach(function(message) {
            ret.pushObject(message);
        });

        return ret;
    }.property('invalidation'),

    invalidation: null,

    init: function() {
        this.cameraManager = new nitrogen.CameraManager(this.get('principal'));
        var self = this;

        this.cameraManager.start(App.session, function(err, message) {
            self.set('invalidation', new Date());
        });
    },

    sendCommand: function(cmd) {
        var command = new nitrogen.Message({
            expires: 'never',
            to: this.get('principal.id'),
            type: 'cameraCommand',
            body: {
                command: cmd
            }
        });

        command.send(App.session, function(err, messages) {
            if (err) console.log('sending command failed: ' + err);
        });
    }
});


})();

(function() {

App.SwitchCapabilityView = Em.View.extend({
    templateName: 'capabilities/switch',

    actions: {
        sendSwitch: function() {
            var self = this;
            var newState = this.switchManager.state === 0.0 ? 1.0 : 0.0;

            var command = new nitrogen.Message({
                to: this.get('principal.id'),
                type: 'switchCommand',
                body: {
                    on: newState
                }
            });

            command.send(App.session, function(err, messages) {
                if (err) console.log('sending command failed: ' + err);
            });
        },
        sendMotion: function() { this.sendCommand('motion'); }
    },

    commands: function() {

        var ret = Em.A();
        if (!this.switchManager) return Em.A([]);

        this.switchManager.messageQueue.forEach(function(message) {
            ret.pushObject(message);
        });

        return ret;
    }.property('invalidation'),

    invalidation: null,

    init: function() {
        this.switchManager = new nitrogen.SwitchManager(this.get('principal'));
        var self = this;

        this.switchManager.start(App.session, function(err, message) {
            self.set('invalidation', new Date());
        });
    }
});

})();

(function() {

App.MessagesTableView = Em.View.extend({
    templateName: 'messages/messagesTable'
});


})();

(function() {

App.ClaimView = Em.View.extend({
    templateName: 'principals/claim',

    actions: {
        claim: function() {
            var response = new nitrogen.Message({
                to: 'service',
                type: 'claim',
                body: {
                    claim_code: this.get('claimCode').toUpperCase()
                },
                expires: 'never'
            });

            response.send(App.session, function(err) {
                if (err) App.set('flash', err.message);

                window.location.reload();
            });
        }
    }
});

})();

(function() {

App.PrincipalView = Em.View.extend({
    viewing: true,

    edit: function() {
        this.set('viewing', false);
    },

    save: function(principal) {
        this.set('viewing', true);
        this.set('principal', principal.save());
    }
});

})();

(function() {

App.config = {
//    Nitrogen uses the following by default to connect to the service.   Modify these as necessary to point elsewhere.
// 
//    host: 'localhost',
//    http_port: 3030,
//    protocol: 'http'
};

request.log = {
    debug: function() {},
    info: function() {},
    error: function() {}
};

App.config.store = new nitrogen.HTML5Store(App.config);
App.service = new nitrogen.Service(App.config);

App.deferReadiness();

App.resetSession = function(err) {
    if (App.get('session')) {
        App.get('session').stop();
    }

    var flash = null;
    if (err && err.message) {
        console.log(JSON.stringify(err));
        flash = err.message;
    }

    App.set('flash', flash);
    App.set('session', null);
    App.set('user', null);

    App.set('attemptedNavigation', window.location.hash);
    window.location = "/#/user/login";
};

App.sessionHandler = function(err, session, user) {
    App.advanceReadiness();

    if (err || !session || !user) return App.resetSession(err);

    App.set('flash', null);

    // save away the session for use in the ember application.
    App.set('session', session);
    App.set('user', App.Principal.create(user));

    if (App.get('attemptedNavigation') && App.get('attemptedNavigation') !== '#/user/login') {
        console.log('successful auth, reloading attempedNavigation url: ' + App.get('attemptedNavigation'));
        window.location = App.get('attemptedNavigation');
        App.set('attemptedNavigation', null);

    } else {
        console.log('successful auth, using default url');
        window.location = "/#/principals";
    }

    session.onAuthFailure(App.resetSession);
};

var user = new nitrogen.User({ 
    nickname: 'current' 
});

App.set('attemptedNavigation', window.location.hash);
App.service.resume(user, App.sessionHandler);


})();