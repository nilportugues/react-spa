var React = require("react");
var reflux = require("reflux");
var connect= require("client/libraries/tmp_connect");

var mui = require("material-ui");
var DocumentTitle = require("client/components/core/documentTitle.jsx");

var sessionActions = require("client/actions/sessionActions");
var sessionStore = require("client/stores/session");

var Signup = React.createClass({
  mixins: [connect(sessionStore, "session")],

  // Transition
  statics: {
    willTransitionTo: function (transition, params) {
      if (sessionStore.isLoggedIn()) {
        transition.redirect("profile");
      }
    }
  },

  componentWillUpdate: function() {
    var router = require("client/core/router").router;
    if (sessionStore.isLoggedIn()) {
      router.transitionTo("profile");
    }
  },

  componentWillMount: function() {
    if (!this.state.session.get("pwdCheckerState")) {
      sessionActions.loadPasswordChecker();
    }
  },

  // Helpers
  handleSubmit: function(evt) {
    evt.preventDefault();
    var username = this.refs.username.getValue();
    var password = this.refs.password.getValue();

    if (this.validate(username, password)) {
      sessionActions.register(username, password);
    }
  },
  handlePwdChange: function() {
    if(this.state.session.get("pwdCheckerState") == "ready") {
      var pwdTest = zxcvbn(this.refs.password.getValue());
      var qualities = ["Discusting", "Poor", "Fair", "Okay", "Great"];
      var pwdQuality = qualities[pwdTest.score] + " (score: " + pwdTest.score + " (0-4); crack time: ~" + pwdTest.crack_time_display + ")";
      this.setState({pwdQualityMsg: pwdQuality});
    }
  },
  validate: function(username, password) {
    // Check title
    if (!username) {
      this.setState({usernameError: "Username cannot be empty!"});
      username = false;
    }
    else {
      this.setState({usernameError: null});
    }

    // Check content
    if (!password) {
      this.setState({passwordError: "Password cannot be empty!"});
      password = false;
    }
    else {
      this.setState({passwordError: null});
    }
    return username && password;
  },
  clearErrors: function() {
    this.setState({usernameError: null});
    this.setState({passwordError: null});
  },

  // Element
  render: function() {
    // Show message if available
    var msg;
    if (this.state.session.get("msg")) {
      msg = (
        <div data-alert className="alert-box alert">
          {this.state.session.get("msg")}
          <a href="#" className="close">&times;</a>
        </div>
      );
    }
    else {
      msg = null;
    }

    var pwdInfoMsg;
    if(this.state.session.get("pwdCheckerState") == "loading") {
      pwdInfoMsg = "Loading password quality checker...";
    }
    else if(this.state.session.get("pwdCheckerState") == "ready") {
      pwdInfoMsg = null || this.state.pwdQualityMsg;
    }
    else if(this.state.session.get("pwdCheckerState") == "failed") {
      pwdInfoMsg = "Failed loading password quality checker";
    }

    return (
      <DocumentTitle title="Signup">
        <div className="row">
          <div className="large-12 columns">
            <h1>Signup</h1>
            {msg}
            <form onSubmit={this.handleSubmit} onChange={this.clearErrors}>
              <div className="row collapse">
                <mui.TextField
                  ref="username"
                  name="username"
                  required={true}
                  errorText={this.state.usernameError}
                  type="text"
                  floatingLabelText="Your desired username" />
                <br/>
                <mui.TextField
                  ref="password"
                  name="password"
                  required={true}
                  errorText={pwdInfoMsg}
                  onChange={this.handlePwdChange}
                  type="password"
                  floatingLabelText="Your password" />
                <br/>
                <br/>
                <mui.FlatButton type="submit" label="Create account" primary={true}/>
              </div>
            </form>
          </div>
        </div>
      </DocumentTitle>
    );
  }
});

module.exports = Signup;
