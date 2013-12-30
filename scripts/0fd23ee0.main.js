!function(){window.App=Ember.Application.create({rootElement:window.TESTING?"#mocha":"#app",LOG_TRANSITIONS:!0})}(),function(){App.ApplicationController=Ember.Controller.extend({actions:{signout:function(){App.session.clearCredentials(),this.transitionToRoute("user.login"),App.set("session",null)}}})}(),function(){App.UserLoginController=Ember.Controller.extend({mode:"signin",createMode:function(){return"create"===this.get("mode")}.property("mode"),resetPasswordMode:function(){return"reset"===this.get("mode")}.property("mode"),notResetPasswordMode:function(){return!this.get("resetPasswordMode")}.property("resetPasswordMode"),signInMode:function(){return"signin"===this.get("mode")}.property("mode"),modeTitle:function(){var a=this.get("mode");return"create"===a?"CREATE ACCOUNT":"signin"===a?"SIGN IN":"reset"===a?"RESET PASSWORD":void 0}.property("mode"),actions:{create:function(){var a=new nitrogen.User({name:this.get("name"),email:this.get("email"),password:this.get("password"),nickname:"current"});App.service.create(a,App.sessionHandler)},login:function(){var a=new nitrogen.User({email:this.get("email"),password:this.get("password"),nickname:"current"});App.service.authenticate(a,App.sessionHandler)},resetPassword:function(){},switchToCreate:function(){this.set("mode","create")},switchToResetPassword:function(){this.set("mode","reset")},switchToSignIn:function(){this.set("mode","signin")}}})}(),function(){App.UserPasswordController=Ember.Controller.extend({actions:{changePassword:function(){var a=this.get("currentPassword"),b=this.get("newPassword"),c=this.get("repeatNewPassword");a&&0!==a.length?a&&0!==b.length?c&&b===c?App.user.changePassword(App.session,a,b,function(a,b,c){return a?App.set("flash",a.message||"Failed to change password, please try again."):(App.sessionHandler(a,b,c),void 0)}):App.set("flash","The new passwords you entered do not match."):App.set("flash","Please enter a new password."):App.set("flash","Please enter your current password.")}}})}(),function(){App.findWithAdapter=function(a,b,c,d){var e=$.Deferred();return c.find(App.session,a,b,function(a,b){if(a)return e.reject(a);var c=b.map(function(a){return d.create(a)});e.resolve(c)}),e},App.findByIdWithAdapter=function(a,b,c){var d=$.Deferred();return b.findById(App.session,a,function(a,b){return a?d.reject(a):(d.resolve(c.create(b)),void 0)}),d},App.saveWithDeferred=function(a){var b=$.Deferred();return a.save(App.session,function(a,c){return a?b.reject(a):(b.resolve(c),void 0)}),b},App.sendWithDeferred=function(a){var b=$.Deferred();return a.send(App.session,function(a,c){return a?b.reject(a):(b.resolve(c),void 0)}),b}}(),function(){App.Agent=Ember.Object.extend(nitrogen.Agent.prototype),App.Agent.reopen({enabledString:function(){return this.get("enabled")?"true":"false"}.property("enabled"),save:function(){return App.saveWithDeferred(new nitrogen.Agent(this))}}),App.Agent.reopenClass({find:function(a,b){return App.findWithAdapter(a,b,nitrogen.Agent,App.Agent)}})}(),function(){App.Message=Ember.Object.extend(nitrogen.Message.prototype),App.Message.reopen({bodyJSON:function(){return JSON.stringify(this.get("body"))}.property("body"),bodyUrlWithAccessToken:function(){return this.get("body")&&this.get("body.url")?this.get("body.url")+"?access_token="+encodeURIComponent(App.get("session.accessToken.token")):null}.property("body.url"),createdAtString:function(){var a=new Date(Date.parse(this.get("created_at")));return a.toLocaleString()}.property("created_at"),fromPrincipal:function(){if(this.get("from")){var a=this;App.Principal.findById(this.get("from")).then(function(b){a.set("fromPrincipal",b)})}}.property("from"),fromName:function(){return this.get("fromPrincipal.name")}.property("from","fromPrincipal"),toPrincipal:function(){if(this.get("to")){var a=this;App.Principal.findById(this.get("to")).then(function(b){a.set("toPrincipal",b)})}}.property("to"),toName:function(){return this.get("toPrincipal.name")}.property("to","toPrincipal"),isCameraCommand:function(){return this.is("cameraCommand")}.property("type"),isHeartbeat:function(){return this.is("heartbeat")}.property("type"),isImage:function(){return this.is("image")}.property("type"),isLog:function(){return this.is("log")}.property("type"),isIP:function(){return this.is("ip")}.property("type"),isIPMatch:function(){return this.is("ip_match")}.property("type"),isNotHeartbeat:function(){return!this.is("heartbeat")}.property("type"),send:function(){return App.sendWithDeferred(new nitrogen.Message(this))},timestampString:function(){var a=new Date(Date.parse(this.get("ts"))),b=Math.floor(this.get("ts").getMilliseconds()/10);return 10>b&&(b="0"+b),a.toLocaleString(navigator.language,{hour12:!1})+"."+b}.property("ts")}),App.Message.reopenClass({find:function(a,b){return App.findWithAdapter(a,b,nitrogen.Message,App.Message)}})}(),function(){App.Permission=Ember.Object.extend(nitrogen.Permission.prototype),App.Permission.reopen({issuedToPrincipal:function(){if(this.get("issued_to")){var a=this;App.Principal.findById(this.get("issued_to")).then(function(b){a.set("issuedToPrincipal",b)})}}.property("issued_to"),issuedToName:function(){return this.get("issuedToPrincipal.name")}.property("issued_to","issuedToPrincipal"),principalForPrincipal:function(){if(this.get("principal_for")){var a=this;App.Principal.findById(this.get("principal_for")).then(function(b){a.set("principalForPrincipal",b)})}}.property("principal_for"),principalForName:function(){return this.get("principalForPrincipal.name")}.property("principal_for","principalForPrincipal"),actionString:function(){return this.get("action")?this.get("action"):"all"}.property("action"),expiresString:function(){return this.get("expires")?this.get("expires"):"never"}.property("expires")}),App.Permission.reopenClass({find:function(a,b){return App.findWithAdapter(a,b,nitrogen.Permission,App.Permission)}})}(),function(){App.Principal=Ember.Object.extend(nitrogen.Principal.prototype),App.Principal.reopen({hasCapability:function(a){return-1!==this.get("capabilities").indexOf(a)},hasCamera:function(){return this.hasCapability("cameraCommand")}.property("capabilities"),hasSwitch:function(){return this.hasCapability("switchCommand")}.property("capabilities"),isDevice:function(){return this.is("device")}.property("type"),isUser:function(){return this.is("user")}.property("type"),lastConnectionString:function(){var a=new Date(Date.parse(this.get("last_connection")));return a.toLocaleString()}.property("last_connection"),nameOrId:function(){return this.get("name")||this.get("id")}.property("id","name"),save:function(){return App.saveWithDeferred(new nitrogen.Principal(this))}}),App.Principal.reopenClass({find:function(a,b){return App.findWithAdapter(a,b,nitrogen.Principal,App.Principal)},findById:function(a){return a?App.findByIdWithAdapter(a,nitrogen.Principal,App.Principal):void 0}})}(),function(){App.AuthenticatedRoute=Ember.Route.extend({beforeModel:function(){return App.session?void 0:Ember.RSVP.reject()},actions:{error:function(a,b){App.set("attempedTransition",b),this.transitionTo("login")}}})}(),function(){App.AgentsRoute=App.AuthenticatedRoute.extend({model:function(){return App.Agent.find()}})}(),function(){App.MessagePagingRoute=App.AuthenticatedRoute.extend({buildPageUrl:function(a){return this.get("baseUrl")+"/skip/"+a.skip+"/sort/"+a.sort+"/direction/"+a.direction},changePage:function(a){return{skip:parseInt(this.get("params.skip"))+a*parseInt(this.get("messagePageLimit")),direction:this.get("params.direction"),sort:this.get("params.sort")}},fullPage:function(){return this.get("controller.content.length")>=this.get("messagePageLimit")}.property("controller.content.length","messagesPerPage"),hasPreviousPage:function(){return 0!==parseInt(this.get("params.skip"))}.property("params.skip"),nextPage:function(){return this.changePage(1)}.property("params.skip","params.direction","params.sort"),nextPageUrl:function(){return this.buildPageUrl(this.get("nextPage"))}.property("nextPage"),previousPage:function(){return this.changePage(-1)}.property("params.skip","params.direction","params.sort"),previousPageUrl:function(){return this.buildPageUrl(this.get("previousPage"))}.property("previousPage")})}(),function(){App.MessagesRoute=App.MessagePagingRoute.extend({messagePageLimit:50,baseUrl:"/#/messages",activate:function(){setTimeout(function(){$("#messagesTab").addClass("active")},0)},deactivate:function(){setTimeout(function(){$("#messagesTab").removeClass("active")},0)},model:function(a){return console.log("skip: "+a.skip),console.log("direction: "+a.direction),console.log("sort: "+a.sort),this.set("params",a),this.query()},query:function(){var a={};return a[this.get("params").sort]=parseInt(this.get("params").direction),App.Message.find({type:{$ne:"heartbeat"}},{skip:parseInt(this.get("params").skip),limit:parseInt(this.get("messagePageLimit")),sort:a})},serialize:function(a){return{skip:a.skip,sort:a.sort,direction:a.direction}},setupController:function(a,b){this._super(a,b),this.controller.set("router",this);var c=this;this.subscription=App.session.onMessage(function(){c.query().then(function(a){c.controller.set("content",a)})})},actions:{willTransition:function(){this.subscription&&(App.session.disconnectSubscription(this.subscription),this.subscription=null)}}})}(),function(){App.PrincipalRoute=App.AuthenticatedRoute.extend({actions:{"delete":function(a){var b=this;a.remove(App.session,function(){b.transitionTo("principals")})}},activate:function(){setTimeout(function(){$("#principalsTab").addClass("active")},0)},deactivate:function(){setTimeout(function(){$("#principalsTab").removeClass("active")},0)},model:function(a){return this.set("params",a),this.query()},query:function(){return App.Principal.findById(this.get("params.id"))},serialize:function(a){return{id:a.get("id")}}})}(),function(){App.PrincipalAccountRoute=App.AuthenticatedRoute.extend({activate:function(){setTimeout(function(){$("#principalAccountTab").addClass("active")},0)},deactivate:function(){setTimeout(function(){$("#principalAccountTab").removeClass("active")},0)},model:function(){return this.modelFor("principal")}})}(),function(){App.PrincipalCommandsRoute=App.AuthenticatedRoute.extend({activate:function(){setTimeout(function(){$("#commandsTab").addClass("active")},0)},deactivate:function(){setTimeout(function(){$("#commandsTab").removeClass("active")},0)},model:function(){return this.modelFor("principal")}})}(),function(){App.PrincipalLogsRoute=App.MessagePagingRoute.extend({messagePageLimit:50,baseUrl:function(){var a="/#/principal/"+this.modelFor("principal").id+"/logs";return console.log(a),a}.property(),activate:function(){setTimeout(function(){$("#principalLogsTab").addClass("active")},0)},deactivate:function(){setTimeout(function(){$("#principalLogsTab").removeClass("active")},0)},model:function(a){a={sort:"ts",skip:0,direction:-1};var b=this.modelFor("principal");console.log("skip: "+a.skip),console.log("direction: "+a.direction),console.log("sort: "+a.sort),this.set("params",a);var c={};return c[a.sort]=parseInt(a.direction),App.Message.find({$and:[{type:"log"},{$or:[{to:b.id},{from:b.id}]}]},{skip:parseInt(this.get("params").skip),limit:parseInt(this.get("messagePageLimit")),sort:c})}})}(),function(){App.PrincipalMessagesRoute=App.MessagePagingRoute.extend({messagePageLimit:50,baseUrl:function(){return"/#/principal/"+this.modelFor("principal").id+"/messages"}.property(),activate:function(){setTimeout(function(){$("#principalMessagesTab").addClass("active")},0)},deactivate:function(){setTimeout(function(){$("#principalMessagesTab").removeClass("active")},0)},model:function(a){console.log("messages model called.");var b=this.modelFor("principal");a={sort:"ts",skip:0,direction:-1};var c={};return c[a.sort]=parseInt(a.direction),App.Message.find({$and:[{$and:[{type:{$ne:"heartbeat"}},{type:{$ne:"log"}}]},{$or:[{to:b.id},{from:b.id}]}]},{skip:parseInt(a.skip),limit:parseInt(this.get("messagePageLimit")),sort:c})}})}(),function(){App.PrincipalPermissionsRoute=App.AuthenticatedRoute.extend({messagePageLimit:50,activate:function(){setTimeout(function(){$("#principalPermissionsTab").addClass("active")},0)},deactivate:function(){setTimeout(function(){$("#principalPermissionsTab").removeClass("active")},0)},model:function(){console.log("in permissions model");var a=this.modelFor("principal");return App.Permission.find({$or:[{issued_to:a.id},{principal_for:a.id}]},{})}})}(),function(){App.PrincipalsRoute=App.AuthenticatedRoute.extend({pageLimit:50,maxUpdateRate:1e4,timeoutSet:!1,nextUpdate:new Date,activate:function(){setTimeout(function(){$("#principalsTab").addClass("active")},0)},deactivate:function(){setTimeout(function(){$("#principalsTab").removeClass("active")},0)},model:function(a){return a={sort:"last_connection",direction:-1,skip:0},this.set("params",a),this.query()},query:function(){var a={};return a[this.get("params").sort]=parseInt(this.get("params").direction),App.session?App.Principal.find({},{skip:parseInt(this.get("params").skip),limit:parseInt(this.get("pageLimit")),sort:a}):void 0},setupController:function(a,b){this._super(a,b),this.controller.set("router",this)}})}(),function(){App.Router.map(function(){this.resource("agents"),this.resource("messages",{path:"/messages/skip/:skip/sort/:sort/direction/:direction"}),this.resource("principals"),this.resource("principal",{path:"principal/:id"},function(){this.route("commands"),this.route("logs"),this.route("messages"),this.route("permissions")}),this.resource("user",function(){this.route("password"),this.route("login")})}),App.IndexRoute=Ember.Route.extend({redirect:function(){this.transitionTo("principals")}})}(),function(){App.AgentView=Em.View.extend({templateName:"agents/agent",editing:!1,notEditing:function(){return!this.get("editing")}.property("editing"),edit:function(){this.set("editing",!0)},save:function(a){this.set("editing",!1),this.set("agent",a.save())}})}(),function(){App.CameraCapabilityView=Em.View.extend({templateName:"capabilities/camera",actions:{sendSnapshot:function(){this.sendCommand("snapshot")},sendMotion:function(){this.sendCommand("motion")}},commands:function(){var a=Em.A();return this.cameraManager?(this.cameraManager.messageQueue.forEach(function(b){a.pushObject(b)}),a):Em.A([])}.property("invalidation"),invalidation:null,init:function(){this.cameraManager=new nitrogen.CameraManager;var a=this;this.cameraManager.start(App.session,this.get("principal.id"),function(){console.log("got another message, invalidating."),a.set("invalidation",new Date)})},sendCommand:function(a){console.log("sending command");var b=new nitrogen.Message({expires:"never",to:this.get("principal.id"),type:"cameraCommand",body:{command:a}});b.send(App.session,function(a){a&&console.log("sending command failed: "+a)})}})}(),function(){App.SwitchCapabilityView=Em.View.extend({templateName:"capabilities/switch",actions:{sendSwitch:function(){var a=0===this.switchManager.state?1:0,b=new nitrogen.Message({to:this.get("principal.id"),type:"switchCommand",body:{on:a}});b.send(App.session,function(a){a&&console.log("sending command failed: "+a)})},sendMotion:function(){this.sendCommand("motion")}},commands:function(){var a=Em.A();return this.switchManager?(this.switchManager.messageQueue.forEach(function(b){a.pushObject(b)}),a):Em.A([])}.property("invalidation"),invalidation:null,init:function(){this.switchManager=new nitrogen.SwitchManager;var a=this,b=this.get("principal.id");this.switchManager.start(App.session,{$or:[{to:b},{from:b}]},function(){a.set("invalidation",new Date)})}})}(),function(){App.MessagesTableView=Em.View.extend({templateName:"messages/messagesTable"})}(),function(){App.ClaimView=Em.View.extend({templateName:"principals/claim",actions:{claim:function(){var a=new nitrogen.Message({to:"service",type:"claim",body:{claim_code:this.get("claimCode").toUpperCase()},expires:"never"});a.send(App.session,function(a){a&&App.set("flash",a.message),window.location.reload()})}}})}(),function(){App.PrincipalView=Em.View.extend({viewing:!0,edit:function(){this.set("viewing",!1)},save:function(a){this.set("viewing",!0),this.set("principal",a.save())}})}(),function(){App.config={},request.log={debug:function(){},info:function(){},error:function(){}},App.config.store=new nitrogen.HTML5Store(App.config),App.service=new nitrogen.Service(App.config),App.deferReadiness(),App.resetSession=function(a){App.get("session")&&App.get("session").close();var b=null;a&&a.message&&(b=a.message),App.set("flash",b),App.set("session",null),App.set("user",null),App.set("attemptedNavigation",window.location.hash),window.location="/#/user/login"},App.sessionHandler=function(a,b,c){return App.advanceReadiness(),!a&&b&&c?(App.set("flash",null),App.set("session",b),App.set("user",App.Principal.create(c)),App.get("attemptedNavigation")&&"#/user/login"!==App.get("attemptedNavigation")?(console.log("successful auth, reloading attempedNavigation url: "+App.get("attemptedNavigation")),window.location=App.get("attemptedNavigation")):window.location="#/principals",b.onAuthFailure(App.resetSession),void 0):App.resetSession(a)};var a=new nitrogen.User({nickname:"current"});App.set("attemptedNavigation",window.location.hash),App.service.resume(a,App.sessionHandler)}();