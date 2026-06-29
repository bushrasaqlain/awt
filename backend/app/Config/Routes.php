<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

// Auth API
$routes->post('api/auth/login',    'Api\Auth::login');
$routes->post('api/auth/register',       'Api\Auth::register');
$routes->post('api/auth/register/admin', 'Api\Auth::registerAdmin');
$routes->post('api/auth/register/csr',   'Api\Auth::registerCsr');
$routes->post('api/auth/logout',   'Api\Auth::logout');
$routes->get('api/auth/me',        'Api\Auth::me');

// Donors API
$routes->post('api/donors/register', 'Api\Donors::register');