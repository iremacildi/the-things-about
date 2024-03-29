import { useEffect, useState, useRef } from 'react'
import { Grid, Typography } from '@mui/material';
import logo from '../img/TTAlogo.png'
import CustomButton from '../Components/CustomButton';
import CustomTextField from '../Components/CustomTextField';
import { useNavigate } from "react-router-dom";
import {
  LoginButton,
  useSession,
} from "@inrupt/solid-ui-react";

function Login() {

  const { session } = useSession();
  const [showUrlField, setShowUrlField] = useState(false);
  const [idp, setIdp] = useState("https://solidcommunity.net");
  const [currentUrl, setCurrentUrl] = useState("http://localhost:3000");

  const prevShow = useRef(showUrlField);
  useEffect(() => {
    prevShow.current = showUrlField;
  }, [showUrlField]);

  const handleToggle = () => {
    setShowUrlField((prevShow) => !prevShow);
  };

  let navigate = useNavigate();

  const redirectHomePage = () => {
    navigate("../home");
  }

  async function handleRedirectAfterLogin() {
    await session.handleIncomingRedirect(window.location.href);
    if (session.info.isLoggedIn) {
      redirectHomePage();
    }
  }

  handleRedirectAfterLogin();

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, [setCurrentUrl]);

  return (
    <Grid container className="center" spacing={2} columns={16} direction="row" alignItems="center">
      <Grid>
        <Grid container item lg={16} justifyContent="center" alignItems="center" id="addmargin">
          <img width="200" src={logo} alt="TTA Logo" />
        </Grid>
        <Grid container item lg={16} justifyContent="center" alignItems="center" id="addmargin">
          <Typography align="center">
            Save and tag your bookmarks or add comments. <br />
            Then find the things about the keywords you searched.
          </Typography>
        </Grid>
        <Grid container item lg={16} justifyContent="center" alignItems="center" id="addmargin">
          <LoginButton
            authOptions={{ clientName: 'The Things About...' }}
            oidcIssuer={idp}
            redirectUrl={currentUrl}
            onError={console.error}
          >
            <CustomButton disabled={showUrlField} id="addmarginright">
              Login with Solid
            </CustomButton>
          </LoginButton>
          <CustomButton disabled={showUrlField} href="/login">Login with Inrupt</CustomButton>
        </Grid>
        <>{!showUrlField &&
          <Grid container item lg={16} justifyContent="center" alignItems="center" id="addmargin">
            <CustomButton onClick={handleToggle}>Login with Custom Provider</CustomButton>
          </Grid>}</>
        <>{showUrlField &&
          <Grid container item lg={16} justifyContent="center" alignItems="center" id="addmargin">
            <CustomButton onClick={handleToggle}>Changed My Mind</CustomButton>
          </Grid>}</>
        <Grid container item lg={16} justifyContent="center" alignItems="center" id="addmargin">
          <>{showUrlField &&
            <CustomTextField
              size="small"
              name="providerurl"
              required
              fullWidth
              id="providerurl"
              label="Type Provider URL and Press Enter"
            />}</>
        </Grid>
        <Grid container item lg={16} justifyContent="center" alignItems="center" id="addmargin">
          <>{showUrlField &&
            <CustomButton href="/login">LOGIN</CustomButton>}</>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Login;