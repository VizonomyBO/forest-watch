import { Component } from "react";
import PropTypes from "prop-types";
import ReduxToastr from "react-redux-toastr";
import { IntlProvider } from "react-intl";
import translations from "locales/index.js";
import { DEFAULT_LANGUAGE } from "constants/global";
import "react-redux-toastr/lib/css/react-redux-toastr.min.css";
import Nav from "components/layouts/Nav";
import Landing from "pages/landing/LandingContainer";
import UserNameForm from "components/modals/UserNameForm";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "components/modals/ErrorFallbackModal";
import { consumeSensitiveAuthCallback } from "security/authCallback";
import { initializeAnalytics, trackPage } from "security/analytics";

// Pages
import Routes from "routes";

class App extends Component {
  UNSAFE_componentWillMount() {
    const { token, confirmToken } = consumeSensitiveAuthCallback();
    this.confirmToken = confirmToken;
    this.props.checkLogged(token);
    initializeAnalytics();
  }

  componentDidMount() {
    this.checkConfirmedUser(this.props);
    this.fireTracking(this.props.location);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { location } = nextProps;
    if (nextProps.user.token !== this.props.user.token && this.confirmToken) {
      this.checkConfirmedUser(nextProps);
    }
    if (location.pathname !== this.props.location.pathname || location.search !== this.props.location.search) {
      this.fireTracking(nextProps.location);
    }
  }

  fireTracking = location => {
    trackPage(location);
  };

  checkConfirmedUser(props) {
    if (this.confirmToken && props.user.token) {
      const confirmToken = this.confirmToken;
      this.confirmToken = undefined;
      this.props.confirmUser(confirmToken);
    }
  }

  render() {
    const { user, userChecked, logout, locale, setLocale, location } = this.props;
    if (!userChecked) return null;
    const mergedMessages = Object.assign({}, translations[DEFAULT_LANGUAGE], translations[locale]);

    return (
      <IntlProvider locale={locale} messages={mergedMessages}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <div>
            <header className="l-header" role="banner">
              <Nav
                loggedIn={user.loggedIn}
                logout={logout}
                locale={locale}
                setLocale={setLocale}
                translations={translations}
                user={user}
              />
            </header>

            <main role="main" className="l-main">
              <Routes
                defaultComponent={() => <Landing locale={locale} setLocale={setLocale} translations={translations} />}
              />
              <UserNameForm isOpen={user.userHasNoLastName && location.pathname !== "/"} />
              <ReduxToastr position="bottom-right" transitionIn="fadeIn" transitionOut="fadeOut" preventDuplicates />
            </main>
          </div>
        </ErrorBoundary>
      </IntlProvider>
    );
  }
}

App.propTypes = {
  location: PropTypes.object.isRequired,
  userChecked: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  checkLogged: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  locale: PropTypes.string,
  setLocale: PropTypes.func
};

export default App;
