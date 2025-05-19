import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Redirect, useHistory } from 'react-router-dom';
import LogoIcon from '../images/3DK_LOGO_ICON_1300.png';
import EnterIcon from '../images/enter.png';
import ExitIcon from '../images/exit.png';
import { UserService } from '../UserService';
import { setPlayerLogout } from '../GlobalState/UserReducer';

export const Menu = () => {
    const dispatch = useDispatch();
    const locationHistory = useHistory();
    const UserState = useSelector((store) => store.user);

    useEffect(() => {
        if (UserState.isLogged) {
            UserService.reloadBalances();
        }
    }, [UserState.isLogged]);

    const handleLogin = () => {
        UserService.login(() => {
            if (UserService.isLogged()) {
                locationHistory.push('/home');
            } else {
                dispatch(setPlayerLogout());
            }
        });
    }

    const onHandleLogout = () => {
        UserService.logout();
    }

    return (
        <nav id="menu" className="d-flex justify-content-between align-items-center px-5" style={{
            background: "#232c39",
            color: "#ff9f43",
            minHeight: 48,
            boxShadow: "0 1px 12px #0008",
            zIndex: 100,
            position: "relative"
        }}>
            {/* Redirecciona si está logueado */}
            {(UserState.isLogged) ? <Redirect to="/home" /> : null}
            <div className="d-flex align-items-center">
                <img src={LogoIcon} alt="LogoIcon" width="42" style={{marginRight: 16}} />
                <div className="text-white fw-bold" style={{ fontSize: 17 }}>
                    {(UserState.isLogged) ?
                        `${UserState.name} - Wallet: ${UserState.balance} - SEXY: ${UserService.sexyBalance}` : ''
                    }
                </div>
            </div>
            <div className="d-flex align-items-center">
                <Link to="/" className="btn-item">Main</Link>
                <Link to="/home" className={`${(UserState.isLogged) ? '' : "disable"} btn-item`}>Home</Link>
                <Link to="/page2" className={`${(UserState.isLogged) ? '' : "disable"} btn-item`}>Page2</Link>
                {
                    !UserState.isLogged ?
                        <button className="btn-item" onClick={handleLogin}>
                            <img src={EnterIcon} alt="Login" width="24" /> Login
                        </button>
                        :
                        <Link to="/" className="btn-item" onClick={onHandleLogout}>
                            Logout <img src={ExitIcon} alt="Exit" width="24" />
                        </Link>
                }
            </div>
        </nav>
    );
};
