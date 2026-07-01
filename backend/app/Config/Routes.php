<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');
// Catch-all OPTIONS handler for CORS preflight (must come before other api/* routes)
$routes->options('api/(:any)', static function () {
    return service('response')
        ->setStatusCode(204)
        ->setHeader('Access-Control-Allow-Origin', '*')
        ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');
});

// Auth API
$routes->post('api/auth/login', 'Api\Auth::login');
$routes->post('api/auth/register', 'Api\Auth::register');
$routes->post('api/auth/register/admin', 'Api\Auth::registerAdmin');
$routes->post('api/auth/register/csr', 'Api\Auth::registerCsr');
$routes->post('api/auth/logout', 'Api\Auth::logout');
$routes->get('api/auth/me', 'Api\Auth::me');

// Donors API
$routes->post('api/donors/register', 'Api\Donors::register');
$routes->get('api/donors', 'Api\Donors::index');
$routes->get('api/donors/(:num)', 'Api\Donors::show/$1');
$routes->put('api/donors/(:num)', 'Api\Donors::update/$1');
$routes->post('api/donors/(:num)', 'Api\Donors::update/$1'); // fallback for multipart PUT

// IMPORTANT: Status route - must be defined BEFORE the wildcard routes
$routes->post('api/donors/(:num)/status', 'Api\Donors::updateStatus/$1');
$routes->patch('api/donors/(:num)/status', 'Api\Donors::updateStatus/$1');
$routes->get('api/donors/(:num)/history', 'Api\Donors::history/$1');

// Cities API
$routes->get('api/cities', 'Api\Cities::index');
$routes->post('api/cities', 'Api\Cities::store');
$routes->put('api/cities/(:num)', 'Api\Cities::update/$1');
$routes->delete('api/cities/(:num)', 'Api\Cities::destroy/$1');
$routes->post('api/cities/import', 'Api\Cities::import');

// CSR management
$routes->get('api/csr', 'Api\Csr::index');
$routes->put('api/csr/(:num)', 'Api\Csr::update/$1');
$routes->delete('api/csr/(:num)', 'Api\Csr::destroy/$1');

// Stock management
$routes->get('api/stock', 'Api\Csr::stock');
$routes->post('api/stock/add', 'Api\Csr::add');
$routes->post('api/stock/edit', 'Api\Csr::edit');
$routes->post('api/stock/dispense', 'Api\Csr::dispense');
$routes->post('api/stock/delete', 'Api\Csr::delete');
$routes->post('api/stock/threshold', 'Api\Csr::threshold');
$routes->get('api/stock/logs', 'Api\Csr::logs');
$routes->get('api/stock/search', 'Api\Csr::search');

// Dashboard
$routes->get('api/admin/dashboard', 'Api\Dashboard::index');

// Blood Donations
$routes->get('blood-donations', 'BloodDonationController::index');
$routes->post('blood-donations/save', 'BloodDonationController::save');