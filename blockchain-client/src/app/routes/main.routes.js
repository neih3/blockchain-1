import React, { lazy } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Layout from '../layout/layout';
import ProfileView from '../views/profile.view';
import ChangePasswordView from '../views/change-password.view';

const main_routes = [
    {
        path: '/',
        component: lazy(() => import('../views/welcome.view')),
        exact: true,
    },
    {
        path: '/dashboard',
        component: lazy(() => import('../views/dashboard.view')),
        exact: true,
    },
    {
        path: '/login',
        component: lazy(() => import('../views/login.view')),
    },
    {
        path: '/register',
        component: lazy(() => import('../views/register.view')),
    },
    {
        path: '/blockchain',
        component: lazy(() => import('../views/blockchain-list.view')),
    },
    {
        path: '/address/:address',
        component: lazy(() => import('../views/address.view')),
    },
    {
        path: '/uTxO',
        component: lazy(() => import('../views/unspentTxOutput.view')),
    },
    {
        path: '/transfer',
        component: lazy(() => import('../views/transfer.view')),
    },
    {
        path: '/transaction-pool',
        component: lazy(() => import('../views/transaction-list.view')),
    },
    {
        path: '/transaction/:transactionId',
        component: lazy(() => import('../views/transaction-detail.view')),
    },
    {
        path: '/block/:blockHash',
        component: lazy(() => import('../views/block-detail.view')),
    },
    {
        path: '/forgot-password',
        component: lazy(() => import('../views/forgot-password.view')),
    },
    {
        path: '/profile',
        exact: true,
        component: ProfileView,
    },
    {
        path: '/changePass',
        exact: true,
        component: ChangePasswordView,
    },
    {
        path: '/transactions',
        component: lazy(() => import('../views/transactions.view')),
    },
    {
        path: '/advanced',
        component: lazy(() => import('../views/advanced.view')),
    },
    {
        path: '/system-info',
        component: lazy(() => import('../views/system-info.view')),
    },
    {
        path: '*',
        component: lazy(() => import('../views/others/page-not-found-view')),
    },
];

const EmployeeScreens = ({ isAuthenticated }) => {
    return (
        <Router>
            <Layout>
                <Switch>
                    {/* Nếu đã đăng nhập, vào trang welcome sẽ tự động chuyển sang dashboard */}
                    <Route exact path="/">
                        {isAuthenticated ? (
                            <Redirect to="/dashboard" />
                        ) : (
                            React.createElement(main_routes[0].component)
                        )}
                    </Route>
                    {/* Nếu đã đăng nhập, vào login sẽ tự động chuyển sang dashboard */}
                    <Route exact path="/login">
                        {isAuthenticated ? (
                            <Redirect to="/dashboard" />
                        ) : (
                            React.createElement(
                                main_routes.find((r) => r.path === '/login').component,
                            )
                        )}
                    </Route>
                    {/* Nếu chưa đăng nhập, vào dashboard sẽ tự động chuyển sang login */}
                    <Route exact path="/dashboard">
                        {isAuthenticated ? (
                            React.createElement(
                                main_routes.find((r) => r.path === '/dashboard').component,
                            )
                        ) : (
                            <Redirect to="/login" />
                        )}
                    </Route>
                    {/* Các route còn lại */}
                    {main_routes
                        .filter((r) => !['/', '/login', '/dashboard'].includes(r.path))
                        .map((item, index) => {
                            return (
                                <Route
                                    key={index}
                                    path={item.path}
                                    exact={item.exact ? item.exact : null}
                                    render={(props) =>
                                        isAuthenticated ? (
                                            <item.component {...props} {...item.props} />
                                        ) : (
                                            <Redirect to="/login" />
                                        )
                                    }
                                />
                            );
                        })}
                </Switch>
            </Layout>
        </Router>
    );
};

export default EmployeeScreens;
