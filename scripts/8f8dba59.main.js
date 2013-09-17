!function(){window.App=Ember.Application.create({rootElement:window.TESTING?"#mocha":"#app",LOG_TRANSITIONS:!0})}(),function(){App.AgentsController=Ember.ArrayController.extend({})}(),function(){App.ApplicationController=Ember.Controller.extend({signout:function(){App.session.clearCredentials(),this.transitionToRoute("login")}})}(),function(){App.LoginController=Ember.Controller.extend({mode:"signin",createMode:function(){return"create"===this.get("mode")}.property("mode"),forgotPasswordMode:function(){return"forgot"===this.get("mode")}.property("mode"),notForgotPasswordMode:function(){return!this.get("forgotPasswordMode")}.property("forgotPasswordMode"),signInMode:function(){return"signin"===this.get("mode")}.property("mode"),modeTitle:function(){var a=this.get("mode");return"create"===a?"Create Account":"signin"===a?"Sign In":"forgot"===a?"Password Reset":void 0}.property("mode"),switchToCreate:function(){this.set("mode","create")},switchToForgotPassword:function(){this.set("mode","forgot")},switchToSignIn:function(){this.set("mode","signin")},submit:function(){App.set("flash",null),this.get("signInMode")?this.login():this.get("forgotPasswordMode")?this.forgotPassword():this.get("create")&&this.create()},create:function(){var a=new nitrogen.User({name:this.get("name"),email:this.get("email"),password:this.get("password"),nickname:"current"});App.service.create(a,App.sessionHandler)},forgotPassword:function(){},login:function(){var a=new nitrogen.User({email:this.get("email"),password:this.get("password"),nickname:"current"});App.service.authenticate(a,App.sessionHandler)}})}(),function(){App.MessagesController=Ember.ArrayController.extend({buildPageUrl:function(a){return"/#/messages/skip/"+a.skip+"/sort/"+a.sort+"/direction/"+a.direction},changePage:function(a){return{skip:parseInt(this.get("router.params.skip"))+a*parseInt(this.get("router.messagePageLimit")),direction:this.get("router.params.direction"),sort:this.get("router.params.sort")}},claim:function(){var a=$("principalId").val();console.log("claiming device: "+a),new nitrogen.Message({to:"system",type:"claim",body:{principal:a},expires:"never"}),response.send(App.session,function(a){a&&console.log(a)})},fullPage:function(){return this.get("content.length")>=this.get("router.messagePageLimit")}.property("content.length","messagesPerPage"),hasPreviousPage:function(){return 0!==parseInt(this.get("router.params.skip"))}.property("router.params.skip"),nextPage:function(){return this.changePage(1)}.property("router.params.skip","router.params.direction","router.params.sort"),nextPageUrl:function(){return this.buildPageUrl(this.get("nextPage"))}.property("nextPage"),previousPage:function(){return this.changePage(-1)}.property("router.params.skip","router.params.direction","router.params.sort"),previousPageUrl:function(){return this.buildPageUrl(this.get("previousPage"))}.property("previousPage")})}(),function(){App.PrincipalController=Ember.Controller.extend({maxTailMessages:25,sendCommand:function(a){var b=new nitrogen.Message({expires:"never",to:this.get("content.id"),type:"cameraCommand",body:{command:a}});b.send(App.session,function(a){a&&console.log("sending command failed: "+a)})},sendSnapshot:function(){this.sendCommand("snapshot")},sendMotion:function(){this.sendCommand("motion")},tailMessages:function(){var a=this.get("messages");return"object"!=typeof this.get("messages")?a:a.slice(0,this.get("maxTailMessages"))}.property("messages")})}(),function(){App.PrincipalsController=Ember.ArrayController.extend({})}(),function(){App.UserCreateController=Ember.Controller.extend({create:function(){App.set("flash",null);var a=new nitrogen.User({name:$("#name").val(),email:$("#email").val(),password:$("#password").val(),nickname:"current"});App.service.create(a,App.sessionHandler)}})}(),function(){App.findWithAdapter=function(a,b,c,d){var e=$.Deferred();return c.find(App.session,a,b,function(a,b){if(a)return e.reject(a);var c=b.map(function(a){return d.create(a)});e.resolve(c)}),e},App.findByIdWithAdapter=function(a,b,c){var d=$.Deferred();return b.findById(App.session,a,function(a,b){return a?d.reject(a):(d.resolve(c.create(b)),void 0)}),d},App.saveWithDeferred=function(a){var b=$.Deferred();return a.save(App.session,function(a,c){return a?b.reject(a):(b.resolve(c),void 0)}),b},App.sendWithDeferred=function(a){var b=$.Deferred();return a.send(App.session,function(a,c){return a?b.reject(a):(b.resolve(c),void 0)}),b}}(),function(){App.Agent=Ember.Object.extend(nitrogen.Agent.prototype),App.Agent.reopen({enabledString:function(){return this.get("enabled")?"true":"false"}.property("enabled"),save:function(){return App.saveWithDeferred(new nitrogen.Agent(this))}}),App.Agent.reopenClass({find:function(a,b){return App.findWithAdapter(a,b,nitrogen.Agent,App.Agent)}})}(),function(){App.Message=Ember.Object.extend(nitrogen.Message.prototype),App.Message.reopen({bodyJSON:function(){return JSON.stringify(this.get("body"))}.property("body"),bodyUrlWithAccessToken:function(){return this.get("body")&&this.get("body.url")?this.get("body.url")+"?access_token="+encodeURIComponent(App.get("session.accessToken.token")):null}.property("body.url"),createdAtString:function(){var a=new Date(Date.parse(this.get("created_at")));return a.toLocaleString()}.property("created_at"),fromPrincipal:function(){if(this.get("from")){var a=this;App.Principal.findById(this.get("from")).then(function(b){a.set("fromPrincipal",b)})}}.property("from"),fromName:function(){return console.log("recomputing fromName."),this.get("fromPrincipal.name")}.property("from","fromPrincipal"),toPrincipal:function(){if(this.get("to")){var a=this;App.Principal.findById(this.get("to")).then(function(b){a.set("toPrincipal",b)})}}.property("to"),toName:function(){return console.log("recomputing toName."),this.get("toPrincipal.name")}.property("to","toPrincipal"),isCameraCommand:function(){return this.is("cameraCommand")}.property("type"),isHeartbeat:function(){return this.is("heartbeat")}.property("type"),isImage:function(){return this.is("image")}.property("type"),isLog:function(){return this.is("log")}.property("type"),isIP:function(){return this.is("ip")}.property("type"),isIPMatch:function(){return this.is("ip_match")}.property("type"),isNotHeartbeat:function(){return!this.is("heartbeat")}.property("type"),send:function(){return App.sendWithDeferred(new nitrogen.Message(this))},timestampString:function(){var a=new Date(Date.parse(this.get("ts")));return a.toLocaleString()}.property("ts")}),App.Message.reopenClass({find:function(a,b){return App.findWithAdapter(a,b,nitrogen.Message,App.Message)}})}(),function(){App.Principal=Ember.Object.extend(nitrogen.Principal.prototype),App.Principal.reopen({hasCapability:function(a){return-1!==this.get("capabilities").indexOf(a)},hasCamera:function(){return this.hasCapability("cameraCommand")}.property("capabilities"),isDevice:function(){return this.is("device")}.property("type"),lastConnectionString:function(){var a=new Date(Date.parse(this.get("last_connection")));return a.toLocaleString()}.property("last_connection"),save:function(){return App.saveWithDeferred(new nitrogen.Principal(this))}}),App.Principal.reopenClass({find:function(a,b){return App.findWithAdapter(a,b,nitrogen.Principal,App.Principal)},findById:function(a){return a?App.findByIdWithAdapter(a,nitrogen.Principal,App.Principal):void 0}})}(),function(){App.AuthenticatedRoute=Ember.Route.extend({beforeModel:function(){return App.session?void 0:Ember.RSVP.reject()},events:{error:function(a,b){console.log("oops"),App.set("attempedTransition",b),this.transitionTo("login")}}})}(),function(){App.AgentsRoute=App.AuthenticatedRoute.extend({model:function(){return App.Agent.find()}})}(),function(){App.MessagesRoute=App.AuthenticatedRoute.extend({messagePageLimit:50,model:function(a){return console.log("skip: "+a.skip),console.log("direction: "+a.direction),console.log("sort: "+a.sort),this.set("params",a),this.query()},query:function(){var a={};return a[this.get("params").sort]=parseInt(this.get("params").direction),App.Message.find({},{skip:parseInt(this.get("params").skip),limit:parseInt(this.get("messagePageLimit")),sort:a})},serialize:function(a){return{skip:a.skip,sort:a.sort,direction:a.direction}},setupController:function(a,b){this._super(a,b),this.controller.set("router",this);var c=this;this.subscription=App.session.onMessage(function(){c.query().then(function(a){c.controller.set("content",a)})})},events:{willTransition:function(){this.subscription&&(App.session.disconnectSubscription(this.subscription),this.subscription=null)}}})}(),function(){App.PrincipalsRoute=App.AuthenticatedRoute.extend({pageLimit:50,maxUpdateRate:1e4,timeoutSet:!1,nextUpdate:new Date,model:function(a){return a={sort:"last_connection",direction:-1,skip:0},this.set("params",a),this.query()},query:function(){var a={};return a[this.get("params").sort]=parseInt(this.get("params").direction),App.session?App.Principal.find({},{skip:parseInt(this.get("params").skip),limit:parseInt(this.get("pageLimit")),sort:a}):void 0},setupController:function(a,b){this._super(a,b),this.controller.set("router",this)},events:{willTransition:function(){this.subscription&&(App.session.disconnectSubscription(this.subscription),this.subscription=null)}}}),App.PrincipalRoute=App.AuthenticatedRoute.extend({model:function(a){return this.set("params",a),this.query()},actions:{"delete":function(a){a.remove(App.session,function(){this.transitionTo("principals")})}},query:function(){return App.Principal.findById(this.get("params.id"))},queryMessages:function(a){var b=this;App.Message.find({$or:[{to:a.id},{from:a.id}]},{limit:25}).then(function(a){b.controller.set("messages",a)})},serialize:function(a){return{id:a.get("id")}},setupController:function(a,b){this._super(a,b),this.controller.set("router",this),this.queryMessages(b);var c=this;this.subscription=App.session.onMessage(function(){c.queryMessages(b)})},events:{willTransition:function(){this.subscription&&(App.session.disconnectSubscription(this.subscription),this.subscription=null)}}})}(),function(){App.Router.map(function(){this.resource("agents"),this.resource("messages",{path:"/messages/skip/:skip/sort/:sort/direction/:direction"}),this.resource("principals"),this.resource("principal",{path:"principal/:id"}),this.resource("login")}),App.IndexRoute=Ember.Route.extend({redirect:function(){this.transitionTo("principals")}})}(),function(){App.AgentView=Em.View.extend({templateName:"agents/agent",editing:!1,notEditing:function(){return!this.get("editing")}.property("editing"),edit:function(){this.set("editing",!0)},save:function(a){this.set("editing",!1),this.set("agent",a.save())}})}(),function(){App.CameraCapabilityView=Em.View.extend({templateName:"capabilities/camera",invalidation:null,init:function(){this.cameraManager=new nitrogen.CameraManager;var a=this,b=this.get("principal").id;this.cameraManager.start(App.session,{$or:[{to:b},{from:b}]},function(){a.set("invalidation",new Date)})},commands:function(){var a=Em.A();return this.cameraManager?(this.cameraManager.messageQueue.forEach(function(b){a.pushObject(b)}),console.log("commands: "+a.length),a):Em.A([])}.property("invalidation")})}(),function(){App.IpMatchView=Em.View.extend({templateName:"messages/ip_match",sendResponse:function(a,b){var c=new nitrogen.Message({to:"system",type:a,response_to:b.id,body:{principal:b.body.principal},expires:"never"});c.send(App.session,function(a){a&&console.log(a)})},claim:function(a){this.sendResponse("claim",a)},reject:function(a){this.sendResponse("reject",a)}})}(),function(){App.MessagesTableView=Em.View.extend({templateName:"messages/messagesTable"})}(),function(){App.PrincipalView=Em.View.extend({viewing:!0,edit:function(){this.set("viewing",!1)},save:function(a){this.set("viewing",!0),this.set("principal",a.save())}})}(),function(){App.PrincipalRowView=Em.View.extend({templateName:"principals/principalRow",lastConnectionClass:function(){var a=(new Date).getTime()-Date.parse(this.get("principal.last_connection"));return a>18e5?"text-error":""}.property("principal.last_connection")})}(),function(){App.config={},App.config.store=new nitrogen.HTML5Store(App.config),App.service=new nitrogen.Service(App.config),App.deferReadiness(),App.resetSession=function(a){App.get("session")&&App.get("session").close();var b=null;a&&a.message&&(b=a.message),App.set("flash",b),App.set("session",null),App.set("user",null),App.set("attemptedNavigation",window.location.hash),window.location="/#/login"},App.sessionHandler=function(a,b,c){return App.advanceReadiness(),!a&&b&&c?(App.set("flash",null),App.set("session",b),App.set("user",App.Principal.create(c)),App.get("attemptedNavigation")&&(console.log("successful auth, reloading attempedNavigation url: "+App.get("attemptedNavigation")),window.location=App.get("attemptedNavigation")),b.onAuthFailure(App.resetSession),void 0):App.resetSession(a)};var a=new nitrogen.User({nickname:"current"});App.set("attemptedNavigation",window.location.hash),App.service.resume(a,App.sessionHandler)}();